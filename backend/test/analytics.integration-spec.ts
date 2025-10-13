import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase, closeTestDb } from './helpers/test-db.helper';
import { registerUser, getAuthToken } from './helpers/test-module.helper';

describe('Analytics API (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let streamId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await registerUser(app, {
      email: 'analytics-test@test.com',
      password: 'SecurePass123!',
      name: 'Analytics Tester',
      role: 'dj',
    });
    authToken = await getAuthToken(app, 'analytics-test@test.com', 'SecurePass123!');

    // Create a test stream
    const streamResponse = await request(app.getHttpServer())
      .post('/v1/streams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Analytics Test Stream',
        shoutcast_url: 'http://test.com:8000',
        mount: '/live',
        stream_key: 'analytics_key',
        visibility: 'public',
      });
    streamId = streamResponse.body.stream_id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestDb();
    await app.close();
  });

  describe('Analytics Collection', () => {
    it('should track stream heartbeat metrics', async () => {
      await request(app.getHttpServer())
        .post(`/v1/streams/${streamId}/heartbeat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          listeners: 50,
          bitrate: 128,
          current_track: 'Test Artist - Test Track',
        })
        .expect(200);
    });

    it('should increment listener count on multiple heartbeats', async () => {
      await request(app.getHttpServer())
        .post(`/v1/streams/${streamId}/heartbeat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ listeners: 30 });

      await request(app.getHttpServer())
        .post(`/v1/streams/${streamId}/heartbeat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ listeners: 45 });

      await request(app.getHttpServer())
        .post(`/v1/streams/${streamId}/heartbeat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ listeners: 60 });
    });
  });

  describe('GET /v1/analytics/streams/:id', () => {
    it('should return analytics for specific stream', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app.getHttpServer())
        .get(`/v1/analytics/streams/${streamId}?from=${today}&to=${today}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('daily_listeners');
      expect(response.body).toHaveProperty('peak_listeners');
      expect(response.body).toHaveProperty('total_listens');
    });

    it('should return analytics for date range', async () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fromDate = weekAgo.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get(`/v1/analytics/streams/${streamId}?from=${fromDate}&to=${toDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.daily_listeners)).toBe(true);
    });

    it('should reject unauthorized access to analytics', async () => {
      await request(app.getHttpServer())
        .get(`/v1/analytics/streams/${streamId}`)
        .expect(401);
    });
  });

  describe('GET /v1/analytics/dashboard', () => {
    it('should return aggregated dashboard analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total_streams');
      expect(response.body).toHaveProperty('total_listeners');
      expect(response.body).toHaveProperty('total_plays');
    });

    it('should include breakdown by resource type', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('streams');
      expect(response.body).toHaveProperty('playlists');
      expect(response.body).toHaveProperty('podcasts');
    });
  });
});
