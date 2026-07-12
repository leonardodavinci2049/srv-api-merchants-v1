import * as crypto from 'node:crypto';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import {
  ShopeeOfferApiResponse,
  ShopeeOfferQueryParams,
  ShopeeOfferV2Response,
} from 'src/core/interfaces/shopee-offer.interface';
import { extractShopeeErrorMessage } from '../shopee-error.util';
import { formatShopeeOffersResponse } from './shopee-offer-formatter.util';
import { buildShopeeOfferQuery } from './shopee-offer-query.util';

/**
 * Processa a requisição de ofertas da Shopee
 */
export async function processShopeeOffers(
  params: ShopeeOfferQueryParams,
  config: ShopeeConfiguration,
): Promise<ShopeeOfferV2Response> {
  try {
    // Construir query GraphQL
    const query = buildShopeeOfferQuery(params);
    const body = { query };

    // Gerar assinatura SHA256
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify(body);
    const factor = `${config.credential}${timestamp}${payload}${config.secretKey}`;
    const signature = crypto.createHash('sha256').update(factor).digest('hex');

    const headers: AxiosRequestConfig['headers'] = {
      Authorization: `SHA256 Credential=${config.credential}, Timestamp=${timestamp}, Signature=${signature}`,
      'Content-Type': 'application/json',
    };

    const response: AxiosResponse<ShopeeOfferApiResponse> = await axios.post(
      config.affiliateEndpoint ||
        'https://open-api.affiliate.shopee.com.br/graphql',
      body,
      { headers },
    );

    return formatShopeeOffersResponse(response.data, params);
  } catch (error) {
    const errorMessage = extractShopeeErrorMessage(error);
    return {
      success: false,
      error: 'Erro na requisição',
      message: `Erro ao buscar ofertas da Shopee: ${errorMessage}`,
    };
  }
}
