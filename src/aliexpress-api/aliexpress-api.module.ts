import { Module } from '@nestjs/common';

import { AliexpressApiService } from './aliexpress-api.service';

@Module({
  controllers: [],
  providers: [AliexpressApiService],
  exports: [AliexpressApiService],
})
export class AliexpressApiModule {}
