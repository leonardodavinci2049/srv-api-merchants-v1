import { Module } from '@nestjs/common';
import { ShopeeApiController } from './shopee-api.controller';
import { ShopeeApiService } from './shopee-api.service';

@Module({
  controllers: [ShopeeApiController],
  providers: [ShopeeApiService],
  exports: [ShopeeApiService],
})
export class ShopeeApiModule {}
