import { Module } from '@nestjs/common';
import { FunctionsService } from 'src/core/utils/forServices/functions.service';
import { DatabaseModule } from 'src/database/database.module';
import { PromolinksModule } from 'src/promolinks/promolinks.module';
import { PromolinksService } from 'src/promolinks/promolinks.service';
import { ShopeeOperationController } from './shopee-operation.controller';
import { ShopeeOperationService } from './shopee-operation.service';

@Module({
  imports: [DatabaseModule, PromolinksModule],
  controllers: [ShopeeOperationController],
  providers: [ShopeeOperationService, FunctionsService, PromolinksService],
})
export class ShopeeOperationModule {}
