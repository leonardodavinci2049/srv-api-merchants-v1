import { Module } from '@nestjs/common';
import { AliExpressApiModule } from 'src/aliexpress-api/aliexpress-api.module';
import { AliExpressOperationController } from './aliexpress-operation.controller';
import { AliExpressOperationService } from './aliexpress-operation.service';

@Module({
  imports: [AliExpressApiModule],
  controllers: [AliExpressOperationController],
  providers: [AliExpressOperationService],
})
export class AliExpressOperationModule {}
