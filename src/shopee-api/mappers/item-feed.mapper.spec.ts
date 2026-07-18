import {
  DeltaDataUpdateType,
  FeedMode,
} from 'src/core/interfaces/shopee-item-feed.interface';
import {
  formatGetItemFeedDataResponse,
  formatListItemFeedsResponse,
} from './item-feed.mapper';

describe('item-feed.mapper', () => {
  describe('formatListItemFeedsResponse', () => {
    it('normaliza feeds com Int64 como string', () => {
      const apiResponse = {
        data: {
          listItemFeeds: {
            feeds: [
              {
                datafeedId: '12345_FULL_20260205',
                datafeedName: 'Home Appliance - Preferred',
                referenceId: '373421936506056704',
                description: 'catalogo deeletrodomesticos',
                totalCount: '509',
                date: '2026-02-08',
                feedMode: FeedMode.FULL,
              },
            ],
          },
        },
      };

      const result = formatListItemFeedsResponse(apiResponse, {
        feedMode: FeedMode.FULL,
      });

      expect(result.success).toBe(true);
      expect(result.data?.feeds[0]).toEqual({
        datafeedId: '12345_FULL_20260205',
        datafeedName: 'Home Appliance - Preferred',
        referenceId: '373421936506056704',
        description: 'catalogo deeletrodomesticos',
        totalCount: '509',
        date: '2026-02-08',
        feedMode: FeedMode.FULL,
      });
    });

    it('aplica feedMode default FULL quando provider nao retorna o campo', () => {
      const apiResponse = {
        data: {
          listItemFeeds: {
            feeds: [{ datafeedId: 'abc' }],
          },
        },
      };

      const result = formatListItemFeedsResponse(apiResponse, {});

      expect(result.data?.feeds[0].feedMode).toBe(FeedMode.FULL);
    });

    it('preserva feedMode DELTA do provider quando presente', () => {
      const apiResponse = {
        data: {
          listItemFeeds: {
            feeds: [{ datafeedId: 'abc', feedMode: FeedMode.DELTA }],
          },
        },
      };

      const result = formatListItemFeedsResponse(apiResponse, {
        feedMode: FeedMode.FULL,
      });

      expect(result.data?.feeds[0].feedMode).toBe(FeedMode.DELTA);
    });

    it('retorna erro quando provider envia GraphQL errors', () => {
      const apiResponse = {
        errors: [{ message: 'Unauthorized' }],
      };

      const result = formatListItemFeedsResponse(apiResponse, {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    it('retorna erro quando a connection esta ausente', () => {
      const result = formatListItemFeedsResponse({}, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Dados não encontrados');
    });
  });

  describe('formatGetItemFeedDataResponse', () => {
    it('faz parse do campo columns (JSON string) em objeto', () => {
      const apiResponse = {
        data: {
          getItemFeedData: {
            rows: [
              {
                columns:
                  '{"itemId":"123","price":"10.5","productName":"Produto"}',
                updateType: DeltaDataUpdateType.NEW,
              },
            ],
            pageInfo: {
              offset: '0',
              limit: '500',
              totalCount: '1000',
              hasMore: true,
            },
          },
        },
      };

      const result = formatGetItemFeedDataResponse(apiResponse, {
        datafeedId: '12345_FULL_20260205',
        offset: 0,
        limit: 500,
      });

      expect(result.success).toBe(true);
      expect(result.data?.rows[0].columns).toEqual({
        itemId: '123',
        price: '10.5',
        productName: 'Produto',
      });
      expect(result.data?.rows[0].updateType).toBe(DeltaDataUpdateType.NEW);
      expect(result.data?.pageInfo).toEqual({
        offset: '0',
        limit: '500',
        totalCount: '1000',
        hasMore: true,
      });
    });

    it('converte columns invalido para null sem falhar', () => {
      const apiResponse = {
        data: {
          getItemFeedData: {
            rows: [{ columns: 'not-json' }],
            pageInfo: { offset: 0, limit: 500, totalCount: 0, hasMore: false },
          },
        },
      };

      const result = formatGetItemFeedDataResponse(apiResponse, {
        datafeedId: 'id',
      });

      expect(result.success).toBe(true);
      expect(result.data?.rows[0].columns).toBeNull();
    });

    it('converte columns array (nao-objeto) para null', () => {
      const apiResponse = {
        data: {
          getItemFeedData: {
            rows: [{ columns: '[1,2,3]' }],
            pageInfo: { offset: 0, limit: 500, totalCount: 0, hasMore: false },
          },
        },
      };

      const result = formatGetItemFeedDataResponse(apiResponse, {
        datafeedId: 'id',
      });

      expect(result.data?.rows[0].columns).toBeNull();
    });

    it('usa defaults 0/500 do request quando pageInfo ausente', () => {
      const apiResponse = {
        data: {
          getItemFeedData: {
            rows: [{ columns: '{"a":1}' }],
          },
        },
      };

      const result = formatGetItemFeedDataResponse(apiResponse, {
        datafeedId: 'id',
        offset: 10,
        limit: 100,
      });

      expect(result.data?.pageInfo).toEqual({
        offset: '10',
        limit: '100',
        totalCount: '0',
        hasMore: false,
      });
    });

    it('retorna erro quando provider envia GraphQL errors', () => {
      const apiResponse = {
        errors: [{ message: 'datafeedId invalido' }],
      };

      const result = formatGetItemFeedDataResponse(apiResponse, {
        datafeedId: 'id',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('datafeedId invalido');
    });

    it('retorna erro quando rows esta ausente', () => {
      const result = formatGetItemFeedDataResponse({}, { datafeedId: 'id' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Dados não encontrados');
    });
  });
});
