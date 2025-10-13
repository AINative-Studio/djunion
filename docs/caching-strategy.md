# DJ Union - Caching Strategy & Data Retention Policies

**Version:** 1.0
**Date:** October 12, 2025
**Status:** Production Ready

---

## Table of Contents

1. [Caching Architecture](#caching-architecture)
2. [Redis Caching Strategy](#redis-caching-strategy)
3. [CDN Caching Strategy](#cdn-caching-strategy)
4. [Application-Level Caching](#application-level-caching)
5. [Data Retention Policies](#data-retention-policies)
6. [Backup & Disaster Recovery](#backup--disaster-recovery)

---

## Caching Architecture

### Multi-Layer Cache Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                       Cache Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  L1: Browser Cache (User Device)                           │
│      ├─ Static Assets: 1 year                              │
│      └─ API Responses: 0-5 minutes                         │
│                                                             │
│  L2: CDN (CloudFront/CloudFlare)                           │
│      ├─ HLS Segments: 6 seconds                            │
│      ├─ Audio Files: 1 hour                                │
│      ├─ Images: 24 hours                                   │
│      └─ RSS Feeds: 5 minutes                               │
│                                                             │
│  L3: Redis (In-Memory Cache)                               │
│      ├─ Heartbeat Data: 5 minutes                          │
│      ├─ Session Data: 30 days                              │
│      ├─ Rate Limits: 1 minute                              │
│      └─ API Responses: 1-60 minutes                        │
│                                                             │
│  L4: Application Cache (Node.js Memory)                    │
│      ├─ Configuration: Until restart                       │
│      ├─ JWT Public Key: Until restart                      │
│      └─ Database Connection Pool: Persistent               │
│                                                             │
│  L5: Database (PostgreSQL)                                 │
│      └─ Source of Truth (No caching)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cache Invalidation Strategy

**Write-Through Pattern:**
- Update database first
- Invalidate cache immediately after
- Next read populates cache

**Cache-Aside Pattern:**
- Check cache first
- On miss: Query database → Populate cache
- Return result

**Event-Driven Invalidation:**
- Redis pub/sub for cross-service invalidation
- Webhook triggers for external updates

---

## Redis Caching Strategy

### Key Naming Convention

```
{prefix}:{resource_type}:{resource_id}:{field}
```

**Examples:**
```
cache:stream:550e8400-e29b-41d4-a716-446655440000:metadata
heartbeat:stream:550e8400-e29b-41d4-a716-446655440000
rl:user:550e8400-e29b-41d4-a716-446655440000:metadata
queue:transcode:550e8400-e29b-41d4-a716-446655440000
```

### Data Structures & TTLs

#### 1. Stream Heartbeat Data

**Structure:** Hash
**TTL:** 300 seconds (5 minutes)

```typescript
Key: heartbeat:stream:{stream_id}

Value (Hash):
{
  "status": "online",
  "listener_count": 150,
  "current_track": "Artist - Track Name",
  "bitrate": 128000,
  "last_seen": 1697040000,
  "relay_worker_pod": "relay-worker-abc123"
}

Commands:
HSET heartbeat:stream:{stream_id} listener_count 150
EXPIRE heartbeat:stream:{stream_id} 300
HGETALL heartbeat:stream:{stream_id}
```

**Usage:**
```typescript
// Update heartbeat
await redis.hmset(`heartbeat:stream:${streamId}`, {
  status: 'online',
  listener_count: 150,
  current_track: 'Artist - Track',
  bitrate: 128000,
  last_seen: Math.floor(Date.now() / 1000)
});
await redis.expire(`heartbeat:stream:${streamId}`, 300);

// Check stream status
const heartbeat = await redis.hgetall(`heartbeat:stream:${streamId}`);
if (!heartbeat || heartbeat.last_seen < Date.now() / 1000 - 300) {
  // Stream is offline
  return { status: 'offline' };
}
```

#### 2. RSS Feed Cache

**Structure:** String (XML)
**TTL:** 300 seconds (5 minutes)

```typescript
Key: cache:rss:{podcast_id}

Value: "<?xml version='1.0'?>..."

Commands:
SET cache:rss:{podcast_id} "{xml_content}" EX 300
GET cache:rss:{podcast_id}
DEL cache:rss:{podcast_id}  // On episode update
```

**Usage:**
```typescript
// Check cache
const cachedRSS = await redis.get(`cache:rss:${podcastId}`);
if (cachedRSS) {
  return cachedRSS;
}

// Generate and cache
const rss = await generateRSS(podcastId);
await redis.setex(`cache:rss:${podcastId}`, 300, rss);
return rss;
```

#### 3. Analytics Data

**Structure:** Hash
**TTL:** 3600 seconds (1 hour)

```typescript
Key: cache:analytics:stream:{stream_id}:{date}

Value (Hash):
{
  "listeners": 1250,
  "peak_listeners": 180,
  "uptime_seconds": 82800
}

Commands:
HMSET cache:analytics:stream:{stream_id}:{date} listeners 1250
EXPIRE cache:analytics:stream:{stream_id}:{date} 3600
```

#### 4. Rate Limiting

**Structure:** String (Counter)
**TTL:** 60 seconds (1 minute)

```typescript
Key: rl:user:{user_id}:{endpoint}

Value: "95"  // Request count

Commands:
INCR rl:user:{user_id}:{endpoint}
EXPIRE rl:user:{user_id}:{endpoint} 60
```

**Usage:**
```typescript
// Rate limit middleware
const key = `rl:user:${userId}:${endpoint}`;
const count = await redis.incr(key);

if (count === 1) {
  await redis.expire(key, 60);
}

if (count > RATE_LIMIT_MAX) {
  throw new RateLimitError('Too many requests');
}
```

#### 5. Session Storage

**Structure:** Hash
**TTL:** 2592000 seconds (30 days)

```typescript
Key: session:{session_id}

Value (Hash):
{
  "user_id": "uuid",
  "created_at": 1697040000,
  "last_active": 1697126400,
  "ip_address": "192.168.1.1"
}
```

#### 6. Job Queue (BullMQ)

**Structure:** List + Sorted Set
**TTL:** Based on job completion

```typescript
Key: bull:transcode:waiting
Key: bull:transcode:active
Key: bull:transcode:completed

Commands:
LPUSH bull:transcode:waiting {job_data}
ZADD bull:transcode:delayed {timestamp} {job_id}
```

### Redis Configuration

**Cluster Setup:**
```yaml
Redis Cluster:
  Nodes: 3 (1 primary, 2 replicas)
  Memory per node: 8GB
  Max connections: 10000
  Eviction policy: allkeys-lru
  Persistence:
    - RDB snapshots every 5 minutes
    - AOF log with fsync every second
```

**Connection Pooling:**
```typescript
import Redis from 'ioredis';

const redis = new Redis.Cluster([
  { host: 'redis-node-1', port: 6379 },
  { host: 'redis-node-2', port: 6379 },
  { host: 'redis-node-3', port: 6379 }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
    db: 0
  },
  clusterRetryStrategy: (times) => Math.min(times * 100, 2000),
  enableReadyCheck: true,
  maxRetriesPerRequest: 3
});
```

### Monitoring

**Key Metrics:**
```
redis_connected_clients
redis_used_memory_bytes
redis_keyspace_hits_total
redis_keyspace_misses_total
redis_evicted_keys_total
redis_expired_keys_total
```

**Hit Rate Target:** > 85%

---

## CDN Caching Strategy

### CloudFront Distribution Configuration

#### 1. HLS Segments & Manifests

**Path Pattern:** `/streams/*/hls/*`

**Cache Behavior:**
```yaml
Cache Policy:
  TTL:
    Min: 0
    Default: 6 seconds
    Max: 6 seconds
  Headers:
    - Origin
    - Access-Control-Request-Method
    - Access-Control-Request-Headers
  Query Strings: All
  Cookies: None

Origin Request Policy:
  Headers:
    - User-Agent
  Query Strings: All
```

**Cache Headers:**
```
Cache-Control: public, max-age=6, s-maxage=6, stale-while-revalidate=3
X-Accel-Buffering: no
Access-Control-Allow-Origin: *
```

#### 2. On-Demand Audio Files

**Path Pattern:** `/uploads/audio/*/hls/*`

**Cache Behavior:**
```yaml
Cache Policy:
  TTL:
    Min: 3600 seconds (1 hour)
    Default: 86400 seconds (24 hours)
    Max: 31536000 seconds (1 year)
  Compression: Enabled (gzip, brotli)
```

**Cache Headers:**
```
Cache-Control: public, max-age=86400, immutable
```

#### 3. RSS Feeds

**Path Pattern:** `/podcasts/*/rss.xml`

**Cache Behavior:**
```yaml
Cache Policy:
  TTL:
    Min: 60 seconds
    Default: 300 seconds (5 minutes)
    Max: 300 seconds
  Headers:
    - If-None-Match
    - If-Modified-Since
```

**Cache Headers:**
```
Cache-Control: public, max-age=300
ETag: "{podcast_id}-{last_modified_timestamp}"
```

#### 4. Static Assets

**Path Pattern:** `/static/*`

**Cache Behavior:**
```yaml
Cache Policy:
  TTL:
    Min: 86400 seconds (24 hours)
    Default: 31536000 seconds (1 year)
    Max: 31536000 seconds
  Compression: Enabled
```

**Cache Headers:**
```
Cache-Control: public, max-age=31536000, immutable
```

### Cache Invalidation

**Trigger Events:**

1. **Episode Update:**
   ```typescript
   await cloudfront.createInvalidation({
     DistributionId: CLOUDFRONT_DIST_ID,
     InvalidationBatch: {
       CallerReference: Date.now().toString(),
       Paths: {
         Quantity: 1,
         Items: [`/podcasts/${podcastId}/rss.xml`]
       }
     }
   });
   ```

2. **Stream Configuration Change:**
   - No invalidation needed (HLS segments are transient)

3. **Upload Completion:**
   - No invalidation needed (new URLs)

---

## Application-Level Caching

### In-Memory Cache (Node.js)

#### 1. Configuration Cache

**Use Case:** App configuration, feature flags

```typescript
import NodeCache from 'node-cache';

const configCache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120
});

async function getConfig(key: string): Promise<any> {
  const cached = configCache.get(key);
  if (cached) return cached;

  const config = await fetchConfigFromDatabase(key);
  configCache.set(key, config);
  return config;
}
```

#### 2. JWT Public Key Cache

**Use Case:** Avoid reading file on every request

```typescript
let cachedPublicKey: string | null = null;

function getJWTPublicKey(): string {
  if (cachedPublicKey) return cachedPublicKey;

  cachedPublicKey = fs.readFileSync(
    process.env.JWT_PUBLIC_KEY_PATH,
    'utf8'
  );

  return cachedPublicKey;
}
```

#### 3. Database Connection Pool

**Use Case:** Reuse database connections

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['error', 'warn'],
  connectionLimit: 20
});

// Middleware to use singleton
export function getPrismaClient(): PrismaClient {
  return prisma;
}
```

---

## Data Retention Policies

### Database Tables

#### 1. Users

**Retention:** Indefinite (GDPR: deletable on request)

**Soft Delete:**
```sql
UPDATE users
SET deleted_at = NOW()
WHERE user_id = 'uuid';
```

**Hard Delete (After 30 days):**
```sql
DELETE FROM users
WHERE deleted_at < NOW() - INTERVAL '30 days';
```

#### 2. Streams

**Retention:** Indefinite (until DJ deletes)

**Archive Inactive Streams:**
```sql
-- Move to archive table after 1 year of inactivity
INSERT INTO streams_archive
SELECT * FROM streams
WHERE enabled = false
  AND updated_at < NOW() - INTERVAL '1 year';

DELETE FROM streams
WHERE stream_id IN (
  SELECT stream_id FROM streams_archive
);
```

#### 3. Uploads

**Retention:**
- Database record: 1 year
- S3 original file: 90 days
- HLS segments: 30 days

**Cleanup Job (Daily):**
```typescript
// Delete old uploads from database
await prisma.upload.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    },
    deletedAt: { not: null }
  }
});

// S3 lifecycle policy
const lifecycleConfig = {
  Rules: [
    {
      Id: 'DeleteOriginalAfter90Days',
      Status: 'Enabled',
      Filter: { Prefix: 'uploads/audio/' },
      Expiration: { Days: 90 },
      NoncurrentVersionExpiration: { NoncurrentDays: 1 }
    },
    {
      Id: 'DeleteHLSAfter30Days',
      Status: 'Enabled',
      Filter: { Prefix: 'uploads/audio/*/hls/' },
      Expiration: { Days: 30 }
    }
  ]
};
```

#### 4. Analytics

**Retention:**
- Raw events: 30 days
- Daily aggregates: 365 days
- Monthly aggregates: Indefinite (archived to Glacier)

**Aggregation & Archival:**
```typescript
// Daily job: Aggregate raw events
await prisma.$executeRaw`
  INSERT INTO analytics (resource_type, resource_id, date, metric, value)
  SELECT
    resource_type,
    resource_id,
    DATE(created_at) as date,
    metric,
    SUM(value) as value
  FROM raw_analytics_events
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY resource_type, resource_id, DATE(created_at), metric
  ON CONFLICT (resource_type, resource_id, date, metric)
  DO UPDATE SET value = analytics.value + EXCLUDED.value;
`;

// Delete raw events older than 30 days
await prisma.rawAnalyticsEvent.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  }
});

// Monthly job: Archive to S3 Glacier
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

const oldAnalytics = await prisma.analytics.findMany({
  where: { date: { lt: oneYearAgo } }
});

await s3.putObject({
  Bucket: 'djunion-archives',
  Key: `analytics/${oneYearAgo.getFullYear()}/monthly.json.gz`,
  Body: gzip(JSON.stringify(oldAnalytics)),
  StorageClass: 'GLACIER'
});

await prisma.analytics.deleteMany({
  where: { date: { lt: oneYearAgo } }
});
```

#### 5. Logs

**Retention:**
- Application logs: 90 days (Loki)
- Access logs: 180 days (S3)
- Audit logs: 7 years (Glacier)

**Loki Configuration:**
```yaml
limits_config:
  retention_period: 2160h  # 90 days

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
  filesystem:
    directory: /loki/chunks

chunk_store_config:
  max_look_back_period: 2160h
```

#### 6. Refresh Tokens

**Retention:** 30 days (auto-expire)

**Cleanup Job (Hourly):**
```typescript
await prisma.refreshToken.deleteMany({
  where: {
    expiresAt: { lt: new Date() }
  }
});
```

#### 7. Password Reset Tokens

**Retention:** 1 hour (auto-expire)

**Cleanup Job (Every 15 minutes):**
```typescript
await prisma.passwordReset.deleteMany({
  where: {
    expiresAt: { lt: new Date() }
  }
});
```

---

## Backup & Disaster Recovery

### Database Backups

**PostgreSQL Backup Strategy:**

1. **Continuous Archiving (WAL):**
   ```bash
   # pg_basebackup + WAL archiving
   archive_mode = on
   archive_command = 'aws s3 cp %p s3://djunion-backups/wal/%f'
   wal_level = replica
   ```

2. **Full Backups:**
   - Frequency: Daily at 02:00 UTC
   - Retention: 30 daily, 12 monthly
   - Storage: S3 Standard → Glacier after 30 days

   ```bash
   #!/bin/bash
   pg_dump -Fc djunion_production > /tmp/backup_$(date +%Y%m%d).dump
   aws s3 cp /tmp/backup_$(date +%Y%m%d).dump s3://djunion-backups/daily/
   ```

3. **Point-in-Time Recovery:**
   - Enabled via WAL archiving
   - Recovery window: 7 days

**Redis Backups:**

1. **RDB Snapshots:**
   ```
   save 900 1     # After 15 min if >= 1 key changed
   save 300 10    # After 5 min if >= 10 keys changed
   save 60 10000  # After 1 min if >= 10000 keys changed
   ```

2. **AOF Log:**
   ```
   appendonly yes
   appendfsync everysec
   ```

**S3 Versioning & Replication:**
```yaml
Versioning: Enabled
Lifecycle Rules:
  - DeleteMarker expiration: 90 days
  - Noncurrent version expiration: 30 days

Replication:
  Destination: us-west-2 (Cross-region)
  Rules:
    - Replicate all objects
    - Replicate delete markers
```

### Disaster Recovery Plan

**RTO (Recovery Time Objective):** 1 hour
**RPO (Recovery Point Objective):** 5 minutes

**DR Scenarios:**

1. **Database Failure:**
   - Promote read replica to primary
   - Update DNS/connection strings
   - Estimated downtime: 5 minutes

2. **Region Failure:**
   - Failover to DR region (us-west-2)
   - Restore from S3 cross-region replica
   - Estimated downtime: 30 minutes

3. **Data Corruption:**
   - Restore from most recent clean backup
   - Replay WAL logs to recover recent transactions
   - Estimated downtime: 1 hour

**Backup Verification:**
- Weekly automated restore test
- Monthly disaster recovery drill

---

## Monitoring & Alerts

### Cache Performance Metrics

**Redis:**
```
redis_hit_rate = hits / (hits + misses)
redis_eviction_rate = evictions / total_keys
redis_memory_utilization = used_memory / max_memory
```

**CDN:**
```
cdn_hit_rate = cache_hits / total_requests
cdn_origin_response_time_p95
cdn_4xx_error_rate
cdn_5xx_error_rate
```

### Alerts

```yaml
Alerts:
  - name: RedisHighMemory
    condition: redis_memory_utilization > 0.8
    severity: warning
    action: Scale up Redis cluster

  - name: RedisLowHitRate
    condition: redis_hit_rate < 0.7
    severity: warning
    action: Review cache TTLs and patterns

  - name: CDNHighOriginLoad
    condition: cdn_hit_rate < 0.8
    severity: warning
    action: Increase CDN TTLs or add cache warmup

  - name: DatabaseBackupFailed
    condition: pg_backup_status != "success"
    severity: critical
    action: Immediate investigation required
```

---

## Summary

This caching strategy provides:

- **Multi-layer caching** for optimal performance
- **Intelligent TTLs** based on data volatility
- **Automatic invalidation** on data updates
- **Comprehensive retention policies** for compliance
- **Robust backup strategy** with 7-day PITR
- **Disaster recovery plan** with 1-hour RTO

All caching layers are monitored with Prometheus and Grafana, with automated alerts for anomalies.
