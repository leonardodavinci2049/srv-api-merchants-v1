/**
 * Interface para parâmetros de entrada da query ProductOfferV2
 */
export interface ProductOfferV2QueryParams {
  // Campos de busca (pelo menos um deve ser fornecido)
  keyword?: string;
  shopId?: string;
  itemId?: string;
  productCatId?: number;

  // Parâmetros de configuração
  listType?: number;
  sortType?: number;
  page?: number;
  limit?: number;
  isAMSOffer?: boolean;
  isKeySeller?: boolean;
}

/**
 * Interface para informações de paginação
 */
export interface PageInfo {
  page: number;
  limit: number;
  hasNextPage: boolean;
  totalResults?: number;
}

/**
 * Interface para um item de produto na resposta
 */
export interface ProductOfferV2Item {
  itemId: string;
  productName: string;
  shopName: string;
  shopId: string;
  priceMin: string;
  priceMax: string;
  commissionRate: string;
  commission: string;
  sales: number;
  ratingStar: string;
  imageUrl: string;
  productLink: string;
  offerLink: string;
  currency?: string;
  discountPercent?: number;
  originalPrice?: string;
  category?: string;
  categoryId?: number;
  brandName?: string;
  isOfficial?: boolean;
  freeShipping?: boolean;
  location?: string;
}

/**
 * Interface para a resposta completa do ProductOfferV2
 */
export interface ProductOfferV2Response {
  success: boolean;
  data?: {
    products: ProductOfferV2Item[];
    pageInfo: PageInfo;
  };
  error?: string;
  message?: string;
}

/**
 * Interface para resposta raw da API GraphQL da Shopee
 */
export interface ShopeeProductOfferApiResponse {
  data?: {
    productOfferV2?: {
      nodes?: Array<{
        itemId: string | number;
        shopId?: string | number;
        productName?: string;
        shopName?: string;
        priceMin?: string | number;
        priceMax?: string | number;
        price?: string | number;
        commissionRate?: string | number;
        commission?: string | number;
        sales?: number;
        ratingStar?: string | number;
        imageUrl?: string;
        productLink?: string;
        offerLink?: string;
        currency?: string;
        discountPercent?: number;
        originalPrice?: string | number;
        category?: string;
        categoryId?: number;
        brandName?: string;
        isOfficial?: boolean;
        freeShipping?: boolean;
        location?: string;
      }>;
      pageInfo?: {
        hasNextPage: boolean;
      };
    };
  };
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

/**
 * Enum para tipos de ordenação
 */
export enum SortType {
  RELEVANCE = 1,
  PRICE_LOW_TO_HIGH = 2,
  PRICE_HIGH_TO_LOW = 3,
  LATEST = 4,
  POPULAR = 5,
  SALES = 6,
  COMMISSION_HIGH_TO_LOW = 7,
  COMMISSION_LOW_TO_HIGH = 8,
}

/**
 * Enum para tipos de lista
 */
export enum ListType {
  GENERAL = 1,
  PROMOTION = 2,
  FLASH_SALE = 3,
  VOUCHER = 4,
}
