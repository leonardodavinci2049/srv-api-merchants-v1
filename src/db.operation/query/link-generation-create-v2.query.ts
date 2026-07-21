import { randomUUID } from 'node:crypto';
import { LinkGenerationCreateV2Dto } from '../dto/link-generation-create-v2.dto';

export const LINK_GENERATION_CREATE_V2_QUERY = `
  INSERT INTO tbl_link_generation (
    UUID,
    CLIENT_ID,
    APP_ID,
    LINK_DESTINATION,
    AFFILIATE_LINK,
    FLAG_CLICK,
    ITEM_ID,
    PRODUCT_NAME,
    SHOP_NAME,
    SHOP_ID,
    PRICE_MIN,
    PRICE_MAX,
    COMMISSION_RATE,
    COMMISSION,
    SALES,
    RATING_STAR,
    IMAGE_URL,
    PRODUCT_LINK,
    OFFER_LINK,
    CURRENCY,
    DISCOUNT_PERCENT,
    ORIGINAL_PRICE,
    CATEGORY,
    CATEGORY_ID,
    BRAND_NAME,
    IS_OFFICIAL,
    FREE_SHIPPING,
    LOCATION,
    CREATEDAT,
    UPDATEDAT
  ) VALUES (
    ?, ?, ?, ?, ?,
    COALESCE(?, 0),
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    COALESCE(?, 0),
    ?, ?, ?, ?,
    COALESCE(?, 'BRL'),
    ?, ?, ?, ?,
    COALESCE(?, 0),
    COALESCE(?, 0),
    ?,
    CURRENT_TIMESTAMP(),
    CURRENT_TIMESTAMP()
  );
`;

export function LinkGenerationCreateV2Params(
  dataJsonDto: LinkGenerationCreateV2Dto,
): Array<string | number | null> {
  const olUuid = dataJsonDto.pe_uuid?.trim() || randomUUID();
  const olClientId = dataJsonDto.pe_client_id ?? 1;
  const olAppId = dataJsonDto.pe_app_id ?? 1;
  const olLinkDestination = dataJsonDto.pe_link_destination ?? '';
  const olAffiliateLink = dataJsonDto.pe_affiliate_link ?? '';
  const olFlagClick = dataJsonDto.pe_flag_click ?? null;
  const olItemId = dataJsonDto.pe_item_id ?? 0;
  const olProductName = dataJsonDto.pe_product_name ?? '';
  const olShopName = dataJsonDto.pe_shop_name ?? '';
  const olShopId = dataJsonDto.pe_shop_id ?? 0;
  const olPriceMin = dataJsonDto.pe_price_min ?? 0;
  const olPriceMax = dataJsonDto.pe_price_max ?? 0;
  const olCommissionRate = dataJsonDto.pe_commission_rate ?? 0;
  const olCommission = dataJsonDto.pe_commission ?? 0;
  const olSales = dataJsonDto.pe_sales ?? null;
  const olRatingStar = dataJsonDto.pe_rating_star ?? 0;
  const olImageUrl = dataJsonDto.pe_image_url ?? '';
  const olProductLink = dataJsonDto.pe_product_link ?? '';
  const olOfferLink = dataJsonDto.pe_offer_link ?? '';
  const olCurrency = dataJsonDto.pe_currency ?? null;
  const olDiscountPercent = dataJsonDto.pe_discount_percent ?? 0;
  const olOriginalPrice = dataJsonDto.pe_original_price ?? 0;
  const olCategory = dataJsonDto.pe_category ?? '';
  const olCategoryId = dataJsonDto.pe_category_id ?? 0;
  const olBrandName = dataJsonDto.pe_brand_name ?? '';
  const olIsOfficial = dataJsonDto.pe_is_official ?? null;
  const olFreeShipping = dataJsonDto.pe_free_shipping ?? null;
  const olLocation = dataJsonDto.pe_location ?? '';

  return [
    olUuid,
    olClientId,
    olAppId,
    olLinkDestination,
    olAffiliateLink,
    olFlagClick,
    olItemId,
    olProductName,
    olShopName,
    olShopId,
    olPriceMin,
    olPriceMax,
    olCommissionRate,
    olCommission,
    olSales,
    olRatingStar,
    olImageUrl,
    olProductLink,
    olOfferLink,
    olCurrency,
    olDiscountPercent,
    olOriginalPrice,
    olCategory,
    olCategoryId,
    olBrandName,
    olIsOfficial,
    olFreeShipping,
    olLocation,
  ];
}
