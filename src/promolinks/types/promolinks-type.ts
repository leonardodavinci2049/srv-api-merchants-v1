import { RowDataPacket } from 'mysql2';

export interface SpDefaultFeedback extends RowDataPacket {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
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

export type SpResultRecordCreateType = [SpDefaultFeedback[], SpOperationResult];
export type SpResultRecordUpdateType = [SpDefaultFeedback[], SpOperationResult];
export type SpResultRecordDeleteType = [SpDefaultFeedback[], SpOperationResult];

export interface tbl_link_generation_find_all extends RowDataPacket {
  ID: number;
  CREATEDAT: string;
  LINK_DESTINATION: string;
  AFFILIATE_LINK: string;
  FLAG_CLICK: number;
  ITEM_ID: number;
  PRODUCT_NAME: string;
  SHOP_NAME: string;
  SHOP_ID: number;
  PRICE_MIN: number;
  PRICE_MAX: number;
  COMMISSION_RATE: number;
  COMMISSION: number;
  SALES: number;
  RATING_STAR: number;
  IMAGE_URL: string;
  PRODUCT_LINK: string;
  OFFER_LINK: string;
  CURRENCY: string;
  DISCOUNT_PERCENT: number;
  ORIGINAL_PRICE: number;
  CATEGORY: string;
  CATEGORY_ID: number;
  BRAND_NAME: string;
  IS_OFFICIAL: number;
  FREE_SHIPPING: number;
  LOCATION: string;
}

export interface tbl_promo_link_find_all extends RowDataPacket {
  ID: number;
  LINK1: string;
  LINK2: string;
  LINK3: string;
  LINK_NAME1: string;
  LINK_NAME2: string;
  LINK_NAME3: string;
  SECRET_KEY1: string;
  SECRET_KEY2: string;
  SECRET_KEY3: string;
  NOTES: string;
  CREATEDAT: string;
  UPDATEDAT: string;
}

export type SpResultlinkGenerationFindAllData = [
  tbl_link_generation_find_all[],
  SpDefaultFeedback[],
  SpOperationResult,
];

export type SpResultPromoLinkFindAllData = [
  tbl_promo_link_find_all[],
  SpDefaultFeedback[],
  SpOperationResult,
];
