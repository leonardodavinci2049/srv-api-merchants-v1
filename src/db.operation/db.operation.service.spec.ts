import { DatabaseService } from 'src/database/database.service';
import {
  CONFIG_LOOKUP_STATUS,
  DbOperationService,
} from './db.operation.service';
import { LinkGenerationCreateV2Dto } from './dto/link-generation-create-v2.dto';
import {
  FIND_CONFIG_SELECT_ID_QUERY,
  SHOPEE_PROJECT_ID,
} from './query/find-config-select-id.query';
import {
  LINK_GENERATION_CREATE_V2_QUERY,
  LinkGenerationCreateV2Params,
} from './query/link-generation-create-v2.query';
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

describe('DbOperationService.taskLinkGenerationCreateV2', () => {
  const ModifyExecute = jest.fn();
  const service = new DbOperationService({
    ModifyExecute,
  } as unknown as DatabaseService);

  const baseDto: LinkGenerationCreateV2Dto = {
    pe_uuid: 'uuid-123',
    pe_client_id: 9,
    pe_app_id: 1,
    pe_link_destination: 'Shopee',
    pe_affiliate_link: 'https://shopee.example/aff',
    pe_flag_click: 1,
    pe_item_id: 1234567890,
    pe_product_name: 'Produto Teste',
    pe_shop_name: 'Toko Teste',
    pe_shop_id: 987654321,
    pe_price_min: 100000,
    pe_price_max: 200000,
    pe_commission_rate: 5.5,
    pe_commission: 11000,
    pe_sales: 50,
    pe_rating_star: 4.5,
    pe_image_url: 'https://example.com/img.jpg',
    pe_product_link: 'https://shopee.example/product',
    pe_offer_link: 'https://shopee.example/offer',
    pe_currency: 'BRL',
    pe_discount_percent: 10,
    pe_original_price: 200000,
    pe_category: 'Elektronik',
    pe_category_id: 123,
    pe_brand_name: 'Brand X',
    pe_is_official: 1,
    pe_free_shipping: 1,
    pe_location: 'Jakarta',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs the parameterized INSERT and forwards the params array', async () => {
    ModifyExecute.mockResolvedValue({
      insertId: 42,
      affectedRows: 1,
    });

    const result = await service.taskLinkGenerationCreateV2(baseDto);

    expect(ModifyExecute).toHaveBeenCalledTimes(1);
    expect(ModifyExecute).toHaveBeenCalledWith(
      LINK_GENERATION_CREATE_V2_QUERY,
      LinkGenerationCreateV2Params(baseDto),
    );
    expect(LINK_GENERATION_CREATE_V2_QUERY).toContain(
      'INSERT INTO tbl_link_generation',
    );
    expect(LINK_GENERATION_CREATE_V2_QUERY).not.toContain(
      'sp_link_generation_create_v2',
    );
    expect(result.statusCode).toBe(100200);
    expect(result.recordId).toBe(42);
    expect(result.message).toBe('Cadastro criado com sucesso');
  });

  it('applies the expected defaults for nullable COALESCE columns', () => {
    const params = LinkGenerationCreateV2Params({
      pe_app_id: 1,
    } as LinkGenerationCreateV2Dto);

    expect(params[0]).toEqual(expect.any(String));
    expect(params[1]).toBe(1);
    expect(params[2]).toBe(1);
    expect(params[5]).toBeNull();
    expect(params[14]).toBeNull();
    expect(params[19]).toBeNull();
    expect(params[25]).toBeNull();
    expect(params[26]).toBeNull();
  });

  it('returns PROCESSING_FAILED when no row is inserted', async () => {
    ModifyExecute.mockResolvedValue({
      insertId: 0,
      affectedRows: 0,
    });

    const result = await service.taskLinkGenerationCreateV2(baseDto);

    expect(result.statusCode).toBe(100422);
    expect(result.recordId).toBe(0);
    expect(result.message).toBe('Link generation create failed');
  });

  it('returns NOT_FOUND when the INSERT throws', async () => {
    ModifyExecute.mockRejectedValue(new Error('connection lost'));

    const result = await service.taskLinkGenerationCreateV2(baseDto);

    expect(result.statusCode).toBe(100404);
    expect(result.message).toBe('connection lost');
    expect(result.data).toEqual([]);
  });
});
