import { Module } from '@nestjs/common';
import { FunctionsService } from 'src/core/utils/forServices/functions.service';
import { DatabaseModule } from 'src/database/database.module';
import { DbOperationModule } from 'src/db.operation/db.operation.module';
import { ShopeeApiModule } from 'src/shopee-api/shopee-api.module';
import { ShopeeOperationController } from './shopee-operation.controller';
import { ShopeeOperationService } from './shopee-operation.service';

@Module({
  imports: [DatabaseModule, DbOperationModule, ShopeeApiModule],
  controllers: [ShopeeOperationController],
  providers: [ShopeeOperationService, FunctionsService],
})
export class ShopeeOperationModule {}
