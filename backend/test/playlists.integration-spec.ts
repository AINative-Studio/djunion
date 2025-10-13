import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase, closeTestDb } from './helpers/test-db.helper';
import { registerUser, getAuthToken } from './helpers/test-module.helper';
import { playlistFixtures, trackFixtures } from './fixtures/playlist.fixtures';

describe('Playlists API (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await registerUser(app, {
      email: 'playlist-test@test.com',
      password: 'SecurePass123!',
      name: 'Playlist Tester',
      role: 'dj',
    });
    authToken = await getAuthToken(app, 'playlist-test@test.com', 'SecurePass123!');
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestDb();
    await app.close();
  });

  describe('POST /v1/playlists', () => {
    it('should create a new playlist', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(playlistFixtures.publicPlaylist)
        .expect(201);

      expect(response.body).toHaveProperty('playlist_id');
      expect(response.body.title).toBe(playlistFixtures.publicPlaylist.title);
    });

    it('should create private playlist', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(playlistFixtures.privatePlaylist)
        .expect(201);

      expect(response.body.visibility).toBe('private');
    });

    it('should create premium playlist', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(playlistFixtures.premiumPlaylist)
        .expect(201);

      expect(response.body.monetization_enabled).toBe(true);
    });
  });

  describe('GET /v1/playlists', () => {
    it('should list all playlists for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter public playlists', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/playlists?visibility=public')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((playlist: any) => {
        expect(playlist.visibility).toBe('public');
      });
    });
  });

  describe('POST /v1/playlists/:id/tracks', () => {
    let playlistId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(playlistFixtures.publicPlaylist);
      playlistId = response.body.playlist_id;
    });

    it('should add external track to playlist', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/playlists/${playlistId}/tracks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(trackFixtures.externalTrack)
        .expect(201);

      expect(response.body).toHaveProperty('track_id');
      expect(response.body.source_type).toBe('external');
    });

    it('should add multiple tracks', async () => {
      await request(app.getHttpServer())
        .post(`/v1/playlists/${playlistId}/tracks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(trackFixtures.externalTrack)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/v1/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tracks.length).toBeGreaterThan(0);
    });
  });

  describe('GET /v1/playlists/:id/stream.m3u8', () => {
    let playlistId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(playlistFixtures.publicPlaylist);
      playlistId = response.body.playlist_id;

      await request(app.getHttpServer())
        .post(`/v1/playlists/${playlistId}/tracks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(trackFixtures.externalTrack);
    });

    it('should return HLS manifest for playlist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/playlists/${playlistId}/stream.m3u8`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/vnd.apple.mpegurl');
      expect(response.text).toContain('#EXTM3U');
    });
  });

  describe('DELETE /v1/playlists/:id', () => {
    let playlistId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(playlistFixtures.publicPlaylist);
      playlistId = response.body.playlist_id;
    });

    it('should delete playlist', async () => {
      await request(app.getHttpServer())
        .delete(`/v1/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/v1/playlists/${playlistId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
