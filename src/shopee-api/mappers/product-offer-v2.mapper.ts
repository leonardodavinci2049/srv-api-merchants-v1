import {
  PageInfo,
  ProductOfferV2Item,
  ProductOfferV2QueryParams,
  ProductOfferV2Response,
  ShopeeProductOfferApiResponse,
} from 'src/core/interfaces/shopee-product-offer.interface';

export interface ProductOfferFormatOptions {
  currencyFallback: string;
  locationFallback: string;
}

const DEFAULT_OPTIONS: ProductOfferFormatOptions = {
  currencyFallback: 'BRL',
  locationFallback: 'Brasil',
};

/**
 * Formata a resposta de productOfferV2. currency/location sao fallbacks
 * derivados do registro selecionado, repassados via options. Valores
 * retornados pelo provider permanecem autoritativos quando presentes.
 */
export function formatProductOffersResponse(
  apiResponse: ShopeeProductOfferApiResponse,
  params: ProductOfferV2QueryParams,
  options?: Partial<ProductOfferFormatOptions>,
): ProductOfferV2Response {
  const opts = { ...DEFAULT_OPTIONS, ...(options ?? {}) };

  if (apiResponse.errors?.length) {
    return {
      success: false,
      error: 'Erro da API',
      message: apiResponse.errors.map((error) => error.message).join(', '),
    };
  }
  const nodes = apiResponse.data?.productOfferV2?.nodes;
  if (!nodes) {
    return {
      success: false,
      error: 'Dados não encontrados',
      message: 'Nenhum produto encontrado com os critérios especificados',
    };
  }
  const products: ProductOfferV2Item[] = nodes.map((node) => ({
    itemId: String(node.itemId || ''),
    productName: node.productName || `Produto ${node.itemId}`,
    shopName: node.shopName || 'Loja Shopee',
    shopId: String(node.shopId || ''),
    priceMin: String(node.priceMin || node.price || '0'),
    priceMax: String(node.priceMax || node.price || '0'),
    commissionRate: String(node.commissionRate || node.commission || '0'),
    commission: String(node.commission || '0'),
    sales: Number(node.sales) || 0,
    ratingStar: String(node.ratingStar || '0'),
    imageUrl: node.imageUrl || '',
    productLink:
      node.productLink ||
      `https://shopee.com.br/product/${node.shopId || 'shop'}/${node.itemId}`,
    offerLink:
      node.offerLink ||
      `https://shopee.com.br/product/${node.shopId || 'shop'}/${node.itemId}`,
    currency: node.currency || opts.currencyFallback,
    discountPercent: Number(node.discountPercent) || 0,
    originalPrice: String(node.originalPrice || node.priceMin || '0'),
    category: node.category || 'Geral',
    categoryId: Number(node.categoryId) || 0,
    brandName: node.brandName || '',
    isOfficial: Boolean(node.isOfficial),
    freeShipping: Boolean(node.freeShipping),
    location: node.location || opts.locationFallback,
  }));
  const pageInfo: PageInfo = {
    page: params.page || 1,
    limit: params.limit || 10,
    hasNextPage:
      apiResponse.data?.productOfferV2?.pageInfo?.hasNextPage || false,
  };
  return { success: true, data: { products, pageInfo } };
}
