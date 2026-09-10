import 'reflect-metadata';
import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('real PostgreSQL readiness', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useLogger(false);
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  afterAll(async () => { if (app) await app.close(); });
  it('connects through Prisma and returns ready', async () => {
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200, { status: 'ok', database: 'up' });
  });
});
