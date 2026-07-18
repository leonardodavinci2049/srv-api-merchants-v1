import {
  FeedMode,
  GetItemFeedDataQueryParams,
  GetItemFeedDataResponse,
  ItemFeed,
  ItemFeedDataRow,
  ItemFeedPageInfo,
  ListItemFeedsQueryParams,
  ListItemFeedsResponse,
  ShopeeGetItemFeedDataApiResponse,
  ShopeeListItemFeedsApiResponse,
} from 'src/core/interfaces/shopee-item-feed.interface';

/**
 * Normaliza a resposta de listItemFeeds. feedMode ausente cai para o
 * valor solicitado ou para o default FULL do provider.
 */
export function formatListItemFeedsResponse(
  apiResponse: ShopeeListItemFeedsApiResponse,
  params: ListItemFeedsQueryParams,
): ListItemFeedsResponse {
  if (apiResponse.errors?.length) {
    return {
      success: false,
      error: 'Erro da API',
      message: apiResponse.errors.map((error) => error.message).join(', '),
    };
  }
  const connection = apiResponse.data?.listItemFeeds;
  if (!connection?.feeds) {
    return {
      success: false,
      error: 'Dados não encontrados',
      message: 'Nenhum feed de produtos encontrado',
    };
  }
  const feeds: ItemFeed[] = connection.feeds.map((node) => ({
    datafeedId: String(node.datafeedId ?? ''),
    datafeedName: node.datafeedName ?? '',
    referenceId: String(node.referenceId ?? ''),
    description: node.description ?? '',
    totalCount: String(node.totalCount ?? '0'),
    date: node.date ?? '',
    feedMode: (node.feedMode ?? params.feedMode ?? FeedMode.FULL) as FeedMode,
  }));
  return { success: true, data: { feeds } };
}

/**
 * Normaliza a resposta de getItemFeedData. columns (JSON string do provider)
 * e convertido para objeto; fica null quando ausente ou invalido.
 */
export function formatGetItemFeedDataResponse(
  apiResponse: ShopeeGetItemFeedDataApiResponse,
  params: GetItemFeedDataQueryParams,
): GetItemFeedDataResponse {
  if (apiResponse.errors?.length) {
    return {
      success: false,
      error: 'Erro da API',
      message: apiResponse.errors.map((error) => error.message).join(', '),
    };
  }
  const connection = apiResponse.data?.getItemFeedData;
  if (!connection?.rows) {
    return {
      success: false,
      error: 'Dados não encontrados',
      message: 'Nenhum dado de feed encontrado para o datafeedId informado',
    };
  }
  const rows: ItemFeedDataRow[] = connection.rows.map((node) => ({
    columns: parseColumns(node.columns),
    updateType: node.updateType,
  }));
  const pageInfo: ItemFeedPageInfo = {
    offset: String(connection.pageInfo?.offset ?? params.offset ?? 0),
    limit: String(connection.pageInfo?.limit ?? params.limit ?? 500),
    totalCount: String(connection.pageInfo?.totalCount ?? 0),
    hasMore: Boolean(connection.pageInfo?.hasMore),
  };
  return { success: true, data: { rows, pageInfo } };
}

/**
 * Converte o campo columns (JSON string do provider) em objeto.
 * Retorna null quando ausente, invalido ou nao-objeto.
 */
function parseColumns(
  raw: string | undefined | null,
): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
