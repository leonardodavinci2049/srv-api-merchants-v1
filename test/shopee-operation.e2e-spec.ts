import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { ResultModel } from 'src/core/utils/result.model';
import {
  CONFIG_LOOKUP_STATUS,
  DbOperationService,
} from 'src/db.operation/db.operation.service';
import { SpConfigSelectIdType } from 'src/db.operation/types/db.operation.type';
import { ShopeeApiService } from 'src/shopee-api/shopee-api.service';
import { ShopeeOperationModule } from 'src/shopee-operation/shopee-operation.module';
import request from 'supertest';
import { App } from 'supertest/types';

/**
 * End-to-end-style test with mocked database and Shopee boundaries. Verifies
 * validation, configuration selection, and response behavior without a real
 * database, credentials, or Shopee request.
 */
describe('ShopeeOperation (e2e-style)', () => {
  let app: INestApplication<App>;

  const dbOperationService = {
    tskFindConfigSelectId: jest.fn(),
    taskLinkGenerationCreateV2: jest.fn(),
  };
  const shopeeApiService = {
    generateShortLink: jest.fn(),
    getProductOffers: jest.fn(),
    getShopeeOffers: jest.fn(),
  };

  function configRow(
    overrides: Partial<SpConfigSelectIdType[0][number]> = {},
  ): ResultModel {
    const record = {
      CONFIG_ID: 1,
      PROJECT_ID: 1,
      SHOPEE_CREDENTIAL: 'credential',
      SHOPEE_SECRET_KEY: 'secret',
      SHOPEE_AFFILIATE_ENDPOINT: 'https://example.com/graphql',
      SHOPEE_AFFILIATE_TIMEOUT: 5000,
      SHOPEE_AFFILIATE_SUBIDS: 'ALINY',
      SHOPEE_PAGE: 1,
      SHOPEE_SORTTYPE: 1,
      SHOPEE_LIMIT: 20,
      CLIENT_ID: 9,
      SHOPEE_APP_ID: 11,
      SHOPEE_FLAG_CLICK: 1,
      SHOPEE_CURRENCY: 'BRL',
      SHOPEE_LOCATION: 'Brasil',
      ACTIVE_FLAG: 1,
      ...overrides,
    };
    const data = [[record], [], { affectedRows: 0 }] as unknown;
    return new ResultModel(CONFIG_LOOKUP_STATUS.SUCCESS, 'ok', 1, data, 1);
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      imports: [ShopeeOperationModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(DbOperationService)
      .useValue(dbOperationService)
      .overrideProvider(ShopeeApiService)
      .useValue(shopeeApiService)
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

  it('rejeita payload sem configId (400)', async () => {
    await request(app.getHttpServer())
      .post('/shopee-operation/v1/get-product-offers')
      .send({ keyword: 'phone' })
      .expect(400);
  });

  it('rejeita credenciais legacy no corpo (forbidNonWhitelisted)', async () => {
    await request(app.getHttpServer())
      .post('/shopee-operation/v1/get-product-offers')
      .send({
        configId: 1,
        keyword: 'phone',
        credential: 'x',
        secretKey: 'y',
      })
      .expect(400);

    expect(dbOperationService.tskFindConfigSelectId).not.toHaveBeenCalled();
  });

  it('retorna 404 quando o configId nao existe', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(
      new ResultModel(
        CONFIG_LOOKUP_STATUS.NOT_FOUND,
        'nao encontrada',
        0,
        [[], [], {}],
        0,
      ),
    );

    await request(app.getHttpServer())
      .post('/shopee-operation/v1/get-shopee-offers')
      .send({ configId: 99 })
      .expect(404);
  });

  it('retorna 422 quando a configuracao esta inativa', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(
      configRow({ ACTIVE_FLAG: 0 }),
    );

    await request(app.getHttpServer())
      .post('/shopee-operation/v1/get-shopee-offers')
      .send({ configId: 1 })
      .expect(422);
  });

  it('retorna 500 quando o banco falha ao executar a procedure', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(
      new ResultModel(
        CONFIG_LOOKUP_STATUS.EXECUTION_FAILURE,
        'connection lost',
        0,
        [],
      ),
    );

    await request(app.getHttpServer())
      .post('/shopee-operation/v1/get-shopee-offers')
      .send({ configId: 1 })
      .expect(500);
  });

  it('retorna 200 e os dados quando o adapter responde com sucesso', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(configRow());
    shopeeApiService.getShopeeOffers.mockResolvedValue({
      success: true,
      data: {
        offers: [
          {
            commissionRate: '0.1',
            imageUrl: '',
            offerLink: 'https://s.shopee.com.br/x',
            originalLink: 'https://shopee.com.br/x',
            offerName: 'Offer',
            offerType: 2,
            categoryId: 100,
            collectionId: null,
            periodStartTime: 1,
            periodEndTime: 2,
          },
        ],
        pageInfo: { page: 1, limit: 20, hasNextPage: false },
      },
    });

    const res = await request(app.getHttpServer())
      .post('/shopee-operation/v1/get-shopee-offers')
      .send({ configId: 1 })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.offers).toHaveLength(1);
    expect(shopeeApiService.getShopeeOffers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortType: 1,
      }),
      expect.objectContaining({
        configId: 1,
        endpoint: 'https://example.com/graphql',
        timeoutMs: 5000,
        credential: 'credential',
        secretKey: 'secret',
      }),
    );
  });

  it('gera link de afiliado ponta a ponta com config resolvida', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(configRow());
    shopeeApiService.generateShortLink.mockResolvedValue(
      'https://s.shopee.com.br/abc',
    );
    shopeeApiService.getProductOffers.mockResolvedValue({
      success: true,
      data: {
        products: [
          {
            itemId: '1',
            productName: 'Produto',
            shopName: 'Loja',
            shopId: '2',
            priceMin: '10',
            priceMax: '12',
            commissionRate: '0.1',
            commission: '1',
            sales: 0,
            ratingStar: '5',
            imageUrl: '',
            productLink: '',
            offerLink: '',
          },
        ],
        pageInfo: { page: 1, limit: 1, hasNextPage: false },
      },
    });
    dbOperationService.taskLinkGenerationCreateV2.mockResolvedValue({
      statusCode: 100200,
      recordId: 42,
      message: 'Criado',
    });

    const res = await request(app.getHttpServer())
      .post('/shopee-operation/v1/generate-affiliate-link')
      .send({
        configId: 1,
        originUrl: 'https://shopee.com.br/product/2/1',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.affiliateLink).toBe('https://s.shopee.com.br/abc');
    expect(res.body.databaseRecord.recordId).toBe(42);

    expect(dbOperationService.tskFindConfigSelectId).toHaveBeenCalledTimes(1);
    expect(dbOperationService.taskLinkGenerationCreateV2).toHaveBeenCalledWith(
      expect.objectContaining({
        pe_client_id: 9,
        pe_app_id: 11,
        pe_flag_click: 1,
        pe_currency: 'BRL',
        pe_location: 'Brasil',
      }),
    );
  });
});
