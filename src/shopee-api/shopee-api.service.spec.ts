import { BadGatewayException } from '@nestjs/common';
import axios from 'axios';
import { ShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import {
  FeedMode,
  ShopeeGetItemFeedDataApiResponse,
  ShopeeListItemFeedsApiResponse,
} from 'src/core/interfaces/shopee-item-feed.interface';
import { ShopeeApiService } from './shopee-api.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ShopeeApiService', () => {
  let service: ShopeeApiService;

  const config: ShopeeConfiguration = {
    credential: 'CRED-123',
    secretKey: 'SECRET-456',
    affiliateSubids: 'ALINY, Michely',
    endpoint: 'https://selected.example.com/graphql',
    timeoutMs: 7000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ShopeeApiService();
  });

  function captureRequest() {
    const postMock = mockedAxios.post;
    return postMock.mock.calls[0];
  }

  describe('generateShortLink', () => {
    it('usa endpoint e timeout do registro selecionado', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            generateShortLink: { shortLink: 'https://s.shopee.com.br/abc' },
          },
        },
      });

      const result = await service.generateShortLink(
        'https://shopee.com.br/product/1/2',
        config,
      );

      expect(result).toBe('https://s.shopee.com.br/abc');
      const call = captureRequest();
      expect(call[0]).toBe(config.endpoint);
      expect(call[2]).toMatchObject({ timeout: config.timeoutMs });
    });

    it('deriva subIds do registro selecionado (split/trim/filter)', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            generateShortLink: { shortLink: 'https://s.shopee.com.br/x' },
          },
        },
      });

      await service.generateShortLink('https://shopee.com.br/p', config);

      const body = captureRequest()[1];
      expect(body.query).toContain('"ALINY"');
      expect(body.query).toContain('"Michely"');
    });

    it('assina com credential+timestamp+payload+secretKey', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          data: { generateShortLink: { shortLink: 'short' } },
        },
      });

      await service.generateShortLink('https://shopee.com.br/p', config);

      const headers = captureRequest()[2].headers as Record<string, string>;
      expect(headers.Authorization).toMatch(
        /^SHA256 Credential=CRED-123, Timestamp=\d+, Signature=[0-9a-f]{64}$/,
      );
    });

    it('traduz erro do provider sem vazar credenciais', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          errors: [{ message: 'Invalid credential' }],
        },
      });

      await expect(
        service.generateShortLink('https://shopee.com.br/p', config),
      ).rejects.toThrow(BadGatewayException);

      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('traduz falha de rede para BadGatewayException', async () => {
      mockedAxios.post.mockRejectedValue(new Error('ETIMEDOUT'));

      await expect(
        service.generateShortLink('https://shopee.com.br/p', config),
      ).rejects.toBeInstanceOf(BadGatewayException);
    });
  });

  describe('getProductOffers', () => {
    it('repassa fallbacks de currency/location ao mapper', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            productOfferV2: {
              nodes: [{ itemId: '1', shopId: '2' }],
              pageInfo: { hasNextPage: false },
            },
          },
        },
      });

      const result = await service.getProductOffers(
        { itemId: '1', page: 1, limit: 1 },
        config,
        { currencyFallback: 'BRL', locationFallback: 'Brasil' },
      );

      expect(result.success).toBe(true);
      expect(result.data?.products[0].currency).toBe('BRL');
      expect(result.data?.products[0].location).toBe('Brasil');
    });
  });

  describe('listItemFeeds', () => {
    it('serializa feedMode como enum GraphQL (sem aspas) e devolve feeds', async () => {
      const apiResponse: ShopeeListItemFeedsApiResponse = {
        data: {
          listItemFeeds: {
            feeds: [
              {
                datafeedId: '12345_FULL_20260205',
                datafeedName: 'Home Appliance',
                referenceId: '373421936506056704',
                description: 'catalogo',
                totalCount: '509',
                date: '2026-02-08',
                feedMode: FeedMode.FULL,
              },
            ],
          },
        },
      };
      mockedAxios.post.mockResolvedValue({ data: apiResponse });

      const result = await service.listItemFeeds(
        { feedMode: FeedMode.FULL },
        config,
      );

      const body = captureRequest()[1];
      expect(body.query).toContain('listItemFeeds(feedMode: FULL)');
      expect(body.query).not.toContain('feedMode: "FULL"');
      expect(body.query).toContain(
        'feeds { datafeedId datafeedName referenceId description totalCount date feedMode }',
      );
      expect(result.success).toBe(true);
      expect(result.data?.feeds[0].datafeedId).toBe('12345_FULL_20260205');
    });

    it('serializa feedMode DELTA sem aspas', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { data: { listItemFeeds: { feeds: [] } } },
      });

      await service.listItemFeeds({ feedMode: FeedMode.DELTA }, config);

      const body = captureRequest()[1];
      expect(body.query).toContain('listItemFeeds(feedMode: DELTA)');
    });

    it('omite feedMode quando ausente', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { data: { listItemFeeds: { feeds: [] } } },
      });

      await service.listItemFeeds({}, config);

      const body = captureRequest()[1];
      expect(body.query).toContain('listItemFeeds()');
    });

    it('traduz erro do provider para BadGatewayException', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { errors: [{ message: 'Unauthorized' }] },
      });

      await expect(
        service.listItemFeeds({ feedMode: FeedMode.DELTA }, config),
      ).rejects.toBeInstanceOf(BadGatewayException);
    });

    it('traduz falha de rede para BadGatewayException', async () => {
      mockedAxios.post.mockRejectedValue(new Error('ETIMEDOUT'));

      await expect(service.listItemFeeds({}, config)).rejects.toBeInstanceOf(
        BadGatewayException,
      );
    });
  });

  describe('getItemFeedData', () => {
    it('serializa datafeedId/offset/limit e faz parse do columns', async () => {
      const apiResponse: ShopeeGetItemFeedDataApiResponse = {
        data: {
          getItemFeedData: {
            rows: [
              {
                columns: '{"itemId":"123"}',
                updateType: 'NEW' as const,
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
      mockedAxios.post.mockResolvedValue({ data: apiResponse });

      const result = await service.getItemFeedData(
        { datafeedId: '12345_FULL_20260205', offset: 0, limit: 500 },
        config,
      );

      const body = captureRequest()[1];
      expect(body.query).toContain(
        'getItemFeedData(datafeedId: "12345_FULL_20260205", offset: 0, limit: 500)',
      );
      expect(result.success).toBe(true);
      expect(result.data?.rows[0].columns).toEqual({ itemId: '123' });
      expect(result.data?.pageInfo.totalCount).toBe('1000');
    });

    it('traduz erro do provider para BadGatewayException', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { errors: [{ message: 'datafeedId invalido' }] },
      });

      await expect(
        service.getItemFeedData({ datafeedId: 'id' }, config),
      ).rejects.toBeInstanceOf(BadGatewayException);
    });
  });
});
