import { Module } from '@nestjs/common';
import { validateEnvironment } from './environment';

export const ENVIRONMENT = Symbol('ENVIRONMENT');
@Module({
  providers: [{ provide: ENVIRONMENT, useFactory: () => validateEnvironment(process.env) }],
  exports: [ENVIRONMENT],
})
export class EnvironmentModule {}
