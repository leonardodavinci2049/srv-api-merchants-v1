import { TblConfigShopeeRecord } from 'src/db.operation/types/db.operation.type';
import { ShopeeConfigurationMapper } from './shopee-configuration.mapper';

describe('ShopeeConfigurationMapper', () => {
  const mapper = new ShopeeConfigurationMapper();

  function makeRecord(
    overrides: Partial<TblConfigShopeeRecord> = {},
  ): TblConfigShopeeRecord {
    return {
      configId: 7,
      projectId: 1,
      clientId: 9,
      accountName: 'Conta de teste',
      shopeeCredential: 'credential',
      shopeeSecretKey: 'secret',
      shopeeAffiliateEndpoint: 'https://example.com/graphql',
      shopeeAffiliateTimeout: '5000',
      shopeeAffiliateSubids: 'ALINY',
      shopeePage: 1,
      shopeeSorttype: 2,
      shopeeLimit: 20,
      shopeeAppId: 11,
      shopeeFlagClick: 1,
      shopeeCurrency: 'BRL',
      shopeeLocation: 'Brasil',
      activeFlag: 1,
      ...overrides,
    };
  }

  it('mapeia um registro completo sem Telegram/webhook', () => {
    const result = mapper.map(makeRecord());
    expect(result.missing).toEqual([]);
    expect(result.inactive).toBe(false);
    expect(result.config).toMatchObject({
      configId: 7,
      credential: 'credential',
      secretKey: 'secret',
      affiliateSubids: 'ALINY',
      endpoint: 'https://example.com/graphql',
      timeoutMs: 5000,
      clientId: 9,
      appId: 11,
      flagClick: 1,
      currency: 'BRL',
      location: 'Brasil',
      defaultPage: 1,
      defaultSortType: 2,
      defaultLimit: 20,
    });
  });

  it('coerce timeout em string numerica para inteiro', () => {
    const result = mapper.map(makeRecord({ shopeeAffiliateTimeout: '7000' }));
    expect(result.config?.timeoutMs).toBe(7000);
  });

  it('rejeita timeout invalido', () => {
    const result = mapper.map(makeRecord({ shopeeAffiliateTimeout: 'abc' }));
    expect(result.config).toBeUndefined();
    expect(result.missing).toContain('timeoutMs');
  });

  it('rejeita clientId, appId e page nao positivos', () => {
    const result = mapper.map(
      makeRecord({
        clientId: 0,
        shopeeAppId: -1,
        shopeePage: 0,
      }),
    );
    expect(result.config).toBeUndefined();
    expect(result.missing).toEqual(
      expect.arrayContaining(['clientId', 'appId', 'page']),
    );
  });

  it('permite flagClick zero', () => {
    const result = mapper.map(makeRecord({ shopeeFlagClick: 0 }));
    expect(result.config?.flagClick).toBe(0);
  });

  it('marca como inativo quando activeFlag = 0', () => {
    const result = mapper.map(makeRecord({ activeFlag: 0 }));
    expect(result.inactive).toBe(true);
  });

  it('reporta todos os campos ausentes sem expor valores', () => {
    const empty = {
      configId: 7,
      projectId: 1,
    } as TblConfigShopeeRecord;
    const result = mapper.map(empty);
    expect(result.config).toBeUndefined();
    expect(result.missing.sort()).toEqual(
      [
        'credential',
        'secretKey',
        'endpoint',
        'timeoutMs',
        'affiliateSubids',
        'clientId',
        'appId',
        'currency',
        'location',
        'page',
        'sortType',
        'limit',
      ].sort(),
    );
  });

  it('retorna vazio para registro nulo', () => {
    const result = mapper.map(undefined);
    expect(result.config).toBeUndefined();
    expect(result.missing).toEqual([]);
    expect(result.inactive).toBe(false);
  });

  it('nao exige campos de Telegram/webhook (independencia)', () => {
    const result = mapper.map(
      makeRecord({
        accountName: null,
      }),
    );
    expect(result.config).toBeDefined();
    expect(result.missing).toEqual([]);
  });
});
