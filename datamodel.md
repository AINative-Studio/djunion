## 1. `users`

Stores authenticated “DJ” and “Admin” accounts.

| Column Name     | Data Type      | Constraints / Description                    |
| --------------- | -------------- | -------------------------------------------- |
| `user_id`       | `UUID`         | **Primary Key**, default `gen_random_uuid()` |
| `email`         | `VARCHAR(255)` | Unique, not null, validated as email         |
| `password_hash` | `VARCHAR(255)` | Not null (bcrypt/scrypt‐hashed password)     |
| `name`          | `VARCHAR(100)` | Not null                                     |
| `role`          | `VARCHAR(10)`  | Not null, CHECK (`role` IN ('dj','admin'))   |
| `created_at`    | `TIMESTAMPTZ`  | Not null, default `now()`                    |
| `deleted_at`    | `TIMESTAMPTZ`  | Nullable; if non‐null → soft‐deleted         |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (user_id)`
* `UNIQUE(email)`
* CHECK constraint on `role` values.

---

## 2. `streams`

Each row represents a registered “live” Shoutcast source that the DJ has set up. A corresponding Relay Worker pod will ingest and multicast this stream.

| Column Name            | Data Type      | Constraints / Description                                                               |
| ---------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `stream_id`            | `UUID`         | **Primary Key**, default `gen_random_uuid()`                                            |
| `user_id`              | `UUID`         | **Foreign Key** → `users(user_id)`, not null                                            |
| `name`                 | `VARCHAR(150)` | Not null                                                                                |
| `shoutcast_url`        | `TEXT`         | Not null, validated as URL                                                              |
| `mount`                | `VARCHAR(100)` | Not null (e.g., `/live`)                                                                |
| `stream_key_enc`       | `TEXT`         | Encrypted Shoutcast password/stream key, not null                                       |
| `genre`                | `VARCHAR(50)`  | Nullable                                                                                |
| `description`          | `TEXT`         | Nullable                                                                                |
| `visibility`           | `VARCHAR(10)`  | Not null, CHECK (`visibility` IN ('public','private'))                                  |
| `monetization_enabled` | `BOOLEAN`      | Not null, default `false`                                                               |
| `enabled`              | `BOOLEAN`      | Not null, default `true`  (if `false` → Relay Worker will stop accepting new listeners) |
| `created_at`           | `TIMESTAMPTZ`  | Not null, default `now()`                                                               |
| `deleted_at`           | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                                                  |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (stream_id)`
* **FK:** `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
* CHECK on `visibility`.
* Index on `(user_id)`.
* Index on `(visibility)` for filtering public vs. private.

---

## 3. `streams_ads`

Stores ad‐marker configurations for each live stream. Multiple ad markers can be assigned to a single stream.

| Column Name        | Data Type     | Constraints / Description                                          |
| ------------------ | ------------- | ------------------------------------------------------------------ |
| `ad_id`            | `UUID`        | **Primary Key**, default `gen_random_uuid()`                       |
| `stream_id`        | `UUID`        | **Foreign Key** → `streams(stream_id)`, not null                   |
| `position_seconds` | `INTEGER`     | Not null (time offset from start of stream in seconds)             |
| `duration_seconds` | `INTEGER`     | Not null (length of ad slot in seconds)                            |
| `ad_type`          | `VARCHAR(10)` | Not null, CHECK (`ad_type` IN ('pre-roll','mid-roll','post-roll')) |
| `created_at`       | `TIMESTAMPTZ` | Not null, default `now()`                                          |
| `deleted_at`       | `TIMESTAMPTZ` | Nullable (soft‐delete)                                             |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (ad_id)`
* **FK:** `FOREIGN KEY (stream_id) REFERENCES streams(stream_id) ON DELETE CASCADE`
* CHECK on `ad_type`.
* Composite index on `(stream_id, position_seconds)` to quickly look up markers for a given stream.

---

## 4. `uploads`

Holds metadata about each MP3 file that a DJ uploads. Background jobs transcode these into HLS segments.

| Column Name     | Data Type      | Constraints / Description                                                          |
| --------------- | -------------- | ---------------------------------------------------------------------------------- |
| `upload_id`     | `UUID`         | **Primary Key**, default `gen_random_uuid()`                                       |
| `user_id`       | `UUID`         | **Foreign Key** → `users(user_id)`, not null                                       |
| `file_path`     | `TEXT`         | S3 object key (e.g., `uploads/audio/{user_id}/{upload_id}/original.mp3`), not null |
| `status`        | `VARCHAR(20)`  | Not null, CHECK (`status` IN ('processing','ready','failed'))                      |
| `error_message` | `TEXT`         | Nullable (populated if `status='failed'`)                                          |
| `title`         | `VARCHAR(150)` | Populated optionally at upload time                                                |
| `artist`        | `VARCHAR(100)` | Populated optionally at upload time                                                |
| `created_at`    | `TIMESTAMPTZ`  | Not null, default `now()`                                                          |
| `completed_at`  | `TIMESTAMPTZ`  | Nullable (set when transcoding to HLS is finished)                                 |
| `deleted_at`    | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                                             |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (upload_id)`
* **FK:** `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
* CHECK on `status`.
* Index on `(user_id)`.
* Partial index on `(status)` where `status='ready'` for quick lookup of HLS‐ready uploads.

---

## 5. `hls_segments`

Tracks individual TS segments generated during transcoding of an `upload`. Only used if you wish to query/gather metadata per‐segment. (Optional; batch jobs could also record aggregated info.)

| Column Name        | Data Type      | Constraints / Description                                                   |
| ------------------ | -------------- | --------------------------------------------------------------------------- |
| `segment_id`       | `UUID`         | **Primary Key**, default `gen_random_uuid()`                                |
| `upload_id`        | `UUID`         | **Foreign Key** → `uploads(upload_id)`, not null                            |
| `sequence_index`   | `INTEGER`      | Not null (e.g., 0, 1, 2, …)                                                 |
| `ts_path`          | `TEXT`         | S3 object key (e.g., `uploads/audio/{upload_id}/hls/segment0.ts`), not null |
| `duration_seconds` | `NUMERIC(5,2)` | Duration of this segment (often 6.00 s)                                     |
| `created_at`       | `TIMESTAMPTZ`  | Not null, default `now()`                                                   |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (segment_id)`
* **FK:** `FOREIGN KEY (upload_id) REFERENCES uploads(upload_id) ON DELETE CASCADE`
* Unique constraint on `(upload_id, sequence_index)`.
* Index on `(upload_id, sequence_index)` for ordered retrieval.

---

## 6. `playlists`

Each row represents a DJ’s on‐demand playlist. A playlist consists of multiple tracks that may originate from `uploads` or external URLs.

| Column Name            | Data Type      | Constraints / Description                              |
| ---------------------- | -------------- | ------------------------------------------------------ |
| `playlist_id`          | `UUID`         | **Primary Key**, default `gen_random_uuid()`           |
| `user_id`              | `UUID`         | **Foreign Key** → `users(user_id)`, not null           |
| `title`                | `VARCHAR(150)` | Not null                                               |
| `description`          | `TEXT`         | Nullable                                               |
| `visibility`           | `VARCHAR(10)`  | Not null, CHECK (`visibility` IN ('public','private')) |
| `monetization_enabled` | `BOOLEAN`      | Not null, default `false`                              |
| `created_at`           | `TIMESTAMPTZ`  | Not null, default `now()`                              |
| `updated_at`           | `TIMESTAMPTZ`  | Not null, default `now()`                              |
| `deleted_at`           | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                 |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (playlist_id)`
* **FK:** `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
* CHECK on `visibility`.
* Index on `(user_id)`.
* Index on `(visibility)` for quick public/private filtering.

---

## 7. `tracks`

Stores individual “track” records associated with a `playlist`. A track can be sourced from a prior upload or an external URL.

| Column Name        | Data Type      | Constraints / Description                                               |
| ------------------ | -------------- | ----------------------------------------------------------------------- |
| `track_id`         | `UUID`         | **Primary Key**, default `gen_random_uuid()`                            |
| `playlist_id`      | `UUID`         | **Foreign Key** → `playlists(playlist_id)`, not null                    |
| `source_type`      | `VARCHAR(10)`  | Not null, CHECK (`source_type` IN ('upload','external'))                |
| `upload_id`        | `UUID`         | Nullable; references `uploads(upload_id)` if `source_type='upload'`     |
| `url`              | `TEXT`         | Nullable; if `source_type='external'`, must be a valid `audio/mpeg` URL |
| `title`            | `VARCHAR(150)` | Not null                                                                |
| `artist`           | `VARCHAR(100)` | Nullable                                                                |
| `duration_seconds` | `INTEGER`      | Not null                                                                |
| `created_at`       | `TIMESTAMPTZ`  | Not null, default `now()`                                               |
| `deleted_at`       | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                                  |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (track_id)`
* **FK:** `FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE`
* **FK:** `FOREIGN KEY (upload_id) REFERENCES uploads(upload_id) ON DELETE SET NULL`
* CHECK on `source_type`.
* Conditional constraint (partial):

  * If `source_type='upload'`, then `upload_id IS NOT NULL` and `url IS NULL`.
  * If `source_type='external'`, then `url IS NOT NULL` and `upload_id IS NULL`.
* Index on `(playlist_id, source_type)`.

---

## 8. `podcasts`

Represents a DJ’s podcast series. May be bound to `domains.custom_domain` for a custom RSS endpoint.

| Column Name            | Data Type      | Constraints / Description                               |
| ---------------------- | -------------- | ------------------------------------------------------- |
| `podcast_id`           | `UUID`         | **Primary Key**, default `gen_random_uuid()`            |
| `user_id`              | `UUID`         | **Foreign Key** → `users(user_id)`, not null            |
| `title`                | `VARCHAR(150)` | Not null                                                |
| `description`          | `TEXT`         | Nullable                                                |
| `language`             | `VARCHAR(10)`  | Not null, e.g., `'en-us'`                               |
| `author`               | `VARCHAR(100)` | Not null                                                |
| `image_url`            | `TEXT`         | Nullable; must be a valid image URL                     |
| `explicit`             | `BOOLEAN`      | Not null, default `false`                               |
| `custom_domain`        | `VARCHAR(255)` | Nullable; unique if present (e.g. `podcast.djname.com`) |
| `monetization_enabled` | `BOOLEAN`      | Not null, default `false`                               |
| `created_at`           | `TIMESTAMPTZ`  | Not null, default `now()`                               |
| `updated_at`           | `TIMESTAMPTZ`  | Not null, default `now()`                               |
| `deleted_at`           | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                  |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (podcast_id)`
* **FK:** `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
* `UNIQUE(custom_domain)` where `custom_domain IS NOT NULL`
* CHECK on `language` to match pattern `[a-z]{2}-[a-z]{2}` (optionally)
* CHECK on `explicit` (boolean)
* Index on `(user_id)`, `(custom_domain)`

---

## 9. `episodes`

Individual episodes linked to a `podcast`. Episodes can be uploaded or reference an external media URL. They appear as `<item>` entries in the RSS feed.

| Column Name             | Data Type      | Constraints / Description                                               |
| ----------------------- | -------------- | ----------------------------------------------------------------------- |
| `episode_id`            | `UUID`         | **Primary Key**, default `gen_random_uuid()`                            |
| `podcast_id`            | `UUID`         | **Foreign Key** → `podcasts(podcast_id)`, not null                      |
| `source_type`           | `VARCHAR(10)`  | Not null, CHECK (`source_type` IN ('upload','external'))                |
| `upload_id`             | `UUID`         | Nullable; references `uploads(upload_id)` if `source_type='upload'`     |
| `media_url`             | `TEXT`         | Nullable; if `source_type='external'`, must be a valid `audio/mpeg` URL |
| `title`                 | `VARCHAR(150)` | Not null                                                                |
| `description`           | `TEXT`         | Nullable                                                                |
| `duration_seconds`      | `INTEGER`      | Not null                                                                |
| `publication_date`      | `TIMESTAMPTZ`  | Not null                                                                |
| `episode_number`        | `INTEGER`      | Not null                                                                |
| `explicit`              | `BOOLEAN`      | Not null, default `false`                                               |
| `monetization_required` | `BOOLEAN`      | Not null, default `false` (paywalled episodes)                          |
| `created_at`            | `TIMESTAMPTZ`  | Not null, default `now()`                                               |
| `updated_at`            | `TIMESTAMPTZ`  | Not null, default `now()`                                               |
| `deleted_at`            | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                                  |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (episode_id)`
* **FK:** `FOREIGN KEY (podcast_id) REFERENCES podcasts(podcast_id) ON DELETE CASCADE`
* **FK:** `FOREIGN KEY (upload_id) REFERENCES uploads(upload_id) ON DELETE SET NULL`
* CHECK on `source_type`.
* Conditional constraint:

  * If `source_type='upload'`, then `upload_id IS NOT NULL` and `media_url IS NULL`.
  * If `source_type='external'`, then `media_url IS NOT NULL` and `upload_id IS NULL`.
* Index on `(podcast_id, publication_date DESC)` for RSS ordering.
* Composite unique index on `(podcast_id, episode_number)` to prevent duplicate episode numbers.

---

## 10. `monetization_plans`

Defines subscription tiers (e.g., “Premium Live Access”) and links to Stripe product/price IDs.

| Column Name         | Data Type      | Constraints / Description                                             |
| ------------------- | -------------- | --------------------------------------------------------------------- |
| `plan_id`           | `UUID`         | **Primary Key**, default `gen_random_uuid()`                          |
| `name`              | `VARCHAR(100)` | Not null                                                              |
| `stripe_product_id` | `VARCHAR(100)` | Not null                                                              |
| `stripe_price_id`   | `VARCHAR(100)` | Not null                                                              |
| `price_cents`       | `INTEGER`      | Not null (e.g., `500` → \$5.00)                                       |
| `currency`          | `VARCHAR(3)`   | Not null, CHECK (ISO 4217 code, e.g. 'USD', 'EUR')                    |
| `billing_interval`  | `VARCHAR(10)`  | Not null, CHECK (`billing_interval` IN ('monthly','yearly'))          |
| `features`          | `JSONB`        | Nullable; array of strings, e.g. `["live_streams","playlist_access"]` |
| `created_at`        | `TIMESTAMPTZ`  | Not null, default `now()`                                             |
| `deleted_at`        | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                                |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (plan_id)`
* Unique index on `(stripe_price_id)` and `(stripe_product_id)`
* CHECK on `currency` length = 3
* CHECK on `billing_interval`

---

## 11. `subscriptions`

Tracks which users are subscribed to which plans, storing the Stripe subscription ID and status.

| Column Name              | Data Type      | Constraints / Description                                                           |
| ------------------------ | -------------- | ----------------------------------------------------------------------------------- |
| `subscription_id`        | `UUID`         | **Primary Key**, default `gen_random_uuid()`                                        |
| `plan_id`                | `UUID`         | **Foreign Key** → `monetization_plans(plan_id)`, not null                           |
| `user_id`                | `UUID`         | **Foreign Key** → `users(user_id)`, not null                                        |
| `stripe_subscription_id` | `VARCHAR(100)` | Not null (from Stripe)                                                              |
| `status`                 | `VARCHAR(20)`  | Not null, CHECK (`status` IN ('active','past\_due','canceled','unpaid','trialing')) |
| `created_at`             | `TIMESTAMPTZ`  | Not null, default `now()`                                                           |
| `expires_at`             | `TIMESTAMPTZ`  | Nullable (if on trial or cancelled, may be null)                                    |
| `updated_at`             | `TIMESTAMPTZ`  | Not null, default `now()`                                                           |
| `deleted_at`             | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                                              |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (subscription_id)`
* **FK:** `FOREIGN KEY (plan_id) REFERENCES monetization_plans(plan_id) ON DELETE CASCADE`
* **FK:** `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
* Unique composite index on `(user_id, plan_id)` to prevent duplicate active subscriptions.
* Index on `(status)` for filtering active vs. past\_due, etc.

---

## 12. `domains`

Manages custom domain registrations for podcasts (and potentially future custom endpoints for streams).

| Column Name            | Data Type      | Constraints / Description                                                  |
| ---------------------- | -------------- | -------------------------------------------------------------------------- |
| `domain_id`            | `UUID`         | **Primary Key**, default `gen_random_uuid()`                               |
| `user_id`              | `UUID`         | **Foreign Key** → `users(user_id)`, not null                               |
| `custom_domain`        | `VARCHAR(255)` | Not null, unique (e.g., `podcast.djname.com`); validated as hostname       |
| `verification_status`  | `VARCHAR(10)`  | Not null, CHECK (`verification_status` IN ('pending','verified','failed')) |
| `tls_status`           | `VARCHAR(10)`  | Not null, CHECK (`tls_status` IN ('pending','issued','failed'))            |
| `dns_challenge_record` | `VARCHAR(255)` | Nullable; DNS TXT value that DJ must add for verification                  |
| `verified_at`          | `TIMESTAMPTZ`  | Nullable; set when DNS verification succeeds                               |
| `tls_issued_at`        | `TIMESTAMPTZ`  | Nullable; set when TLS cert is successfully issued                         |
| `created_at`           | `TIMESTAMPTZ`  | Not null, default `now()`                                                  |
| `deleted_at`           | `TIMESTAMPTZ`  | Nullable (soft‐delete)                                                     |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (domain_id)`
* **FK:** `FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`
* `UNIQUE(custom_domain)`
* CHECK on `verification_status` and `tls_status`
* Index on `(custom_domain)`

---

## 13. `analytics`

Generic table to track time‐series counts for streams, playlists, and podcasts. One row per resource per date per metric.

| Column Name     | Data Type     | Constraints / Description                                                                                         |
| --------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `analytics_id`  | `UUID`        | **Primary Key**, default `gen_random_uuid()`                                                                      |
| `resource_type` | `VARCHAR(10)` | Not null, CHECK (`resource_type` IN ('stream','playlist','podcast'))                                              |
| `resource_id`   | `UUID`        | Not null (references either `streams(stream_id)`, `playlists(playlist_id)`, or `podcasts(podcast_id)`, see below) |
| `date`          | `DATE`        | Not null                                                                                                          |
| `metric`        | `VARCHAR(20)` | Not null, e.g., `'listeners'`, `'play_count'`, `'downloads'`                                                      |
| `value`         | `INTEGER`     | Not null                                                                                                          |
| `created_at`    | `TIMESTAMPTZ` | Not null, default `now()`                                                                                         |

### Indexes & Constraints

* **PK:** `PRIMARY KEY (analytics_id)`
* CHECK on `resource_type`.
* CHECK on `metric` (optionally enforce valid metrics per resource\_type).
* Composite unique index on `(resource_type, resource_id, date, metric)` to prevent duplicate rows.
* Index on `(resource_type, resource_id, date)` for fast lookups.
* No direct FK on `resource_id` because it can reference multiple tables; enforce integrity at application layer or via partial foreign keys in PostgreSQL 12+.

---

## 14. Additional Reference Tables

### 14.1 `password_resets`

(Optional) Tracks password reset tokens for users.

| Column Name   | Data Type      | Constraints / Description                    |
| ------------- | -------------- | -------------------------------------------- |
| `reset_id`    | `UUID`         | **Primary Key**, default `gen_random_uuid()` |
| `user_id`     | `UUID`         | **Foreign Key** → `users(user_id)`, not null |
| `reset_token` | `VARCHAR(100)` | Not null, unique                             |
| `expires_at`  | `TIMESTAMPTZ`  | Not null (e.g., valid for 1 hour)            |
| `created_at`  | `TIMESTAMPTZ`  | Not null, default `now()`                    |

### 14.2 `refresh_tokens`

(Optional) Stores active refresh tokens for users.

| Column Name     | Data Type     | Constraints / Description                    |
| --------------- | ------------- | -------------------------------------------- |
| `token_id`      | `UUID`        | **Primary Key**, default `gen_random_uuid()` |
| `user_id`       | `UUID`        | **Foreign Key** → `users(user_id)`, not null |
| `refresh_token` | `TEXT`        | Not null                                     |
| `expires_at`    | `TIMESTAMPTZ` | Not null                                     |
| `created_at`    | `TIMESTAMPTZ` | Not null, default `now()`                    |

---

## 15. Entity Relationship Summary

Below is a high‐level summary of how these tables relate:

```
users (1) ───┬───> (∞) streams
             │
             ├───> (∞) uploads
             │
             ├───> (∞) playlists
             │        └───> (∞) tracks
             │
             ├───> (∞) podcasts
             │        └───> (∞) episodes
             │
             ├───> (∞) subscriptions
             │        └───> (1) monetization_plans
             │
             └───> (∞) domains

streams (1) ───> (∞) streams_ads

uploads (1) ───> (∞) hls_segments

playlists (1) ───> (∞) tracks

podcasts (1) ───> (∞) episodes

analytics (resource_type, resource_id) references streams/ playlists/ podcasts in application logic
```

* **1→∞** indicates a one-to-many relationship.
* `analytics` uses a generic `(resource_type, resource_id)` combination to point to any of the three: `streams`, `playlists`, or `podcasts`. Application logic must enforce that `resource_id` exists in the respective table based on `resource_type`.

---

## 16. Data Types & Constraints Cheat-Sheet

* **UUID**: `uuid` (PostgreSQL extension; default via `gen_random_uuid()`)
* **Strings**:

  * Short: `VARCHAR(n)` (n as appropriate)
  * Long text: `TEXT`
* **Timestamps**:

  * `TIMESTAMPTZ` for UTC with time zone
  * Default `now()`
* **Dates**:

  * `DATE` (for analytics date)
* **Numbers**:

  * Integer counts: `INTEGER`
  * Monetary amounts (in cents): `INTEGER`
  * Decimals (segment durations): `NUMERIC(5,2)`
* **Booleans**: `BOOLEAN`
* **JSONB**: flexible JSON storage, e.g., `features` in `monetization_plans`
* **Enums / CHECK**: ensure fields only contain valid values (e.g., `visibility`, `status`, `resource_type`)

---

## 17. Example Table DDL (PostgreSQL)

Below are abbreviated examples of how some of these tables could be defined in PostgreSQL.

```sql
-- 1) users
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('dj','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 2) streams
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

-- 3) streams_ads
CREATE TABLE streams_ads (
  ad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES streams(stream_id) ON DELETE CASCADE,
  position_seconds INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  ad_type VARCHAR(10) NOT NULL
    CHECK (ad_type IN ('pre-roll','mid-roll','post-roll')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_ads_stream_pos ON streams_ads(stream_id, position_seconds);

-- 4) uploads
CREATE TABLE uploads (
  upload_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('processing','ready','failed')),
  error_message TEXT,
  title VARCHAR(150),
  artist VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_uploads_user ON uploads(user_id);
CREATE INDEX idx_uploads_status_ready ON uploads(upload_id) 
  WHERE status = 'ready';

-- 5) hls_segments
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

-- 6) playlists
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

-- 7) tracks
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

-- 8) podcasts
CREATE TABLE podcasts (
  podcast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  language VARCHAR(10) NOT NULL,
  author VARCHAR(100) NOT NULL,
  image_url TEXT,
  explicit BOOLEAN NOT NULL DEFAULT FALSE,
  custom_domain VARCHAR(255) UNIQUE,  -- e.g. podcast.djname.com
  monetization_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_podcasts_user ON podcasts(user_id);

-- 9) episodes
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

-- 10) monetization_plans
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

-- 11) subscriptions
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

-- 12) domains
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

-- 13) analytics
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

-- 14.1) password_resets (optional)
CREATE TABLE password_resets (
  reset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reset_token VARCHAR(100) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_password_resets_user ON password_resets(user_id);

-- 14.2) refresh_tokens (optional)
CREATE TABLE refresh_tokens (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
```

---

## 18. Relationship Diagram (Textual)

Below is a textual depiction of the key “one‐to‐many” relationships:

```
users
  ├── streams
  │     └── streams_ads
  │
  ├── uploads
  │     └── hls_segments
  │
  ├── playlists
  │     └── tracks
  │
  ├── podcasts
  │     └── episodes
  │
  ├── subscriptions ──> monetization_plans
  │
  └── domains

analytics (resource_type, resource_id) ↔ (streams | playlists | podcasts)
```

* **`users → streams`**: A DJ can register multiple live streams.
* **`streams → streams_ads`**: Each live stream can have multiple ad markers.
* **`users → uploads → hls_segments`**: Each DJ upload can produce many HLS segments.
* **`users → playlists → tracks`**: Each playlist belongs to one user and contains multiple tracks.
* **`users → podcasts → episodes`**: Each podcast belongs to one user and contains multiple episodes.
* **`users → subscriptions → monetization_plans`**: Each user can have multiple subscriptions (but the `(user_id, plan_id)` pair must be unique).
* **`users → domains`**: Each user can register multiple custom domains (for different podcasts).
* **`analytics`**: Polymorphic targeting of `streams`, `playlists`, or `podcasts` by storing `resource_type` + `resource_id`.

---

## 19. Notes on Polymorphic Relationships

* **`analytics.resource_type`** can be `'stream'`, `'playlist'`, or `'podcast'`. Application code must interpret `resource_id` accordingly:

  * If `resource_type='stream'`, ensure `resource_id` exists in `streams(stream_id)`.
  * If `resource_type='playlist'`, ensure `resource_id` exists in `playlists(playlist_id)`.
  * If `resource_type='podcast'`, ensure `resource_id` exists in `podcasts(podcast_id)`.

  You can implement this either via application‐level checks or using PostgreSQL partial foreign keys (one FK per resource type with a `CHECK` on `resource_type`), for example:

  ```sql
  ALTER TABLE analytics
    ADD CONSTRAINT fk_analytics_stream
    FOREIGN KEY (resource_id)
    REFERENCES streams(stream_id)
    DEFERRABLE INITIALLY IMMEDIATE
    NOT VALID
    CHECK (resource_type = 'stream');

  ALTER TABLE analytics
    ADD CONSTRAINT fk_analytics_playlist
    FOREIGN KEY (resource_id)
    REFERENCES playlists(playlist_id)
    DEFERRABLE INITIALLY IMMEDIATE
    NOT VALID
    CHECK (resource_type = 'playlist');

  ALTER TABLE analytics
    ADD CONSTRAINT fk_analytics_podcast
    FOREIGN KEY (resource_id)
    REFERENCES podcasts(podcast_id)
    DEFERRABLE INITIALLY IMMEDIATE
    NOT VALID
    CHECK (resource_type = 'podcast');
  ```

  However, many teams choose to validate in application code for simplicity.

---

## 20. Summary

This data model provides:

* **Clear table structures** with appropriate data types, primary keys, and foreign key constraints.
* **Soft‐delete** support via `deleted_at` timestamps on most tables, enabling a “recover within 30 days” workflow for GDPR compliance.
* **Polymorphic analytics** storage in a single table with a `resource_type`/`resource_id` pattern.
* **Strong integrity**: Conditional checks to enforce that `source_type` aligns with either `upload_id` or `url`, and unique constraints to prevent duplicates (e.g., episode numbers, one subscription per plan per user).
* **Indexing strategy**: Indexes on foreign keys, visibility flags, and status fields to optimize filtering for public/private resources, HLS readiness, and analytics queries.

With this schema in place, all functional requirements from the PRD—including live streaming relay, on-demand playlists, podcast RSS + custom domains, monetization, ad insertion, and analytics—can be fully supported and enforced at the database level.
