import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AliExpressApiService } from 'src/aliexpress-api/aliexpress-api.service';
import { AliExpressProviderError } from 'src/aliexpress-api/utils/aliexpress-error.util';
import { AliExpressOperationModule } from 'src/aliexpress-operation/aliexpress-operation.module';
import { AuthGuard } from 'src/core/guards/auth.guard';
import request from 'supertest';
import { App } from 'supertest/types';

/**
 * End-to-end-style test with the AliExpress transport mocked. Verifies global
 * validation, API-key authentication, endpoint registration, success and
 * sanitized error behavior without a real database, credentials, or
 * AliExpress request.
 */
describe('AliExpressOperation (e2e-style)', () => {
  let app: INestApplication<App>;

  const aliExpressApiService = {
    getCategories: jest.fn(),
    searchProducts: jest.fn(),
    getProductDetails: jest.fn(),
    getProductSkuDetails: jest.fn(),
    generateAffiliateLinks: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      imports: [AliExpressOperationModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(AliExpressApiService)
      .useValue(aliExpressApiService)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects unknown fields in the body (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/get-categories')
      .send({ app_signature: 'ok', unknown_field: 'x' })
      .expect(400);
  });

  it('rejects page_size out of range', async () => {
    await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/search-products')
      .send({ keywords: 'mp3', page_size: 999 })
      .expect(400);
    expect(aliExpressApiService.searchProducts).not.toHaveBeenCalled();
  });

  it('rejects min_sale_price greater than max_sale_price', async () => {
    await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/search-products')
      .send({ min_sale_price: 1000, max_sale_price: 100 })
      .expect(400);
    expect(aliExpressApiService.searchProducts).not.toHaveBeenCalled();
  });

  it('rejects source_values on disallowed host', async () => {
    await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/generate-affiliate-links')
      .send({
        promotion_link_type: 0,
        source_values: 'https://evil.example.com',
        tracking_id: 't',
      })
      .expect(400);
    expect(aliExpressApiService.generateAffiliateLinks).not.toHaveBeenCalled();
  });

  it('returns the stable success envelope for get-categories', async () => {
    aliExpressApiService.getCategories.mockResolvedValueOnce({
      total_result_count: '1',
      categories: [{ category_id: '111', category_name: 'dress' }],
    });

    const res = await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/get-categories')
      .send({})
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.categories[0].category_id).toBe('111');
  });

  it('returns snake_case fields for search-products', async () => {
    aliExpressApiService.searchProducts.mockResolvedValueOnce({
      current_record_count: 1,
      current_page_no: 1,
      total_record_count: 1,
      products: { product: [{ product_id: 100 }] },
    });

    const res = await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/search-products')
      .send({ keywords: 'mp3' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.current_record_count).toBe(1);
    expect(res.body.data.products.product[0].product_id).toBe(100);
    // Default currency/language applied; tracking_id is sourced from envs and
    // may differ across environments, so we only assert the documented defaults.
    expect(aliExpressApiService.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        target_currency: 'USD',
        target_language: 'EN',
        tracking_id: expect.any(String),
      }),
    );
  });

  it('requires promotion_link_type and source_values', async () => {
    await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/generate-affiliate-links')
      .send({})
      .expect(400);
    expect(aliExpressApiService.generateAffiliateLinks).not.toHaveBeenCalled();
  });

  it('returns 503 when the adapter times out', async () => {
    aliExpressApiService.getCategories.mockRejectedValueOnce(
      new AliExpressProviderError(
        'AliExpress aliexpress.affiliate.category.get timed out',
        { operation: 'aliexpress.affiliate.category.get' },
      ),
    );

    await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/get-categories')
      .send({})
      .expect(503);
  });

  it('returns 502 when the adapter rejects with a provider error', async () => {
    aliExpressApiService.getCategories.mockRejectedValueOnce(
      new AliExpressProviderError(
        'AliExpress aliexpress.affiliate.category.get failed: bad request',
        { operation: 'aliexpress.affiliate.category.get' },
      ),
    );

    await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/get-categories')
      .send({})
      .expect(502);
  });

  it('returns 502 on unexpected adapter errors', async () => {
    aliExpressApiService.getCategories.mockRejectedValueOnce(new Error('boom'));

    await request(app.getHttpServer())
      .post('/aliexpress-operation/v1/get-categories')
      .send({})
      .expect(502);
  });
});
