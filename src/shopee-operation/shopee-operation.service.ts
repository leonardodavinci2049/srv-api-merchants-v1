import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ResolvedShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
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
import { GenerateAffiliateLinkDto } from './dto/generate-affiliate-link.dto';
import { GetProductOffersDto } from './dto/get-product-offers.dto';
import { GetShopeeOffersDto } from './dto/get-shopee-offers.dto';
import { GenerateAffiliateLinkResponse } from './interface/generate-affiliate-link-response.dto';
import { ShopeeConfigurationResolver } from './services/shopee-configuration.resolver';
import { validateProductOfferParams } from './utils/getProductOffers/shopee-product-offer-validator.util';

@Injectable()
export class ShopeeOperationService {
  private readonly logger = new Logger(ShopeeOperationService.name);

  constructor(
    private readonly functionsService: FunctionsService,
    private readonly dbOperationService: DbOperationService,
    private readonly shopeeApiService: ShopeeApiService,
    private readonly configResolver: ShopeeConfigurationResolver,
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

  /**
   * Gera link de afiliado com validação, busca de informações do produto e gravação no banco.
   * A configuracao Shopee é resolvida uma única vez a partir do configId do caller.
   */
  async generateAffiliateLink(
    dto: GenerateAffiliateLinkDto,
  ): Promise<GenerateAffiliateLinkResponse> {
    const config = await this.configResolver.resolve(dto.configId);
    const { originUrl } = dto;

    if (!this.functionsService.isValidShopeeProductUrl(originUrl)) {
      this.logger.warn(`URL inválida recebida: ${originUrl}`);
      throw new BadRequestException(
        'A URL fornecida não é uma URL válida de produto da Shopee',
      );
    }

    // Resolver URL encurtada (se necessário) antes de gerar o link
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

    // Gerar link de afiliado usando a URL resolvida
    let affiliateLink: string;
    try {
      affiliateLink = await this.shopeeApiService.generateShortLink(
        resolvedUrl,
        config,
      );
    } catch (error) {
      this.logger.error(
        'Erro ao gerar link de afiliado:',
        error instanceof Error ? error.message : error,
      );
      throw error;
    }

    // Extrair ID do produto da URL resolvida
    const productInfo = this.functionsService.extractProductNameId(resolvedUrl);
    if (!productInfo) {
      this.logger.warn(
        `Não foi possível extrair ID do produto: ${resolvedUrl}`,
      );
      throw new BadRequestException(
        'Não foi possível extrair informações do produto da URL',
      );
    }

    // Carregar informações do produto reusando a config já resolvida.
    // O enrichment interno usa page=1/limit=1 fixos (nao substituir por defaults do DB).
    let productDetails: ProductOfferV2Item | undefined;
    try {
      const productOfferParams: ProductOfferV2QueryParams = {
        itemId: productInfo.productId,
        page: 1,
        limit: 1,
      };

      const productOfferResponse = await this.getProductOffersInternal(
        productOfferParams,
        config,
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

    // Gravar informações no banco, derivando persistence defaults do registro
    let databaseRecord: { recordId: number; message: string } | undefined;
    try {
      const linkGenerationDto: LinkGenerationCreateV2Dto = {
        pe_uuid: '',
        pe_client_id: config.clientId,
        pe_app_id: config.appId,
        pe_link_destination: originUrl,
        pe_affiliate_link: affiliateLink,
        pe_flag_click: config.flagClick,
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
        pe_currency: productDetails.currency || config.currency,
        pe_discount_percent: productDetails?.discountPercent || 0,
        pe_original_price: this.safeParseFloat(productDetails?.originalPrice),
        pe_category: productDetails?.category || '',
        pe_category_id: productDetails?.categoryId || 0,
        pe_brand_name: productDetails?.brandName || '',
        pe_is_official: productDetails?.isOfficial ? 1 : 0,
        pe_free_shipping: productDetails?.freeShipping ? 1 : 0,
        pe_location: productDetails.location || config.location,
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

    return {
      success: true,
      affiliateLink,
      productInfo: productDetails,
      databaseRecord,
    };
  }

  /**
   * Busca ofertas de produtos usando a configuracao resolvida pelo configId.
   */
  async getProductOffers(
    dto: GetProductOffersDto,
  ): Promise<ProductOfferV2Response> {
    const config = await this.configResolver.resolve(dto.configId);
    const params = this.buildProductOfferParams(dto, config);
    return this.getProductOffersInternal(params, config);
  }

  /**
   * Monta os parametros de ProductOfferV2 aplicando request > default do
   * registro selecionado. Os bounds (1..50) já sao garantidos pelo DTO.
   */
  private buildProductOfferParams(
    dto: GetProductOffersDto,
    config: ResolvedShopeeConfiguration,
  ): ProductOfferV2QueryParams {
    return {
      keyword: dto.keyword,
      shopId: dto.shopId,
      itemId: dto.itemId,
      productCatId: dto.productCatId,
      listType: dto.listType,
      sortType: dto.sortType ?? config.defaultSortType,
      page: dto.page ?? config.defaultPage,
      limit: dto.limit ?? config.defaultLimit,
      isAMSOffer: dto.isAMSOffer,
      isKeySeller: dto.isKeySeller,
    };
  }



  /**
   * Executa a chamada ao adapter depois que a configuracao já está resolvida.
   * Usado pelo fluxo público e pelo enrichment interno de generateAffiliateLink.
   */
  private async getProductOffersInternal(
    params: ProductOfferV2QueryParams,
    config: ResolvedShopeeConfiguration,
  ): Promise<ProductOfferV2Response> {
    const validationError = validateProductOfferParams(params);
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    return this.shopeeApiService.getProductOffers(params, config, {
      currencyFallback: config.currency,
      locationFallback: config.location,
    });
  }




  /**
   * Busca ofertas da Shopee usando a configuracao resolvida pelo configId.
   */
  async getShopeeOffers(
    dto: GetShopeeOffersDto,
  ): Promise<ShopeeOfferV2Response> {
    const config = await this.configResolver.resolve(dto.configId);
    const params = this.buildShopeeOfferParams(dto, config);
    return this.shopeeApiService.getShopeeOffers(params, config);
  }


  /**
   * Monta os parametros de shopeeOfferV2 aplicando request > default do
   * registro selecionado. Os bounds (1..50) já sao garantidos pelo DTO.
   */
  private buildShopeeOfferParams(
    dto: GetShopeeOffersDto,
    config: ResolvedShopeeConfiguration,
  ): ShopeeOfferQueryParams {
    return {
      keyword: dto.keyword,
      sortType: dto.sortType ?? config.defaultSortType,
      page: dto.page ?? config.defaultPage,
      limit: dto.limit ?? config.defaultLimit,
    };
  }




}
