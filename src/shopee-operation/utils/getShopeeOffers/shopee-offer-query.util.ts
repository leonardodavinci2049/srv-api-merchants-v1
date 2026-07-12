import { ShopeeOfferQueryParams } from 'src/core/interfaces/shopee-offer.interface';

/**
 * Constrói a query GraphQL para shopeeOfferV2
 */
export function buildShopeeOfferQuery(params: ShopeeOfferQueryParams): string {
  const queryParams: string[] = [];

  if (params.keyword) {
    queryParams.push(`keyword: "${params.keyword}"`);
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

  const queryParamsString = queryParams.join(', ');

  return `
      query {
        shopeeOfferV2(${queryParamsString}) {
          nodes {
            commissionRate
            imageUrl
            offerLink
            originalLink
            offerName
            offerType
            categoryId
            collectionId
            periodStartTime
            periodEndTime
          }
          pageInfo {
            page
            limit
            hasNextPage
          }
        }
      }
  `;
}
