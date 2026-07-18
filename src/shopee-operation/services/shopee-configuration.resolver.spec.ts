import {
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ResultModel } from 'src/core/utils/result.model';
import {
  CONFIG_LOOKUP_STATUS,
  DbOperationService,
} from 'src/db.operation/db.operation.service';
import { SpConfigSelectIdType } from 'src/db.operation/types/db.operation.type';
import { ShopeeConfigurationMapper } from '../mappers/shopee-configuration.mapper';
import { ShopeeConfigurationResolver } from './shopee-configuration.resolver';

describe('ShopeeConfigurationResolver', () => {
  const dbOperationService = { tskFindConfigSelectId: jest.fn() };
  let resolver: ShopeeConfigurationResolver;
  let mapper: ShopeeConfigurationMapper;

  function successResult(
    overrides: Partial<SpConfigSelectIdType[0][number]> = {},
  ): ResultModel {
    const record = {
      CONFIG_ID: 7,
      PROJECT_ID: 1,
      SHOPEE_CREDENTIAL: 'credential',
      SHOPEE_SECRET_KEY: 'secret',
      SHOPEE_AFFILIATE_ENDPOINT: 'https://example.com/graphql',
      SHOPEE_AFFILIATE_TIMEOUT: 5000,
      SHOPEE_AFFILIATE_SUBIDS: 'ALINY',
      SHOPEE_PAGE: 1,
      SHOPEE_SORTTYPE: 2,
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
    return new ResultModel(CONFIG_LOOKUP_STATUS.SUCCESS, 'ok', 7, data, 1);
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ShopeeConfigurationResolver,
        ShopeeConfigurationMapper,
        { provide: DbOperationService, useValue: dbOperationService },
      ],
    }).compile();
    resolver = module.get(ShopeeConfigurationResolver);
    mapper = module.get(ShopeeConfigurationMapper);
  });

  it('encaminha o configId validado ao DbOperationService', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(successResult());

    await resolver.resolve(7);

    expect(dbOperationService.tskFindConfigSelectId).toHaveBeenCalledWith(7);
  });

  it('retorna ResolvedShopeeConfiguration para registro completo ativo', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(successResult());

    const config = await resolver.resolve(7);

    expect(config.configId).toBe(7);
    expect(config.credential).toBe('credential');
    expect(config.endpoint).toBe('https://example.com/graphql');
    expect(config.timeoutMs).toBe(5000);
    expect(config.clientId).toBe(9);
    expect(config.appId).toBe(11);
    expect(config.flagClick).toBe(1);
    expect(mapper).toBeDefined();
  });

  it('joga NotFoundException quando o registro nao existe', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(
      new ResultModel(
        CONFIG_LOOKUP_STATUS.NOT_FOUND,
        'nao encontrada',
        0,
        [[], [], {}],
        0,
      ),
    );

    await expect(resolver.resolve(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('joga UnprocessableEntityException quando ACTIVE_FLAG = 0', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(
      successResult({ ACTIVE_FLAG: 0 }),
    );

    await expect(resolver.resolve(7)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('joga UnprocessableEntityException quando faltam campos obrigatorios', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(
      successResult({ SHOPEE_CREDENTIAL: undefined, CLIENT_ID: 0 }),
    );

    await expect(resolver.resolve(7)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('joga InternalServerErrorException em falha de execucao do banco', async () => {
    dbOperationService.tskFindConfigSelectId.mockResolvedValue(
      new ResultModel(
        CONFIG_LOOKUP_STATUS.EXECUTION_FAILURE,
        'connection lost',
        0,
        [],
      ),
    );

    await expect(resolver.resolve(7)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('rejeita configId nao positivo (defense-in-depth)', async () => {
    await expect(resolver.resolve(0)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(dbOperationService.tskFindConfigSelectId).not.toHaveBeenCalled();
  });
});
