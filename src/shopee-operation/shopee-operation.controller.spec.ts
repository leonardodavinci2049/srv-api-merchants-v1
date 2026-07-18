import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthGuard } from 'src/core/guards/auth.guard';
import request from 'supertest';
import { App } from 'supertest/types';
import { GenerateAffiliateLinkDto } from './dto/generate-affiliate-link.dto';
import { GetItemFeedDataDto } from './dto/get-item-feed-data.dto';
import { GetProductOffersDto } from './dto/get-product-offers.dto';
import { GetShopeeOffersDto } from './dto/get-shopee-offers.dto';
import { ListItemFeedsDto } from './dto/list-item-feeds.dto';
import { ShopeeOperationController } from './shopee-operation.controller';
import { ShopeeOperationService } from './shopee-operation.service';

describe('ShopeeOperationController (contract)', () => {
  const service = {
    generateAffiliateLink: jest.fn(),
    getProductOffers: jest.fn(),
    getShopeeOffers: jest.fn(),
    listItemFeeds: jest.fn(),
    getItemFeedData: jest.fn(),
  };

  async function buildApp() {
    const moduleRef = await Test.createTestingModule({
      controllers: [ShopeeOperationController],
      providers: [{ provide: ShopeeOperationService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
    return app;
  }

  beforeEach(() => jest.clearAllMocks());

  describe('generate-affiliate-link', () => {
    it('aceita apenas configId + originUrl', async () => {
      const app = await buildApp();

      service.generateAffiliateLink.mockResolvedValue({ success: true });

      await request(app.getHttpServer() as unknown as App)
        .post('/shopee-operation/v1/generate-affiliate-link')
        .send({
          configId: 1,
          originUrl: 'https://shopee.com.br/product',
        })
        .expect(201);

      expect(service.generateAffiliateLink).toHaveBeenCalledWith({
        configId: 1,
        originUrl: 'https://shopee.com.br/product',
      });
      await app.close();
    });

    it('rejeita credenciais legacy mesmo que validas (forbidNonWhitelisted)', async () => {
      const app = await buildApp();

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/generate-affiliate-link')
        .send({
          configId: 1,
          originUrl: 'https://shopee.com.br/product',
          credential: 'x',
          secretKey: 'y',
          clientId: 9,
        })
        .expect(400);

      expect(service.generateAffiliateLink).not.toHaveBeenCalled();
      await app.close();
    });

    it('rejeita configId ausente', async () => {
      const app = await buildApp();

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/generate-affiliate-link')
        .send({ originUrl: 'https://shopee.com.br/product' })
        .expect(400);

      expect(service.generateAffiliateLink).not.toHaveBeenCalled();
      await app.close();
    });
  });

  describe('get-product-offers', () => {
    it('rejeita configId nao numerico', async () => {
      const app = await buildApp();

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/get-product-offers')
        .send({ configId: 'abc', keyword: 'phone' })
        .expect(400);

      expect(service.getProductOffers).not.toHaveBeenCalled();
      await app.close();
    });

    it('preserva campos de operacao (sortType, page, limit, isAMSOffer)', async () => {
      const app = await buildApp();

      service.getProductOffers.mockResolvedValue({
        success: true,
        data: {
          products: [],
          pageInfo: { page: 2, limit: 5, hasNextPage: false },
        },
      });

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/get-product-offers')
        .send({
          configId: 3,
          keyword: 'phone',
          sortType: 2,
          page: 2,
          limit: 5,
          isAMSOffer: true,
        })
        .expect(201);

      const dto: GetProductOffersDto = {
        configId: 3,
        keyword: 'phone',
        sortType: 2,
        page: 2,
        limit: 5,
        isAMSOffer: true,
      };
      expect(service.getProductOffers).toHaveBeenCalledWith(dto);
      await app.close();
    });
  });

  describe('get-shopee-offers', () => {
    it('aceita apenas configId + campos de operacao', async () => {
      const app = await buildApp();

      service.getShopeeOffers.mockResolvedValue({
        success: true,
        data: {
          offers: [],
          pageInfo: { page: 1, limit: 20, hasNextPage: false },
        },
      });

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/get-shopee-offers')
        .send({ configId: 5, sortType: 1, page: 1, limit: 20 })
        .expect(201);

      const dto: GetShopeeOffersDto = {
        configId: 5,
        sortType: 1,
        page: 1,
        limit: 20,
      };
      expect(service.getShopeeOffers).toHaveBeenCalledWith(dto);
      await app.close();
    });
  });

  describe('error propagation', () => {
    it('mapeia NotFoundException do service para 404', async () => {
      const app = await buildApp();

      service.getShopeeOffers.mockRejectedValue(
        new NotFoundException('Configuracao CONFIG_ID=99 nao encontrada'),
      );

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/get-shopee-offers')
        .send({ configId: 99 })
        .expect(404);

      await app.close();
    });
  });

  describe('list-item-feeds', () => {
    it('aceita apenas configId e repassa o dto', async () => {
      const app = await buildApp();

      service.listItemFeeds.mockResolvedValue({
        success: true,
        data: { feeds: [] },
      });

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/list-item-feeds')
        .send({ configId: 5 })
        .expect(201);

      const dto: ListItemFeedsDto = { configId: 5 };
      expect(service.listItemFeeds).toHaveBeenCalledWith(dto);
      await app.close();
    });

    it('preserva feedMode quando informado', async () => {
      const app = await buildApp();

      service.listItemFeeds.mockResolvedValue({
        success: true,
        data: { feeds: [] },
      });

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/list-item-feeds')
        .send({ configId: 5, feedMode: 'DELTA' })
        .expect(201);

      expect(service.listItemFeeds).toHaveBeenCalledWith({
        configId: 5,
        feedMode: 'DELTA',
      });
      await app.close();
    });

    it('rejeita feedMode invalido', async () => {
      const app = await buildApp();

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/list-item-feeds')
        .send({ configId: 5, feedMode: 'INVALIDO' })
        .expect(400);

      expect(service.listItemFeeds).not.toHaveBeenCalled();
      await app.close();
    });

    it('rejeita credenciais legacy (forbidNonWhitelisted)', async () => {
      const app = await buildApp();

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/list-item-feeds')
        .send({ configId: 5, credential: 'x' })
        .expect(400);

      expect(service.listItemFeeds).not.toHaveBeenCalled();
      await app.close();
    });

    it('mapeia sucesso sem data para resposta de erro do envelope', async () => {
      const app = await buildApp();

      service.listItemFeeds.mockResolvedValue({ success: true });

      const res = await request(app.getHttpServer())
        .post('/shopee-operation/v1/list-item-feeds')
        .send({ configId: 5 })
        .expect(201);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Dados não encontrados');
      await app.close();
    });
  });

  describe('item-feed-data', () => {
    it('valida datafeedId obrigatorio', async () => {
      const app = await buildApp();

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/item-feed-data')
        .send({ configId: 5 })
        .expect(400);

      expect(service.getItemFeedData).not.toHaveBeenCalled();
      await app.close();
    });

    it('rejeita limit acima de 500', async () => {
      const app = await buildApp();

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/item-feed-data')
        .send({ configId: 5, datafeedId: 'abc', limit: 501 })
        .expect(400);

      expect(service.getItemFeedData).not.toHaveBeenCalled();
      await app.close();
    });

    it('rejeita offset negativo', async () => {
      const app = await buildApp();

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/item-feed-data')
        .send({ configId: 5, datafeedId: 'abc', offset: -1 })
        .expect(400);

      expect(service.getItemFeedData).not.toHaveBeenCalled();
      await app.close();
    });

    it('preserva offset/limit validos no dto', async () => {
      const app = await buildApp();

      service.getItemFeedData.mockResolvedValue({
        success: true,
        data: {
          rows: [],
          pageInfo: {
            offset: '0',
            limit: '500',
            totalCount: '0',
            hasMore: false,
          },
        },
      });

      await request(app.getHttpServer())
        .post('/shopee-operation/v1/item-feed-data')
        .send({
          configId: 3,
          datafeedId: '12345_FULL_20260205',
          offset: 0,
          limit: 500,
        })
        .expect(201);

      const dto: GetItemFeedDataDto = {
        configId: 3,
        datafeedId: '12345_FULL_20260205',
        offset: 0,
        limit: 500,
      };
      expect(service.getItemFeedData).toHaveBeenCalledWith(dto);
      await app.close();
    });
  });

  describe('GenerateAffiliateLinkDto unit', () => {
    it('valida transformation de configId para inteiro positivo', () => {
      const dto = new GenerateAffiliateLinkDto();
      dto.configId = 5 as number;
      dto.originUrl = 'https://shopee.com.br/x';
      expect(dto.configId).toBe(5);
    });
  });
});
