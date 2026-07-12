import {
  ShopeeOfferApiResponse,
  ShopeeOfferQueryParams,
  ShopeeOfferV2Response,
} from 'src/core/interfaces/shopee-offer.interface';

export function formatShopeeOffersResponse(
  apiResponse: ShopeeOfferApiResponse,
  params: ShopeeOfferQueryParams,
): ShopeeOfferV2Response {
  if (apiResponse.errors?.length) {
    return {
      success: false,
      error: 'Erro da API',
      message: apiResponse.errors.map((error) => error.message).join(', '),
    };
  }
  const connection = apiResponse.data?.shopeeOfferV2;
  if (!connection?.nodes) {
    return {
      success: false,
      error: 'Dados não encontrados',
      message: 'Nenhuma oferta encontrada com os critérios especificados',
    };
  }
  const offers = connection.nodes.map((node) => ({
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
  }));
  const pageInfo = connection.pageInfo || {
    page: params.page || 1,
    limit: params.limit || 10,
    hasNextPage: false,
  };
  return { success: true, data: { offers, pageInfo } };
}
