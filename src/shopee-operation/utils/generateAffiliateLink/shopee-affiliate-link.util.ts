import * as crypto from 'node:crypto';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import { extractShopeeErrorMessage } from '../shopee-error.util';

interface ShopeeGraphQLResponse {
  data?: {
    generateShortLink?: {
      shortLink?: string;
    };
  };
  errors?: { message?: string }[];
  errMsg?: string;
}

export async function processAffiliateLink(
  originUrl: string,
  config: ShopeeConfiguration,
): Promise<string> {
  // Parse subIds from config (comma-separated). Fallback to ['s1'] when missing.
  const rawSubIds = config.affiliateSubids || '';
  const subIds = rawSubIds
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const effectiveSubIds = subIds.length > 0 ? subIds : ['s1'];

  // Build GraphQL query with dynamic subIds
  const subIdsString = effectiveSubIds.map((s) => `"${s}"`).join(', ');
  const query = `
      mutation {
        generateShortLink(input: {
          originUrl: "${originUrl}",
          subIds: [${subIdsString}]
        }) {
          shortLink
        }
      }
    `;

  const body = { query };

  // Gerar assinatura SHA256 conforme documentação:
  // signature = SHA256(Credential + Timestamp + Payload + Secret)
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify(body);
  // Concatena na ordem: Credential + Timestamp + Payload + Secret
  const factor = `${config.credential}${timestamp}${payload}${config.secretKey}`;
  const signature = crypto.createHash('sha256').update(factor).digest('hex');

  const headers: AxiosRequestConfig['headers'] = {
    // Ordem dos campos: Credential, Timestamp, Signature
    Authorization: `SHA256 Credential=${config.credential}, Timestamp=${timestamp}, Signature=${signature}`,
    'Content-Type': 'application/json',
  };

  try {
    const response: AxiosResponse<ShopeeGraphQLResponse> = await axios.post(
      'https://open-api.affiliate.shopee.com.br/graphql',
      body,
      {
        headers,
        timeout: parseInt(config.affiliateTimeout || '5000', 10),
      },
    );

    // Verificar erros no nível do GraphQL (retornados com status 200)
    const responseData = response.data;
    if (
      responseData.errors &&
      Array.isArray(responseData.errors) &&
      responseData.errors.length > 0
    ) {
      const gqlErrors = responseData.errors
        .map((e) => e.message || JSON.stringify(e))
        .join('; ');
      throw new Error(`Erro GraphQL da Shopee: ${gqlErrors}`);
    }

    // Verificar campos de erro específicos da Shopee
    if (responseData.errMsg) {
      throw new Error(`Erro da API Shopee: ${responseData.errMsg}`);
    }

    const shortLink = responseData.data?.generateShortLink?.shortLink;

    if (!shortLink) {
      // Log da resposta completa para debug
      const responsePreview = JSON.stringify(responseData).substring(0, 500);
      throw new Error(
        `A API da Shopee não retornou o link de afiliado. Resposta recebida: ${responsePreview}`,
      );
    }

    return shortLink;
  } catch (error) {
    // Se o erro já foi formatado por nós, re-throw diretamente
    if (error instanceof Error && error.message.startsWith('Erro')) {
      throw error;
    }
    const errorMessage = extractShopeeErrorMessage(error);
    throw new Error(`Erro ao gerar link de afiliado: ${errorMessage}`);
  }
}
