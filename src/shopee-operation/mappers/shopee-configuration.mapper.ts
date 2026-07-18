import { Logger } from '@nestjs/common';
import { ResolvedShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import { SortType } from 'src/core/interfaces/shopee-product-offer.interface';
import { tblConfigSelectIdRecords } from 'src/db.operation/types/db.operation.type';

/**
 * Categorias de campos obrigatorios ausentes ou invalidos na configuracao.
 * Usadas para mensagens de erro sem expor valores reais.
 */
export type MissingShopeeConfigField =
  | 'credential'
  | 'secretKey'
  | 'endpoint'
  | 'timeoutMs'
  | 'affiliateSubids'
  | 'clientId'
  | 'appId'
  | 'currency'
  | 'location'
  | 'page'
  | 'sortType'
  | 'limit';

export interface ShopeeConfigMapperResult {
  config?: ResolvedShopeeConfiguration;
  missing: MissingShopeeConfigField[];
  inactive: boolean;
}

/**
 * Mapper Shopee-especifico: mapeia APENAS os campos exigidos pelas operacoes
 * Shopee. Nao exige campos de Telegram/webhook (diferente de
 * mapDatabaseToBotConfig), evitando bloquear uma configuracao Shopee valida.
 *
 * Trata valores numericos com coerce explicito e rejeita valores invalidos
 * em vez de cair silenciosamente em defaults do .env.
 */
export class ShopeeConfigurationMapper {
  private readonly logger = new Logger(ShopeeConfigurationMapper.name);

  /**
   * Mapeia o registro bruto do banco em ResolvedShopeeConfiguration.
   * Retorna a lista de campos obrigatorios ausentes/invalidos para que o
   * resolver produza a mensagem de erro 422 adequada.
   */
  map(
    record: tblConfigSelectIdRecords | undefined | null,
  ): ShopeeConfigMapperResult {
    if (!record) {
      return { missing: [], inactive: false };
    }

    const missing: MissingShopeeConfigField[] = [];

    const credential = requireNonEmpty(
      record.SHOPEE_CREDENTIAL,
      'credential',
      missing,
    );
    const secretKey = requireNonEmpty(
      record.SHOPEE_SECRET_KEY,
      'secretKey',
      missing,
    );
    const endpoint = requireNonEmpty(
      record.SHOPEE_AFFILIATE_ENDPOINT,
      'endpoint',
      missing,
    );
    const affiliateSubids = requireNonEmpty(
      record.SHOPEE_AFFILIATE_SUBIDS,
      'affiliateSubids',
      missing,
    );
    const currency = requireNonEmpty(
      record.SHOPEE_CURRENCY,
      'currency',
      missing,
    );
    const location = requireNonEmpty(
      record.SHOPEE_LOCATION,
      'location',
      missing,
    );

    const timeoutMs = requirePositiveInt(
      record.SHOPEE_AFFILIATE_TIMEOUT,
      'timeoutMs',
      missing,
    );
    const clientId = requirePositiveInt(record.CLIENT_ID, 'clientId', missing);
    const appId = requirePositiveInt(record.SHOPEE_APP_ID, 'appId', missing);
    const page = requirePositiveInt(record.SHOPEE_PAGE, 'page', missing);
    const sortType = requirePositiveInt(
      record.SHOPEE_SORTTYPE,
      'sortType',
      missing,
    );
    const limit = requirePositiveInt(record.SHOPEE_LIMIT, 'limit', missing);

    const inactive = isInactiveFlag(record.ACTIVE_FLAG);

    if (missing.length > 0) {
      return { missing, inactive };
    }

    const resolved: ResolvedShopeeConfiguration = {
      credential,
      secretKey,
      affiliateSubids,
      endpoint,
      timeoutMs,
      configId: record.CONFIG_ID ?? 0,
      clientId,
      appId,
      flagClick: coerceFlagClick(record.SHOPEE_FLAG_CLICK),
      currency,
      location,
      defaultPage: page,
      defaultSortType: sortType as SortType,
      defaultLimit: limit,
    };

    this.logger.debug?.(
      `Configuracao Shopee mapeada para CONFIG_ID=${resolved.configId}`,
    );
    return { config: resolved, missing, inactive };
  }
}

function requireNonEmpty(
  value: string | undefined | null,
  field: MissingShopeeConfigField,
  missing: MissingShopeeConfigField[],
): string {
  if (value === undefined || value === null || value.trim() === '') {
    missing.push(field);
    return '';
  }
  return value.trim();
}

function requirePositiveInt(
  value: number | string | undefined | null,
  field: MissingShopeeConfigField,
  missing: MissingShopeeConfigField[],
): number {
  if (value === undefined || value === null || value === '') {
    missing.push(field);
    return 0;
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    missing.push(field);
    return 0;
  }
  return n;
}

function coerceFlagClick(value: number | string | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function isInactiveFlag(
  value: number | string | boolean | undefined | null,
): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (value === 0 || value === false) return true;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === '0' || v === 'false';
  }
  return false;
}
