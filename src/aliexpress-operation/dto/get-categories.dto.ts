import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetCategoriesDto {
  @IsOptional()
  @IsString({ message: 'app_signature must be a string' })
  @MaxLength(256, { message: 'app_signature is too long' })
  app_signature?: string;
}

/* Sample JSON for testing in body endpoint:
{
  "app_signature": "aaabbbccc"
}
*/
