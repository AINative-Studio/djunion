**Product Requirements Document (PRD): Web-based Audio Streaming API for DJs & Podcasters**

---

## 1. Executive Summary

**Objective:**
Build a fully featured, RESTful API service that enables DJs to:

1. **Live Streaming Relay via Shoutcast:**

   * DJs send live audio feeds to our service using Shoutcast.
   * Our cloud-based infrastructure ingests (ingress) those feeds, segments them with FFmpeg into HLS chunks in real time, and relays (multicasts) the streams to all connected listeners.

2. **On-Demand Playlist Management:**

   * DJs can upload audio files (direct file upload) or reference externally hosted URLs for tracks.
   * The service generates HLS manifests and/or continuous MP3 streams for on-demand listening.

3. **Podcast & RSS Hosting with Custom Domains:**

   * DJs create podcast series and upload episodes; the service automatically generates valid RSS 2.0 feeds.
   * Support custom domains (e.g., `podcast.djname.com`) with automated DNS and TLS certificate provisioning.

4. **Monetization & Ad Insertion:**

   * Provide optional paid tiers, ad-insertion hooks, and paywall functionality for exclusive streams or episodes.

5. **Metadata & Analytics:**

   * Expose live-stream metadata (current track, bitrate, total listeners).
   * Provide detailed analytics for on-demand playlists (play counts) and podcast episodes (download counts).
   * Support date-range queries and exportable reports.

6. **Scalable, Secure, & Reliable:**

   * Horizontally scalable architecture for high concurrency (tens of thousands of listeners).
   * Robust authentication/authorization, input validation, rate limiting, and monitoring.
   * GDPR-compliant user data handling and “Right to Be Forgotten.”

---

## 2. Goals & Objectives

1. **Live Stream Relay (Shoutcast Integration)**

   * Allow DJs to register Shoutcast source URLs and credentials.
   * Ingest and segment live feeds via FFmpeg in cloud relay workers.
   * Multicast HLS chunks and/or continuous MP3 to all listeners.

2. **On-Demand Playlists with Direct Uploads**

   * DJs can upload MP3 files directly to our object storage (via dedicated file-upload endpoints).
   * Automatically transcode uploaded files into HLS segments.
   * Provide HLS manifest and continuous MP3 endpoints for playlists.

3. **Podcast Hosting & RSS with Custom Domains**

   * DJs create and manage podcast series and episodes (upload via file upload or external URLs).
   * The API auto-generates and serves RSS feeds.
   * Support DJ-provided custom domains for RSS (DNS + TLS automation).

4. **Monetization & Ad Insertion**

   * Provide endpoints to configure paid subscription tiers and ad-insertion timing/slots.
   * Support paywalled streams or episodes (listeners must authenticate and have an active subscription).
   * Provide ad-insertion hooks (e.g., mid-roll markers) for dynamic ad-serving.

5. **Analytics & Reporting**

   * Collect and serve listener counts, play counts, and download counts.
   * Provide built-in CSV/JSON export and visual dashboard (future phase).
   * Retain analytics data for at least two years, purge raw logs after 90 days.

6. **Reliability & Security**

   * Ensure 99.9% uptime via multi-AZ deployment, health checks, and automatic failover.
   * Encrypt sensitive data (e.g., stream keys) at rest and in transit.
   * Implement JWT-based authentication, role-based access, and GDPR compliance.

---

## 3. User Personas & Use Cases

### 3.1 Primary User Personas

1. **DJ / Stream Operator**

   * Registers a Shoutcast source (URL + credentials) and enables relay.
   * Uploads or references audio files for on-demand playlists and podcast episodes.
   * Configures custom RSS domains, monetization settings, and ad insertion.
   * Views analytics for live streams, playlists, and podcasts.

2. **API Consumer / Developer**

   * Builds DJ-facing dashboards, mobile apps, or embedded players that consume live/on-demand streams and RSS.
   * Integrates payment and ad systems into players.
   * Automates DNS and TLS certificate provisioning for custom domains.

3. **Listener (Implicit)**

   * Connects to a live HLS URL (`stream_id/live.m3u8`) or continuous MP3.
   * Connects to on-demand HLS or MP3 endpoints for playlists.
   * Subscribes to podcasts via custom RSS domain (e.g., `podcast.djname.com/rss.xml`).
   * Pays for premium streams or views inserted ads.

---

### 3.2 Core Use Cases

1. **Register & Relay Live Shoutcast Source**

   * DJ submits Shoutcast server URL, mount, credentials → API validates → spins up a relay worker that connects, segments, and multicasts the feed.

2. **Upload & Manage On-Demand Playlist**

   * DJ uploads MP3 files directly or references external URLs → API stores/transcodes → provides HLS manifest and MP3 stream endpoints.

3. **Create Podcast Series & Episodes**

   * DJ registers a custom domain (e.g., `podcast.djname.com`) → API configures DNS and provisions TLS.
   * DJ uploads episode files or references external URLs → API stores/transcodes → regenerates RSS feed at `https://podcast.djname.com/rss.xml`.

4. **Configure Monetization & Ads**

   * DJ defines subscription plans (monthly, yearly) via API.
   * DJ sets ad insertion markers (e.g., pre-roll, mid-roll positions) for live and on-demand streams.
   * Listeners must log in and have active subscription to access paywalled streams/episodes; ads served where applicable.

5. **Consume Streams & RSS**

   * Listeners retrieve HLS manifest at `/v1/streams/{stream_id}/live.m3u8` or `/v1/playlists/{playlist_id}/stream.m3u8`.
   * For podcasts, subscribe to `https://podcast.djname.com/rss.xml`.

6. **View Analytics & Export Reports**

   * DJ requests analytics endpoints (live listeners per day, playlist play counts, episode downloads) with date-range filters.
   * API returns JSON, can also provide CSV download.

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization

* **JWT-Based Authentication**

  * `POST /v1/auth/login` → returns access & refresh tokens.
  * `POST /v1/auth/refresh` → returns new access token.

* **Role-Based Access Control (RBAC)**

  * **DJ Role:** Owns and manages streams, playlists, podcasts, custom domains, monetization settings, and analytics.
  * **Admin Role:** Full visibility across all DJs; manage users, billing, and global analytics.

* **Permissions (Scopes):**

  * `streams:read`, `streams:write`, `playlists:read`, `playlists:write`,
  * `podcasts:read`, `podcasts:write`, `monetization:read`, `monetization:write`,
  * `domains:read`, `domains:write`, `analytics:read`.

---

### 4.2 Live Streaming Relay (Shoutcast) Integration

1. **Register Shoutcast Source**

   * **Endpoint:** `POST /v1/streams`
   * **Request Body:**

     ```json
     {
       "name": "Friday Night DJ Set",
       "shoutcast_url": "http://djshoutcast.example.com:8000",
       "mount": "/live",
       "stream_key": "DJ_STREAM_KEY",
       "genre": "House",
       "description": "Weekly house mix",
       "visibility": "public",       // "public" or "private"
       "monetization_enabled": true  // if paywall or ads apply
     }
     ```
   * **Behavior:**

     * Validate `shoutcast_url` and `stream_key`.
     * Store config (encrypt `stream_key`).
     * Create a Relay Worker record in DB.
     * Trigger orchestration (e.g., Kubernetes Job) to spin up a Relay Worker Pod that connects to the Shoutcast source and begins ingesting the feed.
   * **Response (201 Created):**

     ```json
     {
       "stream_id": "uuid-1234",
       "status": "registered"
     }
     ```
   * **Errors:**

     * `400 Bad Request` if required fields missing.
     * `422 Unprocessable Entity` if cannot connect to Shoutcast source.

2. **Update Stream Configuration**

   * **Endpoint:** `PATCH /v1/streams/{stream_id}`
   * **Request Body (any subset):**

     ```json
     {
       "name": "Updated DJ Set",
       "genre": "Techno",
       "description": "Updated description",
       "visibility": "private",
       "monetization_enabled": false,
       "enabled": false
     }
     ```
   * **Behavior:**

     * Update fields in DB.
     * If `enabled` toggled to `false`, instruct Relay Worker to stop accepting new listener connections (existing clients finish current HLS segments or MP3 buffer).
     * If `monetization_enabled` toggles, update paywall logic in Relay Worker.
   * **Response (200 OK):**

     ```json
     {
       "stream_id": "uuid-1234",
       "updated_fields": ["enabled", "visibility", "monetization_enabled"]
     }
     ```
   * **Errors:**

     * `404 Not Found` if `stream_id` unknown.
     * `400 Bad Request` if invalid fields.

3. **Delete Stream Registration**

   * **Endpoint:** `DELETE /v1/streams/{stream_id}`
   * **Behavior:**

     * Terminate associated Relay Worker (delete Pod).
     * Remove configuration from DB (soft-delete for audit/log).
   * **Response (204 No Content)**
   * **Errors:**

     * `404 Not Found`.

4. **Retrieve Live Stream Metadata**

   * **Endpoint:** `GET /v1/streams/{stream_id}/status`
   * **Behavior:**

     * Query Shoutcast source’s admin endpoint (e.g., `GET /admin.cgi?mode=viewxml&pass=STREAM_KEY`) to fetch current track, bitrate.
     * Query Relay Worker for listener count and connection status.
     * Return real-time combined data.
   * **Response (200 OK):**

     ```json
     {
       "stream_id": "uuid-1234",
       "name": "Friday Night DJ Set",
       "current_track": "DJ Snake – Frequency",
       "bitrate": "128kbps",
       "listeners": 125,
       "uptime": "2h 14m",
       "relay_connected": true
     }
     ```
   * **Errors:**

     * `404 Not Found` if `stream_id` unknown.
     * `503 Service Unavailable` if Relay Worker crashed or Shoutcast source unreachable.

5. **Live Stream Relay Endpoints (Listener-Facing)**

   * **Live HLS Manifest:** `GET /v1/streams/{stream_id}/live.m3u8`

     * **Authentication:** If `visibility == "private"`, require valid JWT with `streams:read`; if `monetization_enabled: true`, also verify listener’s subscription. If `visibility == "public"`, no auth required.
     * **Behavior:** Relay Worker continually generates HLS segments (`segment####.ts`) and updates manifest. CDN caches manifest (TTL=30 s).
     * **Response (200 OK, `application/vnd.apple.mpegurl`):** HLS manifest pointing to TS segments under a CDN URL (e.g., `https://cdn.example.com/streams/{stream_id}/segments/segment####.ts`).

   * **Live Continuous MP3:** `GET /v1/streams/{stream_id}/live.mp3`

     * **Authentication:** Same as above.
     * **Behavior:** Relay Worker proxies raw MP3 frames from Shoutcast source, forwarding them to client with chunked transfer encoding.
     * **Response (200 OK, `audio/mpeg`):** Continuous MP3 stream.

---

### 4.3 On-Demand Playlist Management (with Direct Uploads)

1. **Upload Audio File**

   * **Endpoint:** `POST /v1/uploads/audio` (multipart/form-data)
   * **Authentication:** `playlists:write` or `podcasts:write` required.
   * **Request:** Single file field (e.g., `file`); optional metadata fields can be provided (e.g., `title`, `artist`).
   * **Behavior:**

     * Validate file type (`audio/mpeg`), size limit (e.g., ≤ 100 MB).
     * Perform virus scan (via integrated AV service).
     * Store in S3 under `/uploads/audio/{user_id}/{uuid}/{original_filename}.mp3`.
     * Enqueue background job to generate HLS segments via FFmpeg (e.g., 10 sec TS chunks).
   * **Response (201 Created):**

     ```json
     {
       "upload_id": "uuid-upload-0001",
       "storage_url": "s3://bucket/uploads/audio/{user_id}/uuid-upload-0001/original.mp3",
       "hls_manifest_url": "https://api.example.com/v1/uploads/audio/{upload_id}/hls/manifest.m3u8",
       "status": "processing"  // or "ready" if immediate
     }
     ```
   * **Errors:**

     * `400 Bad Request` if no file or invalid MIME type.
     * `413 Payload Too Large` if file size > limit.

2. **Check Upload & HLS Status**

   * **Endpoint:** `GET /v1/uploads/audio/{upload_id}`
   * **Authentication:** Owner of upload required.
   * **Response (200 OK):**

     ```json
     {
       "upload_id": "uuid-upload-0001",
       "storage_url": "s3://bucket/uploads/audio/{user_id}/uuid-upload-0001/original.mp3",
       "hls_manifest_url": "https://api.example.com/v1/uploads/audio/{upload_id}/hls/manifest.m3u8",
       "status": "ready",          // "processing" | "ready" | "failed"
       "error_message": null
     }
     ```
   * **Errors:**

     * `404 Not Found`.

3. **Create Playlist**

   * **Endpoint:** `POST /v1/playlists`
   * **Request Body:**

     ```json
     {
       "title": "Chill Evening Vibes",
       "description": "Smooth tracks for an evening stream.",
       "tracks": [
         {
           "source_type": "upload",         // "upload" or "external"
           "upload_id": "uuid-upload-0001", // if "upload"
           "title": "Track One",
           "artist": "Artist A",
           "duration_seconds": 180
         },
         {
           "source_type": "external",
           "url": "https://cdn.example.com/audio/track2.mp3",
           "title": "Track Two",
           "artist": "Artist B",
           "duration_seconds": 240
         }
       ],
       "visibility": "public",    // "public" or "private"
       "monetization_enabled": false
     }
     ```
   * **Behavior:**

     * For each track:

       * If `source_type == "upload"`, verify `upload_id` exists and `status == "ready"`.
       * If `source_type == "external"`, verify URL HEAD request returns 200 + `audio/mpeg`.
     * Store playlist metadata and track references in DB.
     * Trigger pre-generation of HLS manifest if all tracks are HLS-ready; otherwise generate on first request.
   * **Response (201 Created):**

     ```json
     {
       "playlist_id": "uuid-5678",
       "stream_urls": {
         "hls": "https://api.example.com/v1/playlists/uuid-5678/stream.m3u8",
         "mp3": "https://api.example.com/v1/playlists/uuid-5678/stream.mp3"
       }
     }
     ```
   * **Errors:**

     * `400 Bad Request`, `422 Unprocessable Entity` if any track invalid.

4. **Retrieve Playlist Metadata**

   * **Endpoint:** `GET /v1/playlists/{playlist_id}`
   * **Authentication:** If `visibility == "private"`, require JWT with `playlists:read` and (if `monetization_enabled`) verify subscription.
   * **Response (200 OK):**

     ```json
     {
       "playlist_id": "uuid-5678",
       "title": "Chill Evening Vibes",
       "description": "Smooth tracks for an evening stream.",
       "tracks": [
         {
           "track_id": "uuid-trk-1",
           "source_type": "upload",
           "upload_id": "uuid-upload-0001",
           "title": "Track One",
           "artist": "Artist A",
           "duration_seconds": 180
         },
         {
           "track_id": "uuid-trk-2",
           "source_type": "external",
           "url": "https://cdn.example.com/audio/track2.mp3",
           "title": "Track Two",
           "artist": "Artist B",
           "duration_seconds": 240
         }
       ],
       "visibility": "public",
       "monetization_enabled": false
     }
     ```
   * **Errors:**

     * `403 Forbidden` if private and unauthorized.
     * `404 Not Found`.

5. **Update Playlist**

   * **Endpoint:** `PUT /v1/playlists/{playlist_id}`
   * **Authentication:** Owner of playlist required (`playlists:write`).
   * **Request Body:** Full playlist object (same schema as creation).
   * **Behavior:**

     * Validate updated tracks as above.
     * Update DB records and regenerate HLS manifest.
   * **Response (200 OK):**

     ```json
     {
       "playlist_id": "uuid-5678",
       "updated": true
     }
     ```
   * **Errors:**

     * `400 Bad Request`, `404 Not Found`.

6. **Delete Playlist**

   * **Endpoint:** `DELETE /v1/playlists/{playlist_id}`
   * **Authentication:** Owner of playlist (`playlists:write`).
   * **Behavior:**

     * Remove playlist record from DB (soft-delete).
     * Invalidate cached HLS and MP3 endpoints on CDN.
   * **Response (204 No Content)**
   * **Errors:**

     * `404 Not Found`.

7. **Stream Playlist Endpoints**

   * **HLS Manifest:** `GET /v1/playlists/{playlist_id}/stream.m3u8`

     * **Authentication:** If `visibility == "private"`, require valid JWT and check `monetization_enabled` subscription. Otherwise public.
     * **Behavior:**

       * If manifest pre-generated, serve from CDN cache (TTL=30 s).
       * Otherwise, relay worker or API dynamically generate manifest referencing TS segments (local or S3).
     * **Response (200 OK, `application/vnd.apple.mpegurl`):** HLS manifest.

   * **Continuous MP3:** `GET /v1/playlists/{playlist_id}/stream.mp3`

     * **Authentication:** Same as above.
     * **Behavior:**

       * Relay Worker or API proxies/concatenates MP3 files into a continuous stream.
     * **Response (200 OK, `audio/mpeg`):** Continuous MP3.

---

### 4.4 Podcast Hosting & RSS (with Custom Domains)

1. **Register Podcast & Custom Domain**

   * **Endpoint:** `POST /v1/podcasts`
   * **Request Body:**

     ```json
     {
       "title": "Tech DJ Podcast",
       "description": "Weekly interviews with top DJs and music producers.",
       "language": "en-us",
       "author": "DJ Example",
       "image_url": "https://cdn.example.com/images/podcast-cover.jpg",
       "explicit": false,
       "custom_domain": "podcast.djname.com",
       "monetization_enabled": true
     }
     ```
   * **Behavior:**

     * Store podcast metadata in DB.
     * Validate `custom_domain` ownership: verify DJ’s control (e.g., DNS TXT record or email verification).
     * Initiate DNS record creation (CNAME to our CDN endpoint).
     * Automatically provision TLS via Let’s Encrypt (ACME) for `podcast.djname.com`.
     * Compute `rss_feed_url = https://podcast.djname.com/rss.xml`.
   * **Response (201 Created):**

     ```json
     {
       "podcast_id": "uuid-9012",
       "rss_feed_url": "https://podcast.djname.com/rss.xml"
     }
     ```
   * **Errors:**

     * `400 Bad Request` for invalid domain or missing fields.
     * `409 Conflict` if domain already in use.

2. **Add Podcast Episode**

   * **Endpoint:** `POST /v1/podcasts/{podcast_id}/episodes`
   * **Request Body:**

     ```json
     {
       "title": "Episode 1: Live from Ibiza",
       "description": "Exclusive set and interview.",
       "source_type": "upload",        // "upload" or "external"
       "upload_id": "uuid-upload-0002", // if "upload"
       "media_url": "https://cdn.example.com/podcasts/episode1.mp3", // if "external"
       "duration_seconds": 3600,
       "publication_date": "2025-06-10T14:00:00Z",
       "episode_number": 1,
       "explicit": false,
       "monetization_required": false  // if subscribers-only
     }
     ```
   * **Behavior:**

     * If `source_type == "upload"`, verify `upload_id` exists and is `ready`.
     * If `source_type == "external"`, verify URL HEAD for `audio/mpeg`.
     * Store episode metadata; enqueue background job to update RSS XML.
     * If `monetization_required: true`, require subscription check in RSS item URL (enforce paywall).
   * **Response (201 Created):**

     ```json
     {
       "episode_id": "uuid-ep-1234"
     }
     ```
   * **Errors:**

     * `400 Bad Request`, `404 Not Found` (invalid `podcast_id`), `422 Unprocessable Entity` (invalid upload or URL).

3. **Update Episode Metadata**

   * **Endpoint:** `PATCH /v1/podcasts/{podcast_id}/episodes/{episode_id}`
   * **Request Body:** Any subset of:

     ```json
     {
       "title": "Episode 1: Ibiza Update",
       "description": "Updated description",
       "media_url": "https://cdn.example.com/podcasts/episode1-v2.mp3",
       "duration_seconds": 3700,
       "publication_date": "2025-06-11T14:00:00Z",
       "episode_number": 1,
       "explicit": false,
       "monetization_required": true
     }
     ```
   * **Behavior:**

     * Update DB, then regenerate RSS XML.
   * **Response (200 OK):**

     ```json
     {
       "episode_id": "uuid-ep-1234",
       "updated_fields": ["media_url", "monetization_required"]
     }
     ```
   * **Errors:**

     * `400 Bad Request`, `404 Not Found`.

4. **Delete Episode**

   * **Endpoint:** `DELETE /v1/podcasts/{podcast_id}/episodes/{episode_id}`
   * **Behavior:**

     * Remove episode from DB, regenerate RSS XML.
     * Invalidate cached RSS on CDN.
   * **Response (204 No Content)**
   * **Errors:**

     * `404 Not Found`.

5. **Serve Podcast RSS Feed**

   * **Endpoint:** `GET https://{custom_domain}/rss.xml` or fallback `GET /v1/podcasts/{podcast_id}/rss.xml`
   * **Authentication:** None if `monetization_required == false` for all episodes; otherwise, enforce subscription checks per `<enclosure>` URL.
   * **Behavior:** Generate RSS 2.0 XML with `<channel>` and `<item>` entries for each episode.
   * **Response (200 OK, `application/rss+xml`):**

     ```xml
     <?xml version="1.0" encoding="UTF-8"?>
     <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
       <channel>
         <title>Tech DJ Podcast</title>
         <link>https://podcast.djname.com</link>
         <description>Weekly interviews with top DJs and music producers.</description>
         <language>en-us</language>
         <itunes:author>DJ Example</itunes:author>
         <itunes:image href="https://cdn.example.com/images/podcast-cover.jpg"/>
         <itunes:explicit>no</itunes:explicit>
         <item>
           <title>Episode 1: Live from Ibiza</title>
           <description>Exclusive set and interview.</description>
           <enclosure url="https://cdn.example.com/podcasts/episode1.mp3" length="3600000" type="audio/mpeg"/>
           <guid>uuid-ep-1234</guid>
           <pubDate>Tue, 10 Jun 2025 14:00:00 GMT</pubDate>
           <itunes:duration>01:00:00</itunes:duration>
           <itunes:explicit>no</itunes:explicit>
         </item>
         <!-- Additional <item> entries -->
       </channel>
     </rss>
     ```
   * **Errors:**

     * `404 Not Found` if `podcast_id` or domain unknown.
     * `403 Forbidden` for paywalled RSS if listener not authenticated/subscribed.

---

### 4.5 Monetization & Ad Insertion

1. **Configure Subscription Plans**

   * **Endpoint:** `POST /v1/monetization/plans`
   * **Authentication:** Admin or DJ with `monetization:write`.
   * **Request Body:**

     ```json
     {
       "name": "Premium Live Access",
       "price_cents": 500,        // in USD cents
       "currency": "USD",
       "billing_interval": "monthly", // "monthly" or "yearly"
       "features": ["live_streams", "playlist_access", "podcast_downloads"]
     }
     ```
   * **Behavior:**

     * Store plan in DB; integrate with payment provider (Stripe) to create product & price.
   * **Response (201 Created):**

     ```json
     {
       "plan_id": "uuid-plan-1001",
       "stripe_product_id": "prod_ABC123",
       "stripe_price_id": "price_DEF456"
     }
     ```
   * **Errors:**

     * `400 Bad Request` if missing fields.

2. **Subscribe to Plan**

   * **Endpoint:** `POST /v1/monetization/subscriptions`
   * **Authentication:** DJ must be user; requiring `monetization:write`.
   * **Request Body:**

     ```json
     {
       "plan_id": "uuid-plan-1001",
       "stripe_payment_method_id": "pm_XYZ789"
     }
     ```
   * **Behavior:**

     * Integrate with Stripe to create a Subscription on customer account.
     * Store `subscription_id` in DB, track status.
   * **Response (201 Created):**

     ```json
     {
       "subscription_id": "uuid-sub-2002",
       "status": "active"
     }
     ```
   * **Errors:**

     * `402 Payment Required` if payment fails.
     * `400 Bad Request`.

3. **Enforce Paywall on Streams/Playlists/Podcasts**

   * **Logic:**

     * If a resource (stream, playlist, or episode) has `monetization_enabled: true`, require valid JWT of a user with active subscription before serving HLS, MP3, or RSS enclosure.
     * Otherwise, return `403 Forbidden`.
   * **Implementation:**

     * Middleware checks JWT and fetches subscription status before allowing access.
     * For live streams: `GET /v1/streams/{stream_id}/live.m3u8` or `.mp3` enforces subscription if `monetization_enabled`.
     * For playlists: same for `GET /v1/playlists/{playlist_id}/stream.m3u8` or `.mp3`.
     * For podcast episodes: if `monetization_required` on `<item>`, require subscription to fetch `<enclosure>` URL (could be a time-limited signed URL).

4. **Ad Insertion Hooks**

   * **Endpoints:**

     * `POST /v1/monetization/ads` (create an ad template or configuration).
     * `PATCH /v1/streams/{stream_id}/ads` (assign ad markers or ad-break schedule).
   * **Request Body (Assign Ad Markers):**

     ```json
     {
       "ad_markers": [
         {
           "position_seconds": 300,           // at 5:00 into live stream
           "duration_seconds": 30,            // 30-second ad slot
           "ad_type": "pre-roll"              // "pre-roll", "mid-roll", "post-roll"
         },
         {
           "position_seconds": 1800,          // 30:00 into live stream
           "duration_seconds": 60,
           "ad_type": "mid-roll"
         }
       ]
     }
     ```
   * **Behavior:**

     * Relay Worker fetches ad-target content from ad server or uses preconfigured ad file.
     * During broadcasting, insert ad segments at specified positions by dynamically switching FFmpeg input.
   * **Response (200 OK):**

     ```json
     {
       "stream_id": "uuid-1234",
       "ad_markers": [
         {
           "position_seconds": 300,
           "duration_seconds": 30,
           "ad_type": "pre-roll"
         },
         {
           "position_seconds": 1800,
           "duration_seconds": 60,
           "ad_type": "mid-roll"
         }
       ]
     }
     ```
   * **Errors:**

     * `400 Bad Request`, `404 Not Found`.

---

### 4.6 Metadata & Analytics

1. **Live Stream Analytics**

   * **Endpoint:** `GET /v1/analytics/streams/{stream_id}`
   * **Query Parameters:** `?from=2025-06-01&to=2025-06-07`
   * **Response (200 OK):**

     ```json
     {
       "stream_id": "uuid-1234",
       "daily_listeners": [
         { "date": "2025-06-01", "listeners": 120 },
         { "date": "2025-06-02", "listeners": 98 }
         // …
       ],
       "peak_listeners": 250,
       "total_listens": 1500
     }
     ```
   * **Errors:**

     * `400 Bad Request` for invalid date range.

2. **Playlist Playback Analytics**

   * **Endpoint:** `GET /v1/analytics/playlists/{playlist_id}`
   * **Response (200 OK):**

     ```json
     {
       "playlist_id": "uuid-5678",
       "plays": [
         { "date": "2025-06-01", "play_count": 75 },
         { "date": "2025-06-02", "play_count": 80 }
         // …
       ],
       "total_plays": 500
     }
     ```
   * **Errors:**

     * `404 Not Found`.

3. **Podcast Download Analytics**

   * **Endpoint:** `GET /v1/analytics/podcasts/{podcast_id}`
   * **Response (200 OK):**

     ```json
     {
       "podcast_id": "uuid-9012",
       "daily_downloads": [
         { "date": "2025-06-01", "downloads": 45 },
         { "date": "2025-06-02", "downloads": 50 }
         // …
       ],
       "total_downloads": 350
     }
     ```
   * **Errors:**

     * `404 Not Found`.

4. **Custom Domain Verification & Status**

   * **Endpoint:** `GET /v1/domains/{domain_id}`
   * **Behavior:**

     * Return DNS verification status, TLS certificate status (pending/issued), and last check time.
   * **Response (200 OK):**

     ```json
     {
       "domain_id": "uuid-domain-3003",
       "custom_domain": "podcast.djname.com",
       "verification_status": "verified", // "pending" or "failed"
       "tls_status": "issued"           // "pending" or "failed"
     }
     ```
   * **Errors:**

     * `404 Not Found`.

---

## 5. Data Model & Database Schema

Below is a high-level Entity-Relationship overview. Use PostgreSQL with JSONB for flexible fields.

```text
+----------------+           +---------------------+           +----------------+
|     users      | 1       * |       streams       | 1       * |  analytics     |
|----------------|           |---------------------|           |----------------|
| user_id (PK)   |           | stream_id (PK)      |           | analytics_id PK|
| email          |           | user_id (FK → users)|           | resource_type  |
| password_hash  |           | name                |           | resource_id    |
| name           |           | shoutcast_url       |           | date           |
| role           |           | mount               |           | metric         |
| created_at     |           | stream_key (enc)    |           | value          |
|                |           | genre               |           +----------------+
|                |           | description         |
+----------------+           | visibility ("public"/ "private") |
                             | monetization_enabled (bool)       |
                             | enabled (bool)                     |
                             | created_at                         |
                             +---------------------+

+----------------+           +---------------------+           +-------------------+
|   playlists    |           |      tracks         |           | playlist_plays    |
|----------------| 1       * |---------------------| 1       * |-------------------|
| playlist_id PK |           | track_id (PK)       |           | analytics_id PK   |
| user_id (FK)   |           | playlist_id (FK)    |           | playlist_id FK    |
| title          |           | source_type         |           | date              |
| description    |           | upload_id (nullable)|           | play_count        |
| visibility     |           | url (if external)   |           +-------------------+
| monetization_enabled (bool)|title               |
| created_at     |           | artist              | 
+----------------+           | duration_seconds    |
                             | created_at          |
                             +---------------------+

+----------------+           +---------------------+           +-------------------+
|   podcasts     |           |     episodes        |           | podcast_downloads |
|----------------| 1       * |---------------------| 1       * |-------------------|
| podcast_id PK  |           | episode_id (PK)     |           | analytics_id PK   |
| user_id (FK)   |           | podcast_id (FK)     |           | podcast_id FK     |
| title          |           | source_type         |           | date              |
| description    |           | upload_id (nullable)|           | downloads         |
| language       |           | media_url (if ext)  |           +-------------------+
| author         |           | duration_seconds    |
| image_url      |           | publication_date    |
| explicit (bool)|           | episode_number      |
| custom_domain  |           | monetization_required (bool) |
| monetization_enabled (bool)| explicit (bool)     |
| created_at     |           | created_at          |
+----------------+           +---------------------+

+-----------------+           +----------------+
|     uploads     | 1       1 | HLS_Segments   |
|-----------------|           |----------------|
| upload_id (PK)  |           | segment_id (PK)|
| user_id (FK)    |           | upload_id (FK) |
| file_path       |           | sequence_index |
| status ("ready","processing","failed") | ts_path     |
| error_message   |           | created_at     |
| created_at      |           +----------------+
+-----------------+

+----------------------+           +----------------------+
|   monetization_plans | 1       * |     subscriptions    |
|----------------------|           |----------------------|
| plan_id (PK)         |           | subscription_id (PK) |
| name                 |           | plan_id (FK)         |
| stripe_product_id    |           | user_id (FK)         |
| stripe_price_id      |           | stripe_subscription_id|
| price_cents          |           | status ("active"/… ) |
| currency             |           | created_at           |
| billing_interval     |           | expires_at           |
| features (JSONB)     |           +----------------------+
| created_at           |
+----------------------+

+------------------+
|     domains      |
|------------------|
| domain_id (PK)   |
| user_id (FK)     |
| custom_domain    |
| verification_status ("pending","verified","failed")|
| tls_status ("pending","issued","failed")|
| created_at       |
+------------------+
```

**Key Tables & Fields**

* **users**

  * `user_id` (UUID, PK)
  * `email` (string, unique)
  * `password_hash` (string)
  * `name` (string)
  * `role` (enum: `dj`, `admin`)
  * `created_at` (timestamp)

* **streams**

  * `stream_id` (UUID, PK)
  * `user_id` (FK → users)
  * `name` (string)
  * `shoutcast_url` (string)
  * `mount` (string)
  * `stream_key` (encrypted string)
  * `genre` (string)
  * `description` (text)
  * `visibility` (enum: `public`, `private`)
  * `monetization_enabled` (boolean)
  * `enabled` (boolean)
  * `created_at` (timestamp)

* **playlists**

  * `playlist_id` (UUID, PK)
  * `user_id` (FK → users)
  * `title` (string)
  * `description` (text)
  * `visibility` (enum: `public`, `private`)
  * `monetization_enabled` (boolean)
  * `created_at` (timestamp)

* **tracks**

  * `track_id` (UUID, PK)
  * `playlist_id` (FK → playlists)
  * `source_type` (enum: `upload`, `external`)
  * `upload_id` (UUID, FK → uploads, nullable)
  * `url` (string, if `external`)
  * `title` (string)
  * `artist` (string)
  * `duration_seconds` (integer)
  * `created_at` (timestamp)

* **podcasts**

  * `podcast_id` (UUID, PK)
  * `user_id` (FK → users)
  * `title` (string)
  * `description` (text)
  * `language` (string)
  * `author` (string)
  * `image_url` (string)
  * `explicit` (boolean)
  * `custom_domain` (string)
  * `monetization_enabled` (boolean)
  * `created_at` (timestamp)

* **episodes**

  * `episode_id` (UUID, PK)
  * `podcast_id` (FK → podcasts)
  * `source_type` (enum: `upload`, `external`)
  * `upload_id` (UUID, FK → uploads, nullable)
  * `media_url` (string, if `external`)
  * `title` (string)
  * `description` (text)
  * `duration_seconds` (integer)
  * `publication_date` (timestamp)
  * `episode_number` (integer)
  * `explicit` (boolean)
  * `monetization_required` (boolean)
  * `created_at` (timestamp)

* **uploads**

  * `upload_id` (UUID, PK)
  * `user_id` (FK → users)
  * `file_path` (string, S3 object key)
  * `status` (enum: `processing`, `ready`, `failed`)
  * `error_message` (text, nullable)
  * `created_at` (timestamp)

* **HLS\_Segments**

  * `segment_id` (UUID, PK)
  * `upload_id` (FK → uploads)
  * `sequence_index` (integer)
  * `ts_path` (string, S3 object key to TS file)
  * `created_at` (timestamp)

* **monetization\_plans**

  * `plan_id` (UUID, PK)
  * `name` (string)
  * `stripe_product_id` (string)
  * `stripe_price_id` (string)
  * `price_cents` (integer)
  * `currency` (string)
  * `billing_interval` (enum: `monthly`, `yearly`)
  * `features` (JSONB, array of strings)
  * `created_at` (timestamp)

* **subscriptions**

  * `subscription_id` (UUID, PK)
  * `plan_id` (FK → monetization\_plans)
  * `user_id` (FK → users)
  * `stripe_subscription_id` (string)
  * `status` (enum: `active`, `past_due`, `canceled`)
  * `created_at` (timestamp)
  * `expires_at` (timestamp)

* **domains**

  * `domain_id` (UUID, PK)
  * `user_id` (FK → users)
  * `custom_domain` (string, unique)
  * `verification_status` (enum: `pending`, `verified`, `failed`)
  * `tls_status` (enum: `pending`, `issued`, `failed`)
  * `created_at` (timestamp)

* **analytics**

  * `analytics_id` (UUID, PK)
  * `resource_type` (enum: `stream`, `playlist`, `podcast`)
  * `resource_id` (UUID)
  * `date` (date)
  * `metric` (string, e.g., `listeners`, `plays`, `downloads`)
  * `value` (integer)
  * `created_at` (timestamp)

---

## 6. API Endpoint Summary

### 6.1 Authentication

| Method | Endpoint                  | Description                               |
| ------ | ------------------------- | ----------------------------------------- |
| POST   | `/v1/auth/login`          | Obtain JWT & Refresh Token                |
| POST   | `/v1/auth/refresh`        | Refresh JWT                               |
| POST   | `/v1/auth/register`       | Create new DJ account (optional)          |
| PUT    | `/v1/auth/password-reset` | Request/perform password reset (optional) |

---

### 6.2 Live Streaming (Shoutcast Relay)

| Method | Endpoint                            | Description                                            |
| ------ | ----------------------------------- | ------------------------------------------------------ |
| POST   | `/v1/streams`                       | Register a new Shoutcast source & start relay worker   |
| PATCH  | `/v1/streams/{stream_id}`           | Update stream metadata (`enabled`, `visibility`, etc.) |
| DELETE | `/v1/streams/{stream_id}`           | Unregister stream & terminate relay worker             |
| GET    | `/v1/streams/{stream_id}/status`    | Fetch live metadata (current track, listener count)    |
| GET    | `/v1/streams/{stream_id}/live.m3u8` | Serve HLS manifest (relay) to listeners                |
| GET    | `/v1/streams/{stream_id}/live.mp3`  | Serve continuous MP3 relay stream to listeners         |

---

### 6.3 Audio File Uploads

| Method | Endpoint                        | Description                                    |
| ------ | ------------------------------- | ---------------------------------------------- |
| POST   | `/v1/uploads/audio`             | Upload an audio file (MP3) for HLS transcoding |
| GET    | `/v1/uploads/audio/{upload_id}` | Check upload & HLS segment status              |

---

### 6.4 Playlists (On-Demand)

| Method | Endpoint                                  | Description                                       |
| ------ | ----------------------------------------- | ------------------------------------------------- |
| POST   | `/v1/playlists`                           | Create a new playlist (supports uploads/external) |
| GET    | `/v1/playlists/{playlist_id}`             | Retrieve playlist metadata                        |
| PUT    | `/v1/playlists/{playlist_id}`             | Replace playlist tracks & metadata                |
| DELETE | `/v1/playlists/{playlist_id}`             | Delete playlist                                   |
| GET    | `/v1/playlists/{playlist_id}/stream.m3u8` | Serve HLS manifest for on-demand streaming        |
| GET    | `/v1/playlists/{playlist_id}/stream.mp3`  | Serve direct MP3 concatenated stream              |

---

### 6.5 Podcasts & RSS (Custom Domains)

| Method | Endpoint                                                                           | Description                               |
| ------ | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| POST   | `/v1/podcasts`                                                                     | Create new Podcast series + custom domain |
| GET    | `/v1/podcasts/{podcast_id}`                                                        | Retrieve podcast metadata (JSON)          |
| PATCH  | `/v1/podcasts/{podcast_id}`                                                        | Update podcast metadata                   |
| DELETE | `/v1/podcasts/{podcast_id}`                                                        | Delete podcast series & all episodes      |
| POST   | `/v1/podcasts/{podcast_id}/episodes`                                               | Add new episode (upload/external)         |
| PATCH  | `/v1/podcasts/{podcast_id}/episodes/{episode_id}`                                  | Update episode metadata                   |
| DELETE | `/v1/podcasts/{podcast_id}/episodes/{episode_id}`                                  | Delete episode (removes from RSS)         |
| GET    | `https://{custom_domain}/rss.xml` <br> OR <br> `/v1/podcasts/{podcast_id}/rss.xml` | Serve public RSS 2.0 XML feed             |

---

### 6.6 Monetization & Ads

| Method | Endpoint                                  | Description                                      |
| ------ | ----------------------------------------- | ------------------------------------------------ |
| POST   | `/v1/monetization/plans`                  | Create subscription plan (integrate with Stripe) |
| POST   | `/v1/monetization/subscriptions`          | Subscribe to a plan (integrate with Stripe)      |
| GET    | `/v1/monetization/plans/{plan_id}`        | Retrieve plan details                            |
| GET    | `/v1/monetization/subscriptions/{sub_id}` | Retrieve subscription status                     |
| POST   | `/v1/streams/{stream_id}/ads`             | Assign ad markers for live streams               |
| POST   | `/v1/playlists/{playlist_id}/ads`         | Assign ad markers for on-demand playlists        |

---

### 6.7 Custom Domain Management

| Method | Endpoint                  | Description                                       |
| ------ | ------------------------- | ------------------------------------------------- |
| POST   | `/v1/domains`             | Register a custom domain for podcasts or streams  |
| GET    | `/v1/domains/{domain_id}` | Retrieve domain verification & TLS status         |
| DELETE | `/v1/domains/{domain_id}` | Unlink custom domain (revert to default endpoint) |

---

### 6.8 Analytics

| Method | Endpoint                                | Description                                   |
| ------ | --------------------------------------- | --------------------------------------------- |
| GET    | `/v1/analytics/streams/{stream_id}`     | Fetch live stream listener stats (date range) |
| GET    | `/v1/analytics/playlists/{playlist_id}` | Fetch playlist play stats (date-wise)         |
| GET    | `/v1/analytics/podcasts/{podcast_id}`   | Fetch podcast download stats (date-wise)      |

---

## 7. Non-Functional Requirements

### 7.1 Technology Stack Recommendations

* **API Server:**

  * Node.js + Express (TypeScript) or Python + FastAPI (async) for REST endpoints.
  * Integration with a relational DB driver (e.g., `pg` for Node.js, `asyncpg` for Python).
* **Relay Workers:**

  * Containerized service running FFmpeg to transcode Shoutcast feeds into HLS segments (TS) and handle continuous MP3 piping.
  * Use Docker images with FFmpeg pre-installed; orchestrate via Kubernetes Jobs or Deployments with auto-scaling.
* **Database:**

  * PostgreSQL (Amazon RDS/Aurora, GCP Cloud SQL, or Azure Database).
  * Use JSONB fields for flexible metadata (e.g., `features` in monetization\_plans).
* **Object Storage:**

  * AWS S3 (or equivalent) for storing uploaded audio, HLS segments, and static assets.
  * Configure bucket with proper CORS and lifecycle policies (expire old HLS segments).
* **CDN:**

  * AWS CloudFront (or equivalent) to cache and serve HLS manifests, TS segments, MP3 files, and RSS feeds.
  * Configure cache invalidation hooks when playlists or podcasts update.
* **Authentication:**

  * JWT (RS256) via custom implementation or Auth0.
  * Refresh token flow and secure storage.
* **Container Orchestration:**

  * Kubernetes (EKS/GKE/AKS) for API pods, Relay Worker pods, and background jobs.
  * Use Horizontal Pod Autoscaler (HPA) to scale relay workers based on CPU or custom metrics (listener count).
* **Payment Provider:**

  * Stripe for subscription management, payments, and billing.
  * Webhooks to handle subscription status updates.
* **Monitoring & Logging:**

  * Prometheus + Grafana for metrics (request rate, latency, listener counts, worker health).
  * ELK stack (Elasticsearch, Logstash, Kibana) or Datadog for structured logs.
  * Alertmanager / PagerDuty integration for critical alerts (no heartbeat, high error rates, low resource availability).

---

### 7.2 Scalability & Performance

1. **Relay Worker Autoscaling**

   * Each live stream spawns one Relay Worker Pod.
   * Use HPA based on CPU and network throughput (e.g., scale up if >80% CPU or listener connections > 5,000 per pod).
   * If a stream becomes inactive (`enabled: false` or no listeners for >10 minutes), auto-scale down or terminate the pod.

2. **HLS Manifest & Segment Caching**

   * Short TTL (30 s) for HLS manifests; longer TTL (60 s) for TS segments.
   * CDN edge caching to serve most requests without hitting origin API.

3. **MP3 Proxy Optimization**

   * Use HTTP chunked transfer encoding to minimize listener buffering.
   * Multiple listeners connect directly to Relay Worker Pod; scale horizontally to handle load.

4. **Database Connection Pooling**

   * Use PgBouncer for PostgreSQL to limit concurrent connections (e.g., max 100).
   * Cache frequently accessed metadata (stream configs, playlist metadata) in Redis.

5. **File Upload & Transcoding**

   * Offload transcoding tasks to background workers (e.g., separate Kubernetes Jobs) to avoid blocking API threads.
   * Limit concurrent transcoding jobs per node based on CPU capacity.

---

### 7.3 Availability & Reliability

1. **High Availability**

   * Deploy API servers across multiple AZs.
   * Use a load balancer (AWS ALB, GCP Cloud Load Balancer) with health checks (`/v1/health`).
   * PostgreSQL in multi-AZ with automatic failover.

2. **Data Durability & Backups**

   * Automated daily backups of PostgreSQL; retain backups for 30 days.
   * S3 versioning enabled for uploaded audio files; lifecycle policy to remove old versions after 60 days.

3. **Failover & Recovery**

   * If a Relay Worker Pod crashes, a new one is automatically spun up by Kubernetes (liveness/readiness probes).
   * If a Shoutcast source is unreachable for >2 minutes, mark stream as offline, notify DJ via email alert, retry connection with exponential backoff.

4. **Disaster Recovery**

   * Monthly restore drills for DB and S3.
   * Maintain Infrastructure as Code (Terraform/Helm) to recreate clusters in a new region if needed.

---

### 7.4 Security & Compliance

1. **Transport Security**

   * Enforce TLS 1.2+ for all API and TLS-terminated endpoints.
   * Use HSTS with `max-age=31536000; includeSubDomains`.

2. **Encryption**

   * Encrypt `stream_key`, `stripe_*` secrets, and any other credentials at rest via AWS KMS or HashiCorp Vault.
   * Enable SSL/TLS for PostgreSQL connections.

3. **Authentication & Authorization**

   * Use JWT (RS256).
   * Short-lived access tokens (24 h), rotating refresh tokens.
   * Validate scopes on every request to protected endpoints.
   * Access control middleware: enforce resource ownership for write operations.

4. **Input Validation & Sanitization**

   * Use JSON Schema or Pydantic (Python) / Joi (Node.js) for request body validation.
   * Parameterized queries or ORM (e.g., Sequelize, SQLAlchemy) to prevent SQL injection.
   * Sanitize all metadata fields to prevent XSS.

5. **Rate Limiting & Abuse Prevention**

   * API-level rate limit: 100 requests/min per user for metadata endpoints, 10 requests/min for write endpoints.
   * Public streaming endpoints (HLS, MP3, RSS) limited to 10,000 requests/min per IP; return `429 Too Many Requests` on excess.
   * CAPTCHA challenge for suspicious repeated failed login attempts.

6. **CORS**

   * Restrict CORS to whitelisted domains specified per DJ (e.g., `dashboard.djsite.com`, `embed.djsite.com`).
   * Reject requests from unauthorized origins.

7. **GDPR & Data Privacy**

   * Provide `DELETE /v1/users/{user_id}` endpoint to remove all PII and content; implement soft-delete for 30 days before permanent purge.
   * Allow DJs to export their data (streams, playlists, podcasts, analytics) via a single request; API generates a downloadable ZIP with JSON exports.
   * Anonymize analytics older than two years; purge raw logs after 90 days.

8. **Vulnerability Scanning & Penetration Testing**

   * Automated dependency scanning (Snyk, Dependabot) on every commit.
   * Quarterly penetration testing on staging environment.
   * Monitor CVEs for all third-party libraries.

---

### 7.5 Monitoring & Logging

1. **Structured Logging**

   * All API requests/responses and errors logged in JSON format (timestamp, request ID, path, status, latency).
   * Relay Worker logs (info, warning, error) forwarded via Fluentd/Logstash to Elasticsearch or Datadog.
   * Log retention: 90 days for hot logs, archived for 1 year.

2. **Metrics & Alerts**

   * Expose Prometheus metrics:

     * **API servers:** HTTP request rate, error rate (4xx/5xx), latency histograms, active connections.
     * **Relay Workers:** CPU usage, memory usage, current listener count, HLS segment generation latency.
   * Set up Grafana dashboards for real-time monitoring:

     * Live listener heatmap, overall concurrent listeners.
     * Playlist usage charts, podcast download charts.
   * Alertmanager rules:

     * **High 5xx rate** (>1% of requests over 5 minutes).
     * **Relay Worker offline** (no heartbeat in 2 minutes).
     * **High CPU** (>80% for >5 minutes).
     * **Database connection saturation** (>90% usage).

3. **Health Checks & Heartbeats**

   * **API Health Endpoint:** `GET /v1/health` → returns `{ "status": "ok" }`.
   * **Relay Worker Heartbeat:** Each Relay Worker Pod POSTs to `/v1/streams/{stream_id}/heartbeat` every 30 seconds.
   * If no heartbeat for >2 minutes, mark Relay Worker as unhealthy, send alert, and attempt restart.

---

## 8. Technical Architecture & Integration

### 8.1 High-Level Architecture Diagram

```
                                          +----------------------+
                                          |     User Devices     |
                                          | (Web, Mobile, Smart  |
                                          |  Speakers, Podcast   |
                                          |  Apps)               |
                                          +----------+-----------+
                                                     |
                                               (HTTPS/HLS/MP3/RSS)
                                                     |
+----------------------+              +--------------v--------------+
|  DJ Dashboard /      |              |  API Gateway / Load Balancer |
|  Third-Party Apps    | <----------> | (AWS ALB / GCP LB)           |
+----------------------+              +--------------+--------------+
                                              |     |     |
                    +-------------------------+     |     +-------------------------+
                    |                               |                               |
            +-------v-------+               +-------v-------+               +-------v-------+
            |   API Server  |               | Relay Worker  |               | Auth Service   |
            | (Node.js/FastAPI) |            |  (Kubernetes  |               | (JWT, Stripe) |
            +-------+-------+               |   Pod w/ FFmpeg)|            +-------+-------+
                    |                       +---------------+                  |
                    |                              | (Live HLS/MP3 Streams)   |
                    |                              v                          |
                    |                       +--------------+                 |
                    |                       | CDN (CloudFront) | <-----------+
                    |                       +------+---------+
                    |                              |
                    |                      (Serve HLS, TS, MP3, RSS)
                    |                              |
            +-------v-------+               +------+---------+
            |    PostgreSQL  |               |   S3 / Storage  |
            |  (RDS/Aurora)  |               | (Audio, HLS,    |
            +---------------+                |  RSS, Assets)   |
                                              +----------------+
```

### 8.2 Component Responsibilities

1. **DJ Dashboard / Third-Party Apps**

   * Interfaces that call API to register streams, upload audio, configure podcasts, customize monetization, assign ad markers, and view analytics.

2. **API Gateway / Load Balancer**

   * SSL/TLS termination, basic rate limiting, routing requests to API servers.
   * Enforce WAF rules to block malicious traffic.

3. **API Server (Node.js + Express or Python + FastAPI)**

   * Expose all RESTful endpoints under `/v1/`.
   * Authenticate/authorize requests (JWT, scopes).
   * Validate inputs, orchestrate background jobs (via message queue/Kubernetes Jobs).
   * Store/retrieve metadata in PostgreSQL.
   * Manage DNS/TLS provisioning for custom domains using ACM (AWS) or Let’s Encrypt.
   * Generate and serve RSS XML (caching at CDN).
   * Provide file-upload endpoints (multipart handling), enqueue transcoding jobs.

4. **Relay Worker (Container with FFmpeg)**

   * Connects to Shoutcast source (ingest).
   * Uses FFmpeg to:

     * Segment live feed into TS chunks (e.g., 6 s each).
     * Generate or update HLS manifest (`live.m3u8`).
     * Serve continuous MP3 proxy stream.
   * Monitor listener connections and report back (heartbeat).
   * Insert ads at configured positions (pause main feed, play ad segment, resume main feed).
   * For on-demand playlists, retrieve pre-encoded HLS segments from S3 or transcode on demand if not pre-generated.

5. **Auth Service**

   * Issue and validate JWT tokens.
   * Manage refresh tokens and handle password resets.
   * Integrate with Stripe for subscription creation and status updates via webhooks.

6. **PostgreSQL (RDS/Aurora)**

   * Store all metadata: users, streams, playlists, podcasts, episodes, uploads, monetization plans, subscriptions, domains, and analytics counters.
   * Use JSONB columns for flexible schema (e.g., `features` in `monetization_plans`).

7. **S3 (Object Storage)**

   * Store uploaded audio files, HLS TS segments, podcast cover images, and any generated HLS manifests for on-demand playlists.
   * Implement lifecycle policies:

     * Remove TS segments older than 24 hours for live streams.
     * Retain on-demand HLS segments for 30 days or as configured.

8. **CDN (CloudFront or Equivalent)**

   * Cache and serve:

     * Live HLS manifests (`.m3u8`).
     * TS segment files (`.ts`).
     * MP3 endpoints.
     * Podcast RSS feeds (`.xml`).
     * Static assets (cover images).
   * Configure cache invalidation hooks for:

     * Playlist updates.
     * Podcast RSS regeneration.
     * Upload status changes.

9. **Monitoring & Logging**

   * Prometheus scrapes metrics from API servers and Relay Workers.
   * Grafana dashboards visualize real-time metrics (listener counts, CPU/RAM usage, request latency).
   * ELK stack (or Datadog) ingests structured logs from API servers and workers.
   * Alertmanager triggers notifications for critical conditions (no relay heartbeat, high error rates, low resource availability).

---

## 9. Detailed API Specifications

> **Note:** All `/v1/` endpoints require `Authorization: Bearer <JWT>` header unless marked public.

### 9.1 Authentication Endpoints

#### 9.1.1 `POST /v1/auth/register`

* **Description:** Create a new DJ account.
* **Request Body (application/json):**

  ```json
  {
    "email": "dj@example.com",
    "password": "SecurePass123!",
    "name": "DJ Example"
  }
  ```
* **Response (201 Created):**

  ```json
  {
    "user_id": "uuid-user-0001",
    "email": "dj@example.com",
    "role": "dj"
  }
  ```
* **Errors:**

  * `400 Bad Request` if email/password invalid or missing.

#### 9.1.2 `POST /v1/auth/login`

* **Description:** Authenticate DJ & return JWT + refresh token.
* **Request Body:**

  ```json
  {
    "email": "dj@example.com",
    "password": "SecurePass123!"
  }
  ```
* **Response (200 OK):**

  ```json
  {
    "access_token": "<JWT_TOKEN>",
    "refresh_token": "<REFRESH_TOKEN>",
    "expires_in": 86400
  }
  ```
* **Errors:**

  * `401 Unauthorized` if credentials invalid.

#### 9.1.3 `POST /v1/auth/refresh`

* **Description:** Refresh JWT.
* **Request Body:**

  ```json
  {
    "refresh_token": "<REFRESH_TOKEN>"
  }
  ```
* **Response (200 OK):**

  ```json
  {
    "access_token": "<NEW_JWT>",
    "expires_in": 86400
  }
  ```
* **Errors:**

  * `401 Unauthorized` if refresh token invalid or expired.

#### 9.1.4 `PUT /v1/auth/password-reset`

* **Description:** Request password reset link or submit new password.
* **Request Body (option 1 – request):**

  ```json
  {
    "email": "dj@example.com"
  }
  ```
* **Behavior (Option 1):** Send email with reset token.
* **Request Body (option 2 – submit new password):**

  ```json
  {
    "reset_token": "<TOKEN_FROM_EMAIL>",
    "new_password": "NewSecurePass!"
  }
  ```
* **Response (200 OK):**

  ```json
  {
    "message": "Password updated successfully."
  }
  ```
* **Errors:**

  * `400 Bad Request`, `401 Unauthorized`.

---

### 9.2 Live Streaming (Shoutcast Relay)

#### 9.2.1 `POST /v1/streams`

* **Description:** Register a Shoutcast source and start relay.

* **Authentication:** Requires scope `streams:write`.

* **Request Body (application/json):**

  ```json
  {
    "name": "Friday Night DJ Set",
    "shoutcast_url": "http://djshoutcast.example.com:8000",
    "mount": "/live",
    "stream_key": "DJ_STREAM_KEY",
    "genre": "House",
    "description": "Weekly house mix",
    "visibility": "public",       
    "monetization_enabled": true  
  }
  ```

* **Validation:**

  * Ensure `shoutcast_url` is valid and reachable.
  * Attempt a HEAD or GET to `http://djshoutcast.example.com:8000/admin.cgi?mode=viewxml&pass=DJ_STREAM_KEY`.

* **Behavior:**

  * Insert record into `streams` table.
  * Spin up a Relay Worker Pod:

    * Connect to Shoutcast source.
    * Begin HLS segmentation via FFmpeg (e.g., `ffmpeg -i http://... -codec: copy -hls_time 6 -hls_list_size 3 -hls_flags delete_segments...`).
    * Serve TS segments to S3 or local storage, generate `live.m3u8`.
    * Proxy continuous MP3 to `/live.mp3`.
    * Send heartbeat to API every 30 s with listener count.

* **Response (201 Created):**

  ```json
  {
    "stream_id": "uuid-1234",
    "status": "registered"
  }
  ```

* **Errors:**

  * `400 Bad Request` for missing fields.
  * `422 Unprocessable Entity` if Shoutcast source validation fails.

#### 9.2.2 `GET /v1/streams/{stream_id}/status`

* **Description:** Fetch real-time metadata for a live stream.

* **Authentication:** If `visibility == "private"`, require `streams:read` scope; if `monetization_enabled: true`, also verify user has an active subscription. Otherwise public.

* **Path Parameters:**

  * `stream_id`: UUID (stream to query).

* **Behavior:**

  * Query Shoutcast admin for `current_track`, `bitrate`.
  * Query Relay Worker for `listeners`, `uptime`, `relay_connected`.

* **Response (200 OK):**

  ```json
  {
    "stream_id": "uuid-1234",
    "name": "Friday Night DJ Set",
    "current_track": "DJ Snake – Frequency",
    "bitrate": "128kbps",
    "listeners": 125,
    "uptime": "2h 14m",
    "relay_connected": true
  }
  ```

* **Errors:**

  * `404 Not Found`, `503 Service Unavailable`.

#### 9.2.3 `PATCH /v1/streams/{stream_id}`

* **Description:** Update live stream configuration (e.g., disable, change visibility, update monetization).
* **Authentication:** Owner (`streams:write`).
* **Path Parameters:**

  * `stream_id`: UUID.
* **Request Body (application/json):**

  ```json
  {
    "name": "Weekend DJ Set",
    "genre": "Techno",
    "description": "Updated description",
    "visibility": "private",
    "monetization_enabled": false,
    "enabled": false
  }
  ```
* **Behavior:**

  * Update fields in DB.
  * If `enabled: false`, instruct Relay Worker to stop accepting new connections.
  * If `monetization_enabled` toggles, update Relay Worker’s paywall settings.
* **Response (200 OK):**

  ```json
  {
    "stream_id": "uuid-1234",
    "updated_fields": ["visibility", "monetization_enabled", "enabled"]
  }
  ```
* **Errors:**

  * `400 Bad Request`, `404 Not Found`.

#### 9.2.4 `DELETE /v1/streams/{stream_id}`

* **Description:** Unregister a Shoutcast source and terminate its Relay Worker.
* **Authentication:** Owner (`streams:write`).
* **Path Parameters:**

  * `stream_id`: UUID.
* **Behavior:**

  * Terminate Relay Worker Pod.
  * Soft-delete `streams` record (set `deleted_at` timestamp).
  * Invalidate cached HLS manifest and MP3 streams on CDN.
* **Response (204 No Content)**
* **Errors:**

  * `404 Not Found`.

#### 9.2.5 `GET /v1/streams/{stream_id}/live.m3u8`

* **Description:** Serve HLS manifest for live streaming.
* **Authentication:**

  * If `visibility == "private"`, require JWT with `streams:read` and active subscription if `monetization_enabled`.
  * If `visibility == "public"`, no authentication required.
* **Path Parameters:**

  * `stream_id`: UUID.
* **Behavior:**

  * Relay Worker continuously updates `live.m3u8` in S3 or a local persistent volume.
  * CDN caches manifest (TTL=30 s).
  * API returns the manifest, which lists TS segment URLs (e.g., `https://cdn.example.com/streams/{stream_id}/segment####.ts`).
* **Response (200 OK, `application/vnd.apple.mpegurl`):** HLS manifest.
* **Errors:**

  * `403 Forbidden` if unauthorized.
  * `404 Not Found`.

#### 9.2.6 `GET /v1/streams/{stream_id}/live.mp3`

* **Description:** Serve continuous MP3 stream for live audio.
* **Authentication:** Same rules as HLS manifest.
* **Path Parameters:**

  * `stream_id`: UUID.
* **Behavior:** Relay Worker proxies raw MP3 feed from Shoutcast to client.
* **Response (200 OK, `audio/mpeg`):** Continuous MP3.
* **Errors:**

  * `403 Forbidden`, `404 Not Found`.

---

### 9.3 Audio File Uploads

#### 9.3.1 `POST /v1/uploads/audio`

* **Description:** Upload an MP3 file for playlist or podcast use.
* **Authentication:** Requires `playlists:write` or `podcasts:write`.
* **Request:** `Content-Type: multipart/form-data; boundary=---XYZ`

  * Form field `file`: MP3 file.
  * Optional form fields: `title` (string), `artist` (string).
* **Behavior:**

  * Validate file type (`audio/mpeg`).
  * Store file in S3 under `/uploads/audio/{user_id}/{upload_id}/{original_filename}`.
  * Insert `uploads` record in DB with status `processing`.
  * Trigger background transcoding job to:

    1. Generate HLS TS segments (e.g., 10 s each) and upload to S3 under `/uploads/audio/{upload_id}/hls/segment####.ts`.
    2. Create `manifest.m3u8` in `/uploads/audio/{upload_id}/hls/manifest.m3u8`.
    3. Update `uploads.status` to `ready` or `failed`.
  * If provided, associate `title` and `artist` metadata with the upload.
* **Response (201 Created):**

  ```json
  {
    "upload_id": "uuid-upload-0001",
    "storage_url": "s3://bucket/uploads/audio/{user_id}/uuid-upload-0001/original.mp3",
    "hls_manifest_url": "https://api.example.com/v1/uploads/audio/uuid-upload-0001/hls/manifest.m3u8",
    "status": "processing"
  }
  ```
* **Errors:**

  * `400 Bad Request` if no file or invalid MIME type.
  * `413 Payload Too Large` if file >100 MB.

#### 9.3.2 `GET /v1/uploads/audio/{upload_id}`

* **Description:** Check upload & HLS generation status.
* **Authentication:** Owner of `upload_id`.
* **Path Parameters:**

  * `upload_id`: UUID.
* **Response (200 OK):**

  ```json
  {
    "upload_id": "uuid-upload-0001",
    "storage_url": "s3://bucket/uploads/audio/{user_id}/uuid-upload-0001/original.mp3",
    "hls_manifest_url": "https://api.example.com/v1/uploads/audio/uuid-upload-0001/hls/manifest.m3u8",
    "status": "ready",          // "processing" | "ready" | "failed"
    "error_message": null
  }
  ```
* **Errors:**

  * `404 Not Found`.

---

### 9.4 Playlist Endpoints

#### 9.4.1 `POST /v1/playlists`

* **Description:** Create a new on-demand playlist (tracks from uploads or external URLs).
* **Authentication:** Requires `playlists:write`.
* **Request Body (application/json):**

  ```json
  {
    "title": "Chill Evening Vibes",
    "description": "Smooth tracks for an evening stream.",
    "tracks": [
      {
        "source_type": "upload",
        "upload_id": "uuid-upload-0001",
        "title": "Track One",
        "artist": "Artist A",
        "duration_seconds": 180
      },
      {
        "source_type": "external",
        "url": "https://cdn.example.com/audio/track2.mp3",
        "title": "Track Two",
        "artist": "Artist B",
        "duration_seconds": 240
      }
    ],
    "visibility": "public",
    "monetization_enabled": false
  }
  ```
* **Validation:**

  * For `upload_id`, check `uploads.status == "ready"`.
  * For `external`, HTTP HEAD must return `200 OK` with `Content-Type: audio/mpeg`.
  * `visibility` ∈ {`public`, `private`}.
  * `monetization_enabled` ∈ {`true`, `false`}.
* **Behavior:**

  * Insert playlist record in DB.
  * Insert track records under that playlist, referencing either `uploads.upload_id` or `url`.
  * If all tracks have `source_type == "upload"` and HLS is ready, pre-generate HLS manifest by concatenating those HLS sub-manifests or generating a unified manifest.
  * If not fully HLS-ready, mark for on-the-fly HLS generation on first listener request.
* **Response (201 Created):**

  ```json
  {
    "playlist_id": "uuid-5678",
    "stream_urls": {
      "hls": "https://api.example.com/v1/playlists/uuid-5678/stream.m3u8",
      "mp3": "https://api.example.com/v1/playlists/uuid-5678/stream.mp3"
    }
  }
  ```
* **Errors:**

  * `400 Bad Request`, `422 Unprocessable Entity` if any track invalid.

#### 9.4.2 `GET /v1/playlists/{playlist_id}`

* **Description:** Retrieve playlist metadata and track list.
* **Authentication:**

  * If `visibility == "private"`, require JWT with `playlists:read` and active subscription if `monetization_enabled`.
  * If `visibility == "public"`, no authentication.
* **Path Parameters:**

  * `playlist_id`: UUID.
* **Response (200 OK):**

  ```json
  {
    "playlist_id": "uuid-5678",
    "title": "Chill Evening Vibes",
    "description": "Smooth tracks for an evening stream.",
    "tracks": [
      {
        "track_id": "uuid-trk-1",
        "source_type": "upload",
        "upload_id": "uuid-upload-0001",
        "title": "Track One",
        "artist": "Artist A",
        "duration_seconds": 180
      },
      {
        "track_id": "uuid-trk-2",
        "source_type": "external",
        "url": "https://cdn.example.com/audio/track2.mp3",
        "title": "Track Two",
        "artist": "Artist B",
        "duration_seconds": 240
      }
    ],
    "visibility": "public",
    "monetization_enabled": false
  }
  ```
* **Errors:**

  * `403 Forbidden`, `404 Not Found`.

#### 9.4.3 `PUT /v1/playlists/{playlist_id}`

* **Description:** Replace entire playlist (tracks & metadata).
* **Authentication:** Owner of playlist (`playlists:write`).
* **Request Body:** Same as creation schema.
* **Behavior:**

  * Validate all tracks (uploads or external).
  * Update playlist record and track records.
  * Regenerate HLS manifest and invalidate cache.
* **Response (200 OK):**

  ```json
  {
    "playlist_id": "uuid-5678",
    "updated": true
  }
  ```
* **Errors:**

  * `400 Bad Request`, `404 Not Found`.

#### 9.4.4 `DELETE /v1/playlists/{playlist_id}`

* **Description:** Delete playlist.
* **Authentication:** Owner of playlist (`playlists:write`).
* **Behavior:**

  * Soft-delete playlist record; delete associated track records.
  * Invalidate cached HLS and MP3 endpoints on CDN.
* **Response (204 No Content)**
* **Errors:**

  * `404 Not Found`.

#### 9.4.5 `GET /v1/playlists/{playlist_id}/stream.m3u8`

* **Description:** Serve HLS manifest for on-demand playlist.
* **Authentication:** Same as retrieving playlist metadata.
* **Path Parameters:**

  * `playlist_id`: UUID.
* **Behavior:**

  * If a pre-generated manifest exists in S3 (`/playlists/{playlist_id}/hls/manifest.m3u8`), serve from CDN.
  * Otherwise, dynamically generate manifest by concatenating TS segments from each track’s HLS sub-manifest (for uploads) or segmenting external MP3 on the fly.
* **Response (200 OK, `application/vnd.apple.mpegurl`):** HLS manifest.
* **Errors:**

  * `403 Forbidden`, `404 Not Found`.

#### 9.4.6 `GET /v1/playlists/{playlist_id}/stream.mp3`

* **Description:** Serve continuous MP3 stream for playlist.
* **Authentication:** Same rules as HLS manifest.
* **Behavior:** Relay Worker or API sequentially reads MP3 data from each uploaded file (via S3) or external URL and pipes to client.
* **Response (200 OK, `audio/mpeg`):** Continuous MP3 stream.
* **Errors:**

  * `403 Forbidden`, `404 Not Found`.

---

### 9.5 Podcast & RSS Endpoints (with Custom Domains)

#### 9.5.1 `POST /v1/podcasts`

* **Description:** Create a new Podcast series and register custom domain.
* **Authentication:** Requires `podcasts:write`.
* **Request Body (application/json):**

  ```json
  {
    "title": "Tech DJ Podcast",
    "description": "Weekly interviews with top DJs and music producers.",
    "language": "en-us",
    "author": "DJ Example",
    "image_url": "https://cdn.example.com/images/podcast-cover.jpg",
    "explicit": false,
    "custom_domain": "podcast.djname.com",
    "monetization_enabled": true
  }
  ```
* **Validation:**

  * `custom_domain` must be a valid DNS hostname.
  * Verify ownership via DNS TXT record or email challenge.
* **Behavior:**

  1. Insert podcast record in `podcasts` table with `custom_domain`, `monetization_enabled`.
  2. Initiate DNS validation workflow:

     * Provide DJ with a DNS TXT record value to add to `podcast.djname.com`.
     * Poll DNS every minute (or use webhook if supported) until TXT record found.
     * If verified, create CNAME (`podcast.djname.com → api.example.com`) or A record.
     * Request TLS certificate from Let’s Encrypt (via ACME DNS challenge).
     * Update `domains.verification_status` to `verified`, `tls_status` to `issued`.
  3. Compute `rss_feed_url = https://podcast.djname.com/rss.xml`.
* **Response (201 Created):**

  ```json
  {
    "podcast_id": "uuid-9012",
    "rss_feed_url": "https://podcast.djname.com/rss.xml",
    "domain_verification": {
      "status": "pending",
      "dns_txt_record": "acme-challenge=XYZ123"
    }
  }
  ```
* **Errors:**

  * `400 Bad Request` if missing required fields.
  * `409 Conflict` if `custom_domain` already registered.

#### 9.5.2 `GET /v1/podcasts/{podcast_id}`

* **Description:** Retrieve podcast metadata, custom domain status, and episode list.
* **Authentication:** If `monetization_enabled: true`, require a valid JWT with active subscription to view certain metadata; otherwise public.
* **Path Parameters:**

  * `podcast_id`: UUID.
* **Response (200 OK):**

  ```json
  {
    "podcast_id": "uuid-9012",
    "title": "Tech DJ Podcast",
    "description": "Weekly interviews with top DJs and music producers.",
    "language": "en-us",
    "author": "DJ Example",
    "image_url": "https://cdn.example.com/images/podcast-cover.jpg",
    "explicit": false,
    "custom_domain": "podcast.djname.com",
    "monetization_enabled": true,
    "rss_feed_url": "https://podcast.djname.com/rss.xml",
    "domain_verification": {
      "status": "verified",
      "tls_status": "issued"
    },
    "episodes": [
      {
        "episode_id": "uuid-ep-1234",
        "source_type": "upload",
        "upload_id": "uuid-upload-0002",
        "title": "Episode 1: Live from Ibiza",
        "description": "Exclusive set and interview.",
        "duration_seconds": 3600,
        "publication_date": "2025-06-10T14:00:00Z",
        "episode_number": 1,
        "explicit": false,
        "monetization_required": false
      }
      // … more episodes
    ]
  }
  ```
* **Errors:**

  * `404 Not Found`.

#### 9.5.3 `PATCH /v1/podcasts/{podcast_id}`

* **Description:** Update podcast metadata (e.g., title, description, image, monetization, custom domain).
* **Authentication:** Owner of podcast (`podcasts:write`).
* **Path Parameters:**

  * `podcast_id`: UUID.
* **Request Body (any subset):**

  ```json
  {
    "title": "Updated Podcast Title",
    "description": "New description",
    "image_url": "https://cdn.example.com/images/new-cover.jpg",
    "explicit": true,
    "custom_domain": "newpodcast.djname.com",  
    "monetization_enabled": false
  }
  ```
* **Behavior:**

  * Update fields in DB.
  * If `custom_domain` changed:

    * Initiate new DNS verification + TLS provisioning.
    * Update `domains` record accordingly.
    * Deactivate old domain after successful new domain issuance.
  * If `monetization_enabled` toggles, adjust access controls on RSS feed items.
* **Response (200 OK):**

  ```json
  {
    "podcast_id": "uuid-9012",
    "updated_fields": ["custom_domain", "monetization_enabled"]
  }
  ```
* **Errors:**

  * `400 Bad Request`, `404 Not Found`, `409 Conflict` (domain in use).

#### 9.5.4 `DELETE /v1/podcasts/{podcast_id}`

* **Description:** Delete podcast series and all episodes.
* **Authentication:** Owner (`podcasts:write`).
* **Path Parameters:**

  * `podcast_id`: UUID.
* **Behavior:**

  * Delete (soft-delete) podcast record.
  * Delete episodes, associated uploads (if exclusively used), and invalidate RSS feed on CDN.
  * Remove custom domain CNAME and TLS certificate.
* **Response (204 No Content)**
* **Errors:**

  * `404 Not Found`.

#### 9.5.5 `POST /v1/podcasts/{podcast_id}/episodes`

* **Description:** Create a new episode under a podcast.
* **Authentication:** Owner (`podcasts:write`).
* **Path Parameters:**

  * `podcast_id`: UUID.
* **Request Body (application/json):**

  ```json
  {
    "title": "Episode 1: Live from Ibiza",
    "description": "Exclusive set and interview.",
    "source_type": "upload",         // "upload" or "external"
    "upload_id": "uuid-upload-0002", // if "upload"
    "media_url": "https://cdn.example.com/podcasts/episode1.mp3", // if "external"
    "duration_seconds": 3600,
    "publication_date": "2025-06-10T14:00:00Z",
    "episode_number": 1,
    "explicit": false,
    "monetization_required": false
  }
  ```
* **Validation:**

  * If `source_type == "upload"`, check `uploads.upload_id` exists & `status == "ready"`.
  * If `source_type == "external"`, verify URL HEAD request returns `audio/mpeg`.
* **Behavior:**

  * Insert episode record in DB.
  * Trigger background job to regenerate RSS XML.
  * If `monetization_required == true`, ensure paywall for its enclosure URL.
* **Response (201 Created):**

  ```json
  {
    "episode_id": "uuid-ep-1234"
  }
  ```
* **Errors:**

  * `400 Bad Request`, `404 Not Found`, `422 Unprocessable Entity`.

#### 9.5.6 `PATCH /v1/podcasts/{podcast_id}/episodes/{episode_id}`

* **Description:** Update episode metadata.
* **Authentication:** Owner (`podcasts:write`).
* **Path Parameters:**

  * `podcast_id`: UUID.
  * `episode_id`: UUID.
* **Request Body (any subset):**

  ```json
  {
    "title": "Updated Episode 1",
    "media_url": "https://cdn.example.com/podcasts/episode1-updated.mp3",
    "duration_seconds": 3700,
    "publication_date": "2025-06-11T14:00:00Z",
    "explicit": true,
    "monetization_required": true
  }
  ```
* **Behavior:**

  * Update DB record.
  * Regenerate RSS XML and invalidate CDN cache.
* **Response (200 OK):**

  ```json
  {
    "episode_id": "uuid-ep-1234",
    "updated_fields": ["media_url", "monetization_required"]
  }
  ```
* **Errors:**

  * `400 Bad Request`, `404 Not Found`.

#### 9.5.7 `DELETE /v1/podcasts/{podcast_id}/episodes/{episode_id}`

* **Description:** Delete an episode (removes from RSS).
* **Authentication:** Owner (`podcasts:write`).
* **Path Parameters:**

  * `podcast_id`: UUID.
  * `episode_id`: UUID.
* **Behavior:**

  * Delete episode record from DB.
  * Invalidate RSS feed on CDN.
* **Response (204 No Content)**
* **Errors:**

  * `404 Not Found`.

#### 9.5.8 `GET https://{custom_domain}/rss.xml` OR `GET /v1/podcasts/{podcast_id}/rss.xml`

* **Description:** Serve public RSS 2.0 XML for podcast.
* **Authentication:**

  * If any episode has `monetization_required: true`, require OAuth or subscription check before exposing `<enclosure>` URLs (signed URLs).
  * Otherwise, public.
* **Behavior:**

  * Generate RSS XML with `<channel>` and `<item>` entries.
  * For each episode:

    * `<enclosure> url=` either a signed S3 URL (if `monetization_required`) or a public URL.
    * `<guid> episode_id </guid>`, `<pubDate> … </pubDate>`, `<itunes:duration> HH:MM:SS </itunes:duration>`, `<itunes:explicit>yes/no</itunes:explicit>`.
  * Cache RSS at CDN (TTL=300 s).
* **Response (200 OK, `application/rss+xml`):**

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <channel>
      <title>Tech DJ Podcast</title>
      <link>https://podcast.djname.com</link>
      <description>Weekly interviews with top DJs and music producers.</description>
      <language>en-us</language>
      <itunes:author>DJ Example</itunes:author>
      <itunes:image href="https://cdn.example.com/images/podcast-cover.jpg"/>
      <itunes:explicit>no</itunes:explicit>
      <item>
        <title>Episode 1: Live from Ibiza</title>
        <description>Exclusive set and interview.</description>
        <enclosure url="https://cdn.example.com/podcasts/episode1.mp3" length="3600000" type="audio/mpeg"/>
        <guid>uuid-ep-1234</guid>
        <pubDate>Tue, 10 Jun 2025 14:00:00 GMT</pubDate>
        <itunes:duration>01:00:00</itunes:duration>
        <itunes:explicit>no</itunes:explicit>
      </item>
      <!-- Additional <item> entries -->
    </channel>
  </rss>
  ```
* **Errors:**

  * `404 Not Found` if `podcast_id` or `custom_domain` unknown.
  * `403 Forbidden` if paywalled content and listener not authenticated/subscribed.

---

### 9.6 Monetization & Ad Insertion Endpoints

#### 9.6.1 `POST /v1/monetization/plans`

* **Description:** Create a new subscription plan.
* **Authentication:** Admin or DJ with `monetization:write`.
* **Request Body (application/json):**

  ```json
  {
    "name": "Premium Live Access",
    "price_cents": 500,
    "currency": "USD",
    "billing_interval": "monthly",
    "features": ["live_streams", "playlist_access", "podcast_downloads"]
  }
  ```
* **Behavior:**

  * Insert plan into `monetization_plans` table.
  * Create corresponding product & price in Stripe.
  * Store `stripe_product_id` and `stripe_price_id`.
* **Response (201 Created):**

  ```json
  {
    "plan_id": "uuid-plan-1001",
    "stripe_product_id": "prod_ABC123",
    "stripe_price_id": "price_DEF456"
  }
  ```
* **Errors:**

  * `400 Bad Request`.

#### 9.6.2 `GET /v1/monetization/plans/{plan_id}`

* **Description:** Retrieve details of a subscription plan.
* **Authentication:** `monetization:read` (owner or admin).
* **Path Parameters:**

  * `plan_id`: UUID.
* **Response (200 OK):**

  ```json
  {
    "plan_id": "uuid-plan-1001",
    "name": "Premium Live Access",
    "price_cents": 500,
    "currency": "USD",
    "billing_interval": "monthly",
    "features": ["live_streams", "playlist_access", "podcast_downloads"],
    "stripe_product_id": "prod_ABC123",
    "stripe_price_id": "price_DEF456"
  }
  ```
* **Errors:**

  * `404 Not Found`.

#### 9.6.3 `POST /v1/monetization/subscriptions`

* **Description:** Subscribe a user (DJ or listener) to a plan.
* **Authentication:** For DJs, require `monetization:write`; for listeners, require user JWT with `subscriptions:write`.
* **Request Body:**

  ```json
  {
    "plan_id": "uuid-plan-1001",
    "stripe_payment_method_id": "pm_XYZ789"
  }
  ```
* **Behavior:**

  * Create a Customer in Stripe (if not exists) or retrieve existing.
  * Attach `payment_method_id`.
  * Create a Subscription in Stripe.
  * Insert `subscriptions` record in DB with `stripe_subscription_id` and initial `status: "active"`.
* **Response (201 Created):**

  ```json
  {
    "subscription_id": "uuid-sub-2002",
    "status": "active",
    "stripe_subscription_id": "sub_ABC123"
  }
  ```
* **Errors:**

  * `402 Payment Required` if payment fails.
  * `400 Bad Request`.

#### 9.6.4 `GET /v1/monetization/subscriptions/{subscription_id}`

* **Description:** Retrieve subscription status.
* **Authentication:** Owner of subscription (`monetization:read`).
* **Path Parameters:**

  * `subscription_id`: UUID.
* **Response (200 OK):**

  ```json
  {
    "subscription_id": "uuid-sub-2002",
    "plan_id": "uuid-plan-1001",
    "status": "active",
    "stripe_subscription_id": "sub_ABC123",
    "created_at": "2025-06-01T12:00:00Z",
    "expires_at": "2025-07-01T12:00:00Z"
  }
  ```
* **Errors:**

  * `404 Not Found`.

#### 9.6.5 `POST /v1/streams/{stream_id}/ads`

* **Description:** Assign ad markers to a live stream.
* **Authentication:** Owner of stream (`monetization:write`).
* **Path Parameters:**

  * `stream_id`: UUID.
* **Request Body (application/json):**

  ```json
  {
    "ad_markers": [
      {
        "position_seconds": 300,
        "duration_seconds": 30,
        "ad_type": "pre-roll"
      },
      {
        "position_seconds": 1800,
        "duration_seconds": 60,
        "ad_type": "mid-roll"
      }
    ]
  }
  ```
* **Behavior:**

  * Store ad markers in DB under `streams_ads` table.
  * Relay Worker picks up markers via configuration and inserts ads at runtime by switching input to ad source (S3 or ad server), then resumes main feed.
* **Response (200 OK):**

  ```json
  {
    "stream_id": "uuid-1234",
    "ad_markers": [
      {
        "position_seconds": 300,
        "duration_seconds": 30,
        "ad_type": "pre-roll"
      },
      {
        "position_seconds": 1800,
        "duration_seconds": 60,
        "ad_type": "mid-roll"
      }
    ]
  }
  ```
* **Errors:**

  * `400 Bad Request`, `404 Not Found`.

#### 9.6.6 `GET /v1/streams/{stream_id}/ads`

* **Description:** Retrieve ad markers for a live stream.
* **Authentication:** Owner (`monetization:read`) or Admin.
* **Path Parameters:**

  * `stream_id`: UUID.
* **Response (200 OK):**

  ```json
  {
    "stream_id": "uuid-1234",
    "ad_markers": [
      {
        "position_seconds": 300,
        "duration_seconds": 30,
        "ad_type": "pre-roll"
      },
      {
        "position_seconds": 1800,
        "duration_seconds": 60,
        "ad_type": "mid-roll"
      }
    ]
  }
  ```
* **Errors:**

  * `404 Not Found`.

---

### 9.7 Custom Domain Management

#### 9.7.1 `POST /v1/domains`

* **Description:** Register a custom domain for a podcast or live stream.
* **Authentication:** DJ (`domains:write`).
* **Request Body (application/json):**

  ```json
  {
    "custom_domain": "podcast.djname.com"
  }
  ```
* **Behavior:**

  * Verify domain format and uniqueness.
  * Generate a DNS TXT record value (e.g., `acme-challenge=XYZ123`).
  * Insert record in `domains` table with `verification_status: "pending"`, `tls_status: "pending"`.
  * Return DNS TXT record instructions to DJ.
* **Response (201 Created):**

  ```json
  {
    "domain_id": "uuid-domain-3003",
    "custom_domain": "podcast.djname.com",
    "verification_status": "pending",
    "tls_status": "pending",
    "dns_txt_record": "acme-challenge=XYZ123"
  }
  ```
* **Errors:**

  * `400 Bad Request` if invalid domain.
  * `409 Conflict` if domain already registered.

#### 9.7.2 `GET /v1/domains/{domain_id}`

* **Description:** Retrieve custom domain verification and TLS status.
* **Authentication:** DJ (`domains:read`) or Admin.
* **Path Parameters:**

  * `domain_id`: UUID.
* **Behavior:**

  * Check DNS TXT record presence for verification.
  * If verified, provision TLS certificate via Let’s Encrypt; update `tls_status`.
  * Return current statuses.
* **Response (200 OK):**

  ```json
  {
    "domain_id": "uuid-domain-3003",
    "custom_domain": "podcast.djname.com",
    "verification_status": "verified",
    "tls_status": "issued",
    "last_checked": "2025-06-03T17:55:00Z"
  }
  ```
* **Errors:**

  * `404 Not Found`.

#### 9.7.3 `DELETE /v1/domains/{domain_id}`

* **Description:** Unregister a custom domain.
* **Authentication:** DJ (`domains:write`).
* **Path Parameters:**

  * `domain_id`: UUID.
* **Behavior:**

  * Remove CNAME record from DNS.
  * Revoke or delete TLS certificate.
  * Soft-delete `domains` record.
* **Response (204 No Content)**
* **Errors:**

  * `404 Not Found`.

---

### 9.8 Analytics

#### 9.8.1 `GET /v1/analytics/streams/{stream_id}`

* **Description:** Fetch live stream listener analytics over a date range.
* **Authentication:** DJ (`analytics:read`) or Admin.
* **Path Parameters:**

  * `stream_id`: UUID.
* **Query Parameters:**

  * `from`: `YYYY-MM-DD` (inclusive)
  * `to`: `YYYY-MM-DD` (inclusive)
* **Behavior:** Aggregate `analytics` table for `resource_type="stream"` and `resource_id=stream_id` over date range.
* **Response (200 OK):**

  ```json
  {
    "stream_id": "uuid-1234",
    "daily_listeners": [
      { "date": "2025-06-01", "listeners": 120 },
      { "date": "2025-06-02", "listeners": 98 }
      // …
    ],
    "peak_listeners": 250,
    "total_listens": 1500
  }
  ```
* **Errors:**

  * `400 Bad Request` if invalid dates.
  * `404 Not Found` if `stream_id` invalid.

#### 9.8.2 `GET /v1/analytics/playlists/{playlist_id}`

* **Description:** Fetch on-demand playlist play counts over time.
* **Authentication:** DJ (`analytics:read`) or Admin.
* **Path Parameters:**

  * `playlist_id`: UUID.
* **Query Parameters:**

  * `from`: `YYYY-MM-DD`
  * `to`: `YYYY-MM-DD`
* **Response (200 OK):**

  ```json
  {
    "playlist_id": "uuid-5678",
    "plays": [
      { "date": "2025-06-01", "play_count": 75 },
      { "date": "2025-06-02", "play_count": 80 }
      // …
    ],
    "total_plays": 500
  }
  ```
* **Errors:**

  * `400 Bad Request`, `404 Not Found`.

#### 9.8.3 `GET /v1/analytics/podcasts/{podcast_id}`

* **Description:** Fetch podcast episode download counts over time.
* **Authentication:** DJ (`analytics:read`) or Admin.
* **Path Parameters:**

  * `podcast_id`: UUID.
* **Query Parameters:**

  * `from`: `YYYY-MM-DD`
  * `to`: `YYYY-MM-DD`
* **Response (200 OK):**

  ```json
  {
    "podcast_id": "uuid-9012",
    "daily_downloads": [
      { "date": "2025-06-01", "downloads": 45 },
      { "date": "2025-06-02", "downloads": 50 }
      // …
    ],
    "total_downloads": 350
  }
  ```
* **Errors:**

  * `400 Bad Request`, `404 Not Found`.

---

## 10. Non-Functional Requirements

### 10.1 Performance & Scalability

1. **Relay Worker Autoscaling:**

   * Each live stream has exactly one Relay Worker Pod.
   * Use Kubernetes Horizontal Pod Autoscaler based on CPU (>80% for >5 min) or custom metric (listener count >5000/pod) to add more pods and split streams (if sharding multi-mount is supported).
   * If `enabled == false` or no listeners for >10 min, terminate Pod automatically.

2. **HLS & MP3 Caching:**

   * CDN caches HLS manifests (TTL=30 s) and TS segments (TTL=60 s).
   * Caching reduces origin load drastically under heavy listener concurrency.

3. **Database Connection Pooling:**

   * Use PgBouncer to maintain max 100 DB connections; share across API server replicas.
   * Redis caching layer for frequently accessed metadata (e.g., stream configs, playlist metadata, domain status).

4. **File Upload & Transcoding Throughput:**

   * Limit concurrent transcoding jobs per node: CPU cores × 2 (e.g., 8 CPU cores → 16 transcoding threads max).
   * Enqueue transcoding tasks in a background queue (e.g., RabbitMQ, Redis Queue) to avoid blocking API threads.

---

### 10.2 Availability & Reliability

1. **99.9% Uptime SLA:**

   * API servers and DB deployed across at least two AZs.
   * Relay Workers distributed across AZs; use multi-region if high global concurrency needed.

2. **Automated Backups & DR:**

   * Daily PostgreSQL backups, retained for 30 days.
   * S3 lifecycle rules: archive HLS segments older than 24 h to Glacier or equivalent.
   * Test restore procedure quarterly.

3. **Health Checks & Self-Healing:**

   * API: Kubernetes readiness/liveness probes on `/v1/health`.
   * Relay Worker: heartbeat every 30 s → if no heartbeat for 2 min, kill Pod and recreate.
   * Alerting on high error rates, no heartbeat, or high resource usage.

---

### 10.3 Security & Compliance

1. **Transport Security:**

   * Enforce TLS 1.2+ for all HTTP traffic.
   * HSTS header with `max-age=31536000; includeSubDomains; preload`.

2. **Data Encryption:**

   * Use AWS KMS to encrypt `stream_key`, `stripe_*` secrets, and other PII in DB.
   * Enforce SSL for PostgreSQL.

3. **Authentication & Authorization:**

   * JWT with RS256, short-lived (24 h), rotate refresh tokens.
   * Validate scopes (`streams:read`, `playlists:write`, etc.) on every request.
   * Role-based access: DJs vs. Admins.

4. **Input Validation:**

   * Use JSON Schema (via `ajv` in Node.js or `pydantic` in Python) to validate request bodies.
   * Parameterized queries via ORM (Sequelize, TypeORM, or SQLAlchemy) to prevent SQL injection.
   * Sanitize metadata (HTML escape) to prevent XSS.

5. **Rate Limiting:**

   * Implement Redis-based rate limiting:

     * **API endpoints:** 100 requests/min per user for metadata; 10 requests/min per user for write operations.
     * **Public streaming (HLS, MP3, RSS):** 10,000 requests/min per IP; return `429 Too Many Requests`.

6. **CORS Policy:**

   * Maintain per-DJ whitelisted CORS domains (configured in their profile).
   * Reject requests from unauthorized origins with `403 Forbidden`.

7. **GDPR Compliance:**

   * Provide `DELETE /v1/users/{user_id}` to initiate data purge (soft-delete all content).
   * Data retention policy: keep backups for 30 days; permanently delete PII thereafter.
   * Provide `GET /v1/users/{user_id}/export` to export all personal data in JSON/CSV.

8. **Vulnerability Scanning:**

   * Automate dependency scanning on each pull request (Snyk, Dependabot).
   * Quarterly penetration testing by a third-party security firm.
   * Monitor CVE feeds and patch high-severity vulnerabilities within 48 h.

---

### 10.4 Monitoring & Logging

1. **Structured Logging:**

   * All API logs in JSON with fields: `timestamp`, `request_id`, `user_id` (if available), `path`, `status_code`, `latency_ms`, and any error stack.
   * Relay Worker logs: `relay_worker_id`, `stream_id`, `listener_count`, `events` (e.g., “segment\_generated: segment####.ts”), `errors`.
   * Forward logs to ELK (Elasticsearch + Logstash + Kibana) or Datadog.

2. **Metrics & Dashboards:**

   * Prometheus collects:

     * **API servers:**

       * `http_requests_total{status_code, method, endpoint}`,
       * `http_request_duration_seconds_bucket`,
       * `db_connection_pool_usage`,
       * `upload_queue_length`.
     * **Relay Workers:**

       * `relay_listener_count{stream_id}`,
       * `hls_segment_generation_time_seconds`,
       * `cpu_usage_percent`, `memory_usage_bytes`.
   * Grafana dashboards visualize:

     * Live listener heatmap (by stream).
     * Playlist usage over time.
     * Podcast download trends.
     * Relay Worker resource utilization.
   * Alertmanager triggers alerts on:

     * API 5xx rate > 1% over 5 min.
     * Relay Worker no heartbeat > 2 min.
     * DB connection pool > 90% usage.
     * CPU > 80% for > 5 min on any critical node.

3. **Health Checks & Heartbeats:**

   * **API Health:** `GET /v1/health` → `{ "status":"ok" }`.
   * **Relay Worker Heartbeat:** Periodic POST to `/v1/streams/{stream_id}/heartbeat` including JSON `{ "listeners": 123, "cpu_usage": 45.2 }`.

---

## 11. Technical Architecture & Integration

### 11.1 Component Responsibilities

1. **DJ Dashboard / Third-Party Apps**

   * Calls API to register streams, configure playlists/podcasts, configure monetization, manage custom domains, view analytics.
   * Example tech: React, Next.js, Vue, Angular, or mobile (iOS/Android) apps.

2. **API Gateway / Load Balancer**

   * Route traffic to API servers.
   * SSL/TLS termination.
   * Basic rate limiting and WAF rules.

3. **API Servers**

   * Implement all endpoints under `/v1/`.
   * Authenticate/authorize requests using JWT & scope checks.
   * Validate request bodies (JSON Schema/Pydantic).
   * Queue background jobs (audio transcoding, RSS regeneration, email notifications).
   * Manage Stripe integration for subscription billing.
   * Handle DNS/TLS for custom domains (trigger ACM or ACME processes).
   * Generate and serve RSS XML for podcasts.

4. **Relay Workers**

   * One Pod per registered live stream (`streams.enabled == true`).
   * Connect to Shoutcast source:

     ```bash
     ffmpeg -i http://djshoutcast.example.com:8000/live.stream_key \
       -c:a copy \
       -f hls \
       -hls_time 6 \
       -hls_list_size 3 \
       -hls_flags delete_segments \
       /var/hls/streams/{stream_id}/segment%d.ts
     ```
   * Continuously update `/var/hls/streams/{stream_id}/live.m3u8`.
   * Serve continuous MP3:

     ```bash
     ffmpeg -i http://djshoutcast.example.com:8000/live.stream_key \
       -c:a copy \
       -f mp3 \
       -ice_name "DJ Example" \
       -ice_genre "House" \
       -ice_description "Weekly house mix" \
       -ice_public true \
       -listen 1 \
       0.0.0.0:80
     ```
   * Insert ads by switching input to ad TS or MP3 file at configured markers.

5. **Stripe Integration (Auth Service)**

   * Manage `monetization_plans`, `subscriptions`, and webhooks for payment success, failure, and subscription updates.
   * Store `stripe_product_id`, `stripe_price_id`, `stripe_subscription_id` in DB.

6. **PostgreSQL (RDS/Aurora)**

   * Houses all relational data: users, streams, playlists, podcasts, episodes, uploads, HLS segments metadata, monetization plans, subscriptions, domains, analytics.
   * Use JSONB for flexible fields (e.g., `features`, `metrics`).

7. **S3 (Object Storage)**

   * Store uploaded MP3s under `/uploads/audio/{user_id}/{upload_id}/original.mp3`.
   * Store HLS TS segments under `/uploads/audio/{upload_id}/hls/segment####.ts`.
   * Store playlist manifest under `/playlists/{playlist_id}/hls/manifest.m3u8`.
   * Store podcast RSS feed under `/podcasts/{podcast_id}/rss.xml` (for fallback if custom domain not used).
   * Bucket policies: public-read for HLS segments (if `visibility == "public"`), private otherwise.

8. **CDN (CloudFront, Fastly, etc.)**

   * Cache and serve:

     * Live HLS manifests (`/streams/{stream_id}/live.m3u8`, TTL=30 s).
     * TS segments (`/streams/{stream_id}/segment####.ts`, TTL=60 s).
     * On-demand playlist manifests (`/playlists/{playlist_id}/stream.m3u8`, TTL=30 s).
     * MP3 endpoints (`/streams/{stream_id}/live.mp3`, TTL=5 min).
     * Podcast RSS (`https://{custom_domain}/rss.xml`, TTL=300 s).
     * Static assets (cover images).
   * Configure invalidation hooks on—

     * Playlist updates (invalidate `/playlists/{playlist_id}/*`).
     * Podcast RSS regeneration (invalidate `/podcasts/{podcast_id}/rss.xml` and `https://{custom_domain}/rss.xml`).

9. **Monitoring & Logging Stack**

   * **Prometheus & Grafana:** Collect and visualize metrics from API servers and Relay Workers.
   * **ELK (Elastic + Logstash + Kibana) or Datadog:** Ingest structured logs from API servers and Relay Workers.
   * **Alertmanager:** Send Slack/email/SMS alerts on critical conditions (relay worker offline, API errors, resource saturation).

---

## 12. Non-Functional Considerations & Best Practices

### 12.1 Performance & Scaling

* **Relay Worker Resource Allocation:**

  * CPU: allocate ≥ 2 vCPU per Relay Worker for live HLS segmentation at 128 kbps. Scale up if bitrate or listener load increases.
  * Memory: allocate ≥ 4 GB RAM per Relay Worker (for buffering TS segments).
  * Autoscale: use HPA to maintain < 70% CPU utilization and < 5,000 listeners per pod.

* **HLS Manifest & Segment Cache:**

  * Manifest updates every 6 s (matching TS chunk duration).
  * CDN caches manifest with TTL = 30 s; TS segments with TTL = 60 s.
  * For on-demand playlists, generate HLS manifests on first request and store in S3; subsequent requests served from CDN.

* **DB & Connection Pooling:**

  * Use PgBouncer to limit connections to 100.
  * Use connection pooling library in API (e.g., `pg-pool` or `asyncpg`).

* **File Upload & Transcoding Throughput:**

  * Background job workers handle transcoding at scale; peak simultaneous jobs = (# of nodes) × (# of CPU cores per node − reserved cores).

---

### 12.2 Availability & Reliability

* **High Availability (HA) Architecture:**

  * Deploy API server replicas across ≥ 2 AZs.
  * Use Multi-AZ PostgreSQL (read-replicas for analytics queries).
  * Deploy Relay Workers across AZs; if one AZ fails, others continue serving.

* **Backup & Disaster Recovery:**

  * Daily DB backups via RDS automated snapshots.
  * S3 versioning for HLS segments and uploaded audio.
  * Quarterly DR drill: restore DB to a separate cluster; recover objects from S3.

* **Self-Healing & Failover:**

  * Kubernetes LivenessProbes: restart API/Relay Worker containers if health endpoints fail.
  * Relay Worker sends heartbeat every 30 s; if no heartbeat for > 2 min, Kubernetes restarts Pod.
  * If Shoutcast source remains unreachable > 5 min, mark stream offline and notify DJ via email.

---

### 12.3 Security & Compliance

* **Transport Layer Security:**

  * All endpoints require HTTPS, no HTTP.
  * HSTS header with `max-age=31536000; includeSubDomains; preload`.

* **Data Encryption:**

  * Use AWS KMS for encrypting sensitive fields (e.g., `stream_key`, `stripe_*`).
  * Enable SSL for PostgreSQL connections at rest.

* **Authentication & Authorization:**

  * JWT with RS256, short-lived (24 h) access tokens, rotating refresh tokens.
  * RBAC:

    * DJs can only modify their own resources.
    * Admins have global read/write access.
  * Scope enforcement in middleware for each endpoint.

* **Input Validation & Sanitization:**

  * Validate JSON bodies with JSON Schema or Pydantic.
  * Parameterized queries via ORM to prevent SQL injection.
  * HTML-escape any metadata shown in user-facing dashboards or RSS.

* **Rate Limiting & Abuse Prevention:**

  * Redis-based rate limiter (e.g., `rate-limit-redis` in Node.js).
  * Throttle or block on suspicious patterns (e.g., repeated failed login attempts, excessive streaming requests).
  * CAPTCHA for repeated login failures.

* **CORS Policy:**

  * Whitelist domains per DJ (configured in profile).
  * Reject requests from unauthorized origins with `403 Forbidden`.

* **GDPR & Data Privacy:**

  * Comply with GDPR:

    * Provide `DELETE /v1/users/{user_id}` to purge PII and content (soft-delete then permanent delete after 30 days).
    * Provide `GET /v1/users/{user_id}/export` to download all personal data in JSON/CSV.
  * Anonymize analytics older than two years; purge raw logs older than 90 days.

* **Vulnerability Scanning & Pentesting:**

  * Automated dependency scanning on each PR (e.g., Snyk, Dependabot).
  * Quarterly third-party penetration tests.
  * Continuous monitoring for CVEs in dependencies.

---

### 12.4 Monitoring & Logging

1. **Structured Logging:**

   * API logs: `timestamp`, `request_id`, `user_id`, `path`, `status_code`, `latency_ms`, `error_details`.
   * Relay Worker logs: `relay_worker_id`, `stream_id`, `listeners`, `hls_segment_events`, `errors`.
   * Forward logs to ELK or Datadog; set log retention to 90 days for hot storage, archive older logs.

2. **Prometheus & Grafana Metrics:**

   * **API servers:**

     * `api_http_requests_total` (labels: `code`, `method`, `endpoint`)
     * `api_http_request_duration_seconds` (histogram)
     * `db_connection_pool_usage` (gauge)
     * `upload_queue_length` (gauge)
   * **Relay Workers:**

     * `relay_listener_count` (gauge, label: `stream_id`)
     * `hls_segment_generation_time_seconds` (histogram)
     * `relay_cpu_usage_percent` (gauge)
     * `relay_memory_usage_bytes` (gauge)
   * **Alerts:**

     * **High 5xx Rate:** `sum(rate(api_http_requests_total{code=~"5.."}[5m])) / sum(rate(api_http_requests_total[5m])) > 0.01`
     * **No Relay Heartbeat:** If no heartbeat POST for > 2 minutes → alert and restart Pod.
     * **DB Connection Saturation:** `db_connection_pool_usage > 0.9` → alert.
     * **CPU Overload:** `relay_cpu_usage_percent > 0.8` for > 5 min → scale pods.

3. **Health Checks & Heartbeats:**

   * **API Health:** `GET /v1/health` → `{ "status":"ok" }`.
   * **Relay Worker Heartbeat:** Relay Worker sends `POST /v1/streams/{stream_id}/heartbeat` with body:

     ```json
     {
       "listeners": 125,
       "cpu_usage": 45.2,
       "memory_usage": 308700800  // bytes
     }
     ```
   * If no heartbeat for > 2 min, Kubernetes restarts Pod.

---

## 13. Roadmap & Milestones

| Milestone                             | Description                                                                                                      | Timeline    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------- |
| **Phase 1: Core Live Relay & Auth**   | - Implement Authentication & JWT <br> - Shoutcast registration <br> - Relay Worker Pods + HLS/MP3 endpoints      | Weeks 1–4   |
| **Phase 2: Audio Upload & Playlists** | - File-upload API & background transcoding <br> - On-demand playlist endpoints (HLS/MP3)                         | Weeks 5–6   |
| **Phase 3: Podcast & Custom Domains** | - Podcast creation & episode endpoints <br> - Custom domain registration & TLS <br> - RSS feed generation        | Weeks 7–8   |
| **Phase 4: Monetization & Ads**       | - Subscription plan API & Stripe integration <br> - Subscription endpoints <br> - Ad insertion logic & endpoints | Weeks 9–10  |
| **Phase 5: Analytics & Caching**      | - Analytics endpoints <br> - Redis caching for HLS/RSS <br> - Rate limiting middleware                           | Weeks 11–12 |
| **Phase 6: Security & Hardening**     | - Pen-testing & vulnerability scanning <br> - GDPR compliance features <br> - WAF & CAPTCHA integration          | Weeks 13–14 |
| **Phase 7: Developer Experience**     | - Publish OpenAPI spec & host Swagger UI <br> - Release official SDKs (Node.js, Python)                          | Weeks 15–16 |
| **Phase 8: DJ Dashboard (Optional)**  | - Build React-based admin UI for streams, playlists, podcasts, monetization, analytics                           | Weeks 17–20 |

---

## 14. Dependencies & Integration Points

1. **Shoutcast Source Access:**

   * DJs must supply valid `shoutcast_url`, `mount`, and `stream_key`.
   * Relay Workers require network access to connect to the Shoutcast server (firewall rules or whitelisting).

2. **Object Storage (S3):**

   * Bucket policies:

     * Public-read for HLS segments of public streams/playlists.
     * Private for paywalled content; generate signed URLs.
   * CORS configuration for HLS/MP3 fetch from browsers/CDN.

3. **CDN Configuration:**

   * Cache rules for:

     * `*.m3u8` (TTL=30 s)
     * `*.ts` (TTL=60 s)
     * `*.mp3` (TTL=300 s)
     * `*.xml` (RSS feeds, TTL=300 s)
   * Invalidation hooks for: playlist updates, RSS regeneration, upload status changes.

4. **Container Orchestration (Kubernetes):**

   * Deploy API server and Relay Workers as separate Deployments.
   * Use Deployment with HPA for API.
   * Use StatefulSet or Deployment (scaled to exact 1 per stream) for Relay Workers.
   * Secret management for `stream_key`, `stripe_*` via Kubernetes Secrets.

5. **Payment Provider (Stripe):**

   * Webhook endpoint (`/v1/monetization/webhook`) to handle events:

     * `invoice.payment_succeeded` → update subscription status to `active`.
     * `invoice.payment_failed` → set subscription to `past_due`.
     * `customer.subscription.deleted` → set subscription to `canceled`.
   * Secure webhook with signature verification.

6. **DNS & TLS Automation:**

   * Use AWS Route 53 (or equivalent) API to create/validate CNAME or TXT records for custom domains.
   * Integrate with Let’s Encrypt ACME client (e.g., Certbot) for TLS certificates.
   * Automate renewal every 60 days.

---

## 15. Risk Analysis & Mitigations

| Risk                                       | Likelihood | Impact | Mitigation                                                                                                                    |
| ------------------------------------------ | ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Shoutcast Source Unavailable               | Medium     | High   | - Poll source every 30 s, alert DJ if offline > 2 min. <br> - Provide fallback to last cached segment or offline placeholder. |
| Relay Worker Overload                      | High       | High   | - Autoscale Relay Workers based on CPU/listener metrics. <br> - Offload TS segments to CDN for distribution.                  |
| High Listener Spikes                       | High       | High   | - Use CDN to serve HLS/MP3 segments. <br> - Pre-generate HLS for popular playlists. <br> - Autoscale Relay Workers.           |
| Podcast RSS Schema Errors                  | Low        | Medium | - Validate generated RSS against official RSS 2.0 DTD. <br> - Automated unit/integration tests for RSS.                       |
| Unauthorized Access to Paywalled Content   | Medium     | High   | - Enforce JWT scope checks in middleware. <br> - Use signed URLs for paywalled MP3 segments and RSS enclosures.               |
| Data Loss or Corruption                    | Low        | High   | - Daily DB backups, S3 versioning, lifecycle policies. <br> - Soft-delete content for 30 days before purge.                   |
| Custom Domain DNS/TLS Provisioning Failure | Medium     | Medium | - Provide clear instructions for DNS TXT record. <br> - Automated retry logic and alert DJ if provisioning fails.             |

---

## 16. Glossary

* **Shoutcast:** Streaming server software for live audio.
* **HLS (HTTP Live Streaming):** Protocol to deliver audio as TS segments with an M3U8 manifest.
* **RSS 2.0:** XML feed format for podcasts.
* **Relay Worker:** Containerized process that ingests Shoutcast feed, performs FFmpeg segmentation, and multicasts to listeners.
* **Custom Domain:** DJ-owned domain (e.g., `podcast.djname.com`) used for serving RSS feeds.
* **Monetization Plan:** Subscription plan managed via Stripe.
* **Ad Marker:** Configuration that instructs Relay Worker to insert ads (pre-roll, mid-roll).
* **CDN (Content Delivery Network):** Edge caching service (e.g., CloudFront) to serve HLS, MP3, and RSS with low latency.
* **FFmpeg:** Open-source multimedia framework used for audio/video transcoding and segmentation.
* **JWT (JSON Web Token):** Token format for stateless, encrypted authentication.
* **ACME (Automated Certificate Management Environment):** Protocol used by Let’s Encrypt to automate TLS certificate issuance.

---

## 17. Appendices

### 17.1 Sample HLS Manifest (Live Relay)

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:1024

#EXTINF:6.000,
https://cdn.example.com/streams/uuid-1234/segment1024.ts
#EXTINF:6.000,
https://cdn.example.com/streams/uuid-1234/segment1025.ts
#EXTINF:6.000,
https://cdn.example.com/streams/uuid-1234/segment1026.ts
#EXT-X-PROGRAM-DATE-TIME:2025-06-03T18:00:00Z
```

---

### 17.2 Sample Podcast RSS 2.0 XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Tech DJ Podcast</title>
    <link>https://podcast.djname.com</link>
    <description>Weekly interviews with top DJs and music producers.</description>
    <language>en-us</language>
    <itunes:author>DJ Example</itunes:author>
    <itunes:image href="https://cdn.example.com/images/podcast-cover.jpg"/>
    <itunes:explicit>no</itunes:explicit>

    <item>
      <title>Episode 1: Live from Ibiza</title>
      <description>Exclusive set and interview.</description>
      <enclosure url="https://cdn.example.com/podcasts/episode1.mp3" length="3600000" type="audio/mpeg"/>
      <guid>uuid-ep-1234</guid>
      <pubDate>Tue, 10 Jun 2025 14:00:00 GMT</pubDate>
      <itunes:duration>01:00:00</itunes:duration>
      <itunes:explicit>no</itunes:explicit>
    </item>

    <!-- Additional <item> entries for each episode -->
  </channel>
</rss>
```

---

**End of Finalized PRD**
All open questions have been addressed with “Yes,” and corresponding features have been integrated:

1. Direct file uploads & transcoding for playlists/podcasts.
2. Custom domain support with automated DNS/TLS.
3. Monetization (subscriptions, ad insertion, paywall).
4. Relay Workers handle real-time HLS segment generation via FFmpeg.


