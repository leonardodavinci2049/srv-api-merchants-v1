import { Logger } from '@nestjs/common';
import {
  BotConfiguration,
  DatabaseResponse,
} from '../interfaces/bot-configuration.interface';

/**
 * Classe responsável por mapear dados do banco de dados para configuração do bot
 * Implementa fallbacks para .env quando necessário
 */
const logger = new Logger('ConfigurationMapper');

function mapDatabaseToBotConfig(response: DatabaseResponse): BotConfiguration {
  // Validar resposta do banco
  if (response.statusCode !== 100200) {
    logger.error(`Erro ao carregar configuração do banco: ${response.message}`);
    throw new Error(`Erro ao carregar configuração: ${response.message}`);
  }

  if (!response.data?.[0]?.[0]) {
    logger.error('Nenhuma configuração encontrada no banco de dados');
    throw new Error('Nenhuma configuração encontrada');
  }

  const config = response.data[0][0];
  logger.log(`Configuração carregada do banco: CONFIG_ID=${config.CONFIG_ID}`);

  return {
    configId: config.CONFIG_ID,
    customerName: config.CUSTOMER_NAME,
    telegramBotName: config.TELEGRAM_BOT_NAME,
    telegramBotLink: config.TELEGRAM_BOT_LINK,
    telegramBotToken: getRequiredValueFromDatabase(
      config.TELEGRAM_BOT_TOKEN,
      'TELEGRAM_BOT_TOKEN',
    ),
    telegramBotChatId: config.TELEGRAM_BOT_CHATID,
    webhookUrl: buildWebhookUrl(config.WEBHOOK_URL, config.WEBHOOK_LOCAL_PORT),
    webhookLocalPort: config.WEBHOOK_LOCAL_PORT,
    openaiApiKey: config.OPENAI_API_KEY,
    shopeeCredential: getRequiredValueFromDatabase(
      config.SHOPEE_CREDENTIAL,
      'SHOPEE_CREDENTIAL',
    ),
    shopeeSecretKey: getRequiredValueFromDatabase(
      config.SHOPEE_SECRET_KEY,
      'SHOPEE_SECRET_KEY',
    ),
    shopeeAffiliateEndpoint: getRequiredValueFromDatabase(
      config.SHOPEE_AFFILIATE_ENDPOINT,
      'SHOPEE_AFFILIATE_ENDPOINT',
    ),
    shopeeAffiliateTimeout: config.SHOPEE_AFFILIATE_TIMEOUT,
    shopeeAffiliateSubids: getRequiredValueFromDatabase(
      config.SHOPEE_AFFILIATE_SUBIDS,
      'SHOPEE_AFFILIATE_SUBIDS',
    ),
    createdAt: new Date(config.CREATEDAT),
    updatedAt: new Date(config.UPDATEDAT),
  };
}

function buildWebhookUrl(webhookUrl: string | null, port: number): string {
  if (webhookUrl && webhookUrl.trim() !== '') {
    /*  this.logger.log(`Usando webhook URL do banco: ${webhookUrl}`); */
    return webhookUrl;
  }

  // Fallback: Construir URL baseada na porta
  if (port && port > 0) {
    const constructedUrl = `http://localhost:${port}`;
    logger.warn(
      `Webhook URL não configurada no banco, construindo baseada na porta: ${constructedUrl}`,
    );
    return constructedUrl;
  }

  // Erro final: sem webhook URL nem porta
  throw new Error(
    'URL do webhook é obrigatória: configure WEBHOOK_URL no banco de dados',
  );
}

function getRequiredValueFromDatabase(
  dbValue: string | undefined,
  fieldName: string,
): string {
  if (dbValue && dbValue.trim() !== '') {
    return dbValue;
  }

  logger.error(
    `Valor obrigatório não encontrado no banco de dados: ${fieldName}`,
  );
  throw new Error(
    `Configuração obrigatória não encontrada no banco: ${fieldName}`,
  );
}

export const ConfigurationMapper = {
  mapDatabaseToBotConfig,
};
