import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  ALIEXPRESS_BOUNDS,
  ALIEXPRESS_PROMOTION_LINK_TYPES,
} from 'src/aliexpress-api/aliexpress-api.constants';
import { IsAliExpressSourceList } from './shared-validators.util';

export class GenerateAffiliateLinksDto {
  @Type(() => Number)
  @IsInt({ message: 'promotion_link_type must be an integer' })
  @IsEnum(ALIEXPRESS_PROMOTION_LINK_TYPES, {
    message: 'promotion_link_type must be 0 (normal) or 2 (hot)',
  })
  promotion_link_type: (typeof ALIEXPRESS_PROMOTION_LINK_TYPES)[number];

  @IsString({ message: 'source_values must be a string' })
  @IsNotEmpty({ message: 'source_values is required' })
  @IsAliExpressSourceList({
    message: 'source_values must contain only allowed AliExpress URLs',
  })
  @MaxLength(8192, { message: 'source_values is too long' })
  source_values: string;

  @IsString({ message: 'tracking_id must be a string' })
  @IsNotEmpty({ message: 'tracking_id is required' })
  @MaxLength(128, { message: 'tracking_id is too long' })
  tracking_id: string;

  @IsOptional()
  @IsString({ message: 'ship_to_country must be a string' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'ship_to_country must be a two-letter country code',
  })
  ship_to_country?: string;

  @IsOptional()
  @IsString({ message: 'app_signature must be a string' })
  @MaxLength(256, { message: 'app_signature is too long' })
  app_signature?: string;

  static get SOURCE_VALUES_MAX(): number {
    return ALIEXPRESS_BOUNDS.SOURCE_VALUES_MAX;
  }
}

/* Sample JSON for testing in body endpoint:
{
  "promotion_link_type": 0,
  "source_values": "https://www.aliexpress.com,https://best.aliexpress.com",
  "tracking_id": "default",
  "ship_to_country": "FR"
}
*/
