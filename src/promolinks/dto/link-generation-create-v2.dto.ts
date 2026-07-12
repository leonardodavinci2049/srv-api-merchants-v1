import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LinkGenerationCreateV2Dto {
  @IsString()
  @IsOptional()
  pe_uuid: string;

  @IsNumber()
  @IsOptional()
  pe_client_id: number;

  @IsNumber()
  @IsNotEmpty()
  pe_app_id: number;

  @IsString()
  @IsOptional()
  pe_link_destination: string;

  @IsString()
  @IsOptional()
  pe_affiliate_link: string;

  @IsNumber()
  @IsOptional()
  pe_flag_click: number;

  @IsNumber()
  @IsOptional()
  pe_item_id: number;

  @IsString()
  @IsOptional()
  pe_product_name: string;

  @IsString()
  @IsOptional()
  pe_shop_name: string;

  @IsNumber()
  @IsOptional()
  pe_shop_id: number;

  @IsNumber()
  @IsOptional()
  pe_price_min: number;

  @IsNumber()
  @IsOptional()
  pe_price_max: number;

  @IsNumber()
  @IsOptional()
  pe_commission_rate: number;

  @IsNumber()
  @IsOptional()
  pe_commission: number;

  @IsNumber()
  @IsOptional()
  pe_sales: number;

  @IsNumber()
  @IsOptional()
  pe_rating_star: number;

  @IsString()
  @IsOptional()
  pe_image_url: string;

  @IsString()
  @IsOptional()
  pe_product_link: string;

  @IsString()
  @IsOptional()
  pe_offer_link: string;

  @IsString()
  @IsOptional()
  pe_currency: string;

  @IsNumber()
  @IsOptional()
  pe_discount_percent: number;

  @IsNumber()
  @IsOptional()
  pe_original_price: number;

  @IsString()
  @IsOptional()
  pe_category: string;

  @IsNumber()
  @IsOptional()
  pe_category_id: number;

  @IsString()
  @IsOptional()
  pe_brand_name: string;

  @IsNumber()
  @IsOptional()
  pe_is_official: number;

  @IsNumber()
  @IsOptional()
  pe_free_shipping: number;

  @IsString()
  @IsOptional()
  pe_location: string;
}

/*
Sample JSON for testing in body endpoint:
{
  "pe_uuid": "123e456",
   "pe_client_id": 1,
  "pe_app_id": 1,
  "pe_link_destination": "Shopee",
  "pe_affiliate_link": "https://shopee.co.id/product/1234567890",
  "pe_flag_click": 1,
  "pe_item_id": 1234567890,
  "pe_product_name": "Contoh Produk",
  "pe_shop_name": "Contoh Toko",
  "pe_shop_id": 987654321,
  "pe_price_min": 100000,
  "pe_price_max": 200000,
  "pe_commission_rate": 5.5,
  "pe_commission": 11000,
  "pe_sales": 50,
  "pe_rating_star": 4.5,
  "pe_image_url": "https://example.com/image.jpg",
  "pe_product_link": "https://shopee.co.id/product/1234567890",
  "pe_offer_link": "https://shopee.co.id/product/1234567890?offer=1",
  "pe_currency": "IDR",
  "pe_discount_percent": 10,
  "pe_original_price": 200000,
  "pe_category": "Elektronik",
  "pe_category_id": 123,
  "pe_brand_name": "Contoh Brand",
  "pe_is_official": 1,
  "pe_free_shipping": 1,
  "pe_location": "Jakarta"
}
 
*/
