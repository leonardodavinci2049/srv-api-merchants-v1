import {
  BadGatewayException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ResolvedShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import { FunctionsService } from 'src/core/utils/forServices/functions.service';
import { DbOperationService } from 'src/db.operation/db.operation.service';
import { ShopeeApiService } from 'src/shopee-api/shopee-api.service';
import { ShopeeConfigurationResolver } from './services/shopee-configuration.resolver';
import { ShopeeOperationService } from './shopee-operation.service';

describe('ShopeeOperationService', () => {
  const resolvedConfig: ResolvedShopeeConfiguration = {
    configId: 7,
    credential: 'credential',
    secretKey: 'secret',
    affiliateSubids: 'ALINY',
    endpoint: 'https://open-api.affiliate.shopee.com.br/graphql',
    timeoutMs: 5000,
    clientId: 9,
    appId: 11,
    flagClick: 1,
    currency: 'BRL',
    location: 'Brasil',
    defaultPage: 1,
    defaultSortType: 1,
    defaultLimit: 20,
  };

  const functionsService = {
    isValidShopeeProductUrl: jest.fn(),
    isShortShopeeUrl: jest.fn(),
    resolveShortUrl: jest.fn(),
    extractProductNameId: jest.fn(),
  };
  const dbOperationService = { taskLinkGenerationCreateV2: jest.fn() };
  const shopeeApiService = {
    generateShortLink: jest.fn(),
    getProductOffers: jest.fn(),
    getShopeeOffers: jest.fn(),
  };
  const configResolver = { resolve: jest.fn() };

  let service: ShopeeOperationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ShopeeOperationService,
        { provide: FunctionsService, useValue: functionsService },
        { provide: DbOperationService, useValue: dbOperationService },
        { provide: ShopeeApiService, useValue: shopeeApiService },
        { provide: ShopeeConfigurationResolver, useValue: configResolver },
      ],
    }).compile();
    service = module.get(ShopeeOperationService);
    configResolver.resolve.mockResolvedValue(resolvedConfig);
  });

  describe('getProductOffers', () => {
    it('carrega exatamente o configId do caller e delega ao adapter', async () => {
      const response = {
        success: true,
        data: {
          products: [],
          pageInfo: { page: 1, limit: 10, hasNextPage: false },
        },
      };
      shopeeApiService.getProductOffers.mockResolvedValue(response);

      await expect(
        service.getProductOffers({
          configId: 7,
          itemId: '123',
        }),
      ).resolves.toBe(response);

      expect(configResolver.resolve).toHaveBeenCalledWith(7);
      expect(shopeeApiService.getProductOffers).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: '123',
          page: resolvedConfig.defaultPage,
          limit: resolvedConfig.defaultLimit,
          sortType: resolvedConfig.defaultSortType,
        }),
        resolvedConfig,
        {
          currencyFallback: resolvedConfig.currency,
          locationFallback: resolvedConfig.location,
        },
      );
    });

    it('valores de request sobrescrevem os defaults do registro', async () => {
      shopeeApiService.getProductOffers.mockResolvedValue({
        success: true,
        data: {
          products: [],
          pageInfo: { page: 3, limit: 5, hasNextPage: false },
        },
      });

      await service.getProductOffers({
        configId: 7,
        keyword: 'phone',
        page: 3,
        limit: 5,
        sortType: 2,
      });

      expect(shopeeApiService.getProductOffers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3, limit: 5, sortType: 2 }),
        resolvedConfig,
        expect.any(Object),
      );
    });

    it('propaga NotFoundException do resolver', async () => {
      configResolver.resolve.mockRejectedValue(
        new NotFoundException('Configuracao CONFIG_ID=99 nao encontrada'),
      );

      await expect(
        service.getProductOffers({ configId: 99, keyword: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getShopeeOffers', () => {
    it('delega ao adapter usando defaults do registro selecionado', async () => {
      const response = {
        success: true,
        data: {
          offers: [],
          pageInfo: { page: 1, limit: 20, hasNextPage: false },
        },
      };
      shopeeApiService.getShopeeOffers.mockResolvedValue(response);

      await expect(service.getShopeeOffers({ configId: 7 })).resolves.toBe(
        response,
      );

      expect(shopeeApiService.getShopeeOffers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: resolvedConfig.defaultPage,
          limit: resolvedConfig.defaultLimit,
          sortType: resolvedConfig.defaultSortType,
        }),
        resolvedConfig,
      );
    });

    it('propaga UnprocessableEntityException de config incompleta', async () => {
      configResolver.resolve.mockRejectedValue(
        new UnprocessableEntityException('Configuracao CONFIG_ID=7 incompleta'),
      );

      await expect(
        service.getShopeeOffers({ configId: 7 }),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
    });
  });

  describe('generateAffiliateLink', () => {
    const product = {
      itemId: '123',
      productName: 'Produto',
      shopName: 'Loja',
      shopId: '456',
      priceMin: '10',
      priceMax: '12',
      commissionRate: '0.1',
      commission: '1',
      sales: 2,
      ratingStar: '5',
      imageUrl: 'image',
      productLink: 'product',
      offerLink: 'offer',
    };

    it('falha quando uma URL encurtada nao pode ser resolvida', async () => {
      functionsService.isValidShopeeProductUrl.mockReturnValue(true);
      functionsService.isShortShopeeUrl.mockReturnValue(true);
      functionsService.resolveShortUrl.mockResolvedValue(null);

      await expect(
        service.generateAffiliateLink({
          configId: 7,
          originUrl: 'https://s.shopee.com.br/x',
        }),
      ).rejects.toBeInstanceOf(BadGatewayException);
      expect(shopeeApiService.generateShortLink).not.toHaveBeenCalled();
    });

    it('gera, enriquece e persiste usando defaults do registro (sem segundo lookup)', async () => {
      functionsService.isValidShopeeProductUrl.mockReturnValue(true);
      functionsService.isShortShopeeUrl.mockReturnValue(false);
      functionsService.extractProductNameId.mockReturnValue({
        productId: '123',
        productName: 'Produto',
      });
      shopeeApiService.generateShortLink.mockResolvedValue('affiliate');
      shopeeApiService.getProductOffers.mockResolvedValue({
        success: true,
        data: {
          products: [product],
          pageInfo: { page: 1, limit: 1, hasNextPage: false },
        },
      });
      dbOperationService.taskLinkGenerationCreateV2.mockResolvedValue({
        statusCode: 100200,
        recordId: 77,
        message: 'Criado',
      });

      await expect(
        service.generateAffiliateLink({
          configId: 7,
          originUrl: 'https://shopee.com.br/product',
        }),
      ).resolves.toMatchObject({
        success: true,
        affiliateLink: 'affiliate',
        productInfo: product,
        databaseRecord: { recordId: 77 },
      });

      expect(configResolver.resolve).toHaveBeenCalledTimes(1);
      expect(configResolver.resolve).toHaveBeenCalledWith(7);

      expect(shopeeApiService.getProductOffers).toHaveBeenCalledWith(
        expect.objectContaining({ itemId: '123', page: 1, limit: 1 }),
        resolvedConfig,
        expect.any(Object),
      );

      expect(
        dbOperationService.taskLinkGenerationCreateV2,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          pe_client_id: resolvedConfig.clientId,
          pe_app_id: resolvedConfig.appId,
          pe_flag_click: resolvedConfig.flagClick,
          pe_currency: 'BRL',
          pe_location: 'Brasil',
          pe_item_id: 123,
        }),
      );
    });

    it('falha quando a persistencia nao confirma a criacao', async () => {
      functionsService.isValidShopeeProductUrl.mockReturnValue(true);
      functionsService.isShortShopeeUrl.mockReturnValue(false);
      functionsService.extractProductNameId.mockReturnValue({
        productId: '123',
        productName: 'Produto',
      });
      shopeeApiService.generateShortLink.mockResolvedValue('affiliate');
      shopeeApiService.getProductOffers.mockResolvedValue({
        success: true,
        data: { products: [{}], pageInfo: {} },
      });
      dbOperationService.taskLinkGenerationCreateV2.mockResolvedValue({
        statusCode: 100404,
        message: 'Falhou',
      });

      await expect(
        service.generateAffiliateLink({
          configId: 7,
          originUrl: 'https://shopee.com.br/product',
        }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
