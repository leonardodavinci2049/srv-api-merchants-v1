import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class GenerateAffiliateLinkDto {
  @IsUrl({}, { message: 'A URL fornecida deve ser uma URL válida.' })
  originUrl: string;

  @IsString()
  @IsNotEmpty()
  credential: string;

  @IsString()
  @IsNotEmpty()
  secretKey: string;

  @IsString()
  @IsNotEmpty()
  affiliateEndpoint: string;

  @IsString()
  @IsNotEmpty()
  affiliateSubids: string;

  @IsString()
  affiliateTimeout?: string;
}

/*Sample JSON for testing in body endpoint:
{ 
 "originUrl": "https://shopee.com.br/Liquidificador-Shake-2-Copos-800ml-300w-220v-GO014-i.389315825.22698012388",
 "credential": "your_credential_here",
 "secretKey": "your_secret_key_here",
 "affiliateEndpoint": "https://affiliate.shopee.com.br/api/v1/links",
 "affiliateSubids": "subid1,subid2,subid3",
 "affiliateTimeout": "5000"
}
*/
