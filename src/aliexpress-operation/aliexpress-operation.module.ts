import { Module } from '@nestjs/common';
import { AliexpressOperationController } from './aliexpress-operation.controller';
import { AliexpressOperationService } from './aliexpress-operation.service';

@Module({
  controllers: [AliexpressOperationController],
  providers: [AliexpressOperationService],
})
export class AliexpressOperationModule {}
