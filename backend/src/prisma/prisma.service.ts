import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { ENVIRONMENT } from '../config/environment.module';
import type { Environment } from '../config/environment';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(ENVIRONMENT) environment: Environment) {
    super({ adapter: new PrismaPg({
      connectionString: environment.databaseUrl,
      connectionTimeoutMillis: 3000,
      query_timeout: 3000,
      statement_timeout: 3000,
      max: 5,
    }) });
  }

  async isReady(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
