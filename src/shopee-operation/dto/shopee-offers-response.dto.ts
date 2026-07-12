import {
  ShopeeOfferPageInfo,
  ShopeeOfferV2,
} from '../../core/interfaces/shopee-offer.interface';

/**
 * DTO para resposta padronizada da API de ofertas Shopee
 */
export class ShopeeOffersResponseDto {
  success: boolean;
  data?: ShopeeOffersDataDto;
  error?: string;
  message?: string;

  constructor(
    success: boolean,
    data?: ShopeeOffersDataDto,
    error?: string,
    message?: string,
  ) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.message = message;
  }

  /**
   * Cria uma resposta de sucesso
   */
  static success(
    offers: ShopeeOfferV2[],
    pageInfo: ShopeeOfferPageInfo,
  ): ShopeeOffersResponseDto {
    return new ShopeeOffersResponseDto(
      true,
      new ShopeeOffersDataDto(offers, pageInfo),
    );
  }

  /**
   * Cria uma resposta de erro
   */
  static error(error: string, message?: string): ShopeeOffersResponseDto {
    return new ShopeeOffersResponseDto(false, undefined, error, message);
  }
}

/**
 * DTO para dados da resposta de ofertas Shopee
 */
export class ShopeeOffersDataDto {
  offers: ShopeeOfferV2[];
  pageInfo: ShopeeOfferPageInfo;

  constructor(offers: ShopeeOfferV2[], pageInfo: ShopeeOfferPageInfo) {
    this.offers = offers;
    this.pageInfo = pageInfo;
  }
}
