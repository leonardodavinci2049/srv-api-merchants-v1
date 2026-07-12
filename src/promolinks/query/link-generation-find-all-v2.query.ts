import { LinkGenerationFindAllV2Dto } from '../dto/link-generation-find-all-v2.dto';

export function LinkGenerationFindAllV2Query(
  dataJsonDto: LinkGenerationFindAllV2Dto,
): string {
  const olAppId = dataJsonDto.pe_app_id ?? 1;
  const olClientId = dataJsonDto.pe_client_id;
  const olLimit = dataJsonDto.pe_limit ?? 10;

  const queryString = ` call sp_link_generation_find_all_v2(
        ${olAppId},
        ${olClientId},
        ${olLimit}
      ) `;

  return queryString;
}
