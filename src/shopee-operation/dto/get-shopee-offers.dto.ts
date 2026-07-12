import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ShopeeOfferSortType } from '../../core/interfaces/shopee-offer.interface';

export class GetShopeeOffersDto {
  // Campos obrigatórios de autenticação
  @IsString()
  @IsNotEmpty({ message: 'Credential é obrigatório' })
  credential: string;

  @IsString()
  @IsNotEmpty({ message: 'SecretKey é obrigatório' })
  secretKey: string;

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
  @IsNumber({}, { message: 'Page deve ser um número' })
  @Min(1, { message: 'Page deve ser maior que 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit deve ser um número' })
  @Min(1, { message: 'Limit deve ser pelo menos 1' })
  @Max(50, { message: 'Limit não pode ser maior que 50' })
  limit?: number = 10;
}

/*Sample JSON for testing in body endpoint POST /shopee/get-shopee-offers:
{
  "credential": "your_credential_here",
  "secretKey": "your_secret_key_here",
  "keyword": "clothes",
  "sortType": 1,
  "page": 1,
  "limit": 10
}
*/
