import { Module } from '@nestjs/common';
import { EnvironmentModule } from '../config/environment.module';
import { PrismaService } from './prisma.service';

@Module({ imports: [EnvironmentModule], providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
