import * as crypto from 'node:crypto';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import {
  ProductOfferV2QueryParams,
  ProductOfferV2Response,
  ShopeeProductOfferApiResponse,
} from 'src/core/interfaces/shopee-product-offer.interface';
import { extractShopeeErrorMessage } from '../shopee-error.util';
import { formatProductOffersResponse } from './shopee-product-offer-formatter.util';
import { buildProductOfferQuery } from './shopee-product-offer-query.util';

export async function processProductOffers(
  params: ProductOfferV2QueryParams,
  config: ShopeeConfiguration,
): Promise<ProductOfferV2Response> {
  try {
    // Construir query GraphQL
    const query = buildProductOfferQuery(params);
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

    const response: AxiosResponse<ShopeeProductOfferApiResponse> =
      await axios.post(
        config.affiliateEndpoint ||
          'https://open-api.affiliate.shopee.com.br/graphql',
        body,
        { headers },
      );

    return formatProductOffersResponse(response.data, params);
  } catch (error) {
    const errorMessage = extractShopeeErrorMessage(error);
    return {
      success: false,
      error: 'Erro na requisição',
      message: `Erro ao buscar ofertas de produtos: ${errorMessage}`,
    };
  }
}
