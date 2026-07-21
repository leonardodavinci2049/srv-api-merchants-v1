import { randomUUID } from 'node:crypto';
import { LinkGenerationCreateV2Dto } from '../dto/link-generation-create-v2.dto';

export const LINK_GENERATION_CREATE_V2_QUERY = `
  INSERT INTO tbl_link_generation_shopee (
    uuId,
    clientId,
    appId,
    linkDestination,
    affiliateLink,
    flagClick,
    itemId,
    productName,
    shopName,
    shopId,
    priceMin,
    priceMax,
    commissionRate,
    commission,
    sales,
    ratingStar,
    imageUrl,
    productLink,
    offerLink,
    currency,
    discountPercent,
    originalPrice,
    category,
    categoryId,
    brandName,
    isOfficial,
    freeShipping,
    location,
    createdAt,
    updatedAt
  ) VALUES (
    ?, ?, ?, ?, ?,
    COALESCE(?, 0),
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    COALESCE(?, 0),
    ?, ?, ?, ?,
    COALESCE(?, 'BRL'),
    ?, ?, ?, ?, ?,
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
