import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PromoLinkFindAllV2Dto {
  @IsNumber()
  @IsOptional()
  pe_client_id: number;

  @IsNumber()
  @IsNotEmpty()
  pe_app_id: number;

  @IsNumber()
  @IsNotEmpty()
  pe_link_id: number;

  @IsNumber()
  @IsOptional()
  pe_limit: number;
}

/*
Sample JSON for testing in body endpoint:
{
  "pe_client_id": 1,
  "pe_app_id": 1,
  "pe_link_id": "abc123",
  "pe_limit": 10
}
*/
