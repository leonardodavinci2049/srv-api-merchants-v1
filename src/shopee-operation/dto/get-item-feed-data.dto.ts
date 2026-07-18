import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetItemFeedDataDto {
  @Type(() => Number)
  @IsInt({ message: 'configId deve ser um número inteiro' })
  @IsPositive({ message: 'configId deve ser um inteiro positivo' })
  configId: number;

  @IsString({ message: 'datafeedId deve ser uma string' })
  @IsNotEmpty({ message: 'datafeedId é obrigatório' })
  datafeedId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset deve ser um número inteiro' })
  @Min(0, { message: 'offset deve ser maior ou igual a 0' })
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit deve ser um número inteiro' })
  @Min(1, { message: 'limit deve ser pelo menos 1' })
  @Max(500, { message: 'limit não pode ser maior que 500' })
  limit?: number;
}

/*Sample JSON for testing in body endpoint POST /api/shopee-operation/v1/item-feed-data:
{
 "configId": 1,
 "datafeedId": "428535457031659520_FULL_2026-07-17",
 "offset": 0,
 "limit": 2
}
*/
