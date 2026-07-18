import { tblConfigSelectIdRecords } from 'src/db.operation/types/db.operation.type';
import { ShopeeConfigurationMapper } from './shopee-configuration.mapper';

describe('ShopeeConfigurationMapper', () => {
  const mapper = new ShopeeConfigurationMapper();

  function makeRecord(
    overrides: Partial<tblConfigSelectIdRecords> = {},
  ): tblConfigSelectIdRecords {
    return {
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
    const result = mapper.map(makeRecord({ SHOPEE_AFFILIATE_TIMEOUT: '7000' }));
    expect(result.config?.timeoutMs).toBe(7000);
  });

  it('rejeita timeout invalido', () => {
    const result = mapper.map(makeRecord({ SHOPEE_AFFILIATE_TIMEOUT: 'abc' }));
    expect(result.config).toBeUndefined();
    expect(result.missing).toContain('timeoutMs');
  });

  it('rejeita clientId, appId e page nao positivos', () => {
    const result = mapper.map(
      makeRecord({
        CLIENT_ID: 0,
        SHOPEE_APP_ID: -1,
        SHOPEE_PAGE: 0,
      }),
    );
    expect(result.config).toBeUndefined();
    expect(result.missing).toEqual(
      expect.arrayContaining(['clientId', 'appId', 'page']),
    );
  });

  it('permite flagClick zero', () => {
    const result = mapper.map(makeRecord({ SHOPEE_FLAG_CLICK: 0 }));
    expect(result.config?.flagClick).toBe(0);
  });

  it('marca como inativo quando ACTIVE_FLAG = 0', () => {
    const result = mapper.map(makeRecord({ ACTIVE_FLAG: 0 }));
    expect(result.inactive).toBe(true);
  });

  it('marca como inativo quando ACTIVE_FLAG = "false"', () => {
    const result = mapper.map(makeRecord({ ACTIVE_FLAG: 'false' }));
    expect(result.inactive).toBe(true);
  });

  it('reporta todos os campos ausentes sem expor valores', () => {
    const empty: tblConfigSelectIdRecords = { CONFIG_ID: 7 };
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
        TELEGRAM_BOT_TOKEN: undefined,
        WEBHOOK_URL: undefined,
        WEBHOOK_LOCAL_PORT: undefined,
      }),
    );
    expect(result.config).toBeDefined();
    expect(result.missing).toEqual([]);
  });
});
