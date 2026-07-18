import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsUrl } from 'class-validator';

export class GenerateAffiliateLinkDto {
  @Type(() => Number)
  @IsInt({ message: 'configId deve ser um número inteiro' })
  @IsPositive({ message: 'configId deve ser um inteiro positivo' })
  configId: number;

  @IsUrl({}, { message: 'A URL fornecida deve ser uma URL válida.' })
  @IsNotEmpty()
  originUrl: string;
}

/*Sample JSON for testing in body endpoint:
{
 "configId": 1,
 "originUrl": "https://shopee.com.br/Liquidificador-Shake-2-Copos-800ml-300w-220v-GO014-i.389315825.22698012388"
}
*/
