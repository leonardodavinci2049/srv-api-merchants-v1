import { Injectable, Logger } from '@nestjs/common';
import axios, { type AxiosRequestConfig } from 'axios';
import { envs } from 'src/core/config/envs';
import {
  ALIEXPRESS_DEFAULTS,
  ALIEXPRESS_OPERATION,
  ALIEXPRESS_TIMEOUT_MS,
  type AliExpressOperationName,
} from './aliexpress-api.constants';
import type {
  AliExpressCategoryResult,
  AliExpressLinkGenerateResult,
  AliExpressOperationParams,
  AliExpressProductDetailResult,
  AliExpressProductQueryResult,
  AliExpressRequestContext,
  AliExpressSkuDetailResult,
  AliExpressTransportEnvelope,
} from './interfaces/aliexpress-api.interface';
import {
  AliExpressProviderError,
  assertNoErrorResponse,
  assertSkuDetailResult,
  assertStandardResult,
  normalizeTransportError,
} from './utils/aliexpress-error.util';
import { buildSignedFormBody } from './utils/aliexpress-request.util';

/**
 * Transport boundary for the AliExpress affiliate gateway. Implements only the
 * five documented affiliate operations and always targets the production
 * gateway. The sandbox configuration is intentionally not referenced here.
 */
@Injectable()
export class AliExpressApiService {
  private readonly logger = new Logger(AliExpressApiService.name);

  async getCategories(
    params: AliExpressOperationParams = {},
  ): Promise<AliExpressCategoryResult> {
    return this.requestStandard<AliExpressCategoryResult>(
      ALIEXPRESS_OPERATION.CATEGORY_GET,
      params,
    );
  }

  async searchProducts(
    params: AliExpressOperationParams,
  ): Promise<AliExpressProductQueryResult> {
    return this.requestStandard<AliExpressProductQueryResult>(
      ALIEXPRESS_OPERATION.PRODUCT_QUERY,
      params,
    );
  }

  async getProductDetails(
    params: AliExpressOperationParams,
  ): Promise<AliExpressProductDetailResult> {
    return this.requestStandard<AliExpressProductDetailResult>(
      ALIEXPRESS_OPERATION.PRODUCT_DETAIL_GET,
      params,
    );
  }

  async getProductSkuDetails(
    params: AliExpressOperationParams,
  ): Promise<AliExpressSkuDetailResult> {
    return this.requestSkuDetail(
      ALIEXPRESS_OPERATION.PRODUCT_SKU_DETAIL_GET,
      params,
    );
  }

  async generateAffiliateLinks(
    params: AliExpressOperationParams,
  ): Promise<AliExpressLinkGenerateResult> {
    return this.requestStandard<AliExpressLinkGenerateResult>(
      ALIEXPRESS_OPERATION.LINK_GENERATE,
      params,
    );
  }

  private async requestStandard<T>(
    operation: AliExpressOperationName,
    operationParams: AliExpressOperationParams,
  ): Promise<T> {
    const context: AliExpressRequestContext = { operation };
    try {
      const payload = await this.post(operation, operationParams, context);
      assertNoErrorResponse(payload, operation, context);
      const result = assertStandardResult(payload, operation, context);
      return result as T;
    } catch (error) {
      throw this.translate(error, operation, context);
    }
  }

  private async requestSkuDetail(
    operation: AliExpressOperationName,
    operationParams: AliExpressOperationParams,
  ): Promise<AliExpressSkuDetailResult> {
    const context: AliExpressRequestContext = { operation };
    try {
      const payload = await this.post(operation, operationParams, context);
      assertNoErrorResponse(payload, operation, context);
      const result = assertSkuDetailResult(payload, operation, context);
      return result as AliExpressSkuDetailResult;
    } catch (error) {
      throw this.translate(error, operation, context);
    }
  }

  private async post(
    operation: AliExpressOperationName,
    operationParams: AliExpressOperationParams,
    context: AliExpressRequestContext,
  ): Promise<AliExpressTransportEnvelope> {
    const { body, systemParams } = buildSignedFormBody({
      operation,
      appKey: envs.ALIEXPRESS_APP_KEY,
      appSecret: envs.ALIEXPRESS_APP_SECRET,
      operationParams,
    });

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Accept: 'application/json',
      },
      timeout: ALIEXPRESS_TIMEOUT_MS,
      // Never follow redirects for outbound provider calls.
      maxRedirects: 0,
    };

    const url = this.buildGatewayUrl(operation);
    try {
      const response = await axios.post<AliExpressTransportEnvelope>(
        url,
        body,
        config,
      );
      return response.data;
    } catch (error) {
      // Re-throw our own normalized errors untouched.
      if (error instanceof AliExpressProviderError) throw error;
      throw normalizeTransportError(error, operation, {
        ...context,
        requestId: systemParams.sign.length ? context.requestId : undefined,
      });
    }
  }

  private buildGatewayUrl(operation: AliExpressOperationName): string {
    const base = envs.ALIEXPRESS_SERVER_URL;
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}method=${encodeURIComponent(operation)}`;
  }

  private translate(
    error: unknown,
    operation: AliExpressOperationName,
    context: AliExpressRequestContext,
  ): AliExpressProviderError {
    const normalized = normalizeTransportError(error, operation, context);
    // Only safe diagnostic context is logged. Request bodies, signatures, and
    // response content are never logged.
    this.logger.warn(
      `AliExpress ${operation} failed: ${normalized.message}${
        normalized.context.requestId
          ? ` (request_id=${normalized.context.requestId})`
          : ''
      }`,
    );
    return normalized;
  }
}

/**
 * Provider defaults exposed for the operation service. They are applied only
 * where the relevant operation documents the field as optional.
 */
export const ALIEXPRESS_OPERATION_DEFAULTS = {
  targetCurrency: ALIEXPRESS_DEFAULTS.TARGET_CURRENCY,
  targetLanguage: ALIEXPRESS_DEFAULTS.TARGET_LANGUAGE,
  trackingId: envs.ALIEXPRESS_TRACKING_ID,
};
