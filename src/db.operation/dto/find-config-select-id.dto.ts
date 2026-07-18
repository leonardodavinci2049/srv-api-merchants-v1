import { IsInt, IsPositive } from 'class-validator';

/**
 * Escopo interno de projeto usado apenas para chamadas a sp_config_select_id_v1.
 * O CONFIG_ID nunca deve ser deduzido nem substituido por este valor.
 */
export const SHOPEE_PROJECT_ID = 1;

export class FindConfigSelectIdDto {
  @IsInt()
  @IsPositive()
  PROJECT_ID: number;

  @IsInt()
  @IsPositive()
  CONFIG_ID: number;
}

/**
 * Factory que normaliza a entrada do DTO garantindo o PROJECT_ID interno e o
 * CONFIG_ID positivo vindo da request do caller.
 */
export function buildFindConfigSelectIdDto(
  configId: number,
): FindConfigSelectIdDto {
  return {
    PROJECT_ID: SHOPEE_PROJECT_ID,
    CONFIG_ID: configId,
  };
}
