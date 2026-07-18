import {
  PageInfo,
  ProductOfferV2Item,
} from '../../core/interfaces/shopee-product-offer.interface';

/**
 * DTO para resposta padronizada da API de ofertas de produtos
 */
export class ProductOffersResponseDto {
  success: boolean;
  data?: ProductOffersDataDto;
  error?: string;
  message?: string;

  constructor(
    success: boolean,
    data?: ProductOffersDataDto,
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
    products: ProductOfferV2Item[],
    pageInfo: PageInfo,
  ): ProductOffersResponseDto {
    return new ProductOffersResponseDto(
      true,
      new ProductOffersDataDto(products, pageInfo),
    );
  }

  /**
   * Cria uma resposta de erro
   */
  static error(error: string, message?: string): ProductOffersResponseDto {
    return new ProductOffersResponseDto(false, undefined, error, message);
  }
}

/**
 * DTO para dados da resposta de ofertas de produtos
 */
export class ProductOffersDataDto {
  products: ProductOfferV2Item[];
  pageInfo: PageInfo;

  constructor(products: ProductOfferV2Item[], pageInfo: PageInfo) {
    this.products = products;
    this.pageInfo = pageInfo;
  }
}

/**
 * DTO simplificado para item de produto na resposta
 */
export class ProductOfferItemDto {
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

  constructor(item: ProductOfferV2Item) {
    this.itemId = item.itemId;
    this.productName = item.productName;
    this.shopName = item.shopName;
    this.shopId = item.shopId;
    this.priceMin = item.priceMin;
    this.priceMax = item.priceMax;
    this.commissionRate = item.commissionRate;
    this.commission = item.commission;
    this.sales = item.sales;
    this.ratingStar = item.ratingStar;
    this.imageUrl = item.imageUrl;
    this.productLink = item.productLink;
    this.offerLink = item.offerLink;
    this.currency = item.currency;
    this.discountPercent = item.discountPercent;
    this.originalPrice = item.originalPrice;
    this.category = item.category;
    this.categoryId = item.categoryId;
    this.brandName = item.brandName;
    this.isOfficial = item.isOfficial;
    this.freeShipping = item.freeShipping;
    this.location = item.location;
  }
}

/**
 * DTO para informações de paginação na resposta
 */
export class PageInfoDto {
  page: number;
  limit: number;
  hasNextPage: boolean;
  totalResults?: number;

  constructor(pageInfo: PageInfo) {
    this.page = pageInfo.page;
    this.limit = pageInfo.limit;
    this.hasNextPage = pageInfo.hasNextPage;
    this.totalResults = pageInfo.totalResults;
  }
}
