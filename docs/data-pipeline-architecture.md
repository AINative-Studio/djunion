# DJ Union - Data Pipeline Architecture

**Version:** 1.0
**Date:** October 12, 2025
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Live Stream Ingestion Pipeline](#live-stream-ingestion-pipeline)
3. [HLS Transcoding Pipeline](#hls-transcoding-pipeline)
4. [Analytics Aggregation Pipeline](#analytics-aggregation-pipeline)
5. [RSS Feed Generation Pipeline](#rss-feed-generation-pipeline)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Infrastructure Components](#infrastructure-components)

---

## Overview

DJ Union's data pipeline architecture is designed for:

- **High Availability**: 99.9% uptime for streaming services
- **Scalability**: Support 10,000+ concurrent listeners
- **Real-time Processing**: Sub-second latency for live streams
- **Fault Tolerance**: Automatic retry and recovery mechanisms
- **Cost Optimization**: Efficient resource utilization with auto-scaling

### Architecture Principles

1. **Event-Driven**: Use Redis pub/sub and Kubernetes events
2. **Asynchronous Processing**: Background jobs for heavy operations
3. **Caching First**: Redis cache layer for frequently accessed data
4. **Stateless Services**: Horizontally scalable API and workers
5. **Idempotent Operations**: Safe to retry on failures

---

## Live Stream Ingestion Pipeline

### Overview

The live stream pipeline connects DJ's Shoutcast/Icecast sources to listeners through Relay Worker pods that handle HLS transcoding and distribution.

### Data Flow

```
┌─────────────────┐
│ DJ's Shoutcast  │
│     Server      │
└────────┬────────┘
         │ MP3 Stream
         │
         ▼
┌─────────────────┐
│  Relay Worker   │◄─────── Kubernetes Orchestration
│  (K8s Pod)      │
└────────┬────────┘
         │
         ├──────► S3 Bucket (HLS segments)
         │
         ├──────► Redis (Heartbeat + Metadata)
         │
         └──────► PostgreSQL (Analytics Events)


┌─────────────────┐
│   CloudFront    │◄─────── S3 Origin
│      CDN        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HLS.js Player  │
│   (Frontend)    │
└─────────────────┘
```

### Pipeline Steps

#### 1. Stream Registration

**Trigger:** DJ submits stream configuration via API

```typescript
POST /v1/streams
{
  "name": "Live House Mix",
  "shoutcast_url": "http://stream.example.com:8000",
  "mount": "/live",
  "stream_key": "secret_key",
  "visibility": "public"
}
```

**Actions:**
1. API validates Shoutcast URL connectivity
2. Encrypt stream key with AES-256
3. Insert record into `streams` table
4. Trigger Kubernetes Job to deploy Relay Worker

**Output:**
- Stream ID returned to client
- Relay Worker pod created in K8s cluster

#### 2. Relay Worker Initialization

**Container Specs:**
```yaml
Container:
  Image: djunion/relay-worker:latest
  Resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
  Env:
    - STREAM_ID
    - SHOUTCAST_URL
    - MOUNT
    - STREAM_KEY_ENC
    - S3_BUCKET
    - REDIS_URL
```

**Initialization Sequence:**
1. Connect to Shoutcast server with authentication
2. Start FFmpeg process for HLS segmentation
3. Begin streaming MP3 data through FFmpeg
4. Initialize heartbeat sender (30-second interval)

**FFmpeg Command:**
```bash
ffmpeg -i "$SHOUTCAST_URL$MOUNT" \
  -c:a aac -b:a 128k \
  -f hls \
  -hls_time 6 \
  -hls_list_size 10 \
  -hls_flags delete_segments+append_list \
  -hls_segment_filename "s3://$S3_BUCKET/streams/$STREAM_ID/hls/segment%05d.ts" \
  "s3://$S3_BUCKET/streams/$STREAM_ID/hls/manifest.m3u8"
```

#### 3. Heartbeat Mechanism

**Frequency:** Every 30 seconds

**Redis Key Structure:**
```
heartbeat:{stream_id} = {
  "listener_count": 150,
  "status": "online",
  "current_track": "Artist - Track Name",
  "bitrate": 128000,
  "last_seen": 1697040000
}
TTL: 5 minutes
```

**API Endpoint:**
```typescript
POST /v1/streams/{stream_id}/heartbeat
{
  "listener_count": 150,
  "current_track": "Artist - Track Name",
  "bitrate": 128000
}
```

**Actions:**
1. Validate stream ownership
2. Update Redis with TTL refresh
3. Log listener count to analytics queue
4. Return acknowledgment

**Failure Handling:**
- If heartbeat missed for 5 minutes: Mark stream as offline
- Send alert to DJ via WebSocket
- Keep Relay Worker running for 15 minutes before termination

#### 4. HLS Manifest Generation

**Manifest Location:**
```
s3://djunion-production/streams/{stream_id}/hls/manifest.m3u8
```

**Example Manifest:**
```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:12345

#EXTINF:6.0,
https://cdn.djunion.com/streams/{stream_id}/hls/segment12345.ts
#EXTINF:6.0,
https://cdn.djunion.com/streams/{stream_id}/hls/segment12346.ts
#EXTINF:6.0,
https://cdn.djunion.com/streams/{stream_id}/hls/segment12347.ts
```

**CDN Configuration:**
```
Cache-Control: public, max-age=6, s-maxage=3
X-Accel-Buffering: no
Access-Control-Allow-Origin: *
```

#### 5. Analytics Event Logging

**Event Types:**
- `stream_started`
- `stream_stopped`
- `listener_connected`
- `listener_disconnected`

**Redis Queue:**
```
LPUSH analytics:events {
  "event_type": "listener_connected",
  "stream_id": "uuid",
  "timestamp": 1697040000,
  "ip_address": "192.168.1.1",
  "user_agent": "HLS.js/1.4.0"
}
```

**Background Worker:** Processes queue every minute and writes to PostgreSQL

### Error Recovery

**Connection Failures:**
1. Exponential backoff: 5s, 10s, 30s, 60s
2. After 4 failures: Mark stream as failed
3. Notify DJ via email/WebSocket

**Resource Exhaustion:**
1. Monitor CPU/Memory usage
2. If > 90% for 5 minutes: Scale out (add pod)
3. If < 30% for 30 minutes: Scale in (remove pod)

**S3 Upload Failures:**
1. Retry 3 times with exponential backoff
2. If persistent failure: Switch to local buffer
3. Upload buffered segments when S3 recovers

---

## HLS Transcoding Pipeline

### Overview

Converts uploaded MP3 files into HLS format for adaptive streaming and on-demand playback.

### Data Flow

```
┌─────────────────┐
│  DJ Upload      │
│  (Frontend)     │
└────────┬────────┘
         │ Multipart Form Data
         │
         ▼
┌─────────────────┐
│   API Server    │
│ (Presigned URL) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   S3 Bucket     │
│ uploads/audio/  │
└────────┬────────┘
         │
         ▼ Trigger Lambda / K8s Job
┌─────────────────┐
│ Transcoding     │
│    Worker       │
│   (FFmpeg)      │
└────────┬────────┘
         │
         ├──────► S3 (HLS segments)
         │
         └──────► PostgreSQL (Update status)


┌─────────────────┐
│   CloudFront    │◄─────── S3 Origin
│      CDN        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Audio Player   │
│   (Frontend)    │
└─────────────────┘
```

### Pipeline Steps

#### 1. Upload Initiation

**API Endpoint:**
```typescript
POST /v1/uploads/audio/initiate
{
  "filename": "summer-mix.mp3",
  "size": 52428800,  // 50 MB
  "content_type": "audio/mpeg"
}
```

**Response:**
```json
{
  "upload_id": "uuid",
  "presigned_url": "https://s3.amazonaws.com/djunion-production/uploads/...",
  "expires_in": 3600
}
```

**Database Record:**
```sql
INSERT INTO uploads (
  upload_id, user_id, file_path, status
) VALUES (
  'uuid', 'user_uuid', 'uploads/audio/{user_id}/{upload_id}/original.mp3', 'processing'
);
```

#### 2. Direct Upload to S3

**Client-Side (Frontend):**
```typescript
const formData = new FormData();
formData.append('file', audioFile);

await fetch(presignedUrl, {
  method: 'PUT',
  body: formData,
  headers: {
    'Content-Type': 'audio/mpeg'
  }
});

// Poll for status
const checkStatus = setInterval(async () => {
  const status = await fetch(`/v1/uploads/audio/${uploadId}`);
  if (status.status === 'ready') {
    clearInterval(checkStatus);
    // Show success
  }
}, 2000);
```

#### 3. Transcoding Job Trigger

**S3 Event Notification → SQS → Lambda/K8s Job**

**Kubernetes Job Manifest:**
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: transcode-{{ upload_id }}
  namespace: audio-processing
spec:
  template:
    spec:
      containers:
      - name: ffmpeg
        image: jrottenberg/ffmpeg:4.4-alpine
        command:
        - /bin/sh
        - -c
        - |
          # Download original file
          aws s3 cp "s3://${S3_BUCKET}/${INPUT_PATH}" /tmp/input.mp3

          # Extract metadata
          ffprobe -v quiet -print_format json -show_format /tmp/input.mp3 > /tmp/metadata.json

          # Transcode to HLS
          ffmpeg -i /tmp/input.mp3 \
            -c:a aac -b:a 128k \
            -f hls \
            -hls_time 6 \
            -hls_list_size 0 \
            -hls_segment_filename /tmp/segment%05d.ts \
            /tmp/manifest.m3u8

          # Upload HLS files
          aws s3 cp /tmp/manifest.m3u8 "s3://${S3_BUCKET}/${OUTPUT_PATH}/hls/"
          aws s3 cp /tmp/segment*.ts "s3://${S3_BUCKET}/${OUTPUT_PATH}/hls/"

          # Update database
          curl -X PATCH "${API_URL}/v1/uploads/audio/${UPLOAD_ID}" \
            -H "Authorization: Bearer ${INTERNAL_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{
              "status": "ready",
              "completed_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
            }'
        env:
        - name: UPLOAD_ID
          value: "{{ upload_id }}"
        - name: S3_BUCKET
          value: "djunion-production"
        - name: INPUT_PATH
          value: "uploads/audio/{{ user_id }}/{{ upload_id }}/original.mp3"
        - name: OUTPUT_PATH
          value: "uploads/audio/{{ user_id }}/{{ upload_id }}"
        - name: API_URL
          value: "https://api.djunion.com"
        - name: INTERNAL_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: internal-api-key
      restartPolicy: OnFailure
  backoffLimit: 3
```

#### 4. HLS Segment Storage

**S3 Structure:**
```
uploads/
  audio/
    {user_id}/
      {upload_id}/
        original.mp3          # Original file (50 MB)
        metadata.json         # FFprobe output
        hls/
          manifest.m3u8       # Master playlist
          segment00000.ts     # 6-second segment
          segment00001.ts
          segment00002.ts
          ...
          segment00499.ts     # ~3000 seconds total
```

**Database Records:**
```sql
-- Update upload status
UPDATE uploads
SET status = 'ready', completed_at = NOW()
WHERE upload_id = 'uuid';

-- Insert HLS segments
INSERT INTO hls_segments (upload_id, sequence_index, ts_path, duration_seconds)
VALUES
  ('uuid', 0, 'uploads/audio/{upload_id}/hls/segment00000.ts', 6.00),
  ('uuid', 1, 'uploads/audio/{upload_id}/hls/segment00001.ts', 6.00),
  ...
```

#### 5. Failure Handling

**Job Failure Scenarios:**

1. **FFmpeg Error:**
   ```sql
   UPDATE uploads
   SET status = 'failed',
       error_message = 'Invalid audio format'
   WHERE upload_id = 'uuid';
   ```

2. **S3 Upload Error:**
   - Retry 3 times
   - If persistent: Save to local disk and queue for later upload

3. **Timeout (> 10 minutes):**
   - Kill job
   - Mark as failed
   - Notify DJ

**Monitoring:**
```typescript
// Prometheus metrics
transcoding_jobs_total{status="success"} 1234
transcoding_jobs_total{status="failed"} 12
transcoding_duration_seconds{quantile="0.95"} 45.2
```

---

## Analytics Aggregation Pipeline

### Overview

Collects real-time events and aggregates them into daily metrics for reporting.

### Data Flow

```
┌─────────────────┐
│  Event Sources  │
├─────────────────┤
│ - Heartbeats    │
│ - Stream Plays  │
│ - Downloads     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redis Queue    │
│ analytics:events│
└────────┬────────┘
         │
         ▼ Process every minute
┌─────────────────┐
│  Aggregation    │
│    Worker       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│  analytics      │
└─────────────────┘
```

### Pipeline Steps

#### 1. Event Collection

**Event Types:**

```typescript
// Stream listener event
{
  "event_type": "stream_listener",
  "stream_id": "uuid",
  "timestamp": 1697040000,
  "listener_count": 150
}

// Playlist play event
{
  "event_type": "playlist_play",
  "playlist_id": "uuid",
  "timestamp": 1697040000,
  "user_id": "uuid",
  "track_id": "uuid"
}

// Podcast download event
{
  "event_type": "podcast_download",
  "podcast_id": "uuid",
  "episode_id": "uuid",
  "timestamp": 1697040000
}
```

**Redis Push:**
```typescript
await redis.lpush('analytics:events', JSON.stringify(event));
```

#### 2. Aggregation Worker

**Cron Schedule:** Every minute

```typescript
import { Queue, Worker } from 'bullmq';

const analyticsQueue = new Queue('analytics-aggregation', {
  connection: redisConnection
});

const worker = new Worker('analytics-aggregation', async (job) => {
  const events = await redis.lrange('analytics:events', 0, -1);
  await redis.del('analytics:events'); // Clear processed events

  const aggregated = aggregateEvents(events);

  for (const metric of aggregated) {
    await prisma.analytics.upsert({
      where: {
        resourceType_resourceId_date_metric: {
          resourceType: metric.resourceType,
          resourceId: metric.resourceId,
          date: metric.date,
          metric: metric.metricName
        }
      },
      update: {
        value: { increment: metric.value }
      },
      create: {
        resourceType: metric.resourceType,
        resourceId: metric.resourceId,
        date: metric.date,
        metric: metric.metricName,
        value: metric.value
      }
    });
  }
}, { connection: redisConnection });

function aggregateEvents(events: string[]): AggregatedMetric[] {
  const metrics = new Map<string, number>();

  for (const eventJson of events) {
    const event = JSON.parse(eventJson);
    const date = new Date(event.timestamp * 1000).toISOString().split('T')[0];

    switch (event.event_type) {
      case 'stream_listener':
        const key = `stream:${event.stream_id}:${date}:listeners`;
        metrics.set(key, Math.max(
          metrics.get(key) || 0,
          event.listener_count
        ));
        break;

      case 'playlist_play':
        const playKey = `playlist:${event.playlist_id}:${date}:play_count`;
        metrics.set(playKey, (metrics.get(playKey) || 0) + 1);
        break;

      case 'podcast_download':
        const dlKey = `podcast:${event.podcast_id}:${date}:downloads`;
        metrics.set(dlKey, (metrics.get(dlKey) || 0) + 1);
        break;
    }
  }

  return Array.from(metrics.entries()).map(([key, value]) => {
    const [resourceType, resourceId, date, metricName] = key.split(':');
    return { resourceType, resourceId, date, metricName, value };
  });
}
```

#### 3. Daily Rollup Job

**Cron Schedule:** Daily at 00:00 UTC

```typescript
// Rollup yesterday's data
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const dateStr = yesterday.toISOString().split('T')[0];

// Calculate aggregates
await prisma.$executeRaw`
  INSERT INTO analytics (resource_type, resource_id, date, metric, value)
  SELECT
    'stream' as resource_type,
    stream_id as resource_id,
    ${dateStr}::date as date,
    'total_listeners' as metric,
    SUM(listener_count) as value
  FROM raw_analytics_events
  WHERE date = ${dateStr}::date
  GROUP BY stream_id
  ON CONFLICT (resource_type, resource_id, date, metric)
  DO UPDATE SET value = EXCLUDED.value;
`;
```

#### 4. Data Retention Policy

**Raw Events:**
- Keep for 30 days
- Delete with background job

```typescript
// Run daily
await prisma.rawAnalyticsEvent.deleteMany({
  where: {
    timestamp: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  }
});
```

**Aggregated Metrics:**
- Keep for 365 days
- Archive to S3 after 1 year

```typescript
// Run monthly
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

const oldMetrics = await prisma.analytics.findMany({
  where: {
    date: { lt: oneYearAgo }
  }
});

// Upload to S3
await s3.putObject({
  Bucket: 'djunion-archives',
  Key: `analytics/${oneYearAgo.getFullYear()}/metrics.json.gz`,
  Body: gzip(JSON.stringify(oldMetrics)),
  StorageClass: 'GLACIER'
});

// Delete from database
await prisma.analytics.deleteMany({
  where: {
    date: { lt: oneYearAgo }
  }
});
```

---

## RSS Feed Generation Pipeline

### Overview

Generates and caches podcast RSS feeds with iTunes tags for directory submission.

### Data Flow

```
┌─────────────────┐
│   API Request   │
│ GET /podcasts/  │
│ {id}/rss.xml    │
└────────┬────────┘
         │
         ▼ Check cache
┌─────────────────┐
│  Redis Cache    │
│  TTL: 5 min     │
└────────┬────────┘
         │ Miss
         ▼
┌─────────────────┐
│  RSS Generator  │
│   (Template)    │
└────────┬────────┘
         │
         ├──────► S3 (Static cache)
         │
         └──────► Redis (Update cache)


┌─────────────────┐
│   CloudFront    │◄─────── Cache RSS
│      CDN        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Podcast Clients │
│ (Apple, Spotify)│
└─────────────────┘
```

### Pipeline Steps

#### 1. RSS Request Handling

**API Endpoint:**
```typescript
GET /v1/podcasts/{podcast_id}/rss.xml
```

**Cache Check:**
```typescript
const cacheKey = `rss:${podcastId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return res
    .header('Content-Type', 'application/rss+xml')
    .header('Cache-Control', 'public, max-age=300')
    .send(cached);
}
```

#### 2. RSS Generation

**Template:**
```typescript
async function generateRSS(podcastId: string): Promise<string> {
  const podcast = await prisma.podcast.findUnique({
    where: { podcastId },
    include: {
      episodes: {
        where: { deletedAt: null },
        orderBy: { publicationDate: 'desc' }
      }
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <link>${API_BASE_URL}/v1/podcasts/${podcast.podcastId}</link>
    <description>${escapeXml(podcast.description)}</description>
    <language>${podcast.language}</language>
    <itunes:author>${escapeXml(podcast.author)}</itunes:author>
    <itunes:image href="${podcast.imageUrl}"/>
    <itunes:explicit>${podcast.explicit ? 'yes' : 'no'}</itunes:explicit>
    <itunes:category text="Music"/>
    <atom:link href="${API_BASE_URL}/v1/podcasts/${podcast.podcastId}/rss.xml"
               rel="self" type="application/rss+xml"/>

    ${podcast.episodes.map(episode => `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description)}</description>
      <enclosure url="${getMediaUrl(episode)}"
                 length="${getFileSize(episode)}"
                 type="audio/mpeg"/>
      <guid isPermaLink="false">${episode.episodeId}</guid>
      <pubDate>${formatRFC822(episode.publicationDate)}</pubDate>
      <itunes:duration>${formatDuration(episode.durationSeconds)}</itunes:duration>
      <itunes:explicit>${episode.explicit ? 'yes' : 'no'}</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
    </item>
    `).join('')}
  </channel>
</rss>`;
}
```

#### 3. Cache Strategy

**Multi-Layer Caching:**

1. **Redis (Hot Cache):**
   ```typescript
   await redis.setex(
     `rss:${podcastId}`,
     300, // 5 minutes
     rssXml
   );
   ```

2. **S3 (Warm Cache):**
   ```typescript
   await s3.putObject({
     Bucket: 'djunion-production',
     Key: `podcasts/${podcastId}/rss.xml`,
     Body: rssXml,
     ContentType: 'application/rss+xml',
     CacheControl: 'public, max-age=300'
   });
   ```

3. **CloudFront (Edge Cache):**
   ```
   Cache-Control: public, max-age=300, s-maxage=300
   ```

#### 4. Cache Invalidation

**Trigger Events:**
- Episode created/updated/deleted
- Podcast metadata changed

```typescript
async function invalidateRSSCache(podcastId: string) {
  // Clear Redis
  await redis.del(`rss:${podcastId}`);

  // Invalidate CloudFront
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

  // Regenerate immediately
  const newRSS = await generateRSS(podcastId);
  await redis.setex(`rss:${podcastId}`, 300, newRSS);
}
```

---

## Infrastructure Components

### Kubernetes Architecture

```yaml
Namespaces:
  - audio-api-production
  - audio-api-staging
  - relay-workers
  - batch-jobs

Deployments:
  - API Server (3 replicas)
  - Analytics Worker (2 replicas)
  - RSS Generator (2 replicas)

StatefulSets:
  - Redis Cluster (3 nodes)
  - PostgreSQL Primary/Replica

Jobs:
  - Transcoding Worker (on-demand)
  - Daily Aggregation Job (cron)

Services:
  - API LoadBalancer (external)
  - Redis ClusterIP (internal)
  - PostgreSQL ClusterIP (internal)
```

### Resource Quotas

```yaml
ResourceQuota:
  hard:
    requests.cpu: "50"
    requests.memory: "100Gi"
    limits.cpu: "100"
    limits.memory: "200Gi"
    persistentvolumeclaims: "10"
```

---

## Summary

This data pipeline architecture provides:

- **Live Streaming**: Real-time ingestion with HLS transcoding
- **File Processing**: Async transcoding with job queues
- **Analytics**: Event-driven aggregation with retention policies
- **RSS Generation**: Multi-layer caching for podcast feeds
- **Scalability**: Horizontal scaling via Kubernetes
- **Reliability**: Fault tolerance and automatic recovery

All pipelines are instrumented with Prometheus metrics and distributed tracing for observability.
