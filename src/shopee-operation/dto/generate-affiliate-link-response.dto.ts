import { ProductOfferV2Item } from 'src/core/interfaces/shopee-product-offer.interface';

/**
 * Interface para resposta da geração de link de afiliado aprimorada
 */
export interface GenerateAffiliateLinkResponse {
  success: boolean;
  affiliateLink?: string;
  productInfo?: ProductOfferV2Item;
  databaseRecord?: {
    recordId: number;
    message: string;
  };
  error?: string;
  message?: string;
}

/**
 * DTO de resposta para o endpoint generateAffiliateLink
 */
export class GenerateAffiliateLinkResponseDto {
  success: boolean;
  affiliateLink?: string;
  productInfo?: ProductOfferV2Item;
  databaseRecord?: {
    recordId: number;
    message: string;
  };
  error?: string;
  message?: string;

  static success(
    affiliateLink: string,
    productInfo?: ProductOfferV2Item,
    databaseRecord?: { recordId: number; message: string },
  ): GenerateAffiliateLinkResponseDto {
    return {
      success: true,
      affiliateLink,
      productInfo,
      databaseRecord,
    };
  }

  static error(
    error: string,
    message?: string,
  ): GenerateAffiliateLinkResponseDto {
    return {
      success: false,
      error,
      message,
    };
  }
}
