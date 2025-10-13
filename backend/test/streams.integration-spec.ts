import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase, closeTestDb } from './helpers/test-db.helper';
import { registerUser, getAuthToken } from './helpers/test-module.helper';
import { streamFixtures } from './fixtures/stream.fixtures';

describe('Streams API (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const user = await registerUser(app, {
      email: 'stream-test@test.com',
      password: 'SecurePass123!',
      name: 'Stream Tester',
      role: 'dj',
    });
    userId = user.user_id;
    authToken = await getAuthToken(app, 'stream-test@test.com', 'SecurePass123!');
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestDb();
    await app.close();
  });

  describe('POST /v1/streams', () => {
    it('should create a new stream with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.validStream)
        .expect(201);

      expect(response.body).toHaveProperty('stream_id');
      expect(response.body.name).toBe(streamFixtures.validStream.name);
      expect(response.body.visibility).toBe('public');
      expect(response.body.enabled).toBe(true);
    });

    it('should reject stream creation without authentication', async () => {
      await request(app.getHttpServer())
        .post('/v1/streams')
        .send(streamFixtures.validStream)
        .expect(401);
    });

    it('should reject invalid shoutcast URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.invalidUrl)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should create private stream', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.privateStream)
        .expect(201);

      expect(response.body.visibility).toBe('private');
    });

    it('should create monetized stream', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.monetizedStream)
        .expect(201);

      expect(response.body.monetization_enabled).toBe(true);
    });
  });

  describe('GET /v1/streams', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.validStream);
    });

    it('should list all streams for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should reject listing streams without authentication', async () => {
      await request(app.getHttpServer())
        .get('/v1/streams')
        .expect(401);
    });
  });

  describe('GET /v1/streams/:id', () => {
    let streamId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.validStream);
      streamId = response.body.stream_id;
    });

    it('should get stream details by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/streams/${streamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stream_id).toBe(streamId);
      expect(response.body.name).toBe(streamFixtures.validStream.name);
    });

    it('should return 404 for non-existent stream', async () => {
      await request(app.getHttpServer())
        .get('/v1/streams/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /v1/streams/:id', () => {
    let streamId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.validStream);
      streamId = response.body.stream_id;
    });

    it('should update stream metadata', async () => {
      const updates = {
        name: 'Updated Stream Name',
        genre: 'Trance',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/v1/streams/${streamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.name).toBe(updates.name);
      expect(response.body.genre).toBe(updates.genre);
    });

    it('should toggle stream enabled status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/v1/streams/${streamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ enabled: false })
        .expect(200);

      expect(response.body.enabled).toBe(false);
    });
  });

  describe('DELETE /v1/streams/:id', () => {
    let streamId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.validStream);
      streamId = response.body.stream_id;
    });

    it('should soft delete stream', async () => {
      await request(app.getHttpServer())
        .delete(`/v1/streams/${streamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/v1/streams/${streamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /v1/streams/:id/heartbeat', () => {
    let streamId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.validStream);
      streamId = response.body.stream_id;
    });

    it('should accept heartbeat with listener count', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/streams/${streamId}/heartbeat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          listeners: 42,
          bitrate: 128,
          current_track: 'Artist - Track Name',
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /v1/streams/:id/status', () => {
    let streamId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamFixtures.validStream);
      streamId = response.body.stream_id;
    });

    it('should return real-time stream status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/streams/${streamId}/status`)
        .expect(200);

      expect(response.body).toHaveProperty('stream_id', streamId);
      expect(response.body).toHaveProperty('online');
      expect(response.body).toHaveProperty('listeners');
    });
  });
});
