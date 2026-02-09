import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/logout (POST) returns 401 without token', () => {
    return request(app.getHttpServer()).post('/auth/logout').expect(401);
  });

  it('/auth/logout (POST) returns 200 with valid token', async () => {
    const jwt = app.get(JwtService);
    const token = await jwt.signAsync({
      sub: 'user_1',
      email: 'admin@test.com',
      role: 'ADMIN',
    });

    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ message: 'Logged out' });
  });

  it('/auth/logout (POST) returns 401 after token revoked', async () => {
    const jwt = app.get(JwtService);
    const token = await jwt.signAsync({
      sub: 'user_1',
      email: 'admin@test.com',
      role: 'ADMIN',
    });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
