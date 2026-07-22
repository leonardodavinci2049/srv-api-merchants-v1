/**
 * AliExpress provider contracts.
 *
 * These interfaces describe the request parameters accepted by the local
 * adapter and the response envelopes returned by AliExpress. Public field
 * names keep the original `snake_case` documented by AliExpress so the
 * integration never silently renames provider data.
 */

export type AliExpressParamValue = string | number | boolean | undefined;

export type AliExpressParameters = Record<string, AliExpressParamValue>;

/**
 * System parameters required by every AliExpress gateway call. The `sign`
 * value is appended after the request is signed.
 */
export interface AliExpressSystemParams {
  app_key: string;
  format: string;
  method: string;
  partner_id: string;
  sign: string;
  sign_method: string;
  timestamp: string;
  v: string;
}

/**
 * Operation parameters supplied by the operation service. They are joined with
 * the system parameters before signing.
 */
export type AliExpressOperationParams = AliExpressParameters;

/** Top-level transport envelope returned by AliExpress. */
export interface AliExpressTransportEnvelope {
  aliexpress_affiliate_product_query_response?: AliExpressOperationEnvelope;
  aliexpress_affiliate_productdetail_get_response?: AliExpressOperationEnvelope;
  aliexpress_affiliate_product_sku_detail_get_response?: AliExpressSkuDetailEnvelope;
  aliexpress_affiliate_category_get_response?: AliExpressOperationEnvelope;
  aliexpress_affiliate_link_generate_response?: AliExpressOperationEnvelope;
  error_response?: AliExpressErrorResponse;
  request_id?: string;
  _trace_id_?: string;
}

/** Standard `resp_result` envelope used by most affiliate operations. */
export interface AliExpressOperationEnvelope {
  resp_result?: {
    resp_code?: string | number;
    resp_msg?: string;
    result?: unknown;
  };
}

/**
 * Distinct nested envelope returned by `aliexpress.affiliate.product.sku.detail.get`.
 * The outer `result` carries the inner `result` plus `code`/`success`.
 */
export interface AliExpressSkuDetailEnvelope {
  result?: {
    result?: unknown;
    code?: string | number;
    success?: boolean | string;
  };
}

/** Provider error payload returned at the transport boundary. */
export interface AliExpressErrorResponse {
  code?: string | number;
  msg?: string;
  sub_code?: string;
  sub_msg?: string;
  request_id?: string;
}

/** Typed result for `aliexpress.affiliate.category.get`. */
export interface AliExpressCategoryResult {
  total_result_count: string | number;
  categories: AliExpressCategory[];
}

export interface AliExpressCategory {
  category_id: string | number;
  category_name: string;
  parent_category_id?: string | number;
}

/** Typed result for `aliexpress.affiliate.product.query`. */
export interface AliExpressProductQueryResult {
  current_page_no?: number;
  current_record_count?: number;
  total_page_no?: number;
  total_record_count?: number;
  products?: unknown;
}

/** Typed result for `aliexpress.affiliate.productdetail.get`. */
export interface AliExpressProductDetailResult {
  current_record_count?: string | number;
  products?: unknown;
}

/**
 * Typed result for `aliexpress.affiliate.product.sku.detail.get`. The shape
 * preserves the `ae_item_info` object documented by AliExpress.
 */
export interface AliExpressSkuDetailResult {
  ae_item_info?: Record<string, unknown> & {
    product_id?: string | number;
  };
  ae_item_sku_info?: unknown;
  code?: string | number;
  success?: boolean | string;
}

/** Typed result for `aliexpress.affiliate.link.generate`. */
export interface AliExpressLinkGenerateResult {
  total_result_count?: string | number;
  promotion_links?: AliExpressPromotionLink[];
}

export interface AliExpressPromotionLink {
  promotion_link: string;
  source_value: string;
  tracking_id?: string;
}

/** Sanitized diagnostic context kept for internal logging only. */
export interface AliExpressRequestContext {
  operation: string;
  requestId?: string;
  traceId?: string;
}
