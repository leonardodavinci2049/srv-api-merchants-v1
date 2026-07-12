import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FunctionsService } from 'src/core/utils/forServices/functions.service';
import { DbOperationService } from 'src/db.operation/db.operation.service';
import { ShopeeApiService } from 'src/shopee-api/shopee-api.service';
import { ShopeeOperationService } from './shopee-operation.service';

describe('ShopeeOperationService', () => {
  const config = {
    credential: 'credential',
    secretKey: 'secret',
    affiliateSubids: 'ALINY',
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
  let service: ShopeeOperationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ShopeeOperationService,
        { provide: FunctionsService, useValue: functionsService },
        { provide: DbOperationService, useValue: dbOperationService },
        { provide: ShopeeApiService, useValue: shopeeApiService },
      ],
    }).compile();
    service = module.get(ShopeeOperationService);
  });

  it('delega buscas de ofertas ao cliente Shopee', async () => {
    const response = {
      success: true,
      data: {
        products: [],
        pageInfo: { page: 1, limit: 10, hasNextPage: false },
      },
    };
    shopeeApiService.getProductOffers.mockResolvedValue(response);

    await expect(
      service.getProductOffers({ itemId: '123' }, config),
    ).resolves.toBe(response);
    expect(shopeeApiService.getProductOffers).toHaveBeenCalledWith(
      { itemId: '123' },
      config,
    );
  });

  it('falha quando uma URL encurtada não pode ser resolvida', async () => {
    functionsService.isValidShopeeProductUrl.mockReturnValue(true);
    functionsService.isShortShopeeUrl.mockReturnValue(true);
    functionsService.resolveShortUrl.mockResolvedValue(null);

    await expect(
      service.generateAffiliateLink('https://s.shopee.com.br/x', config, 9),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(shopeeApiService.generateShortLink).not.toHaveBeenCalled();
  });

  it('gera, enriquece e persiste o link antes de responder com sucesso', async () => {
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
      service.generateAffiliateLink('https://shopee.com.br/product', config, 9),
    ).resolves.toMatchObject({
      success: true,
      affiliateLink: 'affiliate',
      productInfo: product,
      databaseRecord: { recordId: 77 },
    });
    expect(dbOperationService.taskLinkGenerationCreateV2).toHaveBeenCalledWith(
      expect.objectContaining({ pe_client_id: 9, pe_item_id: 123 }),
    );
  });

  it('falha quando a persistência não confirma a criação', async () => {
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
      service.generateAffiliateLink('https://shopee.com.br/product', config, 9),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
