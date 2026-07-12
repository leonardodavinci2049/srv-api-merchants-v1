import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { PromolinksController } from './promolinks.controller';
import { PromolinksService } from './promolinks.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PromolinksController],
  providers: [PromolinksService],
})
export class PromolinksModule {}
