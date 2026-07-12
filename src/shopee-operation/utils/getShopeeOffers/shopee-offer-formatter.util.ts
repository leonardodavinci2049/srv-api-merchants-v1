import {
  ShopeeOfferApiResponse,
  ShopeeOfferPageInfo,
  ShopeeOfferQueryParams,
  ShopeeOfferV2,
  ShopeeOfferV2Response,
} from 'src/core/interfaces/shopee-offer.interface';

/**
 * Formata a resposta da API da Shopee para ofertas (shopeeOfferV2)
 */
export function formatShopeeOffersResponse(
  apiResponse: ShopeeOfferApiResponse,
  originalParams: ShopeeOfferQueryParams,
): ShopeeOfferV2Response {
  if (apiResponse.errors && apiResponse.errors.length > 0) {
    const errorMessage = apiResponse.errors.map((e) => e.message).join(', ');
    return {
      success: false,
      error: 'Erro da API',
      message: errorMessage,
    };
  }

  if (!apiResponse.data?.shopeeOfferV2?.nodes) {
    return {
      success: false,
      error: 'Dados não encontrados',
      message: 'Nenhuma oferta encontrada com os critérios especificados',
    };
  }

  const offers: ShopeeOfferV2[] = apiResponse.data.shopeeOfferV2.nodes.map(
    (node) => ({
      commissionRate: node.commissionRate || '0',
      imageUrl: node.imageUrl || '',
      offerLink: node.offerLink || '',
      originalLink: node.originalLink || '',
      offerName: node.offerName || '',
      offerType: node.offerType || 0,
      categoryId: node.categoryId,
      collectionId: node.collectionId,
      periodStartTime: node.periodStartTime || 0,
      periodEndTime: node.periodEndTime || 0,
    }),
  );

  const pageInfo: ShopeeOfferPageInfo = apiResponse.data.shopeeOfferV2.pageInfo
    ? {
        page: apiResponse.data.shopeeOfferV2.pageInfo.page,
        limit: apiResponse.data.shopeeOfferV2.pageInfo.limit,
        hasNextPage: apiResponse.data.shopeeOfferV2.pageInfo.hasNextPage,
      }
    : {
        page: originalParams.page || 1,
        limit: originalParams.limit || 10,
        hasNextPage: false,
      };

  return {
    success: true,
    data: {
      offers,
      pageInfo,
    },
  };
}
