import {
  ShopeeOfferPageInfo,
  ShopeeOfferV2,
} from '../../core/interfaces/shopee-offer.interface';

/**
 * DTO para resposta padronizada da API de ofertas Shopee
 */
export class ShopeeApiOffersResponseDto {
  success: boolean;
  data?: ShopeeApiOffersDataDto;
  error?: string;
  message?: string;

  constructor(
    success: boolean,
    data?: ShopeeApiOffersDataDto,
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
  ): ShopeeApiOffersResponseDto {
    return new ShopeeApiOffersResponseDto(
      true,
      new ShopeeApiOffersDataDto(offers, pageInfo),
    );
  }

  /**
   * Cria uma resposta de erro
   */
  static error(error: string, message?: string): ShopeeApiOffersResponseDto {
    return new ShopeeApiOffersResponseDto(false, undefined, error, message);
  }
}

/**
 * DTO para dados da resposta de ofertas Shopee
 */
export class ShopeeApiOffersDataDto {
  offers: ShopeeOfferV2[];
  pageInfo: ShopeeOfferPageInfo;

  constructor(offers: ShopeeOfferV2[], pageInfo: ShopeeOfferPageInfo) {
    this.offers = offers;
    this.pageInfo = pageInfo;
  }
}
