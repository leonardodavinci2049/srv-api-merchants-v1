import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ShopeeOfferSortType } from '../../core/interfaces/shopee-offer.interface';

export class GetShopeeOffersDto {
  @Type(() => Number)
  @IsInt({ message: 'configId deve ser um número inteiro' })
  @IsPositive({ message: 'configId deve ser um inteiro positivo' })
  configId: number;

  // Campos opcionais de busca
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(ShopeeOfferSortType, {
    message: 'SortType deve ser 1 (Mais recente) ou 2 (Maior comissão)',
  })
  sortType?: ShopeeOfferSortType;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page deve ser um número inteiro' })
  @Min(1, { message: 'Page deve ser maior que 0' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit deve ser um número inteiro' })
  @Min(1, { message: 'Limit deve ser pelo menos 1' })
  @Max(50, { message: 'Limit não pode ser maior que 50' })
  limit?: number;
}

/*Sample JSON for testing in body endpoint POST /shopee/get-shopee-offers:
{
 "configId": 1,
 "keyword": "clothes",
 "sortType": 1,
 "page": 1,
 "limit": 10
}
*/
