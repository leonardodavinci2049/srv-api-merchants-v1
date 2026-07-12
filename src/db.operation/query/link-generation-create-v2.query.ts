import { randomUUID } from 'node:crypto';
import { LinkGenerationCreateV2Dto } from '../dto/link-generation-create-v2.dto';

export function LinkGenerationCreateV2Query(
  dataJsonDto: LinkGenerationCreateV2Dto,
): string {
  const olUuid = dataJsonDto.pe_uuid?.trim() || randomUUID();
  const olAppId = dataJsonDto.pe_app_id ?? 1;
  const olClientId = dataJsonDto.pe_client_id ?? 1;
  const olLinkDestination = dataJsonDto.pe_link_destination ?? '';
  const olAffiliateLink = dataJsonDto.pe_affiliate_link ?? '';
  const olFlagClick = dataJsonDto.pe_flag_click ?? 0;
  const olItemId = dataJsonDto.pe_item_id ?? 0;
  const olProductName = dataJsonDto.pe_product_name ?? '';
  const olShopName = dataJsonDto.pe_shop_name ?? '';
  const olShopId = dataJsonDto.pe_shop_id ?? 0;
  const olPriceMin = dataJsonDto.pe_price_min ?? 0;
  const olPriceMax = dataJsonDto.pe_price_max ?? 0;
  const olCommissionRate = dataJsonDto.pe_commission_rate ?? 0;
  const olCommission = dataJsonDto.pe_commission ?? 0;
  const olSales = dataJsonDto.pe_sales ?? 0;
  const olRatingStar = dataJsonDto.pe_rating_star ?? 0;
  const olImageUrl = dataJsonDto.pe_image_url ?? '';
  const olProductLink = dataJsonDto.pe_product_link ?? '';
  const olOfferLink = dataJsonDto.pe_offer_link ?? '';
  const olCurrency = dataJsonDto.pe_currency ?? 'BRL';
  const olDiscountPercent = dataJsonDto.pe_discount_percent ?? 0;
  const olOriginalPrice = dataJsonDto.pe_original_price ?? 0;
  const olCategory = dataJsonDto.pe_category ?? '';
  const olCategoryId = dataJsonDto.pe_category_id ?? 0;
  const olBrandName = dataJsonDto.pe_brand_name ?? '';
  const olIsOfficial = dataJsonDto.pe_is_official ?? 0;
  const olFreeShipping = dataJsonDto.pe_free_shipping ?? 0;
  const olLocation = dataJsonDto.pe_location ?? '';

  const queryString = ` call sp_link_generation_create_v2(
        '${olUuid}',
        ${olAppId},
        ${olClientId},
        '${olLinkDestination}',
        '${olAffiliateLink}',
        ${olFlagClick},
        ${olItemId},
        '${olProductName}',
        '${olShopName}',
        ${olShopId},
        ${olPriceMin},
        ${olPriceMax},
        ${olCommissionRate},
        ${olCommission},
        ${olSales},
        ${olRatingStar},
        '${olImageUrl}',
        '${olProductLink}',
        '${olOfferLink}',
        '${olCurrency}',
        ${olDiscountPercent},
        ${olOriginalPrice},
        '${olCategory}',
        ${olCategoryId},
        '${olBrandName}',
        ${olIsOfficial},
        ${olFreeShipping},
        '${olLocation}'
      ) `;

  return queryString;
}
