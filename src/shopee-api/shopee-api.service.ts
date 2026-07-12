import * as crypto from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ShopeeApiResponse,
  ShopeeConfiguration,
  ShopeeConfigurationExtractor,
} from '../core/interfaces/shopee-configuration.interface';
import {
  ShopeeOfferApiResponse,
  ShopeeOfferPageInfo,
  ShopeeOfferQueryParams,
  ShopeeOfferV2,
  ShopeeOfferV2Response,
} from '../core/interfaces/shopee-offer.interface';
import {
  PageInfo,
  ProductOfferV2Item,
  ProductOfferV2QueryParams,
  ProductOfferV2Response,
  ShopeeProductOfferApiResponse,
} from '../core/interfaces/shopee-product-offer.interface';

@Injectable()
export class ShopeeApiService {
  private readonly logger = new Logger(ShopeeApiService.name);

  /**
   * Gera link de afiliado usando configurações fornecidas pelo bot
   * @param originUrl URL original do produto
   * @param shopeeConfig Configurações da Shopee (do banco de dados)
   */
  async generateAffiliateLink(
    originUrl: string,
    shopeeConfig: ShopeeConfiguration,
  ): Promise<string> {
    // Validar configuração
    if (!ShopeeConfigurationExtractor.validateShopeeConfig(shopeeConfig)) {
      const errorMsg =
        ShopeeConfigurationExtractor.getValidationErrorMessage(shopeeConfig);
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    return this.processAffiliateLink(originUrl, shopeeConfig);
  }

  /**
   * Processa a geração do link de afiliado com as configurações fornecidas
   */
  private async processAffiliateLink(
    originUrl: string,
    config: ShopeeConfiguration,
  ): Promise<string> {
    // Parse subIds from config (comma-separated). Fallback to ['s1'] when missing.
    const rawSubIds = config.affiliateSubids || '';
    const subIds = rawSubIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const effectiveSubIds = subIds.length > 0 ? subIds : ['s1'];

    // Build GraphQL query with dynamic subIds
    const subIdsString = effectiveSubIds.map((s) => `"${s}"`).join(', ');
    const query = `
      mutation {
        generateShortLink(input: {
          originUrl: "${originUrl}",
          subIds: [${subIdsString}]
        }) {
          shortLink
        }
      }
    `;

    const body = { query };

    // Gerar assinatura SHA256 conforme documentação:
    // signature = SHA256(Credential + Timestamp + Payload + Secret)
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify(body);
    // Concatena na ordem: Credential + Timestamp + Payload + Secret
    const factor = `${config.credential}${timestamp}${payload}${config.secretKey}`;
    const signature = crypto.createHash('sha256').update(factor).digest('hex');

    const headers: AxiosRequestConfig['headers'] = {
      // Ordem dos campos: Credential, Timestamp, Signature
      Authorization: `SHA256 Credential=${config.credential}, Timestamp=${timestamp}, Signature=${signature}`,
      'Content-Type': 'application/json',
    };

    try {
      const response: AxiosResponse<ShopeeApiResponse> = await axios.post(
        'https://open-api.affiliate.shopee.com.br/graphql',
        body,
        {
          headers,
        },
      );

      return (
        response.data.data?.generateShortLink?.shortLink ||
        'Link não encontrado'
      );
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.logger.error('Erro ao gerar link de afiliado:', errorMessage);
      throw new Error(`Erro ao gerar link de afiliado: ${errorMessage}`);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return typeof error.response?.data === 'string'
        ? error.response.data
        : error.message || 'Erro desconhecido';
    }
    return 'Erro desconhecido';
  }

  /**
   * Busca ofertas de produtos usando configurações fornecidas
   * @param params Parâmetros de busca para ProductOfferV2
   * @param shopeeConfig Configurações da Shopee
   */
  async getProductOffers(
    params: ProductOfferV2QueryParams,
    shopeeConfig: ShopeeConfiguration,
  ): Promise<ProductOfferV2Response> {
    // Validar configuração
    if (!ShopeeConfigurationExtractor.validateShopeeConfig(shopeeConfig)) {
      const errorMsg =
        ShopeeConfigurationExtractor.getValidationErrorMessage(shopeeConfig);
      this.logger.error(errorMsg);
      return {
        success: false,
        error: 'Configuração inválida',
        message: errorMsg,
      };
    }

    // Validar parâmetros de busca
    const validationError = this.validateProductOfferParams(params);
    if (validationError) {
      return {
        success: false,
        error: 'Parâmetros inválidos',
        message: validationError,
      };
    }

    return this.processProductOfferRequest(params, shopeeConfig);
  }

  /**
   * Valida os parâmetros de busca do ProductOfferV2
   */
  private validateProductOfferParams(
    params: ProductOfferV2QueryParams,
  ): string | null {
    // Verificar se pelo menos um critério de busca foi fornecido
    if (
      !params.keyword &&
      !params.shopId &&
      !params.itemId &&
      !params.productCatId
    ) {
      return 'Pelo menos um critério de busca deve ser fornecido: keyword, shopId, itemId ou productCatId';
    }

    // Validar page
    if (params.page && params.page < 1) {
      return 'Page deve ser maior que 0';
    }

    // Validar limit
    if (params.limit && (params.limit < 1 || params.limit > 50)) {
      return 'Limit deve estar entre 1 e 50';
    }

    return null;
  }

  /**
   * Processa a requisição de ofertas de produtos
   */
  private async processProductOfferRequest(
    params: ProductOfferV2QueryParams,
    config: ShopeeConfiguration,
  ): Promise<ProductOfferV2Response> {
    try {
      // Construir query GraphQL
      const query = this.buildProductOfferQuery(params);
      const body = { query };

      // Gerar assinatura SHA256
      const timestamp = Math.floor(Date.now() / 1000);
      const payload = JSON.stringify(body);
      const factor = `${config.credential}${timestamp}${payload}${config.secretKey}`;
      const signature = crypto
        .createHash('sha256')
        .update(factor)
        .digest('hex');

      const headers: AxiosRequestConfig['headers'] = {
        Authorization: `SHA256 Credential=${config.credential}, Timestamp=${timestamp}, Signature=${signature}`,
        'Content-Type': 'application/json',
      };

      /*       this.logger.log(
        'Enviando requisição ProductOfferV2 para a API da Shopee',
      ); */

      const response: AxiosResponse<ShopeeProductOfferApiResponse> =
        await axios.post(
          config.affiliateEndpoint ||
            'https://open-api.affiliate.shopee.com.br/graphql',
          body,
          { headers },
        );

      return this.formatProductOfferResponse(response.data, params);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.logger.error('Erro ao buscar ofertas de produtos:', errorMessage);
      return {
        success: false,
        error: 'Erro na requisição',
        message: `Erro ao buscar ofertas de produtos: ${errorMessage}`,
      };
    }
  }

  /**
   * Constrói a query GraphQL para ProductOfferV2
   */
  private buildProductOfferQuery(params: ProductOfferV2QueryParams): string {
    const queryParams: string[] = [];

    // Adicionar parâmetros de busca
    if (params.keyword) {
      queryParams.push(`keyword: "${params.keyword}"`);
    }
    if (params.shopId) {
      queryParams.push(`shopId: "${params.shopId}"`);
    }
    if (params.itemId) {
      queryParams.push(`itemId: "${params.itemId}"`);
    }
    if (params.productCatId) {
      queryParams.push(`productCatId: ${params.productCatId}`);
    }

    // Adicionar parâmetros de configuração
    if (params.listType) {
      queryParams.push(`listType: ${params.listType}`);
    }
    if (params.sortType) {
      queryParams.push(`sortType: ${params.sortType}`);
    }
    if (params.page) {
      queryParams.push(`page: ${params.page}`);
    }
    if (params.limit) {
      queryParams.push(`limit: ${params.limit}`);
    }
    if (params.isAMSOffer !== undefined) {
      queryParams.push(`isAMSOffer: ${params.isAMSOffer}`);
    }
    if (params.isKeySeller !== undefined) {
      queryParams.push(`isKeySeller: ${params.isKeySeller}`);
    }

    const queryParamsString = queryParams.join(', ');

    return `
      query {
        productOfferV2(${queryParamsString}) {
          nodes {
            itemId
            shopId
            price
            commission
            imageUrl
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;
  }

  /**
   * Busca ofertas (campanhas promocionais) da Shopee
   * @param params Parâmetros de busca para shopeeOfferV2
   * @param shopeeConfig Configurações da Shopee
   */
  async getShopeeApiOffers(
    params: ShopeeOfferQueryParams,
    shopeeConfig: ShopeeConfiguration,
  ): Promise<ShopeeOfferV2Response> {
    // Validar configuração
    if (!ShopeeConfigurationExtractor.validateShopeeConfig(shopeeConfig)) {
      const errorMsg =
        ShopeeConfigurationExtractor.getValidationErrorMessage(shopeeConfig);
      this.logger.error(errorMsg);
      return {
        success: false,
        error: 'Configuração inválida',
        message: errorMsg,
      };
    }

    return this.processShopeeApiOfferRequest(params, shopeeConfig);
  }

  /**
   * Processa a requisição de ofertas da Shopee
   */
  private async processShopeeApiOfferRequest(
    params: ShopeeOfferQueryParams,
    config: ShopeeConfiguration,
  ): Promise<ShopeeOfferV2Response> {
    try {
      // Construir query GraphQL
      const query = this.buildShopeeApiOfferQuery(params);
      const body = { query };

      // Gerar assinatura SHA256
      const timestamp = Math.floor(Date.now() / 1000);
      const payload = JSON.stringify(body);
      const factor = `${config.credential}${timestamp}${payload}${config.secretKey}`;
      const signature = crypto
        .createHash('sha256')
        .update(factor)
        .digest('hex');

      const headers: AxiosRequestConfig['headers'] = {
        Authorization: `SHA256 Credential=${config.credential}, Timestamp=${timestamp}, Signature=${signature}`,
        'Content-Type': 'application/json',
      };

      this.logger.log('Enviando requisição shopeeOfferV2 para a API da Shopee');

      const response: AxiosResponse<ShopeeOfferApiResponse> = await axios.post(
        config.affiliateEndpoint ||
          'https://open-api.affiliate.shopee.com.br/graphql',
        body,
        { headers },
      );

      return this.formatShopeeApiOfferResponse(response.data, params);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.logger.error('Erro ao buscar ofertas da Shopee:', errorMessage);
      return {
        success: false,
        error: 'Erro na requisição',
        message: `Erro ao buscar ofertas da Shopee: ${errorMessage}`,
      };
    }
  }

  /**
   * Constrói a query GraphQL para shopeeOfferV2
   */
  private buildShopeeApiOfferQuery(params: ShopeeOfferQueryParams): string {
    const queryParams: string[] = [];

    if (params.keyword) {
      queryParams.push(`keyword: "${params.keyword}"`);
    }
    if (params.sortType) {
      queryParams.push(`sortType: ${params.sortType}`);
    }
    if (params.page) {
      queryParams.push(`page: ${params.page}`);
    }
    if (params.limit) {
      queryParams.push(`limit: ${params.limit}`);
    }

    const queryParamsString = queryParams.join(', ');

    return `
      query {
        shopeeOfferV2(${queryParamsString}) {
          nodes {
            commissionRate
            imageUrl
            offerLink
            originalLink
            offerName
            offerType
            categoryId
            collectionId
            periodStartTime
            periodEndTime
          }
          pageInfo {
            page
            limit
            hasNextPage
          }
        }
      }
    `;
  }

  /**
   * Formata a resposta da API da Shopee para ofertas (shopeeOfferV2)
   */
  private formatShopeeApiOfferResponse(
    apiResponse: ShopeeOfferApiResponse,
    originalParams: ShopeeOfferQueryParams,
  ): ShopeeOfferV2Response {
    if (apiResponse.errors && apiResponse.errors.length > 0) {
      const errorMessage = apiResponse.errors.map((e) => e.message).join(', ');
      return {
        success: false,
        error: 'Erro da API',
        message: errorMessage,
      };
    }

    if (!apiResponse.data?.shopeeOfferV2?.nodes) {
      return {
        success: false,
        error: 'Dados não encontrados',
        message: 'Nenhuma oferta encontrada com os critérios especificados',
      };
    }

    const offers: ShopeeOfferV2[] = apiResponse.data.shopeeOfferV2.nodes.map(
      (node) => ({
        commissionRate: node.commissionRate || '0',
        imageUrl: node.imageUrl || '',
        offerLink: node.offerLink || '',
        originalLink: node.originalLink || '',
        offerName: node.offerName || '',
        offerType: node.offerType || 0,
        categoryId: node.categoryId,
        collectionId: node.collectionId,
        periodStartTime: node.periodStartTime || 0,
        periodEndTime: node.periodEndTime || 0,
      }),
    );

    const pageInfo: ShopeeOfferPageInfo = apiResponse.data.shopeeOfferV2
      .pageInfo
      ? {
          page: apiResponse.data.shopeeOfferV2.pageInfo.page,
          limit: apiResponse.data.shopeeOfferV2.pageInfo.limit,
          hasNextPage: apiResponse.data.shopeeOfferV2.pageInfo.hasNextPage,
        }
      : {
          page: originalParams.page || 1,
          limit: originalParams.limit || 10,
          hasNextPage: false,
        };

    return {
      success: true,
      data: {
        offers,
        pageInfo,
      },
    };
  }

  /**
   * Formata a resposta da API da Shopee para o formato padrão
   */
  private formatProductOfferResponse(
    apiResponse: ShopeeProductOfferApiResponse,
    originalParams: ProductOfferV2QueryParams,
  ): ProductOfferV2Response {
    if (apiResponse.errors && apiResponse.errors.length > 0) {
      const errorMessage = apiResponse.errors.map((e) => e.message).join(', ');
      return {
        success: false,
        error: 'Erro da API',
        message: errorMessage,
      };
    }

    if (!apiResponse.data?.productOfferV2?.nodes) {
      return {
        success: false,
        error: 'Dados não encontrados',
        message: 'Nenhum produto encontrado com os critérios especificados',
      };
    }

    const products: ProductOfferV2Item[] =
      apiResponse.data.productOfferV2.nodes.map((node) => ({
        itemId: String(node.itemId || ''),
        productName: node.productName || `Produto ${node.itemId}`,
        shopName: node.shopName || 'Loja Shopee',
        shopId: String(node.shopId || ''),
        priceMin: String(node.priceMin || node.price || '0'),
        priceMax: String(node.priceMax || node.price || '0'),
        commissionRate: String(node.commissionRate || node.commission || '0'),
        commission: String(node.commission || '0'),
        sales: Number(node.sales) || 0,
        ratingStar: String(node.ratingStar || '0'),
        imageUrl: node.imageUrl || '',
        productLink:
          node.productLink ||
          `https://shopee.com.br/product/${node.shopId || 'shop'}/${node.itemId}`,
        offerLink:
          node.offerLink ||
          `https://shopee.com.br/product/${node.shopId || 'shop'}/${node.itemId}`,
        currency: node.currency || 'BRL',
        discountPercent: Number(node.discountPercent) || 0,
        originalPrice: String(node.originalPrice || node.price || '0'),
        category: node.category || 'Geral',
        categoryId: Number(node.categoryId) || 0,
        brandName: node.brandName || '',
        isOfficial: Boolean(node.isOfficial),
        freeShipping: Boolean(node.freeShipping),
        location: node.location || 'Brasil',
      }));

    const pageInfo: PageInfo = {
      page: originalParams.page || 1,
      limit: originalParams.limit || 10,
      hasNextPage:
        apiResponse.data.productOfferV2.pageInfo?.hasNextPage || false,
      totalResults: undefined, // Não disponível na resposta simplificada
    };

    return {
      success: true,
      data: {
        products,
        pageInfo,
      },
    };
  }
}
