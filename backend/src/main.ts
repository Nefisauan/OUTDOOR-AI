import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENVIRONMENT } from './config/environment.module';
import type { Environment } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  const environment = app.get<Environment>(ENVIRONMENT);
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  await app.listen(environment.port, environment.host);
  Logger.log('Outdoor AI API listening on port ' + environment.port, 'Bootstrap');
}

void bootstrap().catch(() => {
  Logger.error('Startup failed. Check environment configuration and port availability.', 'Bootstrap');
  process.exitCode = 1;
});
