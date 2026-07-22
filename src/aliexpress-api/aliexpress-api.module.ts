import { Module } from '@nestjs/common';
import { AliExpressApiService } from './aliexpress-api.service';

@Module({
  providers: [AliExpressApiService],
  exports: [AliExpressApiService],
})
export class AliExpressApiModule {}
