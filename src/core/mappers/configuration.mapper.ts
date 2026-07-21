import { Logger } from '@nestjs/common';
import {
  BotConfiguration,
  DatabaseResponse,
} from '../interfaces/bot-configuration.interface';

const logger = new Logger('ConfigurationMapper');

function mapDatabaseToBotConfig(response: DatabaseResponse): BotConfiguration {
  if (response.statusCode !== 100200) {
    logger.error(`Erro ao carregar configuração do banco: ${response.message}`);
    throw new Error(`Erro ao carregar configuração: ${response.message}`);
  }

  const config = response.data?.[0];
  if (!config) {
    logger.error('Nenhuma configuração encontrada no banco de dados');
    throw new Error('Nenhuma configuração encontrada');
  }

  logger.log(`Configuração carregada do banco: configId=${config.configId}`);

  return {
    configId: config.configId,
    projectId: config.projectId,
    clientId: config.clientId,
    accountName: config.accountName,
    shopeeCredential: getRequiredValueFromDatabase(
      config.shopeeCredential,
      'shopeeCredential',
    ),
    shopeeSecretKey: getRequiredValueFromDatabase(
      config.shopeeSecretKey,
      'shopeeSecretKey',
    ),
    shopeeAffiliateEndpoint: getRequiredValueFromDatabase(
      config.shopeeAffiliateEndpoint,
      'shopeeAffiliateEndpoint',
    ),
    shopeeAffiliateTimeout: config.shopeeAffiliateTimeout,
    shopeeAffiliateSubids: getRequiredValueFromDatabase(
      config.shopeeAffiliateSubids,
      'shopeeAffiliateSubids',
    ),
    shopeePage: config.shopeePage,
    shopeeSorttype: config.shopeeSorttype,
    shopeeLimit: config.shopeeLimit,
    shopeeAppId: config.shopeeAppId,
    shopeeFlagClick: config.shopeeFlagClick,
    shopeeCurrency: config.shopeeCurrency,
    shopeeLocation: config.shopeeLocation,
    activeFlag: config.activeFlag,
  };
}

function getRequiredValueFromDatabase(
  dbValue: string | null,
  fieldName: string,
): string {
  if (dbValue?.trim()) {
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
