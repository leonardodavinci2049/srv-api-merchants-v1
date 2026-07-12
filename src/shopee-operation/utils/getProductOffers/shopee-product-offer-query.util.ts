import { ProductOfferV2QueryParams } from 'src/core/interfaces/shopee-product-offer.interface';

/**
 * Constrói a query GraphQL para ProductOfferV2
 */
export function buildProductOfferQuery(
  params: ProductOfferV2QueryParams,
): string {
  const queryParams: string[] = [];

  // Adicionar parâmetros de busca
  if (params.keyword) {
    queryParams.push(`keyword: "${params.keyword}"`);
  }
  if (params.shopId) {
    queryParams.push(`shopId: "${params.shopId}"`);
  }
  if (params.itemId) {
    queryParams.push(`itemId: "${params.itemId}"`);
  }
  if (params.productCatId) {
    queryParams.push(`productCatId: ${params.productCatId}`);
  }

  // Adicionar parâmetros de configuração
  if (params.listType) {
    queryParams.push(`listType: ${params.listType}`);
  }
  if (params.sortType) {
    queryParams.push(`sortType: ${params.sortType}`);
  }
  if (params.page) {
    queryParams.push(`page: ${params.page}`);
  }
  if (params.limit) {
    queryParams.push(`limit: ${params.limit}`);
  }
  if (params.isAMSOffer !== undefined) {
    queryParams.push(`isAMSOffer: ${params.isAMSOffer}`);
  }
  if (params.isKeySeller !== undefined) {
    queryParams.push(`isKeySeller: ${params.isKeySeller}`);
  }

  const queryParamsString = queryParams.join(', ');

  return `
      query {
        productOfferV2(${queryParamsString}) {
          nodes {
            itemId
            shopId
            productName
            shopName
            priceMin
            priceMax
            price
            commissionRate
            commission
            sales
            ratingStar
            imageUrl
            productLink
            offerLink
          }
          pageInfo {
            hasNextPage
          }
        }
      }
  `;
}
