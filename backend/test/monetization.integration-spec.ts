import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase, closeTestDb } from './helpers/test-db.helper';
import { registerUser, getAuthToken } from './helpers/test-module.helper';

describe('Monetization API (Integration)', () => {
  let app: INestApplication;
  let djToken: string;
  let adminToken: string;
  let planId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create DJ user
    await registerUser(app, {
      email: 'monetization-dj@test.com',
      password: 'SecurePass123!',
      name: 'Monetization DJ',
      role: 'dj',
    });
    djToken = await getAuthToken(app, 'monetization-dj@test.com', 'SecurePass123!');

    // Create admin user
    await registerUser(app, {
      email: 'monetization-admin@test.com',
      password: 'AdminPass123!',
      name: 'Monetization Admin',
      role: 'admin',
    });
    adminToken = await getAuthToken(app, 'monetization-admin@test.com', 'AdminPass123!');
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeTestDb();
    await app.close();
  });

  describe('POST /v1/monetization/plans (Admin only)', () => {
    it('should create subscription plan as admin', async () => {
      const planData = {
        name: 'Premium Plan',
        stripe_product_id: 'prod_test_123',
        stripe_price_id: 'price_test_123',
        price_cents: 999,
        currency: 'USD',
        billing_interval: 'monthly',
        features: {
          max_streams: 5,
          max_uploads: 100,
          analytics: true,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/v1/monetization/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(planData)
        .expect(201);

      expect(response.body).toHaveProperty('plan_id');
      expect(response.body.name).toBe(planData.name);
      planId = response.body.plan_id;
    });

    it('should reject plan creation by non-admin', async () => {
      const planData = {
        name: 'Unauthorized Plan',
        stripe_product_id: 'prod_fail',
        stripe_price_id: 'price_fail',
        price_cents: 499,
        currency: 'USD',
        billing_interval: 'monthly',
      };

      await request(app.getHttpServer())
        .post('/v1/monetization/plans')
        .set('Authorization', `Bearer ${djToken}`)
        .send(planData)
        .expect(403);
    });
  });

  describe('GET /v1/monetization/plans', () => {
    it('should list all available plans', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/monetization/plans')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should include plan details', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/monetization/plans')
        .expect(200);

      const plan = response.body[0];
      expect(plan).toHaveProperty('plan_id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('price_cents');
      expect(plan).toHaveProperty('billing_interval');
    });
  });

  describe('POST /v1/monetization/subscriptions', () => {
    it('should create subscription to plan', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/monetization/subscriptions')
        .set('Authorization', `Bearer ${djToken}`)
        .send({
          plan_id: planId,
          payment_method: 'pm_card_visa', // Stripe test token
        })
        .expect(201);

      expect(response.body).toHaveProperty('subscription_id');
      expect(response.body.status).toBe('active');
    });

    it('should reject duplicate subscription', async () => {
      await request(app.getHttpServer())
        .post('/v1/monetization/subscriptions')
        .set('Authorization', `Bearer ${djToken}`)
        .send({ plan_id: planId })
        .expect(409);
    });

    it('should reject subscription without authentication', async () => {
      await request(app.getHttpServer())
        .post('/v1/monetization/subscriptions')
        .send({ plan_id: planId })
        .expect(401);
    });
  });

  describe('GET /v1/monetization/subscriptions', () => {
    it('should list user subscriptions', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/monetization/subscriptions')
        .set('Authorization', `Bearer ${djToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should include subscription details', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/monetization/subscriptions')
        .set('Authorization', `Bearer ${djToken}`)
        .expect(200);

      const sub = response.body[0];
      expect(sub).toHaveProperty('subscription_id');
      expect(sub).toHaveProperty('status');
      expect(sub).toHaveProperty('plan');
    });
  });

  describe('Paywall Enforcement', () => {
    let monetizedStreamId: string;

    beforeAll(async () => {
      const streamResponse = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${djToken}`)
        .send({
          name: 'Premium Stream',
          shoutcast_url: 'http://premium.com:8000',
          mount: '/premium',
          stream_key: 'premium_key',
          visibility: 'public',
          monetization_enabled: true,
        });
      monetizedStreamId = streamResponse.body.stream_id;
    });

    it('should allow access with active subscription', async () => {
      await request(app.getHttpServer())
        .get(`/v1/streams/${monetizedStreamId}/live.m3u8`)
        .set('Authorization', `Bearer ${djToken}`)
        .expect(200);
    });

    it('should block access without subscription', async () => {
      // Register new user without subscription
      await registerUser(app, {
        email: 'no-sub@test.com',
        password: 'Pass123!',
        name: 'No Sub User',
        role: 'dj',
      });
      const noSubToken = await getAuthToken(app, 'no-sub@test.com', 'Pass123!');

      const response = await request(app.getHttpServer())
        .get(`/v1/streams/${monetizedStreamId}/live.m3u8`)
        .set('Authorization', `Bearer ${noSubToken}`)
        .expect(403);

      expect(response.body.error).toContain('Subscription required');
    });
  });

  describe('DELETE /v1/monetization/subscriptions/:id', () => {
    let subscriptionId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/monetization/subscriptions')
        .set('Authorization', `Bearer ${djToken}`);
      subscriptionId = response.body[0].subscription_id;
    });

    it('should cancel subscription', async () => {
      await request(app.getHttpServer())
        .delete(`/v1/monetization/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${djToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/v1/monetization/subscriptions')
        .set('Authorization', `Bearer ${djToken}`);

      const canceledSub = response.body.find(
        (s: any) => s.subscription_id === subscriptionId,
      );
      expect(canceledSub.status).toBe('canceled');
    });
  });
});
