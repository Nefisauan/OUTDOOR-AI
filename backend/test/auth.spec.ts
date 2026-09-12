import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { hashPassword, verifyPassword } from '../src/auth/password';

describe('password hashing', () => {
 it('uses unique salts and verifies only the right password', async () => {
  const one=await hashPassword('A long password!');
  const two=await hashPassword('A long password!');
  expect(one).not.toEqual(two);
  expect(await verifyPassword('A long password!',one)).toBe(true);
  expect(await verifyPassword('Another password!',one)).toBe(false);
  expect(await verifyPassword('A long password!','invalid')).toBe(false);
 },15000);
});
describe('authentication rate limits',()=>{
 let app:INestApplication;
 const auth={register:jest.fn().mockResolvedValue({}),login:jest.fn().mockResolvedValue({})};
 beforeAll(async()=>{const module=await Test.createTestingModule({imports:[ThrottlerModule.forRoot([{ttl:60000,limit:10}])],controllers:[AuthController],providers:[{provide:AuthService,useValue:auth}]}).compile();app=module.createNestApplication();app.useLogger(false);await app.init();});
 afterAll(async()=>{if(app)await app.close();});
 it('returns 429 before invoking expensive authentication work',async()=>{for(let i=0;i<10;i++)await request(app.getHttpServer()).post('/auth/login').send({}).expect(200);await request(app.getHttpServer()).post('/auth/login').send({}).expect(429);expect(auth.login).toHaveBeenCalledTimes(10);});
});
