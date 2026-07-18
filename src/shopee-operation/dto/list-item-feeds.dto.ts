import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { FeedMode } from '../../core/interfaces/shopee-item-feed.interface';

export class ListItemFeedsDto {
  @Type(() => Number)
  @IsInt({ message: 'configId deve ser um número inteiro' })
  @IsPositive({ message: 'configId deve ser um inteiro positivo' })
  configId: number;

  @IsOptional()
  @IsEnum(FeedMode, {
    message: 'feedMode deve ser FULL ou DELTA',
  })
  feedMode?: FeedMode;
}

/*Sample JSON for testing in body endpoint POST /api/shopee-operation/v1/list-item-feeds:
{
 "configId": 1,
 "feedMode": "FULL"
}
*/
