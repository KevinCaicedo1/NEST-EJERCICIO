import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should create a new user with valid data', () => {
      const timestamp = Date.now();
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `test${timestamp}@example.com`,
          password: 'Test123456',
          role: 'USER',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role', 'USER');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Test123456',
          role: 'USER',
        })
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      
      // First signup
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email,
          password: 'Test123456',
          role: 'USER',
        })
        .expect(201);

      // Second signup with same email
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email,
          password: 'Test123456',
          role: 'USER',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    const testUser = {
      email: `logintest${Date.now()}@example.com`,
      password: 'Test123456',
      role: 'USER' as const,
    };

    beforeEach(async () => {
      // Create a test user
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123456',
        })
        .expect(401);
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Test123456',
        })
        .expect(400);
    });
  });
});
