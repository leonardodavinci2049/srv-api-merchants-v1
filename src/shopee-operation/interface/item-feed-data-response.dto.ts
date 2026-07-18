import {
  ItemFeedDataRow,
  ItemFeedPageInfo,
} from '../../core/interfaces/shopee-item-feed.interface';

/**
 * DTO para resposta padronizada dos dados de um feed de produtos.
 */
export class ItemFeedDataResponseDto {
  success: boolean;
  data?: ItemFeedDataDataDto;
  error?: string;
  message?: string;

  constructor(
    success: boolean,
    data?: ItemFeedDataDataDto,
    error?: string,
    message?: string,
  ) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.message = message;
  }

  /**
   * Cria uma resposta de sucesso
   */
  static success(
    rows: ItemFeedDataRow[],
    pageInfo: ItemFeedPageInfo,
  ): ItemFeedDataResponseDto {
    return new ItemFeedDataResponseDto(
      true,
      new ItemFeedDataDataDto(rows, pageInfo),
    );
  }

  /**
   * Cria uma resposta de erro
   */
  static error(error: string, message?: string): ItemFeedDataResponseDto {
    return new ItemFeedDataResponseDto(false, undefined, error, message);
  }
}

/**
 * DTO para dados da resposta de um feed de produtos.
 */
export class ItemFeedDataDataDto {
  rows: ItemFeedDataRow[];
  pageInfo: ItemFeedPageInfo;

  constructor(rows: ItemFeedDataRow[], pageInfo: ItemFeedPageInfo) {
    this.rows = rows;
    this.pageInfo = pageInfo;
  }
}
