import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  ALIEXPRESS_TARGET_CURRENCIES,
  ALIEXPRESS_TARGET_LANGUAGES,
} from 'src/aliexpress-api/aliexpress-api.constants';
import { IsCommaSeparatedList } from './shared-validators.util';

export class GetProductDetailsDto {
  @IsOptional()
  @IsString({ message: 'app_signature must be a string' })
  @MaxLength(256, { message: 'app_signature is too long' })
  app_signature?: string;

  @IsOptional()
  @IsString({ message: 'fields must be a string' })
  @MaxLength(2048, { message: 'fields is too long' })
  fields?: string;

  @IsOptional()
  @IsCommaSeparatedList(undefined, {
    message: 'product_ids must be a comma-separated list of product IDs',
  })
  product_ids?: string;

  @IsOptional()
  @IsEnum(ALIEXPRESS_TARGET_CURRENCIES, {
    message: 'target_currency is not supported',
  })
  target_currency?: (typeof ALIEXPRESS_TARGET_CURRENCIES)[number];

  @IsOptional()
  @IsEnum(ALIEXPRESS_TARGET_LANGUAGES, {
    message: 'target_language is not supported',
  })
  target_language?: (typeof ALIEXPRESS_TARGET_LANGUAGES)[number];

  @IsOptional()
  @IsString({ message: 'tracking_id must be a string' })
  @MaxLength(128, { message: 'tracking_id is too long' })
  tracking_id?: string;

  @IsOptional()
  @IsString({ message: 'country must be a string' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'country must be a two-letter country code',
  })
  country?: string;
}

/* Sample JSON for testing in body endpoint:
{
  "product_ids": "1005007010436304,1005008248175018",
  "fields": "commission_rate,sale_price",
  "target_currency": "USD",
  "target_language": "EN",
  "tracking_id": "default",
  "country": "US"
}
*/
