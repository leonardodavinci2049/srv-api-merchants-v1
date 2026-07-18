import { BadGatewayException } from '@nestjs/common';
import axios from 'axios';
import { ShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
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
});
