/**
 * AliExpress affiliate constants. Values are derived from the production
 * documentation under `docs-api-aliexpress/`. The sandbox URL is intentionally
 * not referenced here so no runtime request can select the sandbox environment.
 */

export const ALIEXPRESS_OPERATION = {
  CATEGORY_GET: 'aliexpress.affiliate.category.get',
  PRODUCT_QUERY: 'aliexpress.affiliate.product.query',
  PRODUCT_DETAIL_GET: 'aliexpress.affiliate.productdetail.get',
  PRODUCT_SKU_DETAIL_GET: 'aliexpress.affiliate.product.sku.detail.get',
  LINK_GENERATE: 'aliexpress.affiliate.link.generate',
} as const;

export type AliExpressOperationName =
  (typeof ALIEXPRESS_OPERATION)[keyof typeof ALIEXPRESS_OPERATION];

export const ALIEXPRESS_PROTOCOL = {
  FORMAT: 'json',
  SIGN_METHOD: 'sha256',
  VERSION: '2.0',
  PARTNER_ID: 'saturn-api',
} as const;

/** Bounded request timeout aligned with the reference client behavior. */
export const ALIEXPRESS_TIMEOUT_MS = 30_000;

export const ALIEXPRESS_DEFAULTS = {
  TARGET_CURRENCY: 'USD',
  TARGET_LANGUAGE: 'EN',
} as const;

/** Documented `promotion_link_type` values for affiliate-link generation. */
export const ALIEXPRESS_PROMOTION_LINK_TYPES = [0, 2] as const;

/** Documented `platform_product_type` values for product search. */
export const ALIEXPRESS_PLATFORM_PRODUCT_TYPES = [
  'ALL',
  'PLAZA',
  'TMALL',
] as const;

/** Documented sort options for product search. */
export const ALIEXPRESS_SORT_OPTIONS = [
  'SALE_PRICE_ASC',
  'SALE_PRICE_DESC',
  'LAST_VOLUME_ASC',
  'LAST_VOLUME_DESC',
] as const;

/** Documented delivery-day filter values for product search. */
export const ALIEXPRESS_DELIVERY_DAYS = [3, 5, 7, 10] as const;

/** Documented target currencies accepted by AliExpress affiliate operations. */
export const ALIEXPRESS_TARGET_CURRENCIES = [
  'USD',
  'GBP',
  'CAD',
  'EUR',
  'UAH',
  'MXN',
  'TRY',
  'RUB',
  'BRL',
  'AUD',
  'INR',
  'JPY',
  'IDR',
  'SEK',
  'KRW',
  'ILS',
  'THB',
  'CLP',
  'VND',
] as const;

/** Documented target languages accepted by AliExpress affiliate operations. */
export const ALIEXPRESS_TARGET_LANGUAGES = [
  'EN',
  'RU',
  'PT',
  'ES',
  'FR',
  'ID',
  'IT',
  'TH',
  'JA',
  'AR',
  'VI',
  'TR',
  'DE',
  'HE',
  'KO',
  'NL',
  'PL',
  'MK',
  'CL',
  'IN',
] as const;

/** Documented hosts allowed for affiliate-link `source_values`. */
export const ALIEXPRESS_ALLOWED_SOURCE_HOSTS = [
  'aliexpress.com',
  'www.aliexpress.com',
  'best.aliexpress.com',
  'm.aliexpress.com',
  'ae.aliexpress.com',
  's.click.aliexpress.com',
] as const;

export const ALIEXPRESS_BOUNDS = {
  PAGE_SIZE_MIN: 1,
  PAGE_SIZE_MAX: 50,
  SKU_IDS_MAX: 20,
  SOURCE_VALUES_MAX: 50,
} as const;
