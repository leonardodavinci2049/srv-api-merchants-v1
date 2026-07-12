import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DbOperationModule } from 'src/db.operation/db.operation.module';
import { ShopeeOperationModule } from 'src/shopee-operation/shopee-operation.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'pageroot'),
      exclude: ['/api/*'],
      serveRoot: '/',
    }),
    DbOperationModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 50000,
      },
    ]),
    ShopeeOperationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
