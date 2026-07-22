import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AliExpressApiService } from 'src/aliexpress-api/aliexpress-api.service';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { AliExpressOperationController } from './aliexpress-operation.controller';
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

describe('AliExpressOperationController', () => {
  const service = {
    getCategories: jest.fn(),
    searchProducts: jest.fn(),
    getProductDetails: jest.fn(),
    getProductSkuDetails: jest.fn(),
    generateAffiliateLinks: jest.fn(),
  };
  let controller: AliExpressOperationController;
  let reflector: Reflector;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AliExpressOperationController],
      providers: [
        { provide: AliExpressOperationService, useValue: service },
        { provide: AliExpressApiService, useValue: {} },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(AliExpressOperationController);
    reflector = module.get(Reflector);
  });

  function routeMetadata(handler: (...args: unknown[]) => unknown) {
    return {
      guards: reflector.get('__guards__', handler),
      path: reflector.get('path', handler),
      method: reflector.get('method', handler),
    };
  }

  it('registers five POST routes guarded by AuthGuard', () => {
    const handlers = Object.getOwnPropertyNames(
      AliExpressOperationController.prototype,
    ).filter((name) => name !== 'constructor');

    expect(handlers).toHaveLength(5);
    for (const handlerName of handlers) {
      const handler = (
        controller as unknown as Record<string, (...args: unknown[]) => unknown>
      )[handlerName];
      const meta = routeMetadata(handler);
      expect(meta.guards).toBeDefined();
      expect(meta.guards?.[0]).toBe(AuthGuard);
      expect(meta.method).toBe(1); // RequestMethod.POST
    }
  });

  it('GET /:id is removed (no GET route is registered)', () => {
    const handlers = Object.getOwnPropertyNames(
      AliExpressOperationController.prototype,
    ).filter((name) => name !== 'constructor');
    expect(handlers.some((n) => n.toLowerCase().includes('find'))).toBe(false);
  });

  it('delegates get-categories to the operation service', async () => {
    service.getCategories.mockResolvedValueOnce({ success: true, data: {} });
    await controller.getCategories({} as GetCategoriesDto);
    expect(service.getCategories).toHaveBeenCalledTimes(1);
  });

  it('delegates search-products to the operation service', async () => {
    service.searchProducts.mockResolvedValueOnce({ success: true, data: {} });
    await controller.searchProducts({} as SearchProductsDto);
    expect(service.searchProducts).toHaveBeenCalledTimes(1);
  });

  it('delegates get-product-details to the operation service', async () => {
    service.getProductDetails.mockResolvedValueOnce({
      success: true,
      data: {},
    });
    await controller.getProductDetails({} as GetProductDetailsDto);
    expect(service.getProductDetails).toHaveBeenCalledTimes(1);
  });

  it('delegates get-product-sku-details to the operation service', async () => {
    service.getProductSkuDetails.mockResolvedValueOnce({
      success: true,
      data: {},
    });
    await controller.getProductSkuDetails({} as GetProductSkuDetailsDto);
    expect(service.getProductSkuDetails).toHaveBeenCalledTimes(1);
  });

  it('delegates generate-affiliate-links to the operation service', async () => {
    service.generateAffiliateLinks.mockResolvedValueOnce({
      success: true,
      data: {},
    });
    await controller.generateAffiliateLinks({} as GenerateAffiliateLinksDto);
    expect(service.generateAffiliateLinks).toHaveBeenCalledTimes(1);
  });
});
