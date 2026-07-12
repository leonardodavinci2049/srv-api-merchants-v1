import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { DbOperationService } from './db.operation.service';

@Module({
  imports: [DatabaseModule],
  providers: [DbOperationService],
  exports: [DbOperationService],
})
export class DbOperationModule {}
