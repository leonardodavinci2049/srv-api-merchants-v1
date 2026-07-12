import { Module } from '@nestjs/common';
import { ShopeeApiService } from './shopee-api.service';

@Module({
  providers: [ShopeeApiService],
  exports: [ShopeeApiService],
})
export class ShopeeApiModule {}
