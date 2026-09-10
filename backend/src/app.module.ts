import { Module } from '@nestjs/common';
import { EnvironmentModule } from './config/environment.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({ imports: [EnvironmentModule, PrismaModule], controllers: [HealthController] })
export class AppModule {}
