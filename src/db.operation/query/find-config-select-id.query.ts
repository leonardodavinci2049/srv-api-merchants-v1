import { FindConfigSelectIdDto } from "../dto/find-config-select-id.dto";

export const SHOPEE_PROJECT_ID = 1;

export function configSelectIdQuery(dataJsonDto: FindConfigSelectIdDto): string {
  const CONFIG_ID = dataJsonDto.CONFIG_ID;
  const olAppId = SHOPEE_PROJECT_ID;

  const queryString = ` call sp_config_select_id_v1(
     ${CONFIG_ID},
    ${olAppId}
      ) `;

  return queryString;
}

