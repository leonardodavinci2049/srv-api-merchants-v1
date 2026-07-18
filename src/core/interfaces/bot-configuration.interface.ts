/**
 * Interface para configuração de bot carregada do banco de dados
 */
export interface BotConfiguration {
  configId: number;
  customerName: string;
  telegramBotName: string;
  telegramBotLink: string;
  telegramBotToken: string;
  telegramBotChatId: string;
  webhookUrl: string;
  webhookLocalPort: number;
  openaiApiKey: string;
  shopeeCredential: string;
  shopeeSecretKey: string;
  shopeeAffiliateEndpoint: string;
  shopeeAffiliateTimeout: number | string;
  shopeeAffiliateSubids: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para resposta do banco de dados (baseada em ResultModel)
 */
export interface DatabaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  data: [
    Array<{
      CONFIG_ID: number;
      PROJECT_ID?: number;
      CUSTOMER_NAME: string;
      TELEGRAM_BOT_NAME: string;
      TELEGRAM_BOT_LINK: string;
      TELEGRAM_BOT_TOKEN: string;
      TELEGRAM_BOT_CHATID: string;
      WEBHOOK_URL: string | null;
      WEBHOOK_LOCAL_PORT: number;
      OPENAI_API_KEY: string;
      SHOPEE_CREDENTIAL: string;
      SHOPEE_SECRET_KEY: string;
      SHOPEE_AFFILIATE_ENDPOINT: string;
      SHOPEE_AFFILIATE_TIMEOUT: number | string;
      SHOPEE_AFFILIATE_SUBIDS: string;
      SHOPEE_PAGE: number;
      SHOPEE_SORTTYPE: number;
      SHOPEE_LIMIT: number;
      CLIENT_ID: number;
      SHOPEE_APP_ID: number;
      SHOPEE_FLAG_CLICK: number;
      SHOPEE_CURRENCY: string;
      SHOPEE_LOCATION: string;
      ACTIVE_FLAG: number;
      CREATEDAT: string;
      UPDATEDAT: string;
    }>,
    Array<{
      pl_record_id: number;
      pl_feedback: string;
      pl_error_id: number;
    }>,
    {
      fieldCount: number;
      affectedRows: number;
      insertId: number;
      info: string;
      serverStatus: number;
      warningStatus: number;
      changedRows: number;
    },
  ];
  quantity?: number;
  info1?: string;
  info2?: string;
}

/**
 * Parâmetros para busca de configuração no banco
 */
export interface ConfigSearchParams {
  PROJECT_ID: number;
  CONFIG_ID: number;
}
