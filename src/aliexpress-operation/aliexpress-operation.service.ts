import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ALIEXPRESS_OPERATION_DEFAULTS,
  AliExpressApiService,
} from 'src/aliexpress-api/aliexpress-api.service';
import type {
  AliExpressCategoryResult,
  AliExpressLinkGenerateResult,
  AliExpressOperationParams,
  AliExpressProductDetailResult,
  AliExpressProductQueryResult,
  AliExpressSkuDetailResult,
} from 'src/aliexpress-api/interfaces/aliexpress-api.interface';
import {
  AliExpressProviderError,
  normalizeTransportError,
} from 'src/aliexpress-api/utils/aliexpress-error.util';
import { GenerateAffiliateLinksDto } from './dto/generate-affiliate-links.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { GetProductDetailsDto } from './dto/get-product-details.dto';
import { GetProductSkuDetailsDto } from './dto/get-product-sku-details.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { AliExpressOperationResponseDto } from './interface/aliexpress-operation-response.dto';

/**
 * Thin orchestration layer that maps validated request DTOs onto the
 * AliExpress adapter. Returns a stable `{ success, data }` envelope on success
 * and translates provider/transport failures into NestJS exceptions.
 */
@Injectable()
export class AliExpressOperationService {
  private readonly logger = new Logger(AliExpressOperationService.name);

  constructor(private readonly aliExpressApi: AliExpressApiService) {}

  async getCategories(
    dto: GetCategoriesDto,
  ): Promise<AliExpressOperationResponseDto<AliExpressCategoryResult>> {
    const params: AliExpressOperationParams = {};
    if (dto.app_signature !== undefined)
      params.app_signature = dto.app_signature;
    const data = await this.call(
      () => this.aliExpressApi.getCategories(params),
      'get categories',
    );
    return AliExpressOperationResponseDto.success(data);
  }

  async searchProducts(
    dto: SearchProductsDto,
  ): Promise<AliExpressOperationResponseDto<AliExpressProductQueryResult>> {
    const data = await this.call(
      () => this.aliExpressApi.searchProducts(this.buildSearchParams(dto)),
      'search products',
    );
    return AliExpressOperationResponseDto.success(data);
  }

  async getProductDetails(
    dto: GetProductDetailsDto,
  ): Promise<AliExpressOperationResponseDto<AliExpressProductDetailResult>> {
    const data = await this.call(
      () =>
        this.aliExpressApi.getProductDetails(
          this.buildProductDetailsParams(dto),
        ),
      'get product details',
    );
    return AliExpressOperationResponseDto.success(data);
  }

  async getProductSkuDetails(
    dto: GetProductSkuDetailsDto,
  ): Promise<AliExpressOperationResponseDto<AliExpressSkuDetailResult>> {
    const data = await this.call(
      () =>
        this.aliExpressApi.getProductSkuDetails(
          this.buildProductSkuDetailsParams(dto),
        ),
      'get product sku details',
    );
    return AliExpressOperationResponseDto.success(data);
  }

  async generateAffiliateLinks(
    dto: GenerateAffiliateLinksDto,
  ): Promise<AliExpressOperationResponseDto<AliExpressLinkGenerateResult>> {
    const params: AliExpressOperationParams = {
      promotion_link_type: dto.promotion_link_type,
      source_values: dto.source_values,
      tracking_id: dto.tracking_id,
    };
    if (dto.ship_to_country !== undefined)
      params.ship_to_country = dto.ship_to_country;
    if (dto.app_signature !== undefined)
      params.app_signature = dto.app_signature;
    const data = await this.call(
      () => this.aliExpressApi.generateAffiliateLinks(params),
      'generate affiliate links',
    );
    return AliExpressOperationResponseDto.success(data);
  }

  private buildSearchParams(dto: SearchProductsDto): AliExpressOperationParams {
    const params: AliExpressOperationParams = {};
    if (dto.app_signature !== undefined)
      params.app_signature = dto.app_signature;
    if (dto.category_ids !== undefined) params.category_ids = dto.category_ids;
    if (dto.fields !== undefined) params.fields = dto.fields;
    if (dto.keywords !== undefined) params.keywords = dto.keywords;
    if (dto.min_sale_price !== undefined)
      params.min_sale_price = dto.min_sale_price;
    if (dto.max_sale_price !== undefined)
      params.max_sale_price = dto.max_sale_price;
    if (dto.page_no !== undefined) params.page_no = dto.page_no;
    if (dto.page_size !== undefined) params.page_size = dto.page_size;
    if (dto.platform_product_type !== undefined)
      params.platform_product_type = dto.platform_product_type;
    if (dto.sort !== undefined) params.sort = dto.sort;
    // target_currency/target_language/tracking_id default only where documented
    // as optional; explicit validated request values always win.
    params.target_currency =
      dto.target_currency ?? ALIEXPRESS_OPERATION_DEFAULTS.targetCurrency;
    params.target_language =
      dto.target_language ?? ALIEXPRESS_OPERATION_DEFAULTS.targetLanguage;
    params.tracking_id =
      dto.tracking_id ?? ALIEXPRESS_OPERATION_DEFAULTS.trackingId;
    if (dto.promotion_name !== undefined)
      params.promotion_name = dto.promotion_name;
    if (dto.ship_to_country !== undefined)
      params.ship_to_country = dto.ship_to_country;
    if (dto.delivery_days !== undefined)
      params.delivery_days = dto.delivery_days;
    return params;
  }

  private buildProductDetailsParams(
    dto: GetProductDetailsDto,
  ): AliExpressOperationParams {
    const params: AliExpressOperationParams = {};
    if (dto.app_signature !== undefined)
      params.app_signature = dto.app_signature;
    if (dto.fields !== undefined) params.fields = dto.fields;
    if (dto.product_ids !== undefined) params.product_ids = dto.product_ids;
    params.target_currency =
      dto.target_currency ?? ALIEXPRESS_OPERATION_DEFAULTS.targetCurrency;
    params.target_language =
      dto.target_language ?? ALIEXPRESS_OPERATION_DEFAULTS.targetLanguage;
    params.tracking_id =
      dto.tracking_id ?? ALIEXPRESS_OPERATION_DEFAULTS.trackingId;
    if (dto.country !== undefined) params.country = dto.country;
    return params;
  }

  private buildProductSkuDetailsParams(
    dto: GetProductSkuDetailsDto,
  ): AliExpressOperationParams {
    const params: AliExpressOperationParams = {
      product_id: dto.product_id,
      ship_to_country: dto.ship_to_country,
      target_currency: dto.target_currency,
      target_language: dto.target_language,
    };
    if (dto.need_deliver_info !== undefined)
      params.need_deliver_info = dto.need_deliver_info;
    if (dto.sku_ids !== undefined) params.sku_ids = dto.sku_ids;
    return params;
  }

  private async call<T>(
    operation: () => Promise<T>,
    label: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.translate(error, label);
    }
  }

  private translate(error: unknown, label: string): Error {
    if (!(error instanceof AliExpressProviderError)) {
      this.logger.error(
        `Unexpected AliExpress failure while ${label}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return new BadGatewayException(
        `AliExpress request could not be processed`,
      );
    }

    const transport = normalizeTransportError(
      error.cause ?? error,
      label,
      error.context,
    );
    this.logger.warn(
      `AliExpress ${label} failed: ${transport.message}${
        transport.context.requestId
          ? ` (request_id=${transport.context.requestId})`
          : ''
      }`,
    );

    // Timeouts/unreachability surface as 503.
    if (this.isTimeoutOrUnreachable(transport)) {
      return new ServiceUnavailableException(
        `AliExpress is unavailable for ${label}`,
      );
    }
    // Provider-rejected requests and HTTP failures are 502 Bad Gateway.
    return new BadGatewayException(
      `AliExpress rejected the request while ${label}`,
    );
  }

  private isTimeoutOrUnreachable(error: AliExpressProviderError): boolean {
    if (
      error.message.includes('timed out') ||
      error.message.includes('unreachable')
    ) {
      return true;
    }
    return false;
  }

  /** Exposed for defense-in-depth validation by the controller or tests. */
  isUnexpectedState(error: unknown): boolean {
    return !(error instanceof AliExpressProviderError);
  }

  /** Helper used by the controller to surface validation-only bad requests. */
  asBadRequest(message: string): Error {
    return new BadRequestException(message);
  }
}
