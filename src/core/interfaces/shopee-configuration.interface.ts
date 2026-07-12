import { BotConfiguration } from './bot-configuration.interface';

/**
 * Interface para configurações da Shopee passadas entre serviços
 */
export interface ShopeeConfiguration {
  credential: string;
  secretKey: string;
  affiliateEndpoint: string;
  affiliateTimeout: string;
  affiliateSubids: string;
}

/**
 * Interface para parâmetros de geração de link de afiliado
 */
export interface GenerateAffiliateLinkParams {
  originUrl: string;
  shopeeConfig: ShopeeConfiguration;
}

/**
 * Interface para resposta da API da Shopee
 */
export interface ShopeeApiResponse {
  data: {
    generateShortLink: {
      shortLink: string;
    };
  };
}

/**
 * Utilitário para extrair configuração da Shopee de BotConfiguration
 */
function extractShopeeConfig(botConfig: BotConfiguration): ShopeeConfiguration {
  return {
    credential: botConfig.shopeeCredential,
    secretKey: botConfig.shopeeSecretKey,
    affiliateEndpoint: botConfig.shopeeAffiliateEndpoint,
    affiliateTimeout: botConfig.shopeeAffiliateTimeout,
    affiliateSubids: botConfig.shopeeAffiliateSubids,
  };
}

function validateShopeeConfig(config: ShopeeConfiguration): boolean {
  return !!(
    config.credential &&
    config.secretKey &&
    config.affiliateEndpoint &&
    config.affiliateSubids
  );
}

function getValidationErrorMessage(config: ShopeeConfiguration): string {
  const missing: string[] = [];

  if (!config.credential) missing.push('credential');
  if (!config.secretKey) missing.push('secretKey');
  if (!config.affiliateEndpoint) missing.push('affiliateEndpoint');
  if (!config.affiliateSubids) missing.push('affiliateSubids');

  if (missing.length > 0) {
    return `Configurações da Shopee incompletas: ${missing.join(', ')}`;
  }

  return '';
}

export const ShopeeConfigurationExtractor = {
  extractShopeeConfig,
  validateShopeeConfig,
  getValidationErrorMessage,
};
