import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { DbOperationController } from './db.operation.controller';
import { DbOperationService } from './db.operation.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DbOperationController],
  providers: [DbOperationService],
  exports: [DbOperationService],
})
export class DbOperationModule {}
