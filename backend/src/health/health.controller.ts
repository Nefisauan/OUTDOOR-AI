import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(private readonly database: PrismaService) {}

  @Get()
  live() { return { status: 'ok' }; }

  @Get('ready')
  async ready() {
    try {
      await this.database.isReady();
      return { status: 'ok', database: 'up' };
    } catch {
      this.logger.warn('Database readiness check failed');
      throw new ServiceUnavailableException({ status: 'unavailable', database: 'down' });
    }
  }
}
