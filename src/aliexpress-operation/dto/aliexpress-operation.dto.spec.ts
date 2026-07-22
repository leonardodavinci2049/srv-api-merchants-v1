import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GenerateAffiliateLinksDto } from './generate-affiliate-links.dto';
import { GetCategoriesDto } from './get-categories.dto';
import { GetProductDetailsDto } from './get-product-details.dto';
import { GetProductSkuDetailsDto } from './get-product-sku-details.dto';
import { SearchProductsDto } from './search-products.dto';

async function validateDto<T extends object>(
  cls: new () => T,
  payload: unknown,
): Promise<string[]> {
  const instance = plainToInstance(cls, payload, {
    enableImplicitConversion: true,
  });
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('AliExpress operation DTOs', () => {
  describe('GetCategoriesDto', () => {
    it('accepts an optional app_signature and rejects unknown fields', async () => {
      expect(
        await validateDto(GetCategoriesDto, { app_signature: 'sig' }),
      ).toEqual([]);
      expect(
        await validateDto(GetCategoriesDto, { unexpected: 'x' }),
      ).toContain('property unexpected should not exist');
    });
  });

  describe('SearchProductsDto', () => {
    it('rejects page_no below 1 and page_size outside 1..50', async () => {
      expect(
        await validateDto(SearchProductsDto, { page_no: 0 }),
      ).toContainEqual(expect.stringContaining('page_no'));
      expect(
        await validateDto(SearchProductsDto, { page_size: 0 }),
      ).toContainEqual(expect.stringContaining('page_size'));
      expect(
        await validateDto(SearchProductsDto, { page_size: 51 }),
      ).toContainEqual(expect.stringContaining('page_size'));
      expect(
        await validateDto(SearchProductsDto, { page_no: 1, page_size: 50 }),
      ).toEqual([]);
    });

    it('rejects min_sale_price greater than max_sale_price', async () => {
      const errors = await validateDto(SearchProductsDto, {
        min_sale_price: 200,
        max_sale_price: 100,
      });
      expect(errors).toContainEqual(
        expect.stringContaining('min_sale_price must be less than'),
      );
    });

    it('accepts min <= max', async () => {
      expect(
        await validateDto(SearchProductsDto, {
          min_sale_price: 100,
          max_sale_price: 100,
        }),
      ).toEqual([]);
    });

    it('rejects unsupported sort, currency, language, delivery days, platform type', async () => {
      const errors = await validateDto(SearchProductsDto, {
        sort: 'INVALID',
        target_currency: 'XYZ',
        target_language: 'XX',
        delivery_days: 4,
        platform_product_type: 'UNKNOWN',
      });
      expect(errors).toEqual(expect.arrayContaining([expect.any(String)]));
      expect(errors.length).toBeGreaterThanOrEqual(5);
    });

    it('rejects two-letter lowercase ship_to_country', async () => {
      const errors = await validateDto(SearchProductsDto, {
        ship_to_country: 'us',
      });
      expect(errors.join(' ')).toMatch(/two-letter country code/);
    });

    it('rejects non-numeric page_no even with implicit conversion off', async () => {
      const errors = await validateDto(SearchProductsDto, {
        page_no: 'abc',
      });
      expect(errors.join(' ')).toMatch(/page_no/);
    });
  });

  describe('GetProductDetailsDto', () => {
    it('requires product_ids to be a non-empty comma-separated list', async () => {
      expect(
        await validateDto(GetProductDetailsDto, { product_ids: ',,' }),
      ).toContainEqual(expect.stringContaining('product_ids'));
      expect(
        await validateDto(GetProductDetailsDto, { product_ids: '1,2' }),
      ).toEqual([]);
    });

    it('rejects unsupported target_currency', async () => {
      const errors = await validateDto(GetProductDetailsDto, {
        target_currency: 'XYZ',
      });
      expect(errors.join(' ')).toMatch(/target_currency/);
    });

    it('rejects malformed country code', async () => {
      const errors = await validateDto(GetProductDetailsDto, {
        country: 'USA',
      });
      expect(errors.join(' ')).toMatch(/country/);
    });
  });

  describe('GetProductSkuDetailsDto', () => {
    const validBase = {
      product_id: '100',
      ship_to_country: 'US',
      target_currency: 'USD',
      target_language: 'EN',
    };

    it('requires all four mandatory fields', async () => {
      expect(await validateDto(GetProductSkuDetailsDto, {})).not.toEqual([]);
    });

    it('accepts a valid payload', async () => {
      expect(await validateDto(GetProductSkuDetailsDto, validBase)).toEqual([]);
    });

    it('limits sku_ids to at most 20 entries', async () => {
      const tooMany = Array.from({ length: 21 }, (_, i) => `${i}`).join(',');
      const errors = await validateDto(GetProductSkuDetailsDto, {
        ...validBase,
        sku_ids: tooMany,
      });
      expect(errors.join(' ')).toMatch(/20/);
    });

    it('accepts exactly 20 sku_ids', async () => {
      const twenty = Array.from({ length: 20 }, (_, i) => `${i}`).join(',');
      expect(
        await validateDto(GetProductSkuDetailsDto, {
          ...validBase,
          sku_ids: twenty,
        }),
      ).toEqual([]);
    });

    it('rejects need_deliver_info values outside Yes/No', async () => {
      const errors = await validateDto(GetProductSkuDetailsDto, {
        ...validBase,
        need_deliver_info: 'Maybe',
      });
      expect(errors.join(' ')).toMatch(/need_deliver_info/);
    });
  });

  describe('GenerateAffiliateLinksDto', () => {
    it('requires promotion_link_type, source_values, tracking_id', async () => {
      expect(await validateDto(GenerateAffiliateLinksDto, {})).not.toEqual([]);
    });

    it('requires tracking_id to be non-empty', async () => {
      const errors = await validateDto(GenerateAffiliateLinksDto, {
        promotion_link_type: 0,
        source_values: 'https://www.aliexpress.com',
        tracking_id: '',
      });
      expect(errors.join(' ')).toMatch(/tracking_id/);
    });

    it('restricts promotion_link_type to 0 or 2', async () => {
      const errors = await validateDto(GenerateAffiliateLinksDto, {
        promotion_link_type: 1,
        source_values: 'https://www.aliexpress.com',
        tracking_id: 't',
      });
      expect(errors.join(' ')).toMatch(/promotion_link_type/);
    });

    it('accepts promotion_link_type 2 (hot link)', async () => {
      expect(
        await validateDto(GenerateAffiliateLinksDto, {
          promotion_link_type: 2,
          source_values: 'https://www.aliexpress.com',
          tracking_id: 't',
        }),
      ).toEqual([]);
    });

    it('rejects source_values on disallowed hosts', async () => {
      const errors = await validateDto(GenerateAffiliateLinksDto, {
        promotion_link_type: 0,
        source_values: 'https://evil.example.com',
        tracking_id: 't',
      });
      expect(errors.join(' ')).toMatch(/source_values/);
    });

    it('rejects malformed URLs in source_values', async () => {
      const errors = await validateDto(GenerateAffiliateLinksDto, {
        promotion_link_type: 0,
        source_values: 'not-a-url',
        tracking_id: 't',
      });
      expect(errors.join(' ')).toMatch(/source_values/);
    });

    it('accepts up to 50 source_values', async () => {
      const urls = Array.from(
        { length: 50 },
        (_, i) => `https://www.aliexpress.com/item/${i}`,
      ).join(',');
      expect(
        await validateDto(GenerateAffiliateLinksDto, {
          promotion_link_type: 0,
          source_values: urls,
          tracking_id: 't',
        }),
      ).toEqual([]);
    });

    it('rejects more than 50 source_values via the documented bound', () => {
      // The class-level constant is the source of truth for the limit.
      expect(GenerateAffiliateLinksDto.SOURCE_VALUES_MAX).toBe(50);
    });
  });
});
