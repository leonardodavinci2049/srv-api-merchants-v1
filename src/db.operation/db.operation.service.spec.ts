import { DatabaseService } from 'src/database/database.service';
import {
  CONFIG_LOOKUP_STATUS,
  DbOperationService,
} from './db.operation.service';
import {
  FIND_CONFIG_SELECT_ID_QUERY,
  SHOPEE_PROJECT_ID,
} from './query/find-config-select-id.query';
import type { TblConfigShopeeRecord } from './types/db.operation.type';

describe('DbOperationService.tskFindConfigSelectId', () => {
  const selectExecute = jest.fn();
  const service = new DbOperationService({
    selectExecute,
  } as unknown as DatabaseService);

  const record = {
    configId: 7,
    projectId: 1,
    clientId: 9,
    accountName: 'Test account',
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
  } as TblConfigShopeeRecord;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executes the direct SELECT with projectId before configId', async () => {
    selectExecute.mockResolvedValue([record]);

    const result = await service.tskFindConfigSelectId(7);

    expect(selectExecute).toHaveBeenCalledWith(FIND_CONFIG_SELECT_ID_QUERY, [
      SHOPEE_PROJECT_ID,
      7,
    ]);
    expect(FIND_CONFIG_SELECT_ID_QUERY).toContain('FROM tbl_config_shopee');
    expect(FIND_CONFIG_SELECT_ID_QUERY).not.toContain('sp_config_select_id_v1');
    expect(result.statusCode).toBe(CONFIG_LOOKUP_STATUS.SUCCESS);
    expect(result.recordId).toBe(7);
    expect(result.data).toEqual([record]);
  });

  it('returns NOT_FOUND for an empty result', async () => {
    selectExecute.mockResolvedValue([]);

    const result = await service.tskFindConfigSelectId({ configId: 99 });

    expect(result.statusCode).toBe(CONFIG_LOOKUP_STATUS.NOT_FOUND);
    expect(result.data).toEqual([]);
  });

  it('returns EXECUTION_FAILURE when the SELECT fails', async () => {
    selectExecute.mockRejectedValue(new Error('connection lost'));

    const result = await service.tskFindConfigSelectId(7);

    expect(result.statusCode).toBe(CONFIG_LOOKUP_STATUS.EXECUTION_FAILURE);
    expect(result.data).toEqual([]);
  });
});
