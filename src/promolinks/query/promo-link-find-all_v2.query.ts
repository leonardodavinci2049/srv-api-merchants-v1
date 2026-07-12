import { PromoLinkFindAllV2Dto } from '../dto/promo-link-find-all_v2.dto';

export function PromoLinkFindAllV2Query(
  dataJsonDto: PromoLinkFindAllV2Dto,
): string {
  const olAppId = dataJsonDto.pe_app_id ?? 1;
  const olClientId = dataJsonDto.pe_client_id;
  const olLinkId = dataJsonDto.pe_link_id ?? 0;
  const olLimit = dataJsonDto.pe_limit ?? 10;

  const queryString = ` call sp_promo_link_find_all_v2(
        ${olAppId},
        ${olClientId},
        ${olLinkId},
        ${olLimit}
      ) `;

  return queryString;
}
