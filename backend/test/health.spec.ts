import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HealthController } from '../src/health/health.controller';
import { PrismaService } from '../src/prisma/prisma.service';

describe('health HTTP contract', () => {
  let app: INestApplication;
  const database = { isReady: jest.fn() };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController], providers: [{ provide: PrismaService, useValue: database }],
    }).compile();
    app = module.createNestApplication();
    app.useLogger(false);
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  it('reports liveness without contacting PostgreSQL', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200, { status: 'ok' });
    expect(database.isReady).not.toHaveBeenCalled();
  });
  it('reports database readiness', async () => {
    database.isReady.mockResolvedValueOnce(undefined);
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200, { status: 'ok', database: 'up' });
  });
  it('returns 503 without disclosing database errors', async () => {
    database.isReady.mockRejectedValueOnce(new Error('private credentials'));
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503, { status: 'unavailable', database: 'down' });
  });
});
