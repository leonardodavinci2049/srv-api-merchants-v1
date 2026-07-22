import {
  BadGatewayException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AliExpressApiService } from 'src/aliexpress-api/aliexpress-api.service';
import { AliExpressProviderError } from 'src/aliexpress-api/utils/aliexpress-error.util';
import { AliExpressOperationService } from './aliexpress-operation.service';
import { GenerateAffiliateLinksDto } from './dto/generate-affiliate-links.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { GetProductDetailsDto } from './dto/get-product-details.dto';
import { GetProductSkuDetailsDto } from './dto/get-product-sku-details.dto';
import { SearchProductsDto } from './dto/search-products.dto';

jest.mock('src/core/config/envs', () => ({
  envs: {
    ALIEXPRESS_SERVER_URL: 'https://api-sg.aliexpress.com/sync',
    ALIEXPRESS_APP_KEY: 'test-app-key',
    ALIEXPRESS_APP_SECRET: 'test-app-secret',
    ALIEXPRESS_TRACKING_ID: 'default-tracking',
  },
}));

describe('AliExpressOperationService', () => {
  const aliExpressApi = {
    getCategories: jest.fn(),
    searchProducts: jest.fn(),
    getProductDetails: jest.fn(),
    getProductSkuDetails: jest.fn(),
    generateAffiliateLinks: jest.fn(),
  };
  let service: AliExpressOperationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AliExpressOperationService,
        { provide: AliExpressApiService, useValue: aliExpressApi },
      ],
    }).compile();
    service = module.get(AliExpressOperationService);
  });

  function makeProviderError(message: string, opts: { cause?: unknown } = {}) {
    return new AliExpressProviderError(
      message,
      { operation: 'op' },
      opts.cause,
    );
  }

  it('delegates getCategories and returns the stable success envelope', async () => {
    aliExpressApi.getCategories.mockResolvedValueOnce({
      total_result_count: '1',
      categories: [{ category_id: '1', category_name: 'a' }],
    });
    const dto = { app_signature: 'sig' } as GetCategoriesDto;

    const result = await service.getCategories(dto);

    expect(aliExpressApi.getCategories).toHaveBeenCalledWith({
      app_signature: 'sig',
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      total_result_count: '1',
      categories: [{ category_id: '1', category_name: 'a' }],
    });
  });

  it('forwards search-products defaults for currency/language/tracking when DTO omits them', async () => {
    aliExpressApi.searchProducts.mockResolvedValueOnce({
      current_record_count: 0,
    });
    const dto = { keywords: 'mp3' } as SearchProductsDto;

    await service.searchProducts(dto);

    expect(aliExpressApi.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        keywords: 'mp3',
        target_currency: 'USD',
        target_language: 'EN',
        tracking_id: 'default-tracking',
      }),
    );
  });

  it('does not override explicit validated values with the defaults', async () => {
    aliExpressApi.searchProducts.mockResolvedValueOnce({
      current_record_count: 0,
    });
    const dto = {
      keywords: 'mp3',
      target_currency: 'BRL',
      target_language: 'PT',
      tracking_id: 'custom',
    } as SearchProductsDto;

    await service.searchProducts(dto);

    expect(aliExpressApi.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        target_currency: 'BRL',
        target_language: 'PT',
        tracking_id: 'custom',
      }),
    );
  });

  it('passes through product details parameters with defaults', async () => {
    aliExpressApi.getProductDetails.mockResolvedValueOnce({
      current_record_count: '1',
      products: [],
    });
    const dto = { product_ids: '1,2' } as GetProductDetailsDto;

    await service.getProductDetails(dto);

    expect(aliExpressApi.getProductDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        product_ids: '1,2',
        target_currency: 'USD',
        target_language: 'EN',
        tracking_id: 'default-tracking',
      }),
    );
  });

  it('maps sku detail required parameters verbatim', async () => {
    aliExpressApi.getProductSkuDetails.mockResolvedValueOnce({
      ae_item_info: { product_id: '100' },
    });
    const dto = {
      product_id: '100',
      ship_to_country: 'US',
      target_currency: 'USD',
      target_language: 'EN',
      need_deliver_info: 'Yes',
      sku_ids: '1,2',
    } as GetProductSkuDetailsDto;

    await service.getProductSkuDetails(dto);

    expect(aliExpressApi.getProductSkuDetails).toHaveBeenCalledWith({
      product_id: '100',
      ship_to_country: 'US',
      target_currency: 'USD',
      target_language: 'EN',
      need_deliver_info: 'Yes',
      sku_ids: '1,2',
    });
  });

  it('passes required generate-affiliate-links fields verbatim', async () => {
    aliExpressApi.generateAffiliateLinks.mockResolvedValueOnce({
      total_result_count: '1',
      promotion_links: [],
    });
    const dto = {
      promotion_link_type: 0,
      source_values: 'https://www.aliexpress.com',
      tracking_id: 'my-tracking',
    } as GenerateAffiliateLinksDto;

    await service.generateAffiliateLinks(dto);

    expect(aliExpressApi.generateAffiliateLinks).toHaveBeenCalledWith({
      promotion_link_type: 0,
      source_values: 'https://www.aliexpress.com',
      tracking_id: 'my-tracking',
    });
  });

  it('translates timeouts into ServiceUnavailableException', async () => {
    aliExpressApi.getCategories.mockRejectedValueOnce(
      makeProviderError('AliExpress op timed out'),
    );
    await expect(service.getCategories({})).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('translates unreachable into ServiceUnavailableException', async () => {
    aliExpressApi.getCategories.mockRejectedValueOnce(
      makeProviderError('AliExpress op is unreachable'),
    );
    await expect(service.getCategories({})).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('translates provider rejections into BadGatewayException', async () => {
    aliExpressApi.getCategories.mockRejectedValueOnce(
      makeProviderError('AliExpress op failed: bad request'),
    );
    await expect(service.getCategories({})).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('translates unexpected errors into BadGatewayException', async () => {
    aliExpressApi.getCategories.mockRejectedValueOnce(new Error('boom'));
    await expect(service.getCategories({})).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
