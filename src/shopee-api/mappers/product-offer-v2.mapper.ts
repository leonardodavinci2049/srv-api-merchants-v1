import { envs } from 'src/core/config';
import {
  PageInfo,
  ProductOfferV2Item,
  ProductOfferV2QueryParams,
  ProductOfferV2Response,
  ShopeeProductOfferApiResponse,
} from 'src/core/interfaces/shopee-product-offer.interface';

export function formatProductOffersResponse(
  apiResponse: ShopeeProductOfferApiResponse,
  params: ProductOfferV2QueryParams,
): ProductOfferV2Response {
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
    currency: node.currency || envs.SHOPEE_CURRENCY,
    discountPercent: Number(node.discountPercent) || 0,
    originalPrice: String(node.originalPrice || node.priceMin || '0'),
    category: node.category || 'Geral',
    categoryId: Number(node.categoryId) || 0,
    brandName: node.brandName || '',
    isOfficial: Boolean(node.isOfficial),
    freeShipping: Boolean(node.freeShipping),
    location: node.location || envs.SHOPEE_LOCATION,
  }));
  const pageInfo: PageInfo = {
    page: params.page || 1,
    limit: params.limit || 10,
    hasNextPage:
      apiResponse.data?.productOfferV2?.pageInfo?.hasNextPage || false,
  };
  return { success: true, data: { products, pageInfo } };
}
