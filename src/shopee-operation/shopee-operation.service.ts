import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { envs } from 'src/core/config';
import {
  ShopeeConfiguration,
  ShopeeConfigurationExtractor,
} from 'src/core/interfaces/shopee-configuration.interface';
import {
  ShopeeOfferQueryParams,
  ShopeeOfferV2Response,
} from 'src/core/interfaces/shopee-offer.interface';
import {
  ProductOfferV2Item,
  ProductOfferV2QueryParams,
  ProductOfferV2Response,
} from 'src/core/interfaces/shopee-product-offer.interface';
import { FunctionsService } from 'src/core/utils/forServices/functions.service';
import { DbOperationService } from 'src/db.operation/db.operation.service';
import { LinkGenerationCreateV2Dto } from 'src/db.operation/dto/link-generation-create-v2.dto';
import { ShopeeApiService } from 'src/shopee-api/shopee-api.service';
import { GenerateAffiliateLinkResponse } from './dto/generate-affiliate-link-response.dto';
import { validateProductOfferParams } from './utils/getProductOffers/shopee-product-offer-validator.util';

@Injectable()
export class ShopeeOperationService {
  private readonly logger = new Logger(ShopeeOperationService.name);

  constructor(
    private readonly functionsService: FunctionsService,
    private readonly dbOperationService: DbOperationService,
    private readonly shopeeApiService: ShopeeApiService,
  ) {}

  /**
   * Converte string para número de forma segura, retornando 0 para valores inválidos
   */
  private safeParseFloat(value: string | number | undefined | null): number {
    if (value === undefined || value === null || value === '') {
      return 0;
    }
    if (typeof value === 'number') {
      return Number.isNaN(value) ? 0 : value;
    }
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Converte string para inteiro de forma segura, retornando 0 para valores inválidos
   */
  private safeParseInt(value: string | number | undefined | null): number {
    if (value === undefined || value === null || value === '') {
      return 0;
    }
    if (typeof value === 'number') {
      return Number.isNaN(value) ? 0 : Math.floor(value);
    }
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  create() {
    return 'This action adds a new shopeeOperation';
  }

  /**
   * Gera link de afiliado com validação, busca de informações do produto e gravação no banco de dados
   * @param originUrl URL original do produto
   * @param shopeeConfig Configurações da Shopee (do banco de dados)
   */
  async generateAffiliateLink(
    originUrl: string,
    shopeeConfig: ShopeeConfiguration,
    clientId: number,
  ): Promise<GenerateAffiliateLinkResponse> {
    // 1. Validar configuração da Shopee
    if (!ShopeeConfigurationExtractor.validateShopeeConfig(shopeeConfig)) {
      const errorMsg =
        ShopeeConfigurationExtractor.getValidationErrorMessage(shopeeConfig);
      this.logger.error(errorMsg);
      throw new BadRequestException(errorMsg);
    }

    // 2. Validar URL de produto Shopee
    if (!this.functionsService.isValidShopeeProductUrl(originUrl)) {
      this.logger.warn(`URL inválida recebida: ${originUrl}`);
      throw new BadRequestException(
        'A URL fornecida não é uma URL válida de produto da Shopee',
      );
    }

    // 3. Resolver URL encurtada (se necessário) antes de gerar o link
    let resolvedUrl = originUrl;
    if (this.functionsService.isShortShopeeUrl(originUrl)) {
      const fullUrl = await this.functionsService.resolveShortUrl(originUrl);
      if (!fullUrl) {
        throw new BadGatewayException(
          `Não foi possível resolver a URL encurtada: ${originUrl}`,
        );
      }
      resolvedUrl = fullUrl;
    }

    // 4. Gerar link de afiliado (usando a URL resolvida)
    let affiliateLink: string;
    try {
      affiliateLink = await this.shopeeApiService.generateShortLink(
        resolvedUrl,
        shopeeConfig,
      );
    } catch (error) {
      this.logger.error(
        'Erro ao gerar link de afiliado:',
        error instanceof Error ? error.message : error,
      );
      throw error;
    }

    // 5. Extrair ID do produto da URL resolvida
    const productInfo = this.functionsService.extractProductNameId(resolvedUrl);
    if (!productInfo) {
      this.logger.warn(
        `Não foi possível extrair ID do produto: ${resolvedUrl}`,
      );
      throw new BadRequestException(
        'Não foi possível extrair informações do produto da URL',
      );
    }

    // 6. Carregar informações do produto usando a API da Shopee
    let productDetails: ProductOfferV2Item | undefined;
    try {
      const productOfferParams: ProductOfferV2QueryParams = {
        itemId: productInfo.productId,
        page: 1,
        limit: 1,
      };

      const productOfferResponse = await this.getProductOffers(
        productOfferParams,
        shopeeConfig,
      );

      if (
        productOfferResponse.success &&
        productOfferResponse.data?.products?.length
      ) {
        productDetails = productOfferResponse.data.products[0];
      }
      if (!productDetails) {
        throw new BadGatewayException(
          'A Shopee não retornou informações para o produto',
        );
      }
    } catch (error) {
      this.logger.error('Erro ao buscar informações do produto:', error);
      throw error;
    }

    // 7. Gravar informações no banco de dados
    let databaseRecord: { recordId: number; message: string } | undefined;
    try {
      const linkGenerationDto: LinkGenerationCreateV2Dto = {
        pe_uuid: '',
        pe_client_id: clientId,
        pe_app_id: envs.SHOPEE_APP_ID,
        pe_link_destination: originUrl,
        pe_affiliate_link: affiliateLink,
        pe_flag_click: envs.SHOPEE_FLAG_CLICK,
        pe_item_id: this.safeParseInt(
          productDetails?.itemId || productInfo.productId,
        ),
        pe_product_name: productDetails?.productName || productInfo.productName,
        pe_shop_name: productDetails?.shopName || '',
        pe_shop_id: this.safeParseInt(productDetails?.shopId),
        pe_price_min: this.safeParseFloat(productDetails?.priceMin),
        pe_price_max: this.safeParseFloat(productDetails?.priceMax),
        pe_commission_rate: this.safeParseFloat(productDetails?.commissionRate),
        pe_commission: this.safeParseFloat(productDetails?.commission),
        pe_sales: productDetails?.sales || 0,
        pe_rating_star: this.safeParseFloat(productDetails?.ratingStar),
        pe_image_url: productDetails?.imageUrl || '',
        pe_product_link: productDetails?.productLink || originUrl,
        pe_offer_link: productDetails?.offerLink || affiliateLink,
        pe_currency: productDetails.currency || envs.SHOPEE_CURRENCY,
        pe_discount_percent: productDetails?.discountPercent || 0,
        pe_original_price: this.safeParseFloat(productDetails?.originalPrice),
        pe_category: productDetails?.category || '',
        pe_category_id: productDetails?.categoryId || 0,
        pe_brand_name: productDetails?.brandName || '',
        pe_is_official: productDetails?.isOfficial ? 1 : 0,
        pe_free_shipping: productDetails?.freeShipping ? 1 : 0,
        pe_location: productDetails.location || envs.SHOPEE_LOCATION,
      };

      const dbResult =
        await this.dbOperationService.taskLinkGenerationCreateV2(
          linkGenerationDto,
        );

      if (dbResult.statusCode === 100200 && dbResult.recordId) {
        databaseRecord = {
          recordId:
            typeof dbResult.recordId === 'string'
              ? parseInt(dbResult.recordId, 10)
              : dbResult.recordId,
          message: dbResult.message,
        };
      } else {
        throw new InternalServerErrorException(
          dbResult.message || 'Falha ao persistir o link de afiliado',
        );
      }
    } catch (error) {
      this.logger.error('Erro ao gravar no banco de dados:', error);
      throw error instanceof InternalServerErrorException
        ? error
        : new InternalServerErrorException('Falha ao persistir o link');
    }

    // 8. Retornar resposta completa
    return {
      success: true,
      affiliateLink,
      productInfo: productDetails,
      databaseRecord,
    };
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
      throw new BadRequestException(errorMsg);
    }

    // Validar parâmetros de busca
    const validationError = validateProductOfferParams(params);
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    return this.shopeeApiService.getProductOffers(params, shopeeConfig);
  }

  /**
   * Busca ofertas (campanhas promocionais) da Shopee
   * @param params Parâmetros de busca para shopeeOfferV2
   * @param shopeeConfig Configurações da Shopee
   */
  async getShopeeOffers(
    params: ShopeeOfferQueryParams,
    shopeeConfig: ShopeeConfiguration,
  ): Promise<ShopeeOfferV2Response> {
    // Validar configuração
    if (!ShopeeConfigurationExtractor.validateShopeeConfig(shopeeConfig)) {
      const errorMsg =
        ShopeeConfigurationExtractor.getValidationErrorMessage(shopeeConfig);
      this.logger.error(errorMsg);
      throw new BadRequestException(errorMsg);
    }

    return this.shopeeApiService.getShopeeOffers(params, shopeeConfig);
  }
}
