import axios, { type AxiosError } from 'axios';
import { ALIEXPRESS_OPERATION } from './aliexpress-api.constants';
import { AliExpressApiService } from './aliexpress-api.service';

jest.mock('axios');
jest.mock('src/core/config/envs', () => ({
  envs: {
    ALIEXPRESS_SERVER_URL: 'https://api-sg.aliexpress.com/sync',
    ALIEXPRESS_APP_KEY: 'test-app-key',
    ALIEXPRESS_APP_SECRET: 'test-app-secret',
    ALIEXPRESS_TRACKING_ID: 'default-tracking',
  },
}));

// Capture the real AxiosError class before jest.mock('axios') replaces it.
const RealAxiosError = jest.requireActual('axios').AxiosError as {
  new (
    message?: string,
    code?: string,
    config?: unknown,
    request?: unknown,
    response?: { status?: number; data?: unknown },
  ): AxiosError;
};

describe('AliExpressApiService', () => {
  let service: AliExpressApiService;
  const postMock = axios.post as jest.MockedFunction<typeof axios.post>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AliExpressApiService();
  });

  function axiosResponse(data: unknown) {
    return { data, status: 200, statusText: 'OK' } as never;
  }

  function envelopeKey(operation: string) {
    return `${operation.replace(/\./g, '_')}_response`;
  }

  describe('getCategories', () => {
    it('posts the documented system + operation params and returns the typed result', async () => {
      postMock.mockResolvedValueOnce(
        axiosResponse({
          [envelopeKey(ALIEXPRESS_OPERATION.CATEGORY_GET)]: {
            resp_result: {
              resp_code: '200',
              resp_msg: 'success',
              result: {
                total_result_count: '1',
                categories: [{ category_id: '111', category_name: 'dress' }],
              },
            },
          },
          request_id: 'rid',
        }),
      );

      const result = await service.getCategories({ app_signature: 'sig' });

      expect(result).toEqual({
        total_result_count: '1',
        categories: [{ category_id: '111', category_name: 'dress' }],
      });
      expect(postMock).toHaveBeenCalledTimes(1);
      const [url, body, config] = postMock.mock.calls[0];
      expect(url).toContain(
        `method=${encodeURIComponent(ALIEXPRESS_OPERATION.CATEGORY_GET)}`,
      );
      expect(url.startsWith('https://api-sg.aliexpress.com/sync')).toBe(true);
      // form-urlencoded
      expect(config.headers['Content-Type']).toBe(
        'application/x-www-form-urlencoded;charset=utf-8',
      );
      expect(config.headers.Accept).toBe('application/json');
      expect(config.timeout).toBe(30_000);
      expect(config.maxRedirects).toBe(0);
      // System parameters
      expect(body).toContain('app_key=test-app-key');
      expect(body).toContain('sign_method=sha256');
      expect(body).toContain('format=json');
      expect(body).toContain('v=2.0');
      expect(body).toContain(
        `method=${encodeURIComponent(ALIEXPRESS_OPERATION.CATEGORY_GET)}`,
      );
      // Operation parameter
      expect(body).toContain('app_signature=sig');
      // Signature appended
      expect(body).toMatch(/sign=[0-9A-F]{64}/);
      // Never leaks the secret
      expect(body).not.toContain('test-app-secret');
    });
  });

  describe('searchProducts', () => {
    it('forwards documented operation parameters and preserves snake_case in result', async () => {
      postMock.mockResolvedValueOnce(
        axiosResponse({
          [envelopeKey(ALIEXPRESS_OPERATION.PRODUCT_QUERY)]: {
            resp_result: {
              resp_code: 200,
              resp_msg: 'Call succeeds',
              result: {
                current_record_count: 1,
                products: { product: [{ product_id: 100 }] },
              },
            },
          },
        }),
      );

      const result = await service.searchProducts({
        keywords: 'mp3',
        page_no: 1,
        page_size: 50,
      });

      expect(result).toEqual({
        current_record_count: 1,
        products: { product: [{ product_id: 100 }] },
      });
      const body = postMock.mock.calls[0][1] as string;
      expect(body).toContain('keywords=mp3');
      expect(body).toContain('page_no=1');
      expect(body).toContain('page_size=50');
    });
  });

  describe('getProductDetails', () => {
    it('returns the documented product detail envelope', async () => {
      postMock.mockResolvedValueOnce(
        axiosResponse({
          [envelopeKey(ALIEXPRESS_OPERATION.PRODUCT_DETAIL_GET)]: {
            resp_result: {
              resp_code: '200',
              resp_msg: 'success',
              result: { current_record_count: '1', products: [] },
            },
          },
        }),
      );
      const result = await service.getProductDetails({ product_ids: '1,2' });
      expect(result).toEqual({ current_record_count: '1', products: [] });
    });
  });

  describe('getProductSkuDetails', () => {
    it('handles the nested SKU-detail envelope', async () => {
      postMock.mockResolvedValueOnce(
        axiosResponse({
          [envelopeKey(ALIEXPRESS_OPERATION.PRODUCT_SKU_DETAIL_GET)]: {
            result: {
              result: {
                ae_item_info: { product_id: '100' },
                ae_item_sku_info: [],
              },
              code: '200',
              success: 'true',
            },
          },
        }),
      );
      const result = await service.getProductSkuDetails({
        product_id: '100',
        ship_to_country: 'US',
        target_currency: 'USD',
        target_language: 'EN',
      });
      expect(result.ae_item_info?.product_id).toBe('100');
    });
  });

  describe('generateAffiliateLinks', () => {
    it('returns the documented promotion_links result', async () => {
      postMock.mockResolvedValueOnce(
        axiosResponse({
          [envelopeKey(ALIEXPRESS_OPERATION.LINK_GENERATE)]: {
            resp_result: {
              resp_code: '200',
              resp_msg: 'success',
              result: {
                total_result_count: '1',
                promotion_links: [
                  {
                    promotion_link: 'https://s.click.aliexpress.com/e/x',
                    source_value: 'https://www.aliexpress.com',
                    tracking_id: 'default-tracking',
                  },
                ],
              },
            },
          },
        }),
      );
      const result = await service.generateAffiliateLinks({
        promotion_link_type: 0,
        source_values: 'https://www.aliexpress.com',
        tracking_id: 'default-tracking',
      });
      expect(result.promotion_links?.[0].promotion_link).toBe(
        'https://s.click.aliexpress.com/e/x',
      );
    });
  });

  describe('failure handling', () => {
    it('rejects when AliExpress returns error_response', async () => {
      postMock.mockResolvedValueOnce(
        axiosResponse({
          error_response: {
            code: '50',
            msg: 'service unavailable',
            sub_msg: 'rate limited',
          },
        }),
      );
      await expect(service.getCategories({})).rejects.toThrow(
        /rejected the request: rate limited/,
      );
    });

    it('rejects when resp_code is unsuccessful', async () => {
      postMock.mockResolvedValueOnce(
        axiosResponse({
          [envelopeKey(ALIEXPRESS_OPERATION.CATEGORY_GET)]: {
            resp_result: { resp_code: '400', resp_msg: 'bad request' },
          },
        }),
      );
      await expect(service.getCategories({})).rejects.toThrow(
        /AliExpress.*failed: bad request/,
      );
    });

    it('rejects on missing envelope (malformed payload)', async () => {
      postMock.mockResolvedValueOnce(axiosResponse({ unrelated: true }));
      await expect(service.getCategories({})).rejects.toThrow(
        /unknown response envelope/,
      );
    });

    it('rejects on success envelope without result', async () => {
      postMock.mockResolvedValueOnce(
        axiosResponse({
          [envelopeKey(ALIEXPRESS_OPERATION.CATEGORY_GET)]: {
            resp_result: { resp_code: '200', resp_msg: 'success' },
          },
        }),
      );
      await expect(service.getCategories({})).rejects.toThrow(/without result/);
    });

    it('maps axios timeouts to a transport error', async () => {
      const axiosError = new RealAxiosError(
        'timeout of 30000ms exceeded',
        'ECONNABORTED',
      );
      postMock.mockRejectedValueOnce(axiosError);
      await expect(service.getCategories({})).rejects.toThrow(/timed out/);
    });

    it('maps non-2xx HTTP responses to a transport error', async () => {
      const axiosError = new RealAxiosError(
        'bad gateway',
        'ERR_BAD_RESPONSE',
        undefined,
        undefined,
        { status: 502, data: {} },
      );
      postMock.mockRejectedValueOnce(axiosError);
      await expect(service.getCategories({})).rejects.toThrow(/HTTP 502/);
    });

    it('maps unreachable network errors to a transport error', async () => {
      const axiosError = new RealAxiosError(
        'connect ECONNREFUSED',
        'ECONNREFUSED',
      );
      postMock.mockRejectedValueOnce(axiosError);
      await expect(service.getCategories({})).rejects.toThrow(/unreachable/);
    });
  });
});
