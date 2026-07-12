/**
 * Interface para um item de oferta Shopee (ShopeeOfferV2)
 */
export interface ShopeeOfferV2 {
  commissionRate: string;
  imageUrl: string;
  offerLink: string;
  originalLink: string;
  offerName: string;
  offerType: number;
  categoryId?: number;
  collectionId?: number;
  periodStartTime: number;
  periodEndTime: number;
}

/**
 * Interface para parâmetros de entrada da query shopeeOfferV2
 */
export interface ShopeeOfferQueryParams {
  keyword?: string;
  sortType?: number;
  page?: number;
  limit?: number;
}

/**
 * Enum para tipos de ordenação de ofertas Shopee
 */
export enum ShopeeOfferSortType {
  LATEST_DESC = 1,
  HIGHEST_COMMISSION_DESC = 2,
}

/**
 * Enum para tipos de oferta Shopee
 */
export enum ShopeeOfferType {
  CAMPAIGN_TYPE_COLLECTION = 1,
  CAMPAIGN_TYPE_CATEGORY = 2,
}

/**
 * Interface para a resposta completa do shopeeOfferV2
 */
export interface ShopeeOfferV2Response {
  success: boolean;
  data?: {
    offers: ShopeeOfferV2[];
    pageInfo: ShopeeOfferPageInfo;
  };
  error?: string;
  message?: string;
}

/**
 * Interface para informações de paginação do shopeeOfferV2
 */
export interface ShopeeOfferPageInfo {
  page: number;
  limit: number;
  hasNextPage: boolean;
}

/**
 * Interface para resposta raw da API GraphQL da Shopee (shopeeOfferV2)
 */
export interface ShopeeOfferApiResponse {
  data?: {
    shopeeOfferV2?: {
      nodes?: Array<{
        commissionRate?: string;
        imageUrl?: string;
        offerLink?: string;
        originalLink?: string;
        offerName?: string;
        offerType?: number;
        categoryId?: number;
        collectionId?: number;
        periodStartTime?: number;
        periodEndTime?: number;
      }>;
      pageInfo?: {
        page: number;
        limit: number;
        hasNextPage: boolean;
      };
    };
  };
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}
