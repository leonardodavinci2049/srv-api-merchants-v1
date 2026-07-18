/**
 * Modos de feed de produtos da Shopee.
 * FULL: catalogo completo, indicado para a carga inicial.
 * DELTA: apenas produtos adicionados, atualizados ou removidos desde o dia anterior.
 */
export enum FeedMode {
  FULL = 'FULL',
  DELTA = 'DELTA',
}

/**
 * Tipo de alteracao de um registro em feeds DELTA.
 */
export enum DeltaDataUpdateType {
  NEW = 'NEW',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Parametros de entrada da operacao GraphQL listItemFeeds.
 * A documentacao lista apenas feedMode, opcional.
 */
export interface ListItemFeedsQueryParams {
  feedMode?: FeedMode;
}

/**
 * Parametros de entrada da operacao GraphQL getItemFeedData.
 */
export interface GetItemFeedDataQueryParams {
  datafeedId: string;
  offset?: number;
  limit?: number;
}

/**
 * Feed de produtos retornado por listItemFeeds.
 * totalCount/date seguem o formato do provider; campos Int64 sao
 * expostos como string para preservar precisao acima de 2^53.
 */
export interface ItemFeed {
  datafeedId: string;
  datafeedName: string;
  referenceId: string;
  description: string;
  totalCount: string;
  date: string;
  feedMode: FeedMode;
}

/**
 * Linha de dados retornada por getItemFeedData. columns e o JSON da Shopee
 * já parseado em objeto; fica null quando ausente ou invalido.
 */
export interface ItemFeedDataRow {
  columns: Record<string, unknown> | null;
  updateType?: DeltaDataUpdateType;
}

/**
 * Informacoes de paginacao de getItemFeedData. Campos Int64 sao expostos
 * como string para preservar precisao acima de 2^53.
 */
export interface ItemFeedPageInfo {
  offset: string;
  limit: string;
  totalCount: string;
  hasMore: boolean;
}

/**
 * Resposta normalizada de listItemFeeds.
 */
export interface ListItemFeedsResponse {
  success: boolean;
  data?: {
    feeds: ItemFeed[];
  };
  error?: string;
  message?: string;
}

/**
 * Resposta normalizada de getItemFeedData.
 */
export interface GetItemFeedDataResponse {
  success: boolean;
  data?: {
    rows: ItemFeedDataRow[];
    pageInfo: ItemFeedPageInfo;
  };
  error?: string;
  message?: string;
}

/**
 * Resposta raw da API GraphQL da Shopee para listItemFeeds.
 */
export interface ShopeeListItemFeedsApiResponse {
  data?: {
    listItemFeeds?: {
      feeds?: Array<{
        datafeedId?: string | number;
        datafeedName?: string;
        referenceId?: string | number;
        description?: string;
        totalCount?: string | number;
        date?: string;
        feedMode?: FeedMode;
      }>;
    };
  };
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

/**
 * Resposta raw da API GraphQL da Shopee para getItemFeedData.
 */
export interface ShopeeGetItemFeedDataApiResponse {
  data?: {
    getItemFeedData?: {
      rows?: Array<{
        columns?: string;
        updateType?: DeltaDataUpdateType;
      }>;
      pageInfo?: {
        offset?: string | number;
        limit?: string | number;
        totalCount?: string | number;
        hasMore?: boolean;
      };
    };
  };
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}
