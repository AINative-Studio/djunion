import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase, closeTestDb } from './helpers/test-db.helper';

describe('Authentication Workflow (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  const testUser = {
    email: 'e2e-test@test.com',
    password: 'SecurePass123!',
    name: 'E2E Test User',
    role: 'dj',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestDb();
    await app.close();
  });

  it('Complete auth flow: register -> login -> refresh -> logout', async () => {
    // Step 1: Register new user
    const registerResponse = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(registerResponse.body).toHaveProperty('user_id');
    expect(registerResponse.body.email).toBe(testUser.email);
    expect(registerResponse.body).not.toHaveProperty('password_hash');

    // Step 2: Login with credentials
    const loginResponse = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('access_token');
    expect(loginResponse.body).toHaveProperty('refresh_token');
    expect(loginResponse.body).toHaveProperty('expires_in');

    accessToken = loginResponse.body.access_token;
    refreshToken = loginResponse.body.refresh_token;

    // Step 3: Access protected resource
    const profileResponse = await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(profileResponse.body.email).toBe(testUser.email);

    // Step 4: Refresh access token
    const refreshResponse = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(200);

    expect(refreshResponse.body).toHaveProperty('access_token');
    expect(refreshResponse.body.access_token).not.toBe(accessToken);

    const newAccessToken = refreshResponse.body.access_token;

    // Step 5: Verify new token works
    await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(200);

    // Step 6: Logout
    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .send({ refresh_token: refreshToken })
      .expect(200);

    // Step 7: Verify refresh token is invalidated
    await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(401);
  });

  it('Should reject invalid login credentials', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!',
      })
      .expect(401);
  });

  it('Should reject access without token', async () => {
    await request(app.getHttpServer())
      .get('/v1/users/me')
      .expect(401);
  });

  it('Should reject expired or invalid tokens', async () => {
    await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
