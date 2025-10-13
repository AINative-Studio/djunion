# Epic 1: Authentication & User Management

**Epic Description:**
Provide secure user registration, login, JWT issuance, role‐based access control, and basic user administration (Admin view).

### US-1.1: User Registration

* **As a** new DJ,
* **I want** to register an account with my email, password, and name,
* **So that** I can obtain credentials to access protected API endpoints.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/auth/register` (Content‐Type: `application/json`).
2. **Request Fields:** `email` (string, valid format), `password` (string, meets strength policy), `name` (string).
3. **Behavior:**

   * Validate that email is not already in use.
   * Validate password strength (≥ 8 characters, includes uppercase, lowercase, number).
   * Hash password with bcrypt (or equivalent) and store `password_hash`.
   * Insert a new `users` record with `role='dj'` and `created_at=now()`.
4. **Response (201 Created):**

   ```json
   {
     "user_id": "uuid‐generated",
     "email": "dj@example.com",
     "name": "DJ Example",
     "role": "dj",
     "created_at": "2025‐06‐01T12:00:00Z"
   }
   ```
5. **Error Cases:**

   * `400 Bad Request` if any field missing/invalid.
   * `409 Conflict` if email already exists.

---

### US-1.2: User Login & JWT Issuance

* **As a** registered DJ,
* **I want** to log in with my email and password,
* **So that** I receive an access token (JWT) and refresh token to call protected endpoints.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/auth/login` (Content‐Type: `application/json`).
2. **Request Fields:** `email` (string), `password` (string).
3. **Behavior:**

   * Verify that the user exists and `deleted_at` is null.
   * Compare provided password against stored `password_hash`.
   * On success, generate:

     * `access_token`: JWT (RS256) with claims `{ sub: user_id, email, role, scopes:[...] }`, expires in 24 hours.
     * `refresh_token`: long‐lived random string stored in `refresh_tokens` table with expiration (e.g., 30 days).
4. **Response (200 OK):**

   ```json
   {
     "access_token": "<JWT_TOKEN>",
     "refresh_token": "<REFRESH_TOKEN>",
     "expires_in": 86400
   }
   ```
5. **Error Cases:**

   * `401 Unauthorized` if email/password invalid.
   * `400 Bad Request` if fields missing.

---

### US-1.3: Refresh JWT

* **As a** logged‐in DJ who has a valid refresh token,
* **I want** to exchange it for a new access token,
* **So that** I can maintain session without re‐entering my password.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/auth/refresh` (Content‐Type: `application/json`).
2. **Request Fields:** `refresh_token` (string).
3. **Behavior:**

   * Validate `refresh_token` exists, is not expired, and belongs to a non‐deleted user.
   * Generate a new `access_token` (JWT) with same claims and a fresh expiration.
   * (Optionally) rotate the refresh token—issue new `refresh_token` and revoke the old one.
4. **Response (200 OK):**

   ```json
   {
     "access_token": "<NEW_JWT_TOKEN>",
     "expires_in": 86400
   }
   ```
5. **Error Cases:**

   * `401 Unauthorized` if `refresh_token` invalid or expired.
   * `400 Bad Request` if field missing.

---

### US-1.4: Admin: List All Users

* **As an** Admin,
* **I want** to retrieve all registered users and their roles,
* **So that** I can manage and audit user accounts.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/users` (JSON).
2. **Authentication:** JWT with `role='admin'` required.
3. **Behavior:**

   * Fetch all non‐deleted users from `users` table.
   * Return paginated list of `{ user_id, email, name, role, created_at }`.
4. **Response (200 OK):**

   ```json
   {
     "users": [
       { "user_id": "...", "email": "dj1@example.com", "name": "DJ One", "role": "dj", "created_at": "2025-05-20T10:00:00Z" },
       { "user_id": "...", "email": "admin@example.com", "name": "Admin", "role": "admin", "created_at": "2025-04-15T08:00:00Z" }
     ],
     "page": 1,
     "per_page": 20,
     "total": 42
   }
   ```
5. **Error Cases:**

   * `403 Forbidden` if JWT missing or not `role='admin'`.
   * `400 Bad Request` on invalid pagination parameters.

---

# Epic 2: Live Stream Management (Shoutcast Integration)

**Epic Description:**
Allow DJs to register Shoutcast sources, spin up cloud Relay Workers to ingest and segment, and serve live HLS/MP3 streams to listeners (public or private).

---

### US-2.1: Register Shoutcast Source

* **As a** DJ,
* **I want** to register my Shoutcast server URL, mount, and stream key,
* **So that** the system spins up a Relay Worker to ingest and relay my live feed.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/streams` (JSON).
2. **Request Fields:**

   ```json
   {
     "name": "Friday Night DJ Set",
     "shoutcast_url": "http://djshoutcast.example.com:8000",
     "mount": "/live", 
     "stream_key": "DJ_STREAM_KEY",
     "genre": "House",
     "description": "Weekly house mix",
     "visibility": "public",          // "public" or "private"
     "monetization_enabled": false
   }
   ```
3. **Behavior:**

   * Validate all required fields present.
   * Attempt to connect to `shoutcast_url` + `/admin.cgi?mode=viewxml&pass=<stream_key>` to confirm credentials.
   * On success:

     1. Encrypt `stream_key` (AES/KMS) and insert a new `streams` record with `enabled=true`, `created_at=now()`.
     2. Trigger a K8s Deployment (Relay Worker Pod) with env vars:

        ```
        STREAM_ID=<generated_uuid>
        SHOUTCAST_URL=<provided_url>
        MOUNT=<provided_mount>
        STREAM_KEY=<decrypted>
        ```
   * On failure (cannot reach Shoutcast, invalid key): return `422 Unprocessable Entity`.
4. **Response (201 Created):**

   ```json
   {
     "stream_id": "uuid‐stream‐0001",
     "status": "registered"
   }
   ```
5. **Error Cases:**

   * `400 Bad Request` if any field missing or invalid.
   * `422 Unprocessable Entity` if Shoutcast admin validation fails.
   * `401 Unauthorized` if JWT missing or lacks `streams:write` scope.

---

### US-2.2: Update Stream Configuration

* **As a** DJ,
* **I want** to modify metadata of my registered stream (e.g., rename, change genre, toggle visibility/monetization, disable),
* **So that** the Relay Worker and API behave according to my updated settings.

**Acceptance Criteria:**

1. **Endpoint:** `PATCH /v1/streams/{stream_id}` (JSON).
2. **Authentication:** JWT with `streams:write`, and `user_id` owner of `stream_id`.
3. **Request Body (any subset):**

   ```json
   {
     "name": "Weekend DJ Set",
     "genre": "Techno",
     "description": "Updated description",
     "visibility": "private",
     "monetization_enabled": true,
     "enabled": false
   }
   ```
4. **Behavior:**

   * Validate `stream_id` exists and belongs to current user; else `404 / 403`.
   * Update provided fields in `streams` table.
   * If `"enabled": false`, scale down or delete the associated Relay Worker Deployment.
   * If `"monetization_enabled"` toggled, modify paywall logic in Relay Worker (e.g., block unauthorized connections).
5. **Response (200 OK):**

   ```json
   {
     "stream_id": "uuid‐stream‐0001",
     "updated_fields": ["name","visibility","monetization_enabled","enabled"]
   }
   ```
6. **Error Cases:**

   * `404 Not Found` if `stream_id` does not exist or belongs to another user.
   * `400 Bad Request` if fields invalid (e.g., invalid visibility).
   * `401 Unauthorized` if JWT missing or lacks `streams:write`.
   * `403 Forbidden` if user not owner.

---

### US-2.3: Delete (Unregister) Stream

* **As a** DJ,
* **I want** to delete my stream registration,
* **So that** the Relay Worker is terminated and my configuration is removed.

**Acceptance Criteria:**

1. **Endpoint:** `DELETE /v1/streams/{stream_id}`.
2. **Authentication:** JWT with `streams:write`, and stream belongs to user.
3. **Behavior:**

   * Soft‐delete the record in `streams` (set `deleted_at=now()`).
   * Terminate and remove the Relay Worker Deployment/Pods in K8s.
   * Invalidate any cached HLS/MP3 manifests on the CDN.
4. **Response (204 No Content).**
5. **Error Cases:**

   * `404 Not Found` if stream not exist or belongs to another user.
   * `401 Unauthorized` if JWT missing or lacks `streams:write`.
   * `403 Forbidden` if user not owner.

---

### US-2.4: Stream Heartbeat (Relay Worker → API)

* **As a** Relay Worker,
* **I want** to post a heartbeat every 30 seconds (with listener count and uptime),
* **So that** the API can track real‐time availability and listener metrics.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/streams/{stream_id}/heartbeat` (JSON).
2. **Authentication:** Relay Worker authenticates via a shared secret or service account token.
3. **Request Body:**

   ```json
   {
     "listeners": 125,
     "uptime_seconds": 8040,
     "cpu_usage_percent": 37.5,
     "memory_usage_bytes": 512000000
   }
   ```
4. **Behavior:**

   * Validate `stream_id` exists.
   * Update an in‐memory store (Redis) or DB table with fields:

     * `last_heartbeat`: timestamp of receipt.
     * `listeners`, `uptime_seconds`, `cpu_usage_percent`, `memory_usage_bytes`.
   * If `stream_id` is soft‐deleted or `enabled=false`, ignore or return `410 Gone`.
5. **Response (200 OK):** `{ "status": "ok" }`.
6. **Error Cases:**

   * `404 Not Found` if invalid `stream_id`.
   * `401 Unauthorized` if Relay Worker not authenticated.

---

### US-2.5: Retrieve Live-Stream Status

* **As a** DJ,
* **I want** to view my stream’s current metadata—current track, bitrate, listener count, uptime, and relay status,
* **So that** I can monitor my live broadcast.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/streams/{stream_id}/status`.
2. **Authentication:**

   * If `visibility="private"`, require JWT with `streams:read` and (if `monetization_enabled=true`) an active subscription.
   * If `visibility="public"`, no auth required.
3. **Behavior:**

   * Check `last_heartbeat`; if `now() – last_heartbeat > 2 min`, set `relay_connected=false`; else `true`.
   * Query Shoutcast admin (via stored `shoutcast_url` + encrypted `stream_key`) to fetch `current_track` and `bitrate` (stubbed to return “Mock Artist – Track” + “128kbps” if admin endpoint unavailable).
   * Retrieve `listeners` and `uptime_seconds` from the heartbeat store.
   * Return:

     ```json
     {
       "stream_id": "uuid‐stream‐0001",
       "name": "Friday Night DJ Set",
       "current_track": "Mock Artist – Track",
       "bitrate": "128kbps",
       "listeners": 125,
       "uptime": "2h 14m",
       "relay_connected": true
     }
     ```
4. **Error Cases:**

   * `404 Not Found` if `stream_id` invalid.
   * `503 Service Unavailable` if relay has been offline > 5 min (optional).

---

### US-2.6: Serve Live HLS Manifest

* **As a** listener,
* **I want** to connect to `GET /v1/streams/{stream_id}/live.m3u8`,
* **So that** I can receive the HLS playlist and stream segments to hear the live broadcast.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/streams/{stream_id}/live.m3u8`.
2. **Authentication:**

   * If `visibility="private"`, require valid JWT with `streams:read` and an active subscription if `monetization_enabled=true`.
   * If `visibility="public"`, allow anonymous.
3. **Behavior:**

   * Proxy or fetch the latest `live.m3u8` from the Relay Worker Pod (e.g., `http://relay‐svc:8000/live.m3u8`) or from S3 if Relay writes to storage.
   * Return content‐type `application/vnd.apple.mpegurl`.
   * Set HTTP cache headers: `Cache‐Control: max‐age=30`.
4. **Response (200 OK):** HLS manifest body:

   ```
   #EXTM3U
   #EXT‐X‐VERSION:3
   #EXT‐X‐TARGETDURATION:6
   #EXT‐X‐MEDIA‐SEQUENCE:1024
   #EXTINF:6.000,
   https://cdn.example.com/streams/uuid‐stream‐0001/segment1024.ts
   ...
   ```
5. **Error Cases:**

   * `403 Forbidden` if unauthorized.
   * `404 Not Found` if `stream_id` invalid or no Relay Worker available.

---

### US-2.7: Serve Live MP3 Stream

* **As a** listener,
* **I want** to connect to `GET /v1/streams/{stream_id}/live.mp3`,
* **So that** I can receive a continuous MP3 stream of the live broadcast.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/streams/{stream_id}/live.mp3`.
2. **Authentication:** Same rules as HLS manifest.
3. **Behavior:**

   * Relay Worker proxies the raw Shoutcast MP3 feed (or re‐streams via ffmpeg).
   * Proxy the HTTP chunked response from Relay Worker so that client receives `audio/mpeg` continuously.
   * Set `Content‐Type: audio/mpeg`, `Transfer‐Encoding: chunked`.
4. **Response (200 OK):** Continuous MP3.
5. **Error Cases:**

   * `403 Forbidden` if unauthorized.
   * `404 Not Found` if `stream_id` invalid or relay down.

---

# Epic 3: On-Demand Playlist Management

**Epic Description:**
Enable DJs to upload MP3 files, generate HLS segments, create playlists (mix of uploaded and external tracks), and serve combined HLS/MP3 streams on demand.

---

### US-3.1: Upload Audio File for HLS Transcoding

* **As a** DJ,
* **I want** to upload an MP3 file to the system,
* **So that** it is stored and automatically transcoded into HLS segments.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/uploads/audio` (multipart/form-data).
2. **Authentication:** JWT with `playlists:write` or `podcasts:write`.
3. **Request:** Single form field `file` containing MP3. Optional form fields `title`, `artist`.
4. **Behavior:**

   * Validate content‐type `audio/mpeg`. Max size = 100 MB.
   * Store original MP3 in S3 at `uploads/audio/{user_id}/{upload_id}/original.mp3`.
   * Insert `uploads` record with `status='processing'`, `created_at=now()`, store `title`/`artist` if provided.
   * Launch a K8s Job (Transcoder) that:

     1. Downloads `original.mp3` from S3.
     2. Runs `ffmpeg -i original.mp3 -c:a copy -f hls -hls_time 10 -hls_list_size 0 /workdir/{upload_id}/hls/segment%03d.ts`.
     3. Uploads all TS segments and `manifest.m3u8` to S3 at `uploads/audio/{user_id}/{upload_id}/hls/`.
     4. Updates `uploads.status='ready'` and `completed_at=now()`. If error, set `status='failed'`, populate `error_message`.
5. **Response (201 Created):**

   ```json
   {
     "upload_id": "uuid‐upload‐0001",
     "storage_url": "s3://bucket/uploads/audio/{user_id}/uuid‐upload‐0001/original.mp3",
     "hls_manifest_url": "https://api.example.com/v1/uploads/audio/uuid‐upload‐0001/hls/manifest.m3u8",
     "status": "processing"
   }
   ```
6. **Error Cases:**

   * `400 Bad Request` if wrong content type or no file.
   * `413 Payload Too Large` if file > 100 MB.
   * `401 Unauthorized` if JWT missing or lacks `playlists:write`.

---

### US-3.2: Check Upload & Transcoding Status

* **As a** DJ,
* **I want** to check whether my uploaded MP3 has finished transcoding and the HLS manifest is ready,
* **So that** I know when I can use it in a playlist or podcast.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/uploads/audio/{upload_id}`.
2. **Authentication:** JWT with `playlists:read` (owner only).
3. **Behavior:**

   * Validate `upload_id` exists and belongs to current user.
   * Return:

     * `status`: one of `processing`, `ready`, `failed`.
     * If `ready`, include `hls_manifest_url` pointing to `https://api.example.com/v1/uploads/audio/{upload_id}/hls/manifest.m3u8`.
     * If `failed`, include `error_message`.
4. **Response (200 OK):**

   ```json
   {
     "upload_id": "uuid‐upload‐0001",
     "storage_url": "s3://bucket/uploads/audio/{user_id}/uuid‐upload‐0001/original.mp3",
     "hls_manifest_url": "https://api.example.com/v1/uploads/audio/uuid‐upload‐0001/hls/manifest.m3u8",
     "status": "ready",
     "error_message": null
   }
   ```
5. **Error Cases:**

   * `404 Not Found` if `upload_id` invalid or belongs to another user.
   * `401 Unauthorized` if JWT missing or lacks `playlists:read`.

---

### US-3.3: Create On-Demand Playlist

* **As a** DJ,
* **I want** to create a playlist mixing uploaded HLS‐ready tracks and external MP3 URLs,
* **So that** I can offer a continuous on‐demand stream to listeners.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/playlists` (JSON).
2. **Authentication:** JWT with `playlists:write`.
3. **Request Body:**

   ```json
   {
     "title": "Chill Evening Vibes",
     "description": "Smooth tracks for an evening stream.",
     "tracks": [
       {
         "source_type": "upload",
         "upload_id": "uuid‐upload‐0001",
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
     "visibility": "public",     // "public" or "private"
     "monetization_enabled": false
   }
   ```
4. **Behavior:**

   * Validate each track:

     * If `source_type='upload'`, ensure `uploads.status='ready'`.
     * If `source_type='external'`, perform HTTP HEAD request, confirm `200 OK` and `Content‐Type: audio/mpeg`.
   * Insert a `playlists` record with `visibility`, `monetization_enabled`, `created_at=now()`.
   * Insert one `tracks` record per array element.
   * If **all** tracks are from `upload` (and have existing HLS manifests), pre‐generate a combined HLS manifest:

     1. For each `upload_id`, fetch `/uploads/audio/{upload_id}/hls/manifest.m3u8` from S3.
     2. Concatenate their `<EXTINF>` + TS URIs (prefix with a common base URL) into a single manifest.
     3. Upload the new manifest to S3 at `/playlists/{playlist_id}/hls/manifest.m3u8`.
     4. Set `playlists.hls_ready=true`.
   * If any track is `external`, mark `playlists.hls_ready=false`. On first listener request, generate on‐the‐fly.
5. **Response (201 Created):**

   ```json
   {
     "playlist_id": "uuid‐playlist‐0001",
     "stream_urls": {
       "hls": "https://api.example.com/v1/playlists/uuid‐playlist‐0001/stream.m3u8",
       "mp3": "https://api.example.com/v1/playlists/uuid‐playlist‐0001/stream.mp3"
     }
   }
   ```
6. **Error Cases:**

   * `400 Bad Request` if required fields missing or invalid.
   * `422 Unprocessable Entity` if any `upload_id` not ready or external URL invalid.
   * `401 Unauthorized` if JWT missing or lacks `playlists:write`.

---

### US-3.4: Retrieve Playlist Metadata

* **As a** listener (or DJ),
* **I want** to fetch playlist details and track list,
* **So that** I can see what songs are included before streaming.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/playlists/{playlist_id}`.
2. **Authentication:**

   * If `visibility="private"`, require JWT with `playlists:read` and active subscription if `monetization_enabled=true`.
   * If `visibility="public"`, no auth required.
3. **Behavior:**

   * Verify `playlist_id` exists (and is not deleted).
   * Fetch playlist metadata: `title`, `description`, `visibility`, `monetization_enabled`, `created_at`, `updated_at`.
   * Fetch associated `tracks` ordered by insertion.
4. **Response (200 OK):**

   ```json
   {
     "playlist_id": "uuid‐playlist‐0001",
     "title": "Chill Evening Vibes",
     "description": "Smooth tracks for an evening stream.",
     "tracks": [
       {
         "track_id": "uuid‐track‐0001",
         "source_type": "upload",
         "upload_id": "uuid‐upload‐0001",
         "title": "Track One",
         "artist": "Artist A",
         "duration_seconds": 180
       },
       {
         "track_id": "uuid‐track‐0002",
         "source_type": "external",
         "url": "https://cdn.example.com/audio/track2.mp3",
         "title": "Track Two",
         "artist": "Artist B",
         "duration_seconds": 240
       }
     ],
     "visibility": "public",
     "monetization_enabled": false,
     "created_at": "2025-06-03T14:20:00Z",
     "updated_at": "2025-06-03T14:20:00Z"
   }
   ```
5. **Error Cases:**

   * `404 Not Found` if `playlist_id` invalid.
   * `403 Forbidden` if private and user lacks access.

---

### US-3.5: Update Existing Playlist

* **As a** DJ,
* **I want** to modify an existing playlist’s track list or metadata,
* **So that** I can keep my playlist up to date.

**Acceptance Criteria:**

1. **Endpoint:** `PUT /v1/playlists/{playlist_id}` (JSON).
2. **Authentication:** JWT with `playlists:write`, and playlist belongs to current user.
3. **Request Body:** Entire playlist object (same schema as creation).
4. **Behavior:**

   * Validate `playlist_id` belongs to user.
   * Validate all tracks as in creation.
   * Remove old `tracks` rows, insert new ones.
   * Update playlist metadata (`title`, `description`, `visibility`, `monetization_enabled`, `updated_at = now()`).
   * Regenerate combined HLS manifest if all tracks are uploaded‐type and ready; else mark `hls_ready=false`.
5. **Response (200 OK):**

   ```json
   {
     "playlist_id": "uuid‐playlist‐0001",
     "updated": true
   }
   ```
6. **Error Cases:**

   * `404 Not Found` if `playlist_id` invalid.
   * `403 Forbidden` if not owner.
   * `400 Bad Request` or `422 Unprocessable Entity` on invalid tracks.

---

### US-3.6: Delete Playlist

* **As a** DJ,
* **I want** to delete one of my playlists,
* **So that** it is no longer available to listeners.

**Acceptance Criteria:**

1. **Endpoint:** `DELETE /v1/playlists/{playlist_id}`.
2. **Authentication:** JWT with `playlists:write`, user must own the playlist.
3. **Behavior:**

   * Soft‐delete `playlists` row (`deleted_at=now()`).
   * Delete associated `tracks` (or soft‐delete them).
   * Invalidate any generated HLS/MP3 files on CDN (purge or set TTL=0).
4. **Response (204 No Content).**
5. **Error Cases:**

   * `404 Not Found` if `playlist_id` invalid.
   * `403 Forbidden` if user not owner.

---

### US-3.7: Serve Playlist HLS Manifest

* **As a** listener,
* **I want** to connect to `GET /v1/playlists/{playlist_id}/stream.m3u8`,
* **So that** I can stream the combined playlist via HLS.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/playlists/{playlist_id}/stream.m3u8`.
2. **Authentication:**

   * If `visibility="private"`, require JWT with `playlists:read` and active subscription if `monetization_enabled=true`.
   * If `visibility="public"`, no auth required.
3. **Behavior (two modes):**

   * **Pre‐Generated (if `hls_ready=true`):** Proxy S3 object at `/playlists/{playlist_id}/hls/manifest.m3u8` to client.
   * **On‐the‐Fly (if `hls_ready=false`):**

     1. Assemble a minimal HLS manifest by referencing each track’s HLS (if upload) or external MP3 (if external) via a template:

        ```
        #EXTM3U
        #EXT‐INF:180.000,
        https://cdn.example.com/uploads/audio/{upload_id}/hls/segment000.ts
        ...
        #EXTINF:240.000,
        https://external.example.com/track2.mp3
        ```
     2. Serve the assembled manifest without caching (or short TTL).
4. **Response (200 OK, `application/vnd.apple.mpegurl`).**
5. **Error Cases:**

   * `403 Forbidden` if private + unauthorized.
   * `404 Not Found` if `playlist_id` invalid.

---

### US-3.8: Serve Playlist Continuous MP3

* **As a** listener,
* **I want** to connect to `GET /v1/playlists/{playlist_id}/stream.mp3`,
* **So that** I can receive a single continuous MP3 stream concatenating all tracks.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/playlists/{playlist_id}/stream.mp3`.
2. **Authentication:** Same rules as HLS endpoint.
3. **Behavior:**

   * Stream a chained MP3 by running ffmpeg:

     ```
     ffmpeg -i "concat:/uploads/audio/{upload1}.mp3|/external/track2.mp3|..." \
       -c copy -f mp3 pipe:1
     ```
   * Use `Transfer‐Encoding: chunked` so the client receives data as it is available.
   * If any track is `external`, re‐stream from the URL; if `upload`, fetch from S3.
4. **Response (200 OK, `audio/mpeg`).**
5. **Error Cases:**

   * `403 Forbidden` if private + unauthorized.
   * `404 Not Found` if `playlist_id` invalid.

---

# Epic 4: Podcast Hosting & RSS Feed

**Epic Description:**
Allow DJs to create podcasts (series), add episodes (uploads or external), automatically generate an RSS 2.0 feed (with optional custom domain), and serve RSS to subscribers.

---

### US-4.1: Create Podcast Series

* **As a** DJ,
* **I want** to create a podcast series with title, description, language, author, cover image URL, explicit flag, and optional custom domain,
* **So that** I can begin adding episodes and have an RSS feed.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/podcasts` (JSON).
2. **Authentication:** JWT with `podcasts:write`.
3. **Request Body:**

   ```json
   {
     "title": "Tech DJ Podcast",
     "description": "Weekly interviews with top DJs and music producers.",
     "language": "en-us",
     "author": "DJ Example",
     "image_url": "https://cdn.example.com/images/podcast-cover.jpg",
     "explicit": false,
     "custom_domain": null,
     "monetization_enabled": false
   }
   ```
4. **Behavior:**

   * Validate fields:

     * `language` matches pattern `^[a-z]{2}-[a-z]{2}$`.
     * `image_url` is a valid URL (optional check: `GET` returns image MIME).
   * Insert new `podcasts` row with `custom_domain=null`, `monetization_enabled=false`, `created_at=now()`.
   * Generate `rss_feed_url = "/v1/podcasts/{podcast_id}/rss.xml"`.
5. **Response (201 Created):**

   ```json
   {
     "podcast_id": "uuid‐podcast‐0001",
     "rss_feed_url": "https://api.example.com/v1/podcasts/uuid‐podcast‐0001/rss.xml"
   }
   ```
6. **Error Cases:**

   * `400 Bad Request` if required fields missing or invalid.
   * `409 Conflict` if `custom_domain` already in use.
   * `401 Unauthorized` if JWT missing or lacks `podcasts:write`.

---

### US-4.2: Retrieve Podcast Metadata & Episodes

* **As a** listener (or DJ),
* **I want** to fetch podcast details (title, description, language, author, image, explicit, custom domain status, monetization flag) and a list of all episodes,
* **So that** I can view what content is available.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/podcasts/{podcast_id}`.
2. **Authentication:**

   * If `monetization_enabled=true`, require JWT with active subscription.
   * Otherwise, public.
3. **Behavior:**

   * Validate `podcast_id` exists and not deleted.
   * Retrieve podcast fields and array of episodes (ordered by `publication_date DESC`):

     ```json
     [
       {
         "episode_id": "uuid-ep-1001",
         "source_type": "upload",
         "upload_id": "uuid-upload-0002",
         "title": "Episode 1: Live from Ibiza",
         "description": "Exclusive set and interview.",
         "duration_seconds": 3600,
         "publication_date": "2025-06-10T14:00:00Z",
         "episode_number": 1,
         "explicit": false,
         "monetization_required": false
       },
       ...
     ]
     ```
4. **Response (200 OK):**

   ```json
   {
     "podcast_id": "uuid‐podcast‐0001",
     "title": "Tech DJ Podcast",
     "description": "Weekly interviews with top DJs and music producers.",
     "language": "en-us",
     "author": "DJ Example",
     "image_url": "https://cdn.example.com/images/podcast-cover.jpg",
     "explicit": false,
     "custom_domain": null,
     "monetization_enabled": false,
     "rss_feed_url": "https://api.example.com/v1/podcasts/uuid‐podcast‐0001/rss.xml",
     "episodes": [ /* array as above */ ]
   }
   ```
5. **Error Cases:**

   * `404 Not Found` if `podcast_id` invalid.
   * `403 Forbidden` if monetized and unauthorized.

---

### US-4.3: Add Podcast Episode

* **As a** DJ,
* **I want** to add a new episode (upload or external) with title, description, media, publication date, episode number, explicit flag, and monetization requirement,
* **So that** it appears in my RSS feed.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/podcasts/{podcast_id}/episodes` (JSON).
2. **Authentication:** JWT with `podcasts:write`, must own `podcast_id`.
3. **Request Body:**

   ```json
   {
     "title": "Episode 1: Live from Ibiza",
     "description": "Exclusive set and interview.",
     "source_type": "upload",
     "upload_id": "uuid‐upload‐0002",
     "media_url": null,            // if source_type='upload'
     "duration_seconds": 3600,
     "publication_date": "2025-06-10T14:00:00Z",
     "episode_number": 1,
     "explicit": false,
     "monetization_required": false
   }
   ```

   *(Or, if `source_type='external'`: `upload_id=null`, `media_url='https://...'`.)*
4. **Behavior:**

   * Validate `podcast_id` exists and belongs to user.
   * Validate `publication_date` is a valid ISO timestamp, `episode_number` unique for that podcast.
   * If `source_type='upload'`, ensure that `uploads.status='ready'`.
   * If `source_type='external'`, HEAD check media URL for `audio/mpeg`.
   * Insert new `episodes` row with `created_at=now()`.
   * Trigger “RSS regeneration” (either immediately or via background job).
5. **Response (201 Created):**

   ```json
   {
     "episode_id": "uuid‐episode‐1001"
   }
   ```
6. **Error Cases:**

   * `400 Bad Request` if fields missing/invalid.
   * `404 Not Found` if `podcast_id` invalid.
   * `422 Unprocessable Entity` if `upload_id` not ready or external URL invalid.
   * `409 Conflict` if `episode_number` already exists.
   * `401 Unauthorized` if JWT missing or lacks `podcasts:write`.

---

### US-4.4: Update Podcast Episode

* **As a** DJ,
* **I want** to modify an existing episode’s metadata or media URL,
* **So that** my RSS feed always reflects the correct information.

**Acceptance Criteria:**

1. **Endpoint:** `PATCH /v1/podcasts/{podcast_id}/episodes/{episode_id}` (JSON).
2. **Authentication:** JWT with `podcasts:write`, owner of both podcast and episode.
3. **Request Body:** Any subset of fields from creation (e.g., `title`, `media_url`, `publication_date`, etc.).
4. **Behavior:**

   * Validate `podcast_id` & `episode_id` exist and belong to user.
   * Validate updated fields (e.g., if changing `source_type`, enforce conditional logic).
   * Update `episodes` record fields; set `updated_at=now()`.
   * Regenerate RSS feed (background or synchronous).
5. **Response (200 OK):**

   ```json
   {
     "episode_id": "uuid‐episode‐1001",
     "updated_fields": [ "media_url", "monetization_required" ]
   }
   ```
6. **Error Cases:**

   * `404 Not Found` if invalid `podcast_id` or `episode_id`.
   * `403 Forbidden` if not owner.
   * `400 Bad Request` or `422 Unprocessable Entity` for invalid updates.

---

### US-4.5: Delete Podcast Episode

* **As a** DJ,
* **I want** to delete an episode from my podcast,
* **So that** it no longer appears in the RSS feed.

**Acceptance Criteria:**

1. **Endpoint:** `DELETE /v1/podcasts/{podcast_id}/episodes/{episode_id}`.
2. **Authentication:** JWT with `podcasts:write`, owner.
3. **Behavior:**

   * Soft‐delete episode (`deleted_at=now()`).
   * Regenerate RSS feed.
   * Invalidate cached RSS on CDN.
4. **Response (204 No Content).**
5. **Error Cases:**

   * `404 Not Found` if invalid IDs.
   * `403 Forbidden` if not owner.

---

### US-4.6: Serve Podcast RSS Feed

* **As a** listener (or podcast client),
* **I want** to fetch the RSS XML at `/v1/podcasts/{podcast_id}/rss.xml` (or custom domain),
* **So that** I can subscribe and receive new episode notifications.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/podcasts/{podcast_id}/rss.xml` (or `GET https://{custom_domain}/rss.xml`).
2. **Authentication:**

   * If **no** episodes require `monetization_required=true`, allow public.
   * If **any** episode has `monetization_required=true`, require JWT with active subscription.
3. **Behavior:**

   * If cached RSS exists in S3/Redis and is < 300 s old, serve it.
   * Otherwise regenerate:

     1. Load podcast metadata (title, description, language, author, image\_url, explicit).
     2. Query all non‐deleted episodes, ordered by `publication_date DESC`.
     3. Build RSS 2.0 XML with iTunes tags:

        ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
          <channel>
            <title>Tech DJ Podcast</title>
            <link>https://api.example.com/v1/podcasts/uuid-podcast-0001</link>
            <description>Weekly interviews ...</description>
            <language>en-us</language>
            <itunes:author>DJ Example</itunes:author>
            <itunes:image href="https://cdn.example.com/images/podcast-cover.jpg"/>
            <itunes:explicit>no</itunes:explicit>
            <item>
              <title>Episode 1: Live from Ibiza</title>
              <description>Exclusive set and interview.</description>
              <enclosure url="https://cdn.example.com/podcasts/{podcast_id}/episode1.mp3" length="3600000" type="audio/mpeg"/>
              <guid>uuid-episode-1001</guid>
              <pubDate>Tue, 10 Jun 2025 14:00:00 GMT</pubDate>
              <itunes:duration>01:00:00</itunes:duration>
              <itunes:explicit>no</itunes:explicit>
            </item>
            <!-- more <item> entries -->
          </channel>
        </rss>
        ```
   * Return `Content‐Type: application/rss+xml`.
4. **Response (200 OK):** RSS XML body.
5. **Error Cases:**

   * `404 Not Found` if `podcast_id` invalid.
   * `403 Forbidden` if any episode paywalled and user lacks subscription.

---

### US-4.7: Register Custom Domain for Podcast RSS (Stub)

* **As a** DJ,
* **I want** to register a custom domain (e.g., `podcast.djname.com`) for my RSS feed,
* **So that** listeners can subscribe at my own domain.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/domains` (JSON).
2. **Authentication:** JWT with `domains:write`.
3. **Request Body:**

   ```json
   {
     "custom_domain": "podcast.djname.com"
   }
   ```
4. **Behavior (staging stub):**

   * Validate domain format (regex: `^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`).
   * Ensure domain not already registered (unique).
   * Insert `domains` row with `verification_status="pending"`, `tls_status="pending"`, `dns_challenge_record="acme-challenge=STAGING123"`, `created_at=now()`.
   * Return instructions to user: e.g., “Add TXT record `acme-challenge=STAGING123` to your DNS.”
5. **Response (201 Created):**

   ```json
   {
     "domain_id": "uuid-domain-0001",
     "custom_domain": "podcast.djname.com",
     "verification_status": "pending",
     "tls_status": "pending",
     "dns_challenge_record": "acme-challenge=STAGING123"
   }
   ```
6. **Error Cases:**

   * `400 Bad Request` if invalid domain format.
   * `409 Conflict` if domain already registered.
   * `401 Unauthorized` if JWT missing or lacks `domains:write`.

---

### US-4.8: Check Custom Domain Verification & TLS Status (Stub)

* **As a** DJ,
* **I want** to poll for my custom domain’s DNS verification and TLS issuance status,
* **So that** I know when my custom RSS URL is live.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/domains/{domain_id}`.
2. **Authentication:** JWT with `domains:read`.
3. **Behavior (staging stub):**

   * Simulate DNS check: if `now() – created_at >= 1 minute`, flip `verification_status="verified"`.
   * Simulate TLS issuance: flip `tls_status="issued"`.
   * Return current statuses and timestamps:

     ```json
     {
       "domain_id": "uuid-domain-0001",
       "custom_domain": "podcast.djname.com",
       "verification_status": "verified",
       "tls_status": "issued",
       "last_checked": "2025-06-03T17:55:00Z"
     }
     ```
4. **Response (200 OK).**
5. **Error Cases:**

   * `404 Not Found` if invalid `domain_id`.
   * `401 Unauthorized` if JWT missing or lacks `domains:read`.

---

# Epic 5: Analytics & Reporting

**Epic Description:**
Collect and expose listener counts for live streams and play counts for playlists/podcasts, with date‐range querying and basic aggregation.

---

### US-5.1: Record Live‐Stream Analytics on Heartbeat

* **As a** system,
* **I want** to upsert daily listener counts into an analytics table each time a heartbeat arrives,
* **So that** I can provide historical data to DJs.

**Acceptance Criteria:**

1. **Trigger:** Upon receiving `POST /v1/streams/{stream_id}/heartbeat`.
2. **Behavior:**

   * Compute `date = current_date` (UTC).
   * Upsert into `analytics` table row where `(resource_type='stream', resource_id=stream_id, date, metric='listeners')`.
   * If existing row for today, add `listeners` to `value`; otherwise insert new row with `value=listeners`.
3. **Data Schema (analytics):**
   \| analytics\_id (UUID) | resource\_type (VARCHAR(10)) | resource\_id (UUID) | date (DATE) | metric (VARCHAR(20)) | value (INTEGER) | created\_at (TIMESTAMPTZ) |
4. **Example:** If `POST /heartbeat` reports `listeners=120`, and no row for (stream\_id, 2025-06-03, 'listeners') exists, insert with `value=120`. If called again with `listeners=80` same day, update `value=200`.
5. **Error Cases:**

   * If `stream_id` invalid, heartbeat returns `404`; no analytics update.

---

### US-5.2: Record Playlist Play Count

* **As a** system,
* **I want** to increment a daily play counter each time `GET /v1/playlists/{playlist_id}/stream.m3u8` is requested,
* **So that** I can track how many times each playlist was streamed.

**Acceptance Criteria:**

1. **Trigger:** Upon successful `GET /v1/playlists/{playlist_id}/stream.m3u8`.
2. **Behavior:**

   * Compute `date = current_date`.
   * Upsert into `analytics` where `(resource_type='playlist', resource_id=playlist_id, date, metric='play_count')`.
   * Add 1 to `value` if existing, else insert new with `value=1`.
3. **Example:** First request today for playlist A → insert `(playlist, A, 2025-06-03, play_count, 1)`. Next request → update to `(value=2)`.
4. **Error Cases:**

   * If `playlist_id` invalid or user unauthorized, do not increment (return `404` or `403`).

---

### US-5.3: Retrieve Stream Analytics Over Date Range

* **As a** DJ,
* **I want** to query my stream’s listener counts for a given date range,
* **So that** I can review performance trends.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/analytics/streams/{stream_id}` with query params `?from=YYYY-MM-DD&to=YYYY-MM-DD`.
2. **Authentication:** JWT with `analytics:read` and owner must own `stream_id`, OR Admin.
3. **Behavior:**

   * Validate `from ≤ to`, both valid dates.
   * Query `analytics` for `(resource_type='stream', resource_id=stream_id, date >= from AND date <= to, metric='listeners')`, sorted by `date`.
   * Compute `peak_listeners = MAX(value)` and `total_listens = SUM(value)` over that range.
4. **Response (200 OK):**

   ```json
   {
     "stream_id": "uuid‐stream‐0001",
     "daily_listeners": [
       { "date": "2025-06-01", "listeners": 120 },
       { "date": "2025-06-02", "listeners": 98 }
     ],
     "peak_listeners": 120,
     "total_listens": 218
   }
   ```
5. **Error Cases:**

   * `400 Bad Request` if date format invalid or `from > to`.
   * `404 Not Found` if `stream_id` invalid.
   * `403 Forbidden` if user not owner and not Admin.

---

### US-5.4: Retrieve Playlist Analytics Over Date Range

* **As a** DJ,
* **I want** to query my playlist’s play counts for a given date range,
* **So that** I can see how often it’s being streamed.

**Acceptance Criteria:**

1. **Endpoint:** `GET /v1/analytics/playlists/{playlist_id}` with `?from=YYYY-MM-DD&to=YYYY-MM-DD`.
2. **Authentication:** JWT with `analytics:read` and owner must own `playlist_id`, OR Admin.
3. **Behavior:**

   * Validate date args.
   * Query `analytics` for `(resource_type='playlist', resource_id=playlist_id, date >= from AND date <= to, metric='play_count')`.
   * Compute `total_plays = SUM(value)`.
4. **Response (200 OK):**

   ```json
   {
     "playlist_id": "uuid‐playlist‐0001",
     "plays": [
       { "date": "2025-06-01", "play_count": 75 },
       { "date": "2025-06-02", "play_count": 80 }
     ],
     "total_plays": 155
   }
   ```
5. **Error Cases:**

   * `400 Bad Request` if date invalid.
   * `404 Not Found` if `playlist_id` invalid.
   * `403 Forbidden` if not owner/Admin.

---

# Epic 6: Monetization & Ad Insertion

**Epic Description:**
Enable DJs to create subscription plans, subscribers to join plans, and enforce paywalls on streams, playlists, and podcast episodes. Provide endpoints to assign ad markers for live streams. (Stripe integration is stubbed in MVP.)

---

### US-6.1: Create Subscription Plan (Stub)

* **As an** Admin (or DJ),
* **I want** to define a subscription plan (name, price, interval, features),
* **So that** listeners can purchase access to monetized content.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/monetization/plans` (JSON).
2. **Authentication:** JWT with `monetization:write` (Admin or DJ).
3. **Request Body:**

   ```json
   {
     "name": "Premium Live Access",
     "price_cents": 500,
     "currency": "USD",
     "billing_interval": "monthly",  // "monthly" or "yearly"
     "features": ["live_streams", "playlist_access", "podcast_downloads"]
   }
   ```
4. **Behavior (stubbed):**

   * Insert `monetization_plans` record with `stripe_product_id="test_prod"`, `stripe_price_id="test_price"`, `created_at=now()`.
5. **Response (201 Created):**

   ```json
   {
     "plan_id": "uuid‐plan‐0001",
     "stripe_product_id": "test_prod",
     "stripe_price_id": "test_price"
   }
   ```
6. **Error Cases:**

   * `400 Bad Request` if missing/invalid fields.
   * `401 Unauthorized` if JWT missing or lacks `monetization:write`.

---

### US-6.2: Subscribe to a Plan (Stub)

* **As a** user (DJ or listener),
* **I want** to subscribe to a plan by providing a payment method,
* **So that** I gain access to paywalled streams or playlists.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/monetization/subscriptions` (JSON).
2. **Authentication:** JWT with `monetization:write`.
3. **Request Body:**

   ```json
   {
     "plan_id": "uuid‐plan‐0001",
     "stripe_payment_method_id": "test_pm"
   }
   ```
4. **Behavior (stubbed):**

   * Create `subscriptions` record with `stripe_subscription_id="test_sub"`, `status="active"`, `created_at=now()`, `expires_at=now()+30days`.
5. **Response (201 Created):**

   ```json
   {
     "subscription_id": "uuid‐sub‐0001",
     "status": "active",
     "stripe_subscription_id": "test_sub"
   }
   ```
6. **Error Cases:**

   * `400 Bad Request` if `plan_id` invalid.
   * `402 Payment Required` if “payment” fails (simulate failure if PM ID = `"fail_pm"`).
   * `401 Unauthorized` if missing/invalid JWT.

---

### US-6.3: Enforce Paywall on Monetized Streams/Playlists/Podcasts

* **As a** listener,
* **I want** to be denied access to any live stream, playlist, or podcast episode marked `monetization_enabled=true` unless I have an active subscription,
* **So that** only paying subscribers can consume premium content.

**Acceptance Criteria:**

1. **Middleware Logic:**

   * On each protected endpoint (`GET /v1/streams/{id}/live.m3u8`, `/live.mp3`, `/v1/playlists/{id}/stream.*`, `/v1/podcasts/{podcast_id}/rss.xml` if any episode paywalled), check:

     1. Retrieve `user_id` from JWT.
     2. Query `subscriptions` table for `(user_id, plan_id)` where `status='active'` and `expires_at > now()`.
   * If no active subscription, return `403 Forbidden`.
2. **Stream Endpoint Example:**

   * DJ sets `"monetization_enabled": true` on a stream.
   * Listener calls `GET /v1/streams/{stream_id}/live.m3u8` with JWT.

     * If subscription exists and active: serve HLS.
     * Else: `403 Forbidden` with JSON `{"error":"Subscription required", "code":403}`.
3. **Playlist & Podcast:** similar rules.

---

### US-6.4: Assign Ad Markers to Live Stream (Stub)

* **As a** DJ,
* **I want** to configure ad insertion points (pre‐roll, mid‐roll) for my live stream,
* **So that** ads can be inserted at runtime.

**Acceptance Criteria:**

1. **Endpoint:** `POST /v1/streams/{stream_id}/ads` (JSON).
2. **Authentication:** JWT with `monetization:write`, owner of `stream_id`.
3. **Request Body:**

   ```json
   {
     "ad_markers": [
       { "position_seconds": 300, "duration_seconds": 30, "ad_type": "pre-roll" },
       { "position_seconds": 1800, "duration_seconds": 60, "ad_type": "mid-roll" }
     ]
   }
   ```
4. **Behavior (stubbed):**

   * Validate each marker: `position_seconds ≥ 0`, `duration_seconds > 0`, `ad_type` in \[`pre-roll`,`mid-roll`,`post-roll`].
   * Insert each into `streams_ads` table with `created_at=now()`.
   * Relay Worker (stub) will read these markers from DB and log “AD insertion scheduled”.
5. **Response (200 OK):**

   ```json
   {
     "stream_id": "uuid‐stream‐0001",
     "ad_markers": [
       { "position_seconds": 300, "duration_seconds": 30, "ad_type": "pre-roll" },
       { "position_seconds": 1800, "duration_seconds": 60, "ad_type": "mid-roll" }
     ]
   }
   ```
6. **Error Cases:**

   * `400 Bad Request` if any marker invalid or missing fields.
   * `404 Not Found` if `stream_id` invalid.
   * `403 Forbidden` if not owner.

---

# Epic 7: Infrastructure, CI/CD & Deployment

**Epic Description:**
Provision a shared Git repository, set up CI/CD pipelines for linting, testing, and Docker builds; configure a Kubernetes staging environment and Helm charts to deploy all components.

---

### US-7.1: Initialize Git Repository & Branch Strategy

* **As a** DevOps engineer,
* **I want** to create the project repository with `develop` and `main` branches,
* **So that** we have a centralized codebase with a clear branching policy.

**Acceptance Criteria:**

1. Repository exists on GitHub (or equivalent).
2. Branch protection: `main` cannot be pushed directly; all merges via pull requests.
3. `develop` branch is the integration branch for sprint work.
4. README with basic project overview and setup instructions is committed.

---

### US-7.2: Configure CI Pipeline (GitHub Actions)

* **As a** DevOps engineer,
* **I want** CI steps to run on every PR and push to `develop`,
* **So that** code is automatically linted, tested, and Docker images are built.

**Acceptance Criteria:**

1. **Lint Step:** Run ESLint (if Node.js) or Pylint (if Python) across the codebase; fail on any errors.
2. **Test Step:** Run unit tests with coverage threshold (≥ 80%).
3. **Docker Build Step:** Build `api` and `relay-worker` Docker images; tag them with `latest` and commit SHA.
4. **Artifact Publishing:** On successful build of `main`, publish Docker images to a registry.
5. **Notifications:** Send build status to a Slack channel.

---

### US-7.3: Provision Kubernetes Staging Namespace & Helm Chart

* **As a** DevOps engineer,
* **I want** a `audio-api-staging` namespace in K8s and a Helm chart (with templates) for API + Relay Worker,
* **So that** we can deploy consistently and configure parameters.

**Acceptance Criteria:**

1. Create K8s namespace `audio-api-staging`.
2. Write a `Chart.yaml` with metadata, version, app name.
3. Under `templates/`:

   * `deployment-api.yaml`: Deployment spec for the API server, with placeholders for `image.repository`, `image.tag`, `env`.
   * `service-api.yaml`: ClusterIP Service exposing port 80.
   * `deployment-relay.yaml`: Deployment spec for Relay Worker, autoscaling disabled (one pod per stream).
   * `service-relay.yaml`: ClusterIP Service at port 8000.
   * `configmap.yaml`: Config map for environment variables (DB connection string, JWT public key, S3 bucket, etc.).
4. Write `values.yaml` with defaults (e.g., `replicaCount: 2` for API, `resources` for CPU/memory).
5. Verify that `helm install` or `helm upgrade` in staging successfully creates all resources.

---

### US-7.4: Health Check & Monitoring Setup

* **As a** DevOps engineer,
* **I want** a health check endpoint and basic Prometheus/Grafana metrics integration,
* **So that** we can monitor service health.

**Acceptance Criteria:**

1. **Health Endpoint:** `GET /v1/health` returns `{ "status":"ok" }`.
2. Relay Worker also exposes `GET /healthz` returning `200 OK`.
3. Instrument API to expose metrics at `/metrics` (Prometheus format):

   * `http_requests_total{method,code,endpoint}`
   * `http_request_duration_seconds` histograms
4. Add a basic Grafana dashboard showing:

   * Request rate (per minute)
   * Error rate (4xx/5xx)
   * API pod CPU/Memory
   * Relay Worker pod listener counts (from heartbeat metrics)
5. Ensure Prometheus can scrape metrics from `api-service:8080/metrics`.

---

# Epic 8: Error Handling, Validation & Security

**Epic Description:**
Implement consistent request validation, sanitized error responses, RBAC middleware, input sanitization, rate limiting, and basic security practices.

---

### US-8.1: Standardize Error Responses

* **As a** developer,
* **I want** every API error to return a consistent JSON structure with an `error` message and `code`,
* **So that** clients can uniformly handle errors.

**Acceptance Criteria:**

1. All 4xx/5xx responses:

   ```json
   {
     "error": "Descriptive message",
     "code": <HTTP_STATUS_CODE>
   }
   ```
2. Implement an error‐handling middleware to catch uncaught exceptions and format them.
3. Examples:

   * `400 Bad Request`: `{"error":"Invalid request body","code":400}`
   * `401 Unauthorized`: `{"error":"Authentication required","code":401}`
   * `403 Forbidden`: `{"error":"Access denied","code":403}`
   * `404 Not Found`: `{"error":"Playlist not found","code":404}`
   * `422 Unprocessable Entity`: `{"error":"Cannot connect to Shoutcast source","code":422}`
   * `500 Internal Server Error`: `{"error":"An unexpected error occurred","code":500}`

---

### US-8.2: Request Body Validation

* **As a** developer,
* **I want** to validate all request bodies against JSON Schemas (or Pydantic models),
* **So that** malformed payloads are rejected early with `400 Bad Request`.

**Acceptance Criteria:**

1. For each endpoint, define a JSON Schema (or Pydantic/DTO class) describing required and optional fields, data types, formats (e.g., `date-time`).
2. Parse and validate incoming JSON; on any schema violation, return `400 Bad Request` with details:

   ```json
   {
     "error": "Field ‘email’ must be a valid email address.",
     "code": 400
   }
   ```
3. Examples:

   * `POST /v1/auth/register` validation: `email` must match email regex, `password` min length 8.
   * `POST /v1/streams`: `visibility` must be `"public"` or `"private"`.
   * `POST /v1/podcasts/{id}/episodes`: `publication_date` must be valid ISO 8601.

---

### US-8.3: RBAC & Scope Enforcement

* **As a** system,
* **I want** to enforce role‐based access (Admin vs DJ) and scope‐based permissions (`streams:read`, `streams:write`, etc.),
* **So that** only authorized users can call protected endpoints.

**Acceptance Criteria:**

1. JWT includes a `role` claim (`"dj"` or `"admin"`) and a `scopes` array (e.g., `["streams:read","streams:write","playlists:read"]`).
2. Middleware:

   * Extract and verify JWT (`RS256`), validate signature & expiration.
   * Check `role` if endpoint requires Admin (e.g., `GET /v1/users` requires `role="admin"`).
   * Check that `scopes` contains required scope for each endpoint:

     * `streams:write` for `POST /v1/streams`, `PATCH /v1/streams/{id}`, `DELETE /v1/streams/{id}`, `POST /v1/streams/{id}/ads`.
     * `streams:read` for `GET /v1/streams/{id}/status`, `GET /v1/streams/{id}/live.*`.
     * `playlists:write` for `POST /v1/playlists`, `PUT /v1/playlists/{id}`, `DELETE /v1/playlists/{id}`.
     * `playlists:read` for `GET /v1/playlists/{id}`, streaming endpoints.
     * `podcasts:write` for `POST /v1/podcasts`, episode CRUD.
     * `podcasts:read` for `GET /v1/podcasts/{id}`, RSS.
     * `monetization:write` for plans/subscriptions.
     * `analytics:read` for analytics endpoints.
3. Return `401 Unauthorized` if JWT missing or invalid; `403 Forbidden` if scope/role insufficient.

---

### US-8.4: Input Sanitization & SQL Injection Prevention

* **As a** developer,
* **I want** to ensure no user‐supplied string can inject SQL or insert malicious HTML,
* **So that** the system is secure from common injection attacks.

**Acceptance Criteria:**

1. Use parameterized queries or an ORM (e.g., Sequelize, SQLAlchemy) for all DB interactions—no string interpolation.
2. Sanitize user‐provided metadata fields (`name`, `description`, etc.) when rendering in any web UI (HTML‐escape).
3. Validate URLs strictly (e.g., use a URL parser to ensure `http://` or `https://`).
4. No observed SQL injection vulnerability in tests.

---

### US-8.5: Rate Limiting & Abuse Prevention

* **As a** system,
* **I want** to throttle API requests to prevent DDoS/abuse,
* **So that** the service remains available under load.

**Acceptance Criteria:**

1. **Rate Limits:**

   * Metadata endpoints (`GET /v1/streams/{id}/status`, `GET /v1/playlists/{id}`, `GET /v1/podcasts/{id}`): 100 requests/min per user (by JWT).
   * Write endpoints (`POST /v1/...`, `PATCH /v1/...`, `DELETE /v1/...`): 10 requests/min per user.
   * Public streaming endpoints (`GET /v1/streams/{id}/live.*`, `GET /v1/playlists/{id}/stream.*`, `GET /v1/podcasts/{id}/rss.xml`): 10,000 requests/min per IP.
2. If a client exceeds their limit, return `429 Too Many Requests` with:

   ```json
   {
     "error": "Rate limit exceeded. Try again in 60 seconds.",
     "code": 429
   }
   ```
3. Implement using a Redis‐backed rate limiter (e.g., token bucket).

---

# Epic 9: Error & Empty States, Documentation & Testing

**Epic Description:**
Provide friendly error and empty‐state messages, comprehensive API documentation (OpenAPI + Postman), and a robust test suite (unit, integration, E2E).

---

### US-9.1: Friendly Error & Empty States in API

* **As a** user of the API,
* **I want** to receive clear error messages or empty‐state responses (e.g., “No books uploaded”),
* **So that** I understand what went wrong or why no data is available.

**Acceptance Criteria:**

1. **No Resource:** If a GET finds no data (e.g., `GET /v1/playlists` when user has none), return:

   ```json
   {
     "playlists": [],
     "message": "You have no playlists yet."
   }
   ```
2. **Invalid File Type:** `POST /v1/uploads/audio` with non‐MP3 file returns `400`:

   ```json
   {
     "error": "Unsupported file type. Please upload an MP3.",
     "code": 400
   }
   ```
3. **No Episodes:** If `GET /v1/podcasts/{id}` and podcast has no episodes:

   ```json
   {
     "podcast_id": "uuid",
     "episodes": [],
     "message": "No episodes yet. Add your first episode!"
   }
   ```
4. **Fallback for Transcoding Failure:** After upload, if `status="failed"`, `GET /v1/uploads/{id}` returns:

   ```json
   {
     "upload_id": "uuid",
     "status": "failed",
     "error_message": "Transcoding error: unsupported sample rate."
   }
   ```

---

### US-9.2: OpenAPI Documentation

* **As a** developer,
* **I want** an OpenAPI (Swagger) spec covering all endpoints,
* **So that** client teams can generate SDKs and understand the API contract.

**Acceptance Criteria:**

1. A valid `openapi.yaml` (or `openapi.json`) in `/docs/`, describing:

   * All endpoints (`/v1/auth/*`, `/v1/streams/*`, `/v1/uploads/*`, `/v1/playlists/*`, `/v1/podcasts/*`, `/v1/monetization/*`, `/v1/analytics/*`, `/v1/domains/*`).
   * Request parameters, request bodies (schemas), response schemas (success & errors).
   * Security definitions (JWT bearer auth).
2. `swagger-ui` can be served locally (e.g., `npm run serve-docs`) and shows interactive docs.
3. All endpoints have example requests/responses.

---

### US-9.3: Postman Collection

* **As a** QA or client developer,
* **I want** a Postman collection with example requests for every endpoint,
* **So that** I can manually test or import into automated tests.

**Acceptance Criteria:**

1. Export a Postman `.json` collection in `/docs/postman_collection.json`.
2. Each request includes:

   * Correct URL (pointing to staging: `https://api.staging.example.com/v1/...`).
   * Authorization header example (`Bearer <JWT>`).
   * Example request body for POST/PATCH.
   * Tests scripts to validate response codes.

---

### US-9.4: Unit Test Coverage

* **As a** QA engineer,
* **I want** unit tests covering at least 80% of the new code,
* **So that** we catch regressions early.

**Acceptance Criteria:**

1. All services (auth, stream registration, upload/transcode logic, playlist assembly, podcast RSS generation, analytics insertion, monetization middleware) have unit tests.
2. Coverage report shows ≥ 80% lines covered for new modules.
3. Tests run as part of CI; any coverage drop fails the build.

---

### US-9.5: Integration & E2E Tests

* **As a** QA engineer,
* **I want** integration tests for each major workflow,
* **So that** we verify end‐to‐end behavior (DB + K8s + S3 stubs).

**Acceptance Criteria:**

1. **Auth Flow:** Register → Login → Refresh → Access protected endpoint.
2. **Stream Flow:**

   * Register stream with invalid Shoutcast → `422`.
   * Register stream with valid stub → `201` + Relay Worker Pod up.
   * Send heartbeat → `200`.
   * Fetch status → includes stub track and listener count.
   * Fetch HLS → receives valid manifest.
3. **Upload & Playlist Flow:**

   * Upload MP3 → `201` → Wait for transcoder to complete (simulate via MinIO).
   * `GET /uploads/{id}` → `ready`.
   * Create playlist using `upload_id` + external URL → `201`.
   * `GET /playlists/{id}` → correct metadata.
   * `GET /playlists/{id}/stream.m3u8` → valid combined manifest.
   * `GET /playlists/{id}/stream.mp3` → continuous MP3.
4. **Podcast Flow:**

   * Create podcast → `201`.
   * Add upload‐based episode → `201`; regenerate RSS.
   * `GET /podcasts/{id}/rss.xml` → valid RSS (validate XML schema).
5. **Analytics Flow:**

   * Send multiple heartbeats on different days (simulate via date override) → `analytics` accumulation.
   * `GET /analytics/streams/{id}?from=&to=` → correct report.
   * `GET /playlists/{id}/stream.m3u8` multiple times → play\_count increments.
   * `GET /analytics/playlists/{id}?from=&to=` → correct report.
6. **Monetization Flow:**

   * Create plan + subscribe → `201`.
   * Register a monetized stream → `201`.
   * Attempt to fetch `/streams/{id}/live.m3u8` without subscription → `403`.
   * With subscription → `200`.
7. **Domain Flow (Stub):**

   * Register custom domain → `201` with `dns_challenge_record`.
   * Poll `GET /domains/{id}` multiple times → status flips to `verified/issued` after simulated delay.
8. **Error Cases:**

   * Invalid payloads → `400`.
   * Unauthorized access where required → `401` or `403`.
   * Nonexistent resources → `404`.
   * Rate limit exceeded → `429`.

---

# Epic 10: Documentation & Dev Experience

**Epic Description:**
Ensure developers can easily run, test, and extend the system—provide a README, setup scripts, and contributor guidelines.

---

### US-10.1: README with Local Setup Instructions

* **As a** new developer,
* **I want** a clear README explaining how to install dependencies, run migrations, start the API locally, and run tests,
* **So that** I can contribute without friction.

**Acceptance Criteria:**

1. README covers:

   * Prerequisites (Node.js/Python version, Docker, Helm, kubectl, AWS CLI).
   * Steps to clone the repo and install dependencies (`npm install` or `pip install`).
   * How to configure environment variables (e.g., `DATABASE_URL`, `JWT_PRIVATE_KEY_PATH`).
   * How to run database migrations.
   * How to start API server locally (`npm run dev` or equivalent).
   * How to run transcoder simulation.
   * How to run unit tests (`npm test` / `pytest`).
   * How to run integration tests (with LocalStack/MinIO).
   * How to lint code.

---

### US-10.2: CONTRIBUTING Guidelines

* **As a** contributor,
* **I want** a CONTRIBUTING.md outlining how to submit PRs, follow branch conventions, run tests, and adhere to coding standards,
* **So that** my contributions align with the project’s workflow.

**Acceptance Criteria:**

1. File `CONTRIBUTING.md` includes:

   * Coding style (refer to ESLint / Pylint rules).
   * Branch naming conventions (`feature/<short‐description>`, `bugfix/<issue>`, `hotfix/<issue>`).
   * How to write a good commit message (conventional commits style).
   * How to open a Pull Request, labeling guidelines, and review process.
   * How to run the full test suite locally.
   * Link to issue tracker (Jira or GitHub Issues).

---

# Epic 11: Error & Empty State UI Support (Minimal)

**Epic Description:**
Though primarily an API, certain endpoints return “friendly” empty‐state messages. Although no frontend is mandated, ensure JSON payloads include helpful messages where data is empty.

---

### US-11.1: Return Friendly Message When No Playlists Exist

* **As a** DJ,
* **I want** `GET /v1/playlists` (if implemented) to respond with an empty array and a message,
* **So that** I know I haven’t created any playlists yet.

**Acceptance Criteria:**

1. If a user has zero playlists, `GET /v1/playlists` returns:

   ```json
   {
     "playlists": [],
     "message": "You have not created any playlists yet. Use POST /v1/playlists to add one!"
   }
   ```
2. If at least one playlist exists, return `{"playlists":[...], "message":null}`.

---

### US-11.2: Return Friendly Message When No Episodes Exist in Podcast

* **As a** DJ,
* **I want** `GET /v1/podcasts/{podcast_id}` (if no episodes added) to show a message “No episodes yet,”
* **So that** I remember to add my first episode.

**Acceptance Criteria:**

1. If `episodes` array is empty, include `"message": "No episodes yet. Add your first episode via POST /v1/podcasts/{podcast_id}/episodes."`
2. If episodes exist, `message` field is `null`.

---

# Summary of Backlog Structure

Below is a high-level outline of all Epics and their User Stories:

```
Epic 1: Authentication & User Management
  - US-1.1: User Registration
  - US-1.2: User Login & JWT Issuance
  - US-1.3: Refresh JWT
  - US-1.4: Admin: List All Users

Epic 2: Live Stream Management (Shoutcast Integration)
  - US-2.1: Register Shoutcast Source
  - US-2.2: Update Stream Configuration
  - US-2.3: Delete (Unregister) Stream
  - US-2.4: Stream Heartbeat (Relay Worker → API)
  - US-2.5: Retrieve Live-Stream Status
  - US-2.6: Serve Live HLS Manifest
  - US-2.7: Serve Live MP3 Stream

Epic 3: On-Demand Playlist Management
  - US-3.1: Upload Audio File for HLS Transcoding
  - US-3.2: Check Upload & Transcoding Status
  - US-3.3: Create On-Demand Playlist
  - US-3.4: Retrieve Playlist Metadata
  - US-3.5: Update Existing Playlist
  - US-3.6: Delete Playlist
  - US-3.7: Serve Playlist HLS Manifest
  - US-3.8: Serve Playlist Continuous MP3

Epic 4: Podcast Hosting & RSS Feed
  - US-4.1: Create Podcast Series
  - US-4.2: Retrieve Podcast Metadata & Episodes
  - US-4.3: Add Podcast Episode
  - US-4.4: Update Podcast Episode
  - US-4.5: Delete Podcast Episode
  - US-4.6: Serve Podcast RSS Feed
  - US-4.7: Register Custom Domain for Podcast RSS (Stub)
  - US-4.8: Check Custom Domain Verification & TLS Status (Stub)

Epic 5: Analytics & Reporting
  - US-5.1: Record Live-Stream Analytics on Heartbeat
  - US-5.2: Record Playlist Play Count
  - US-5.3: Retrieve Stream Analytics Over Date Range
  - US-5.4: Retrieve Playlist Analytics Over Date Range

Epic 6: Monetization & Ad Insertion
  - US-6.1: Create Subscription Plan (Stub)
  - US-6.2: Subscribe to a Plan (Stub)
  - US-6.3: Enforce Paywall on Monetized Streams/Playlists/Podcasts
  - US-6.4: Assign Ad Markers to Live Stream (Stub)

Epic 7: Infrastructure, CI/CD & Deployment
  - US-7.1: Initialize Git Repository & Branch Strategy
  - US-7.2: Configure CI Pipeline (GitHub Actions)
  - US-7.3: Provision Kubernetes Staging Namespace & Helm Chart
  - US-7.4: Health Check & Monitoring Setup

Epic 8: Error Handling, Validation & Security
  - US-8.1: Standardize Error Responses
  - US-8.2: Request Body Validation
  - US-8.3: RBAC & Scope Enforcement
  - US-8.4: Input Sanitization & SQL Injection Prevention
  - US-8.5: Rate Limiting & Abuse Prevention

Epic 9: Error & Empty States, Documentation & Testing
  - US-9.1: Friendly Error & Empty States in API
  - US-9.2: OpenAPI Documentation
  - US-9.3: Postman Collection
  - US-9.4: Unit Test Coverage
  - US-9.5: Integration & E2E Tests

Epic 10: Documentation & Dev Experience
  - US-10.1: README with Local Setup Instructions
  - US-10.2: CONTRIBUTING Guidelines

Epic 11: Error & Empty State UI Support (Minimal)
  - US-11.1: Return Friendly Message When No Playlists Exist
  - US-11.2: Return Friendly Message When No Episodes Exist in Podcast
```

* All epics and stories are intended to be prioritized into the one-week sprint (as outlined in the sprint plan).
* Each User Story is small enough to be completed within a few hours to a few days, ensuring iterative progress and daily “Done” increments.

