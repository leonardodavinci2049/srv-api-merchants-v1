import * as crypto from 'node:crypto';
import { BadGatewayException, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import {
  ShopeeOfferApiResponse,
  ShopeeOfferQueryParams,
  ShopeeOfferV2Response,
} from 'src/core/interfaces/shopee-offer.interface';
import {
  ProductOfferV2QueryParams,
  ProductOfferV2Response,
  ShopeeProductOfferApiResponse,
} from 'src/core/interfaces/shopee-product-offer.interface';
import { extractShopeeErrorMessage } from './graphql/shopee-error.util';
import { formatProductOffersResponse } from './mappers/product-offer-v2.mapper';
import { formatShopeeOffersResponse } from './mappers/shopee-offer-v2.mapper';

interface GenerateShortLinkResponse {
  data?: { generateShortLink?: { shortLink?: string } };
  errors?: Array<{ message?: string }>;
  errMsg?: string;
}

/**
 * Opcoes de formatacao repassadas ao mapper de product offers.
 * currency/location sao fallbacks derivados do registro selecionado.
 */
export interface ProductOfferFormatOptions {
  currencyFallback: string;
  locationFallback: string;
}

@Injectable()
export class ShopeeApiService {


  async generateShortLink(
    originUrl: string,
    config: ShopeeConfiguration,
  ): Promise<string> {
    const subIds = config.affiliateSubids
      .split(',')
      .map((subId) => subId.trim())
      .filter(Boolean);
    const query = `
      mutation {
        generateShortLink(input: {
          originUrl: ${JSON.stringify(originUrl)},
          subIds: [${subIds.map((subId) => JSON.stringify(subId)).join(', ')}]
        }) { shortLink }
      }
    `;
    const response = await this.request<GenerateShortLinkResponse>(
      query,
      config,
      'gerar link de afiliado',
    );
    const shortLink = response.data?.generateShortLink?.shortLink;
    if (!shortLink) {
      throw new BadGatewayException(
        response.errMsg || 'A API da Shopee não retornou o link de afiliado',
      );
    }
    return shortLink;
  }

  async getProductOffers(
    params: ProductOfferV2QueryParams,
    config: ShopeeConfiguration,
    options?: Partial<ProductOfferFormatOptions>,
  ): Promise<ProductOfferV2Response> {
    const response = await this.request<ShopeeProductOfferApiResponse>(
      this.buildProductOfferQuery(params),
      config,
      'buscar ofertas de produtos',
    );
    const result = formatProductOffersResponse(response, params, options);
    if (!result.success) {
      throw new BadGatewayException(result.message || result.error);
    }
    return result;
  }

  async getShopeeOffers(
    params: ShopeeOfferQueryParams,
    config: ShopeeConfiguration,
  ): Promise<ShopeeOfferV2Response> {
    const response = await this.request<ShopeeOfferApiResponse>(
      this.buildShopeeOfferQuery(params),
      config,
      'buscar ofertas da Shopee',
    );
    const result = formatShopeeOffersResponse(response, params);
    if (!result.success) {
      throw new BadGatewayException(result.message || result.error);
    }
    return result;
  }

  private async request<T>(
    query: string,
    config: ShopeeConfiguration,
    operation: string,
  ): Promise<T> {
    const body = { query };
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify(body);
    const factor = `${config.credential}${timestamp}${payload}${config.secretKey}`;
    const signature = crypto.createHash('sha256').update(factor).digest('hex');
    const headers: AxiosRequestConfig['headers'] = {
      Authorization: `SHA256 Credential=${config.credential}, Timestamp=${timestamp}, Signature=${signature}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post<T>(config.endpoint, body, {
        headers,
        timeout: config.timeoutMs,
      });
      const data = response.data as T & {
        errors?: Array<{ message?: string }>;
        errMsg?: string;
      };
      if (data.errors?.length) {
        throw new Error(
          data.errors
            .map((error) => error.message || 'Erro GraphQL')
            .join('; '),
        );
      }
      if (data.errMsg) throw new Error(data.errMsg);
      return response.data;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException(
        `Erro ao ${operation}: ${extractShopeeErrorMessage(error)}`,
      );
    }
  }

  private buildProductOfferQuery(params: ProductOfferV2QueryParams): string {
    const queryParams = this.buildQueryParams(params);
    return `query { productOfferV2(${queryParams}) {
      nodes { itemId shopId productName shopName priceMin priceMax commissionRate
        commission sales ratingStar imageUrl productLink offerLink }
      pageInfo { page limit hasNextPage }
    } }`;
  }

  private buildShopeeOfferQuery(params: ShopeeOfferQueryParams): string {
    const queryParams = this.buildQueryParams(params);
    return `query { shopeeOfferV2(${queryParams}) {
      nodes { commissionRate imageUrl offerLink originalLink offerName offerType
        categoryId collectionId periodStartTime periodEndTime }
      pageInfo { page limit hasNextPage }
    } }`;
  }

  private buildQueryParams(params: object): string {
    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(
        ([key, value]) =>
          `${key}: ${typeof value === 'string' ? JSON.stringify(value) : String(value)}`,
      )
      .join(', ');
  }
}
