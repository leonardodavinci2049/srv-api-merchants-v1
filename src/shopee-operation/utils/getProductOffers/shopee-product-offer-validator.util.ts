import { ProductOfferV2QueryParams } from 'src/core/interfaces/shopee-product-offer.interface';

/**
 * Valida os parâmetros de busca do ProductOfferV2
 */
export function validateProductOfferParams(
  params: ProductOfferV2QueryParams,
): string | null {
  // Verificar se pelo menos um critério de busca foi fornecido
  if (
    !params.keyword &&
    !params.shopId &&
    !params.itemId &&
    !params.productCatId
  ) {
    return 'Pelo menos um critério de busca deve ser fornecido: keyword, shopId, itemId ou productCatId';
  }

  // Validar page
  if (params.page && params.page < 1) {
    return 'Page deve ser maior que 0';
  }

  // Validar limit
  if (params.limit && (params.limit < 1 || params.limit > 50)) {
    return 'Limit deve estar entre 1 e 50';
  }

  return null;
}
