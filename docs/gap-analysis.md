# DJ Union Backend Gap Analysis & Implementation Plan

**Date:** October 12, 2025
**Status:** Backend 0% Complete | Frontend 95% Complete
**Estimated Timeline:** 12 weeks (3 months)
**Priority:** High - Blocking MVP Launch

---

## Executive Summary

After comprehensive analysis of the PRD, data model, sprint plan, and backlog documentation against the current Next.js frontend codebase, **100% of the backend infrastructure needs to be built from scratch**. The frontend is production-ready with excellent UI/UX, but there is no backend API, database, authentication, or cloud infrastructure currently implemented.

---

## Current State Analysis

### ✅ Completed (Frontend)
- **Framework**: Next.js 15 with App Router
- **UI Components**: Complete shadcn/ui + Radix UI library (40+ components)
- **Pages**:
  - Marketing: Home, About, Careers, Pricing, Blog, Community
  - Auth: Login, Signup, Onboarding
  - Application: Dashboard, Player, Admin, Developers, Docs
  - Legal: Privacy, Terms, Cookies, DMCA, Support
- **Styling**: Tailwind CSS with custom theme
- **TypeScript**: Full type safety
- **Deployment**: Ready for Vercel/Next.js deployment

### ❌ Missing (Entire Backend Stack)
- No backend server/API (0 endpoints implemented)
- No database (PostgreSQL not set up)
- No authentication system (JWT not implemented)
- No API routes (Next.js API routes don't exist)
- No data persistence layer
- No cloud infrastructure (AWS/GCP/Azure)
- No Kubernetes cluster or Docker containers
- No CI/CD pipeline
- No monitoring/logging infrastructure

---

## Gap Analysis by Epic

### Epic 1: Authentication & User Management 🔴 0% Complete

**Required Components:**
- User registration with bcrypt password hashing
- JWT authentication (RS256 signature)
- Refresh token mechanism with 30-day expiration
- Role-based access control (DJ vs Admin roles)
- Admin user management interface
- Password reset flow with email verification
- Session management and logout

**Database Schema:**
```sql
-- users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('dj','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- refresh_tokens table
CREATE TABLE refresh_tokens (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- password_resets table
CREATE TABLE password_resets (
  reset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reset_token VARCHAR(100) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**API Endpoints:**
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login (returns JWT + refresh token)
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Invalidate tokens
- `POST /v1/auth/forgot-password` - Request password reset
- `POST /v1/auth/reset-password` - Reset password with token
- `GET /v1/users` - List all users (admin only)
- `GET /v1/users/{user_id}` - Get user details
- `PATCH /v1/users/{user_id}` - Update user
- `DELETE /v1/users/{user_id}` - Soft delete user

**Frontend Integration:**
- Update `/app/login/page.tsx` to call login API
- Update `/app/signup/page.tsx` to call register API
- Add JWT token storage (httpOnly cookies recommended)
- Implement protected route middleware
- Add session persistence across page refreshes

**Estimated Effort:** 1-2 weeks (Epic 1 in Sprint Plan)

---

### Epic 2: Live Stream Management (Shoutcast Integration) 🔴 0% Complete

**Required Components:**
- Shoutcast server connectivity and validation
- Relay Worker orchestration via Kubernetes
- Stream heartbeat monitoring (30-second intervals)
- HLS manifest generation (m3u8)
- MP3 stream proxying with chunked encoding
- Real-time listener count tracking
- Stream metadata extraction (current track, bitrate)

**Database Schema:**
```sql
-- streams table
CREATE TABLE streams (
  stream_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  shoutcast_url TEXT NOT NULL,
  mount VARCHAR(100) NOT NULL,
  stream_key_enc TEXT NOT NULL,
  genre VARCHAR(50),
  description TEXT,
  visibility VARCHAR(10) NOT NULL CHECK (visibility IN ('public','private')),
  monetization_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_streams_user ON streams(user_id);
CREATE INDEX idx_streams_visibility ON streams(visibility);

-- streams_ads table
CREATE TABLE streams_ads (
  ad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES streams(stream_id) ON DELETE CASCADE,
  position_seconds INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  ad_type VARCHAR(10) NOT NULL CHECK (ad_type IN ('pre-roll','mid-roll','post-roll')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_ads_stream_pos ON streams_ads(stream_id, position_seconds);
```

**API Endpoints:**
- `POST /v1/streams` - Register Shoutcast source
- `GET /v1/streams` - List user's streams
- `GET /v1/streams/{stream_id}` - Get stream details
- `PATCH /v1/streams/{stream_id}` - Update stream configuration
- `DELETE /v1/streams/{stream_id}` - Unregister stream
- `POST /v1/streams/{stream_id}/heartbeat` - Relay Worker heartbeat
- `GET /v1/streams/{stream_id}/status` - Real-time stream status
- `GET /v1/streams/{stream_id}/live.m3u8` - HLS manifest
- `GET /v1/streams/{stream_id}/live.mp3` - MP3 stream
- `POST /v1/streams/{stream_id}/ads` - Configure ad markers
- `GET /v1/streams/{stream_id}/ads` - List ad markers

**Infrastructure Components:**
1. **Relay Worker Docker Image**
   - Base: Node.js 18 Alpine
   - FFmpeg for HLS segmentation
   - Shoutcast/Icecast connection handling
   - HLS manifest generation (6-second segments)
   - Heartbeat sender (POST to API every 30s)
   - S3 upload for HLS segments

2. **Kubernetes Resources**
   - Deployment per stream (1 pod per active stream)
   - Service with ClusterIP for API communication
   - ConfigMap for Shoutcast credentials
   - Resource limits: 256MB RAM, 0.5 CPU per pod

3. **Redis Cache**
   - Heartbeat data storage (TTL: 5 minutes)
   - Real-time listener count
   - Stream health status

4. **S3 Bucket Structure**
   ```
   /streams/
     /{stream_id}/
       /hls/
         manifest.m3u8
         segment0001.ts
         segment0002.ts
         ...
   ```

5. **CDN Configuration**
   - CloudFront/CloudFlare for HLS delivery
   - Cache headers: max-age=6s for manifests
   - CORS headers for cross-origin playback

**Frontend Integration:**
- Dashboard stream registration form
- Stream management UI (enable/disable, edit metadata)
- Real-time listener count display
- Player integration with HLS.js library
- Stream status indicators (online/offline)

**Estimated Effort:** 2-3 weeks (Epic 2 in Sprint Plan)

---

### Epic 3: On-Demand Playlist Management 🔴 0% Complete

**Required Components:**
- MP3 file upload system (multipart/form-data)
- S3 presigned URL generation for secure uploads
- FFmpeg transcoding pipeline (MP3 → HLS)
- Background job queue for async processing
- Playlist creation with mixed sources (uploaded + external)
- Track ordering and reordering
- Combined HLS manifest generation
- On-the-fly stream concatenation for external URLs

**Database Schema:**
```sql
-- uploads table
CREATE TABLE uploads (
  upload_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('processing','ready','failed')),
  error_message TEXT,
  title VARCHAR(150),
  artist VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_uploads_user ON uploads(user_id);
CREATE INDEX idx_uploads_status_ready ON uploads(upload_id) WHERE status = 'ready';

-- hls_segments table
CREATE TABLE hls_segments (
  segment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES uploads(upload_id) ON DELETE CASCADE,
  sequence_index INTEGER NOT NULL,
  ts_path TEXT NOT NULL,
  duration_seconds NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(upload_id, sequence_index)
);
CREATE INDEX idx_hls_segments_upload_idx ON hls_segments(upload_id, sequence_index);

-- playlists table
CREATE TABLE playlists (
  playlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  visibility VARCHAR(10) NOT NULL CHECK (visibility IN ('public','private')),
  monetization_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_playlists_user ON playlists(user_id);
CREATE INDEX idx_playlists_visibility ON playlists(visibility);

-- tracks table
CREATE TABLE tracks (
  track_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(playlist_id) ON DELETE CASCADE,
  source_type VARCHAR(10) NOT NULL CHECK (source_type IN ('upload','external')),
  upload_id UUID REFERENCES uploads(upload_id) ON DELETE SET NULL,
  url TEXT,
  title VARCHAR(150) NOT NULL,
  artist VARCHAR(100),
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (
    (source_type = 'upload' AND upload_id IS NOT NULL AND url IS NULL)
    OR
    (source_type = 'external' AND url IS NOT NULL AND upload_id IS NULL)
  )
);
CREATE INDEX idx_tracks_playlist ON tracks(playlist_id);
```

**API Endpoints:**
- `POST /v1/uploads/audio` - Upload MP3 file
- `GET /v1/uploads/audio/{upload_id}` - Check transcoding status
- `GET /v1/uploads/audio` - List user's uploads
- `DELETE /v1/uploads/audio/{upload_id}` - Delete upload
- `POST /v1/playlists` - Create playlist
- `GET /v1/playlists` - List user's playlists
- `GET /v1/playlists/{playlist_id}` - Get playlist details
- `PUT /v1/playlists/{playlist_id}` - Update playlist
- `DELETE /v1/playlists/{playlist_id}` - Delete playlist
- `GET /v1/playlists/{playlist_id}/stream.m3u8` - HLS manifest
- `GET /v1/playlists/{playlist_id}/stream.mp3` - MP3 concatenated stream

**Infrastructure Components:**
1. **Transcoding Worker (Kubernetes Job)**
   ```yaml
   apiVersion: batch/v1
   kind: Job
   metadata:
     name: transcode-{upload_id}
   spec:
     template:
       spec:
         containers:
         - name: ffmpeg
           image: jrottenberg/ffmpeg:alpine
           command:
           - /bin/sh
           - -c
           - |
             aws s3 cp s3://bucket/uploads/{upload_id}/original.mp3 /tmp/input.mp3
             ffmpeg -i /tmp/input.mp3 -c:a copy -f hls -hls_time 10 \
               -hls_list_size 0 -hls_segment_filename /tmp/segment%03d.ts \
               /tmp/manifest.m3u8
             aws s3 cp /tmp/manifest.m3u8 s3://bucket/uploads/{upload_id}/hls/
             aws s3 cp /tmp/segment*.ts s3://bucket/uploads/{upload_id}/hls/
         restartPolicy: OnFailure
   ```

2. **Background Job Queue (BullMQ)**
   - Job types: `transcode_upload`, `generate_playlist_manifest`
   - Concurrency: 5 workers
   - Retry policy: 3 attempts with exponential backoff
   - Job status tracking in Redis

3. **S3 Bucket Structure**
   ```
   /uploads/
     /audio/
       /{user_id}/
         /{upload_id}/
           original.mp3
           /hls/
             manifest.m3u8
             segment000.ts
             segment001.ts
             ...

   /playlists/
     /{playlist_id}/
       /hls/
         manifest.m3u8  (combined from multiple uploads)
   ```

**Frontend Integration:**
- File upload component with progress bar
- Drag-and-drop upload interface
- Playlist builder UI (add/remove/reorder tracks)
- Preview player for uploaded tracks
- Playlist management dashboard
- Public playlist directory page

**Estimated Effort:** 2-3 weeks (Epic 3 in Sprint Plan)

---

### Epic 4: Podcast Hosting & RSS Feed 🔴 0% Complete

**Required Components:**
- Podcast series management (metadata, cover art)
- Episode CRUD operations
- RSS 2.0 feed generation with iTunes tags
- Custom domain DNS verification (stub for MVP)
- TLS certificate automation via Let's Encrypt (stub for MVP)
- Episode paywall support
- RSS feed caching strategy

**Database Schema:**
```sql
-- podcasts table
CREATE TABLE podcasts (
  podcast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  language VARCHAR(10) NOT NULL,
  author VARCHAR(100) NOT NULL,
  image_url TEXT,
  explicit BOOLEAN NOT NULL DEFAULT FALSE,
  custom_domain VARCHAR(255) UNIQUE,
  monetization_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_podcasts_user ON podcasts(user_id);

-- episodes table
CREATE TABLE episodes (
  episode_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID NOT NULL REFERENCES podcasts(podcast_id) ON DELETE CASCADE,
  source_type VARCHAR(10) NOT NULL CHECK (source_type IN ('upload','external')),
  upload_id UUID REFERENCES uploads(upload_id) ON DELETE SET NULL,
  media_url TEXT,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  duration_seconds INTEGER NOT NULL,
  publication_date TIMESTAMPTZ NOT NULL,
  episode_number INTEGER NOT NULL,
  explicit BOOLEAN NOT NULL DEFAULT FALSE,
  monetization_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (
    (source_type = 'upload' AND upload_id IS NOT NULL AND media_url IS NULL)
    OR
    (source_type = 'external' AND media_url IS NOT NULL AND upload_id IS NULL)
  )
);
CREATE INDEX idx_episodes_podcast_pubdate ON episodes(podcast_id, publication_date DESC);
CREATE UNIQUE INDEX ux_episodes_podcast_number ON episodes(podcast_id, episode_number);

-- domains table
CREATE TABLE domains (
  domain_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  custom_domain VARCHAR(255) NOT NULL UNIQUE,
  verification_status VARCHAR(10) NOT NULL CHECK (verification_status IN ('pending','verified','failed')),
  tls_status VARCHAR(10) NOT NULL CHECK (tls_status IN ('pending','issued','failed')),
  dns_challenge_record VARCHAR(255),
  verified_at TIMESTAMPTZ,
  tls_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_domains_user ON domains(user_id);
```

**API Endpoints:**
- `POST /v1/podcasts` - Create podcast series
- `GET /v1/podcasts` - List user's podcasts
- `GET /v1/podcasts/{podcast_id}` - Get podcast details + episodes
- `PATCH /v1/podcasts/{podcast_id}` - Update podcast metadata
- `DELETE /v1/podcasts/{podcast_id}` - Delete podcast
- `POST /v1/podcasts/{podcast_id}/episodes` - Add episode
- `GET /v1/podcasts/{podcast_id}/episodes/{episode_id}` - Get episode
- `PATCH /v1/podcasts/{podcast_id}/episodes/{episode_id}` - Update episode
- `DELETE /v1/podcasts/{podcast_id}/episodes/{episode_id}` - Delete episode
- `GET /v1/podcasts/{podcast_id}/rss.xml` - RSS feed
- `POST /v1/domains` - Register custom domain
- `GET /v1/domains/{domain_id}` - Check domain verification status

**RSS Feed Generation:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tech DJ Podcast</title>
    <link>https://api.djunion.com/v1/podcasts/{podcast_id}</link>
    <description>Weekly interviews with top DJs and music producers.</description>
    <language>en-us</language>
    <itunes:author>DJ Example</itunes:author>
    <itunes:image href="https://cdn.djunion.com/images/podcast-cover.jpg"/>
    <itunes:explicit>no</itunes:explicit>
    <itunes:category text="Music"/>
    <atom:link href="https://api.djunion.com/v1/podcasts/{podcast_id}/rss.xml"
               rel="self" type="application/rss+xml"/>

    <item>
      <title>Episode 1: Live from Ibiza</title>
      <description>Exclusive set and interview.</description>
      <enclosure url="https://cdn.djunion.com/podcasts/{podcast_id}/episode1.mp3"
                 length="86400000" type="audio/mpeg"/>
      <guid isPermaLink="false">{episode_id}</guid>
      <pubDate>Tue, 10 Jun 2025 14:00:00 GMT</pubDate>
      <itunes:duration>01:00:00</itunes:duration>
      <itunes:explicit>no</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
    </item>
  </channel>
</rss>
```

**Infrastructure Components:**
1. **RSS Cache Strategy**
   - Store generated RSS in S3: `/podcasts/{podcast_id}/rss.xml`
   - Cache in Redis with 5-minute TTL
   - Invalidate cache on episode CRUD operations
   - Set CDN cache headers: `Cache-Control: public, max-age=300`

2. **Custom Domain Setup (Stub for MVP)**
   - DNS verification: Check for TXT record `_acme-challenge.podcast.djname.com`
   - Simulated delay: 1 minute after creation, flip status to `verified`
   - TLS issuance: Simulate Let's Encrypt certificate generation
   - Production: Integrate with Route53/Cloudflare API + cert-manager

**Frontend Integration:**
- Podcast creation wizard
- Episode upload/management interface
- RSS feed preview and validation
- Custom domain configuration UI
- Podcast directory page
- Embeddable podcast player

**Estimated Effort:** 1.5-2 weeks (Epic 4 in Sprint Plan)

---

### Epic 5: Analytics & Reporting 🔴 0% Complete

**Required Components:**
- Listener count tracking for live streams
- Play count tracking for playlists/podcasts
- Daily aggregation pipeline
- Date-range queries with aggregation
- Real-time metrics updates
- Analytics dashboard data endpoints

**Database Schema:**
```sql
-- analytics table
CREATE TABLE analytics (
  analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(10) NOT NULL CHECK (resource_type IN ('stream','playlist','podcast')),
  resource_id UUID NOT NULL,
  date DATE NOT NULL,
  metric VARCHAR(20) NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resource_type, resource_id, date, metric)
);
CREATE INDEX idx_analytics_resource_date ON analytics(resource_type, resource_id, date);
```

**Metrics Collected:**
- **Streams**: `listeners` (daily sum), `peak_listeners` (daily max), `uptime_seconds`
- **Playlists**: `play_count` (daily count), `unique_listeners`
- **Podcasts**: `downloads` (daily count), `unique_subscribers`

**API Endpoints:**
- `GET /v1/analytics/streams/{stream_id}?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - Response: `{ daily_listeners: [{date, listeners}], peak_listeners, total_listens }`
- `GET /v1/analytics/playlists/{playlist_id}?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - Response: `{ plays: [{date, play_count}], total_plays }`
- `GET /v1/analytics/podcasts/{podcast_id}?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - Response: `{ downloads: [{date, download_count}], total_downloads }`
- `GET /v1/analytics/dashboard` - Aggregated stats for user's dashboard

**Data Collection Triggers:**
1. **Stream Heartbeat**: `POST /v1/streams/{id}/heartbeat` → upsert daily `listeners` value
2. **Playlist Stream**: `GET /v1/playlists/{id}/stream.m3u8` → increment `play_count`
3. **Podcast Download**: `GET /v1/podcasts/{id}/rss.xml` → increment `downloads`

**Infrastructure Components:**
1. **Analytics Pipeline (Background Job)**
   - Runs daily at midnight UTC
   - Aggregates raw events into analytics table
   - Calculates peak values, unique counts
   - Purges raw events older than 30 days

2. **Real-Time Updates**
   - WebSocket connection for live listener count
   - Server-Sent Events (SSE) for dashboard updates
   - Redis pub/sub for metric broadcasting

**Frontend Integration:**
- Dashboard analytics charts (Chart.js / Recharts)
- Real-time listener count badges
- Historical trend visualizations
- Exportable analytics reports (CSV)
- Geographic distribution map (optional)

**Estimated Effort:** 1 week (Epic 5 in Sprint Plan)

---

### Epic 6: Monetization & Ad Insertion 🔴 0% Complete

**Required Components:**
- Subscription plan management
- Stripe integration (stubbed for MVP)
- Paywall enforcement middleware
- Ad marker configuration for streams
- Subscription status tracking
- Webhook handlers for Stripe events

**Database Schema:**
```sql
-- monetization_plans table
CREATE TABLE monetization_plans (
  plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  stripe_product_id VARCHAR(100) NOT NULL UNIQUE,
  stripe_price_id VARCHAR(100) NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (length(currency) = 3),
  billing_interval VARCHAR(10) NOT NULL CHECK (billing_interval IN ('monthly','yearly')),
  features JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- subscriptions table
CREATE TABLE subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES monetization_plans(plan_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active','past_due','canceled','unpaid','trialing')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, plan_id)
);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

**API Endpoints:**
- `POST /v1/monetization/plans` - Create subscription plan (admin)
- `GET /v1/monetization/plans` - List available plans
- `POST /v1/monetization/subscriptions` - Subscribe to plan
- `GET /v1/monetization/subscriptions` - List user's subscriptions
- `DELETE /v1/monetization/subscriptions/{subscription_id}` - Cancel subscription
- `POST /v1/streams/{stream_id}/ads` - Configure ad markers
- `GET /v1/streams/{stream_id}/ads` - List ad markers
- `POST /v1/webhooks/stripe` - Stripe webhook handler

**Paywall Enforcement Logic:**
```typescript
// Middleware: Check subscription before serving content
async function checkSubscription(req, res, next) {
  const resource = await getResource(req.params.id);

  if (resource.monetization_enabled) {
    const userId = req.user.id; // From JWT
    const subscription = await Subscription.findOne({
      where: {
        user_id: userId,
        status: 'active',
        expires_at: { $gt: new Date() }
      }
    });

    if (!subscription) {
      return res.status(403).json({
        error: 'Subscription required',
        code: 403,
        subscription_url: '/pricing'
      });
    }
  }

  next();
}
```

**Stripe Integration (Stubbed for MVP):**
- Use test mode API keys
- Mock webhook events
- Stub payment flow with `test_payment_method`
- Simulate successful subscriptions

**Infrastructure Components:**
1. **Webhook Handler**
   - Verify Stripe signature
   - Handle events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Update subscription status in database
   - Send email notifications (optional)

2. **Ad Insertion (Relay Worker)**
   - Read ad markers from `streams_ads` table
   - Inject silent segments at specified timestamps
   - Generate HLS manifests with SCTE-35 markers (future)

**Frontend Integration:**
- Pricing page with plan selection
- Stripe Checkout integration
- Subscription management dashboard
- Paywall modals for protected content
- Ad configuration UI for DJs

**Estimated Effort:** 1-1.5 weeks (Epic 6 in Sprint Plan)

---

### Epic 7: Infrastructure, CI/CD & Deployment 🔴 0% Complete

**Required Components:**
- Git repository setup (main, develop branches)
- GitHub Actions CI/CD pipeline
- Kubernetes staging cluster
- Helm charts for API and Relay Worker
- Health check endpoints
- Prometheus metrics
- Grafana dashboards
- Logging infrastructure (Loki)

**CI/CD Pipeline (GitHub Actions):**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: djunion_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - name: Build API Docker image
        run: docker build -t djunion/api:${{ github.sha }} -f Dockerfile.api .
      - name: Build Relay Worker Docker image
        run: docker build -t djunion/relay-worker:${{ github.sha }} -f Dockerfile.relay .
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push djunion/api:${{ github.sha }}
          docker push djunion/relay-worker:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      - name: Install Helm
        run: curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
      - name: Deploy to staging
        run: |
          helm upgrade --install djunion-api ./helm/api \
            --namespace audio-api-staging \
            --set image.tag=${{ github.sha }} \
            --set environment=staging
```

**Kubernetes Resources:**
```yaml
# helm/api/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-api
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: djunion-api
  template:
    metadata:
      labels:
        app: djunion-api
    spec:
      containers:
      - name: api
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: djunion-secrets
              key: database-url
        - name: JWT_PRIVATE_KEY
          valueFrom:
            secretKeyRef:
              name: djunion-secrets
              key: jwt-private-key
        livenessProbe:
          httpGet:
            path: /v1/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /v1/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

**Monitoring Setup:**
1. **Prometheus Metrics**
   ```typescript
   // metrics.ts
   import { Counter, Histogram, Registry } from 'prom-client';

   export const httpRequestsTotal = new Counter({
     name: 'http_requests_total',
     help: 'Total number of HTTP requests',
     labelNames: ['method', 'route', 'status_code']
   });

   export const httpRequestDuration = new Histogram({
     name: 'http_request_duration_seconds',
     help: 'HTTP request latency in seconds',
     labelNames: ['method', 'route'],
     buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
   });
   ```

2. **Grafana Dashboards**
   - API request rate (per minute)
   - Error rate (4xx/5xx)
   - Response time percentiles (p50, p95, p99)
   - CPU/Memory usage per pod
   - Active stream count
   - Listener count distribution

**Frontend Integration:**
- API base URL from environment variable
- Health check status page
- Deployment status notifications

**Estimated Effort:** 1-2 weeks (Epic 7 in Sprint Plan)

---

### Epic 8: Error Handling, Validation & Security 🔴 0% Complete

**Required Components:**
- Consistent error response format
- Request body validation (JSON Schema / Zod)
- JWT middleware with RS256 verification
- RBAC scope enforcement
- Input sanitization for SQL injection prevention
- Rate limiting (Redis-backed)
- CORS configuration
- Security headers (Helmet.js)

**Error Response Standard:**
```json
{
  "error": "Descriptive error message",
  "code": 400,
  "field": "email",
  "details": {
    "validation_errors": [
      "Email must be a valid email address"
    ]
  }
}
```

**Request Validation (Zod Example):**
```typescript
import { z } from 'zod';

const CreateStreamSchema = z.object({
  name: z.string().min(3).max(150),
  shoutcast_url: z.string().url(),
  mount: z.string().regex(/^\/[a-zA-Z0-9_-]+$/),
  stream_key: z.string().min(8),
  genre: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  visibility: z.enum(['public', 'private']),
  monetization_enabled: z.boolean()
});

// In route handler
async function createStream(req, res) {
  try {
    const data = CreateStreamSchema.parse(req.body);
    // Proceed with validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 400,
        details: error.errors
      });
    }
  }
}
```

**JWT Middleware:**
```typescript
import jwt from 'jsonwebtoken';
import fs from 'fs';

const publicKey = fs.readFileSync('keys/jwt_public.pem');

async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 401
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    req.user = decoded; // { sub: user_id, email, role, scopes }
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 401
    });
  }
}

function requireScope(scope: string) {
  return (req, res, next) => {
    if (!req.user.scopes.includes(scope)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 403,
        required_scope: scope
      });
    }
    next();
  };
}

// Usage
app.post('/v1/streams',
  authenticateJWT,
  requireScope('streams:write'),
  createStream
);
```

**Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const metadataLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:metadata:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Rate limit exceeded. Try again in 60 seconds.',
    code: 429
  },
  keyGenerator: (req) => req.user?.id || req.ip
});

const writeLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:write:'
  }),
  windowMs: 60 * 1000,
  max: 10, // 10 writes per minute
  message: {
    error: 'Rate limit exceeded. Try again in 60 seconds.',
    code: 429
  },
  keyGenerator: (req) => req.user?.id || req.ip
});

// Apply to routes
app.get('/v1/streams/:id/status', metadataLimiter, getStreamStatus);
app.post('/v1/streams', writeLimiter, createStream);
```

**Security Headers:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://cdn.djunion.com"],
      connectSrc: ["'self'", "https://api.djunion.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://cdn.djunion.com"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**Frontend Integration:**
- Display validation errors in forms
- Handle 401/403 with redirect to login
- Show rate limit errors with retry timer
- Store JWT in httpOnly cookies

**Estimated Effort:** 1 week (Epic 8 in Sprint Plan)

---

### Epic 9: Documentation & Testing 🔴 0% Complete

**Required Components:**
- OpenAPI 3.0 specification
- Postman collection with examples
- Unit tests (≥80% coverage)
- Integration tests for major workflows
- E2E tests for critical user journeys
- API documentation site (Swagger UI)
- README with setup instructions

**OpenAPI Specification (Example):**
```yaml
openapi: 3.0.0
info:
  title: DJ Union API
  version: 1.0.0
  description: Web-based audio streaming platform for DJs
servers:
  - url: https://api.djunion.com/v1
    description: Production
  - url: https://api.staging.djunion.com/v1
    description: Staging

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Stream:
      type: object
      required:
        - name
        - shoutcast_url
        - mount
        - stream_key
        - visibility
      properties:
        stream_id:
          type: string
          format: uuid
          readOnly: true
        name:
          type: string
          minLength: 3
          maxLength: 150
        shoutcast_url:
          type: string
          format: uri
        mount:
          type: string
          pattern: ^/[a-zA-Z0-9_-]+$
        genre:
          type: string
          maxLength: 50
        visibility:
          type: string
          enum: [public, private]
        monetization_enabled:
          type: boolean

paths:
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
            example:
              email: dj@example.com
              password: SecurePass123!
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  refresh_token:
                    type: string
                  expires_in:
                    type: integer
        '401':
          description: Invalid credentials

  /streams:
    post:
      summary: Register new stream
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Stream'
      responses:
        '201':
          description: Stream created
        '400':
          description: Validation error
        '401':
          description: Unauthorized
```

**Testing Strategy:**

1. **Unit Tests (Jest / Mocha)**
   ```typescript
   describe('AuthService', () => {
     describe('register', () => {
       it('should create a new user with hashed password', async () => {
         const userData = {
           email: 'test@example.com',
           password: 'SecurePass123!',
           name: 'Test User'
         };

         const user = await authService.register(userData);

         expect(user.email).toBe(userData.email);
         expect(user.password_hash).not.toBe(userData.password);
         expect(await bcrypt.compare(userData.password, user.password_hash)).toBe(true);
       });

       it('should reject duplicate email', async () => {
         await authService.register({
           email: 'dup@example.com',
           password: 'Pass123!',
           name: 'User One'
         });

         await expect(
           authService.register({
             email: 'dup@example.com',
             password: 'Pass456!',
             name: 'User Two'
           })
         ).rejects.toThrow('Email already exists');
       });
     });
   });
   ```

2. **Integration Tests (Supertest)**
   ```typescript
   describe('POST /v1/streams', () => {
     let authToken;

     beforeAll(async () => {
       const response = await request(app)
         .post('/v1/auth/login')
         .send({ email: 'dj@test.com', password: 'Pass123!' });
       authToken = response.body.access_token;
     });

     it('should create a new stream', async () => {
       const streamData = {
         name: 'Test Stream',
         shoutcast_url: 'http://test.example.com:8000',
         mount: '/live',
         stream_key: 'test_key',
         visibility: 'public',
         monetization_enabled: false
       };

       const response = await request(app)
         .post('/v1/streams')
         .set('Authorization', `Bearer ${authToken}`)
         .send(streamData)
         .expect(201);

       expect(response.body.stream_id).toBeDefined();
       expect(response.body.status).toBe('registered');
     });

     it('should reject invalid Shoutcast URL', async () => {
       const response = await request(app)
         .post('/v1/streams')
         .set('Authorization', `Bearer ${authToken}`)
         .send({
           ...streamData,
           shoutcast_url: 'http://unreachable.example.com:8000'
         })
         .expect(422);

       expect(response.body.error).toContain('Shoutcast');
     });
   });
   ```

3. **E2E Tests (Playwright)**
   ```typescript
   test('DJ can register, create stream, and see it in dashboard', async ({ page }) => {
     // Register
     await page.goto('/signup');
     await page.fill('input[name="email"]', 'dj@test.com');
     await page.fill('input[name="password"]', 'SecurePass123!');
     await page.fill('input[name="name"]', 'Test DJ');
     await page.click('button[type="submit"]');

     // Login
     await page.waitForURL('/dashboard');

     // Create stream
     await page.click('text=Add Stream');
     await page.fill('input[name="name"]', 'My Live Stream');
     await page.fill('input[name="shoutcast_url"]', 'http://test.com:8000');
     await page.fill('input[name="mount"]', '/live');
     await page.fill('input[name="stream_key"]', 'my_key');
     await page.click('button:has-text("Create Stream")');

     // Verify in dashboard
     await page.waitForSelector('text=My Live Stream');
     expect(await page.textContent('.stream-status')).toBe('Online');
   });
   ```

**Documentation Site:**
- Host Swagger UI at `/docs`
- Link from frontend developer page
- Include authentication guide
- Add code examples in multiple languages

**Frontend Integration:**
- Link to API docs from developer dashboard
- Embed Postman "Run in Postman" button
- Display API status/health on homepage

**Estimated Effort:** 1.5-2 weeks (Epic 9 in Sprint Plan)

---

## Technology Stack Recommendations

### Backend API
**Recommended: NestJS + TypeScript + Prisma**

**Rationale:**
- Type safety across frontend and backend
- Enterprise-grade framework with built-in modules
- Excellent dependency injection
- Built-in validation with class-validator
- Easy testing with Jest
- Active community and ecosystem

**Alternative: FastAPI + Python + SQLAlchemy**
- Better for ML/AI features in future
- Excellent async performance
- Great for data processing

**Project Structure:**
```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   ├── streams/
│   │   ├── streams.controller.ts
│   │   ├── streams.service.ts
│   │   ├── streams.module.ts
│   │   └── dto/
│   ├── playlists/
│   ├── podcasts/
│   ├── analytics/
│   ├── monetization/
│   ├── common/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── decorators/
│   ├── prisma/
│   │   └── prisma.service.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
├── .env.example
├── Dockerfile
└── package.json
```

### Database
**PostgreSQL 14+** (Required)
- UUID support via `gen_random_uuid()`
- JSONB for flexible features storage
- Partial indexes for performance
- Full-text search capabilities
- Excellent TypeScript ORM support

**Connection Pooling:**
- Prisma built-in pooling
- PgBouncer for production

### Caching & Queue
**Redis 6+**
- Heartbeat data storage (TTL: 5 minutes)
- Rate limiting counters
- Session cache
- BullMQ job queue
- Pub/sub for real-time updates

### Object Storage
**AWS S3** (Recommended) or **MinIO** (Self-hosted)
- Audio file storage (uploads)
- HLS segment storage
- RSS feed cache
- CDN origin

### Container Orchestration
**Kubernetes 1.25+**
- Managed options: AWS EKS, GCP GKE, Azure AKS
- Self-hosted: K3s for smaller deployments
- Helm for package management
- Kustomize for environment-specific configs

### CI/CD
**GitHub Actions** (Recommended)
- Native GitHub integration
- Free for open source
- Self-hosted runners option

### Monitoring & Logging
- **Prometheus** - Metrics collection
- **Grafana** - Dashboards and visualization
- **Loki** - Log aggregation
- **Jaeger** - Distributed tracing (optional)

---

## Development Environment Setup

### Prerequisites
```bash
# Required tools
- Node.js 18+ (LTS)
- Docker Desktop
- kubectl
- helm
- PostgreSQL client (psql)
- Redis CLI
- AWS CLI (for S3)
- git
```

### Local Development Setup
```bash
# 1. Clone repository
git clone https://github.com/AINative-Studio/djunion.git
cd djunion

# 2. Start infrastructure with Docker Compose
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: djunion
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: djunion_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
EOF

docker-compose up -d

# 3. Create backend directory
mkdir backend
cd backend

# 4. Initialize NestJS project
npm i -g @nestjs/cli
nest new api --package-manager npm

cd api

# 5. Install dependencies
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @prisma/client
npm install -D prisma @types/bcrypt @types/passport-jwt

# 6. Initialize Prisma
npx prisma init

# 7. Configure environment variables
cat > .env << EOF
DATABASE_URL="postgresql://djunion:dev_password@localhost:5432/djunion_dev"
JWT_PRIVATE_KEY_PATH="./keys/jwt_private.pem"
JWT_PUBLIC_KEY_PATH="./keys/jwt_public.pem"
REDIS_URL="redis://localhost:6379"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="djunion-dev"
NODE_ENV="development"
EOF

# 8. Generate JWT keys
mkdir keys
ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwt_private.pem -N ""
openssl rsa -in keys/jwt_private.pem -pubout -outform PEM -out keys/jwt_public.pem

# 9. Run database migrations (after creating schema)
npx prisma migrate dev --name init

# 10. Start development server
npm run start:dev
```

---

## Implementation Timeline (12 Weeks)

### Week 1-2: Foundation
**Sprint 1: Authentication & Infrastructure**
- ✅ Set up PostgreSQL, Redis, S3
- ✅ Create NestJS project structure
- ✅ Implement authentication module
  - User registration with bcrypt
  - JWT login (RS256)
  - Refresh token flow
- ✅ Create base middleware (JWT auth, error handling)
- ✅ Set up Docker Compose for local dev
- ✅ Write unit tests for auth module

**Deliverable:** Working auth endpoints + local dev environment

---

### Week 3-5: Core Streaming
**Sprint 2-3: Live Streaming & Relay Workers**
- ✅ Implement stream registration endpoints
- ✅ Build Relay Worker Docker image
  - Shoutcast connection handling
  - HLS segmentation with FFmpeg
  - Heartbeat sender
- ✅ Set up Kubernetes cluster (staging)
- ✅ Create Helm charts for API + Relay Worker
- ✅ Implement stream status endpoints
- ✅ Build HLS/MP3 streaming proxies
- ✅ Integrate Redis for heartbeat storage
- ✅ Set up S3 for HLS segment storage
- ✅ Write integration tests for streaming flow

**Deliverable:** Live streaming functional end-to-end

---

### Week 6-8: Content Management
**Sprint 4-5: Uploads, Playlists & Podcasts**
- ✅ Implement file upload endpoints
- ✅ Build FFmpeg transcoding pipeline
- ✅ Create Kubernetes Jobs for transcoding
- ✅ Implement playlist CRUD operations
- ✅ Build combined HLS manifest generator
- ✅ Implement podcast management
- ✅ Create RSS feed generator
- ✅ Set up RSS caching strategy
- ✅ Write integration tests for content workflows

**Deliverable:** On-demand content fully functional

---

### Week 9-10: Business Logic
**Sprint 6-7: Analytics & Monetization**
- ✅ Implement analytics collection
- ✅ Build daily aggregation pipeline
- ✅ Create analytics query endpoints
- ✅ Implement subscription plan management
- ✅ Integrate Stripe (stubbed)
- ✅ Build paywall enforcement middleware
- ✅ Implement ad marker configuration
- ✅ Write tests for monetization flow

**Deliverable:** Business features operational

---

### Week 11-12: Production Readiness
**Sprint 8: Security, Testing & Deployment**
- ✅ Implement rate limiting
- ✅ Add request validation for all endpoints
- ✅ Set up RBAC enforcement
- ✅ Configure security headers
- ✅ Write comprehensive test suite (≥80% coverage)
- ✅ Create OpenAPI specification
- ✅ Build Postman collection
- ✅ Set up GitHub Actions CI/CD
- ✅ Deploy to staging environment
- ✅ Configure monitoring (Prometheus + Grafana)
- ✅ Write API documentation

**Deliverable:** Production-ready backend

---

## Frontend Integration Checklist

### 1. API Client Setup
```typescript
// lib/api-client.ts
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(email: string, password: string, name: string) {
    return this.request('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  // Stream methods
  async createStream(data: any) {
    return this.request('/v1/streams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStreams() {
    return this.request('/v1/streams');
  }

  // More methods...
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1'
);
```

### 2. Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_CDN_URL=http://localhost:9000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. State Management (Zustand)
```typescript
// store/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),
      clearAuth: () =>
        set({ user: null, token: null, refreshToken: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 4. Protected Route Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Protected routes
  const protectedPaths = ['/dashboard', '/player', '/admin'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/player/:path*', '/admin/:path*'],
};
```

### 5. Update Pages with API Calls

**Login Page:**
```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const response = await apiClient.login(email, password);
      setAuth(response.user, response.access_token, response.refresh_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Dashboard Page:**
```typescript
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardPage() {
  const [streams, setStreams] = useState([]);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
      loadStreams();
    }
  }, [token]);

  async function loadStreams() {
    try {
      const data = await apiClient.getStreams();
      setStreams(data.streams);
    } catch (error) {
      console.error('Failed to load streams:', error);
    }
  }

  return (
    <div>
      <h1>My Streams</h1>
      {streams.map((stream: any) => (
        <div key={stream.stream_id}>
          <h3>{stream.name}</h3>
          <p>Status: {stream.enabled ? 'Active' : 'Inactive'}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Risk Mitigation Strategies

### High Priority Risks

1. **Shoutcast Integration Complexity**
   - **Risk:** Real Shoutcast servers may have authentication issues
   - **Mitigation:**
     - Use stub Relay Worker for MVP
     - Test with multiple Shoutcast/Icecast servers
     - Implement retry logic with exponential backoff

2. **FFmpeg Transcoding Performance**
   - **Risk:** Large MP3 files may take too long to transcode
   - **Mitigation:**
     - Limit upload size to 100MB
     - Use low-bitrate transcoding for MVP (64kbps)
     - Scale transcoding workers horizontally
     - Implement job priority queue

3. **Kubernetes Resource Management**
   - **Risk:** Relay Worker pods may exhaust cluster resources
   - **Mitigation:**
     - Set strict resource limits (256MB RAM, 0.5 CPU per pod)
     - Implement pod autoscaling based on listener count
     - Monitor resource usage with Prometheus alerts

4. **Database Connection Pool Exhaustion**
   - **Risk:** High concurrent requests may exhaust DB connections
   - **Mitigation:**
     - Use PgBouncer for connection pooling
     - Set max connections: 100
     - Implement query timeout (5 seconds)
     - Cache frequently accessed data in Redis

5. **S3 Storage Costs**
   - **Risk:** HLS segments may accumulate and increase costs
   - **Mitigation:**
     - Implement S3 lifecycle policy (delete segments after 7 days)
     - Use S3 Intelligent-Tiering
     - Compress segments with gzip
     - Monitor storage usage with CloudWatch

---

## Success Metrics

### Technical KPIs
- **API Uptime:** ≥99.9%
- **Response Time (p95):** <500ms for metadata, <100ms for streaming
- **Test Coverage:** ≥80%
- **Build Success Rate:** ≥95%
- **Zero Critical Security Vulnerabilities**

### Business KPIs
- **Concurrent Streams:** Support 100+ simultaneous live streams
- **Listener Capacity:** 10,000+ concurrent listeners
- **Upload Processing Time:** <2 minutes for 10MB MP3
- **API Error Rate:** <1%

---

## Next Steps

### Immediate Actions (Week 1)

1. **Set Up Development Environment**
   - Install required tools
   - Run Docker Compose for local infrastructure
   - Create backend project with NestJS

2. **Database Schema Implementation**
   - Create Prisma schema from datamodel.md
   - Run initial migration
   - Seed database with test data

3. **Authentication Module**
   - Implement registration endpoint
   - Implement login endpoint with JWT
   - Write unit tests

4. **Frontend Integration Prep**
   - Add API client library
   - Set up environment variables
   - Create auth store with Zustand

### Week 2 Goals

1. **Complete Authentication**
   - Refresh token endpoint
   - Password reset flow
   - Admin user management

2. **Start Stream Management**
   - Stream registration endpoint
   - Basic Relay Worker Docker image
   - Kubernetes deployment scaffolding

3. **CI/CD Setup**
   - GitHub Actions workflow
   - Docker image builds
   - Automated tests

---

## Conclusion

The DJ Union project requires a complete backend implementation from scratch. While the frontend is production-ready, all API, database, authentication, infrastructure, and deployment components need to be built.

**Key Takeaways:**
- **Estimated Timeline:** 12 weeks with 1-2 full-time backend engineers
- **Technology Stack:** NestJS + PostgreSQL + Redis + Kubernetes + AWS S3
- **Architecture:** Microservices with API Gateway, Relay Workers, and Background Jobs
- **Testing:** Comprehensive unit, integration, and E2E test coverage
- **Deployment:** Kubernetes with Helm, CI/CD via GitHub Actions
- **Monitoring:** Prometheus + Grafana for observability

**Recommended Approach:**
1. Start with 7-day MVP sprint (authentication + basic streaming)
2. Iterate in 2-week sprints to add features
3. Maintain ≥80% test coverage throughout
4. Deploy to staging after each sprint
5. Conduct security audit before production launch

This gap analysis serves as the roadmap for backend development. Each epic can be broken down into smaller tasks and assigned to development teams or specialized agents for parallel implementation.

---

**Document Version:** 1.0
**Last Updated:** October 12, 2025
**Author:** Claude (AI Assistant)
**Status:** Draft - Pending Review
