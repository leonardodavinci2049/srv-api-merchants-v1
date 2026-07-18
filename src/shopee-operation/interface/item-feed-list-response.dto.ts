import { ItemFeed } from '../../core/interfaces/shopee-item-feed.interface';

/**
 * DTO para resposta padronizada da listagem de feeds de produtos.
 */
export class ItemFeedListResponseDto {
  success: boolean;
  data?: ItemFeedListDataDto;
  error?: string;
  message?: string;

  constructor(
    success: boolean,
    data?: ItemFeedListDataDto,
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
  static success(feeds: ItemFeed[]): ItemFeedListResponseDto {
    return new ItemFeedListResponseDto(true, new ItemFeedListDataDto(feeds));
  }

  /**
   * Cria uma resposta de erro
   */
  static error(error: string, message?: string): ItemFeedListResponseDto {
    return new ItemFeedListResponseDto(false, undefined, error, message);
  }
}

/**
 * DTO para dados da resposta de listagem de feeds.
 */
export class ItemFeedListDataDto {
  feeds: ItemFeed[];

  constructor(feeds: ItemFeed[]) {
    this.feeds = feeds;
  }
}
