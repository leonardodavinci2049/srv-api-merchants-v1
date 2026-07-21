import { RowDataPacket } from 'mysql2';

export interface SpDefaultFeedback extends RowDataPacket {
  pl_id_cadastro: number;
  pl_feedback: string;
  pl_id_erro: number;
}

// Database operation result
export interface SpOperationResult {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  info: string;
  serverStatus: number;
  warningStatus: number;
  changedRows: number;
}

export interface TblConfigShopeeRecord extends RowDataPacket {
  configId: number;
  projectId: number | null;
  clientId: number | null;
  accountName: string | null;
  shopeeCredential: string | null;
  shopeeSecretKey: string | null;
  shopeeAffiliateEndpoint: string | null;
  shopeeAffiliateTimeout: string | null;
  shopeeAffiliateSubids: string | null;
  shopeePage: number | null;
  shopeeSorttype: number | null;
  shopeeLimit: number | null;
  shopeeAppId: number | null;
  shopeeFlagClick: number | null;
  shopeeCurrency: string | null;
  shopeeLocation: string | null;
  activeFlag: number | null;
}

export interface tblTelegramChatRecords extends RowDataPacket {
  ID: number;
  UUID?: string;
  PROJECT_ID: number;
  CONFIG_ID: number;
  CHAT_ID?: string;
  MESSAGE_RECEIVED?: string;
  MESSAGE_SENT?: string;
  JSON_OBJECT?: string;
  CREATEDAT?: Date;
  UPDATEDAT?: Date;
}

export type ConfigShopeeSelectResult = TblConfigShopeeRecord[];

export type SpTelegramChatType = [
  tblTelegramChatRecords[],
  SpDefaultFeedback[],
  SpOperationResult,
];
