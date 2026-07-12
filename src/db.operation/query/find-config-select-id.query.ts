import { FindConfigSelectIdDto } from '../dto/find-config-select-id.dto';

export function FindConfigSelectIdQuery(
  dataJsonDto: FindConfigSelectIdDto,
): string {
  const peProjectId_ = dataJsonDto.PROJECT_ID ?? 1;
  const peConfigId = dataJsonDto.CONFIG_ID ?? 0;

  const queryString = ` call sp_config_select_id_v1(
       ${peProjectId_},
       ${peConfigId}
       ) `;

  return queryString;
}
