import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ListType,
  SortType,
} from '../../core/interfaces/shopee-product-offer.interface';

export class GetProductOffersDto {
  // Campos obrigatórios de autenticação
  @IsString()
  @IsNotEmpty({ message: 'Credential é obrigatório' })
  credential: string;

  @IsString()
  @IsNotEmpty({ message: 'SecretKey é obrigatório' })
  secretKey: string;

  @IsString()
  @IsNotEmpty({ message: 'AffiliateEndpoint é obrigatório' })
  affiliateEndpoint: string;

  @IsOptional()
  @IsString()
  affiliateSubids?: string;

  // Campos opcionais de busca (pelo menos um deve ser fornecido)
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  itemId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ProductCatId deve ser um número' })
  productCatId?: number;

  // Parâmetros de configuração da busca
  @IsOptional()
  @Type(() => Number)
  @IsEnum(ListType, { message: 'ListType deve ser um valor válido (1-4)' })
  listType?: ListType;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(SortType, { message: 'SortType deve ser um valor válido (1-8)' })
  sortType?: SortType;

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

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean({ message: 'IsAMSOffer deve ser um valor booleano' })
  isAMSOffer?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean({ message: 'IsKeySeller deve ser um valor booleano' })
  isKeySeller?: boolean;

  // Validação customizada: pelo menos um campo de busca deve ser fornecido
  @ValidateIf(
    (o: GetProductOffersDto) =>
      !o.keyword && !o.shopId && !o.itemId && !o.productCatId,
  )
  @IsNotEmpty({
    message:
      'Pelo menos um critério de busca deve ser fornecido: keyword, shopId, itemId ou productCatId',
  })
  _atLeastOneSearchCriteria?: string;
}
