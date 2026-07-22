import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  Validate,
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import {
  ALIEXPRESS_BOUNDS,
  ALIEXPRESS_DELIVERY_DAYS,
  ALIEXPRESS_PLATFORM_PRODUCT_TYPES,
  ALIEXPRESS_SORT_OPTIONS,
  ALIEXPRESS_TARGET_CURRENCIES,
  ALIEXPRESS_TARGET_LANGUAGES,
} from 'src/aliexpress-api/aliexpress-api.constants';
import { IsCommaSeparatedList } from './shared-validators.util';

@ValidatorConstraint({ name: 'minSalePriceLteMaxSalePrice', async: false })
class MinSalePriceLteMaxSalePriceConstraint
  implements ValidatorConstraintInterface
{
  validate(_value: unknown, args: ValidationArguments): boolean {
    const dto = args.object as SearchProductsDto;
    if (dto.min_sale_price === undefined || dto.max_sale_price === undefined) {
      return true;
    }
    return dto.min_sale_price <= dto.max_sale_price;
  }

  defaultMessage(): string {
    return 'min_sale_price must be less than or equal to max_sale_price';
  }
}

export class SearchProductsDto {
  @IsOptional()
  @IsString({ message: 'app_signature must be a string' })
  @MaxLength(256, { message: 'app_signature is too long' })
  app_signature?: string;

  @IsOptional()
  @IsCommaSeparatedList(undefined, {
    message: 'category_ids must be a comma-separated list of category IDs',
  })
  category_ids?: string;

  @IsOptional()
  @IsString({ message: 'fields must be a string' })
  @MaxLength(2048, { message: 'fields is too long' })
  fields?: string;

  @IsOptional()
  @IsString({ message: 'keywords must be a string' })
  @MaxLength(256, { message: 'keywords is too long' })
  keywords?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'min_sale_price must be an integer (cents)' })
  @Min(0, { message: 'min_sale_price must be non-negative' })
  @Validate(MinSalePriceLteMaxSalePriceConstraint)
  min_sale_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'max_sale_price must be an integer (cents)' })
  @Min(0, { message: 'max_sale_price must be non-negative' })
  max_sale_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page_no must be an integer' })
  @Min(1, { message: 'page_no must be a positive integer' })
  page_no?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page_size must be an integer' })
  @Min(ALIEXPRESS_BOUNDS.PAGE_SIZE_MIN, {
    message: `page_size must be at least ${ALIEXPRESS_BOUNDS.PAGE_SIZE_MIN}`,
  })
  @Max(ALIEXPRESS_BOUNDS.PAGE_SIZE_MAX, {
    message: `page_size must be at most ${ALIEXPRESS_BOUNDS.PAGE_SIZE_MAX}`,
  })
  page_size?: number;

  @IsOptional()
  @IsEnum(ALIEXPRESS_PLATFORM_PRODUCT_TYPES, {
    message: 'platform_product_type must be one of ALL, PLAZA, TMALL',
  })
  platform_product_type?: (typeof ALIEXPRESS_PLATFORM_PRODUCT_TYPES)[number];

  @IsOptional()
  @IsEnum(ALIEXPRESS_SORT_OPTIONS, {
    message:
      'sort must be one of SALE_PRICE_ASC, SALE_PRICE_DESC, LAST_VOLUME_ASC, LAST_VOLUME_DESC',
  })
  sort?: (typeof ALIEXPRESS_SORT_OPTIONS)[number];

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
  @IsString({ message: 'promotion_name must be a string' })
  @MaxLength(256, { message: 'promotion_name is too long' })
  promotion_name?: string;

  @IsOptional()
  @IsString({ message: 'ship_to_country must be a string' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'ship_to_country must be a two-letter country code',
  })
  ship_to_country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(ALIEXPRESS_DELIVERY_DAYS, {
    message: 'delivery_days must be one of 3, 5, 7, 10',
  })
  delivery_days?: (typeof ALIEXPRESS_DELIVERY_DAYS)[number];
}

/* Sample JSON for testing in body endpoint:
{
  "keywords": "mp3",
  "page_no": 1,
  "page_size": 20,
  "sort": "LAST_VOLUME_DESC",
  "target_currency": "USD",
  "target_language": "EN",
  "min_sale_price": 100,
  "max_sale_price": 30000,
  "ship_to_country": "US",
  "delivery_days": 3
}
*/
