import {
  PageInfo,
  ProductOfferV2Item,
  ProductOfferV2QueryParams,
  ProductOfferV2Response,
  ShopeeProductOfferApiResponse,
} from 'src/core/interfaces/shopee-product-offer.interface';

/**
 * Formata a resposta da API da Shopee para o formato padrão
 */
export function formatProductOffersResponse(
  apiResponse: ShopeeProductOfferApiResponse,
  originalParams: ProductOfferV2QueryParams,
): ProductOfferV2Response {
  if (apiResponse.errors && apiResponse.errors.length > 0) {
    const errorMessage = apiResponse.errors.map((e) => e.message).join(', ');
    return {
      success: false,
      error: 'Erro da API',
      message: errorMessage,
    };
  }

  if (!apiResponse.data?.productOfferV2?.nodes) {
    return {
      success: false,
      error: 'Dados não encontrados',
      message: 'Nenhum produto encontrado com os critérios especificados',
    };
  }

  const products: ProductOfferV2Item[] =
    apiResponse.data.productOfferV2.nodes.map((node) => ({
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
      currency: node.currency || 'BRL',
      discountPercent: Number(node.discountPercent) || 0,
      originalPrice: String(node.originalPrice || node.price || '0'),
      category: node.category || 'Geral',
      categoryId: Number(node.categoryId) || 0,
      brandName: node.brandName || '',
      isOfficial: Boolean(node.isOfficial),
      freeShipping: Boolean(node.freeShipping),
      location: node.location || 'Brasil',
    }));

  const pageInfo: PageInfo = {
    page: originalParams.page || 1,
    limit: originalParams.limit || 10,
    hasNextPage: apiResponse.data.productOfferV2.pageInfo?.hasNextPage || false,
    totalResults: undefined, // Não disponível na resposta simplificada
  };

  return {
    success: true,
    data: {
      products,
      pageInfo,
    },
  };
}
