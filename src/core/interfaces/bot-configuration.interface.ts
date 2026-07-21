import type { TblConfigShopeeRecord } from 'src/db.operation/types/db.operation.type';

/**
 * Configuracao Shopee carregada diretamente de tbl_config_shopee.
 */
export interface BotConfiguration {
  configId: number;
  projectId: number | null;
  clientId: number | null;
  accountName: string | null;
  shopeeCredential: string;
  shopeeSecretKey: string;
  shopeeAffiliateEndpoint: string;
  shopeeAffiliateTimeout: string | null;
  shopeeAffiliateSubids: string;
  shopeePage: number | null;
  shopeeSorttype: number | null;
  shopeeLimit: number | null;
  shopeeAppId: number | null;
  shopeeFlagClick: number | null;
  shopeeCurrency: string | null;
  shopeeLocation: string | null;
  activeFlag: number | null;
}

/**
 * Resposta da consulta encapsulada pelo ResultModel.
 */
export interface DatabaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  data: TblConfigShopeeRecord[];
  quantity?: number;
  info1?: string;
  info2?: string;
}

export interface ConfigSearchParams {
  configId: number;
}
