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

export interface tblConfigSelectIdRecords extends RowDataPacket {
  CONFIG_ID?: number;
  PROJECT_ID?: number;
  CUSTOMER_NAME?: string;
  TELEGRAM_BOT_NAME?: string;
  TELEGRAM_BOT_LINK?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_BOT_CHATID?: string;
  WEBHOOK_URL?: string;
  WEBHOOK_LOCAL_PORT?: number;
  OPENAI_API_KEY?: string;
  SHOPEE_CREDENTIAL?: string;
  SHOPEE_SECRET_KEY?: string;
  SHOPEE_AFFILIATE_ENDPOINT?: string;
  SHOPEE_AFFILIATE_TIMEOUT?: number | string;
  SHOPEE_AFFILIATE_SUBIDS?: string;
  SHOPEE_PAGE?: number;
  SHOPEE_SORTTYPE?: number;
  SHOPEE_LIMIT?: number;
  CLIENT_ID?: number;
  SHOPEE_APP_ID?: number;
  SHOPEE_FLAG_CLICK?: number;
  SHOPEE_CURRENCY?: string;
  SHOPEE_LOCATION?: string;
  ACTIVE_FLAG?: number;
  CREATEDAT?: Date;
  UPDATEDAT?: Date;
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

export type SpConfigSelectIdType = [
  tblConfigSelectIdRecords[],
  SpDefaultFeedback[],
  SpOperationResult,
];

export type SpTelegramChatType = [
  tblTelegramChatRecords[],
  SpDefaultFeedback[],
  SpOperationResult,
];
