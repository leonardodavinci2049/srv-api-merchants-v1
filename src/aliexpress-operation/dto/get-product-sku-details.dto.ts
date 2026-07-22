import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import {
  ALIEXPRESS_BOUNDS,
  ALIEXPRESS_TARGET_CURRENCIES,
  ALIEXPRESS_TARGET_LANGUAGES,
} from 'src/aliexpress-api/aliexpress-api.constants';
import { IsCommaSeparatedList } from './shared-validators.util';

export class GetProductSkuDetailsDto {
  @IsString({ message: 'product_id must be a string' })
  @IsNotEmpty({ message: 'product_id is required' })
  product_id: string;

  @IsString({ message: 'ship_to_country must be a string' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'ship_to_country must be a two-letter country code',
  })
  ship_to_country: string;

  @IsEnum(ALIEXPRESS_TARGET_CURRENCIES, {
    message: 'target_currency is not supported',
  })
  target_currency: (typeof ALIEXPRESS_TARGET_CURRENCIES)[number];

  @IsEnum(ALIEXPRESS_TARGET_LANGUAGES, {
    message: 'target_language is not supported',
  })
  target_language: (typeof ALIEXPRESS_TARGET_LANGUAGES)[number];

  @IsOptional()
  @IsString({ message: 'need_deliver_info must be a string' })
  @Matches(/^(Yes|No)$/, {
    message: 'need_deliver_info must be "Yes" or "No"',
  })
  need_deliver_info?: string;

  @IsOptional()
  @IsCommaSeparatedList(ALIEXPRESS_BOUNDS.SKU_IDS_MAX, {
    message: `sku_ids must be a comma-separated list of at most ${ALIEXPRESS_BOUNDS.SKU_IDS_MAX} SKU IDs`,
  })
  sku_ids?: string;
}

/* Sample JSON for testing in body endpoint:
{
  "product_id": "1005007588427363",
  "ship_to_country": "US",
  "target_currency": "USD",
  "target_language": "EN",
  "need_deliver_info": "No",
  "sku_ids": "12000041407359776,12000041669723427"
}
*/
