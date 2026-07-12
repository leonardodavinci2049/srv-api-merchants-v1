import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.main/app.module';
import { envs } from './core/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const loggerApp = new Logger('SRV-API-MERCHANTS');

  // Set the global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS for all routes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove properties that do not have decorators
      transform: true, // transform payload to DTO instances
      forbidNonWhitelisted: true, // throw error if payload has properties that do not have decorators
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // security measure to only make available the listed methods
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  await app.listen(process.env.APP_PORT ?? 3000);
  loggerApp.log(`Application is running on : ${envs.APP_API_URL}`);
}

// Start the application
void bootstrap();
