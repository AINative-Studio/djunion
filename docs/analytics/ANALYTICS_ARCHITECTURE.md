# DJ Union Analytics & Monitoring Architecture

**Version:** 1.0
**Date:** October 12, 2025
**Epic:** Epic 5 - Analytics & Reporting
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Analytics Pipeline Architecture](#analytics-pipeline-architecture)
3. [Data Collection Strategy](#data-collection-strategy)
4. [Time-Series Data Storage](#time-series-data-storage)
5. [API Endpoints](#api-endpoints)
6. [Monitoring Infrastructure](#monitoring-infrastructure)
7. [ML Feature Engineering](#ml-feature-engineering)
8. [Deployment Architecture](#deployment-architecture)

---

## Overview

The DJ Union analytics system provides comprehensive real-time and historical insights into:

- **Live Stream Performance**: Listener counts, uptime, peak concurrent listeners
- **Playlist Engagement**: Play counts, unique listeners, completion rates
- **Podcast Analytics**: Downloads, subscribers, episode performance
- **System Metrics**: API performance, resource utilization, error rates

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Collection Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Stream Heartbeats  │  Play Events  │  Download Events      │
│  (30s interval)     │  (on-demand)  │  (podcast RSS)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Event Processing Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Redis Stream      │  Background Jobs  │  Aggregation        │
│  (real-time)       │  (BullMQ)         │  (daily cron)       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                            │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL        │  TimescaleDB      │  Redis Cache        │
│  (aggregated)      │  (time-series)    │  (real-time)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Analytics API Layer                         │
├─────────────────────────────────────────────────────────────┤
│  GET /analytics/streams/{id}                                 │
│  GET /analytics/playlists/{id}                               │
│  GET /analytics/podcasts/{id}                                │
│  GET /analytics/dashboard                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring & Observability                 │
├─────────────────────────────────────────────────────────────┤
│  Prometheus        │  Grafana          │  Loki               │
│  (metrics)         │  (visualization)  │  (logs)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Analytics Pipeline Architecture

### Event Flow

```typescript
// 1. Event Collection
POST /v1/streams/{id}/heartbeat
{
  "listener_count": 145,
  "bitrate": 128000,
  "uptime_seconds": 3600,
  "current_track": "Artist - Track Name"
}

// 2. Event Processing (Redis Stream)
XADD stream:heartbeats *
  stream_id {id}
  listener_count 145
  timestamp {unix_timestamp}

// 3. Real-time Cache Update
HSET stream:{id}:realtime
  listener_count 145
  last_seen {timestamp}
EXPIRE stream:{id}:realtime 300

// 4. Background Aggregation (Daily Job)
INSERT INTO analytics (
  resource_type, resource_id, date, metric, value
) VALUES (
  'stream', '{id}', CURRENT_DATE, 'listeners', 145
) ON CONFLICT (resource_type, resource_id, date, metric)
DO UPDATE SET value = GREATEST(analytics.value, EXCLUDED.value);
```

### Aggregation Pipeline

```sql
-- Daily Aggregation Job (runs at midnight UTC)
CREATE OR REPLACE FUNCTION aggregate_daily_analytics()
RETURNS void AS $$
BEGIN
  -- Aggregate stream listeners (sum of daily heartbeats)
  INSERT INTO analytics (resource_type, resource_id, date, metric, value)
  SELECT
    'stream',
    stream_id,
    DATE(created_at),
    'listeners',
    SUM(listener_count)
  FROM stream_heartbeats
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY stream_id, DATE(created_at)
  ON CONFLICT (resource_type, resource_id, date, metric)
  DO UPDATE SET value = EXCLUDED.value;

  -- Calculate peak listeners
  INSERT INTO analytics (resource_type, resource_id, date, metric, value)
  SELECT
    'stream',
    stream_id,
    DATE(created_at),
    'peak_listeners',
    MAX(listener_count)
  FROM stream_heartbeats
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY stream_id, DATE(created_at)
  ON CONFLICT (resource_type, resource_id, date, metric)
  DO UPDATE SET value = EXCLUDED.value;

  -- Aggregate playlist plays
  INSERT INTO analytics (resource_type, resource_id, date, metric, value)
  SELECT
    'playlist',
    playlist_id,
    DATE(played_at),
    'play_count',
    COUNT(*)
  FROM playlist_plays
  WHERE DATE(played_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY playlist_id, DATE(played_at)
  ON CONFLICT (resource_type, resource_id, date, metric)
  DO UPDATE SET value = analytics.value + EXCLUDED.value;

  -- Aggregate podcast downloads
  INSERT INTO analytics (resource_type, resource_id, date, metric, value)
  SELECT
    'podcast',
    podcast_id,
    DATE(downloaded_at),
    'downloads',
    COUNT(*)
  FROM podcast_downloads
  WHERE DATE(downloaded_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY podcast_id, DATE(downloaded_at)
  ON CONFLICT (resource_type, resource_id, date, metric)
  DO UPDATE SET value = analytics.value + EXCLUDED.value;

  -- Purge old raw events (keep 30 days)
  DELETE FROM stream_heartbeats WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM playlist_plays WHERE played_at < NOW() - INTERVAL '30 days';
  DELETE FROM podcast_downloads WHERE downloaded_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily aggregation
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('daily-analytics', '0 0 * * *', 'SELECT aggregate_daily_analytics()');
```

---

## Data Collection Strategy

### 1. Stream Heartbeats (Real-Time)

**Trigger:** Relay Worker sends heartbeat every 30 seconds

```typescript
// Relay Worker heartbeat sender
setInterval(async () => {
  const metrics = await getStreamMetrics();

  await fetch(`${API_URL}/v1/streams/${streamId}/heartbeat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${relayWorkerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listener_count: metrics.listeners,
      bitrate: metrics.bitrate,
      uptime_seconds: metrics.uptime,
      current_track: metrics.nowPlaying
    })
  });
}, 30000);
```

**API Handler:**

```typescript
// POST /v1/streams/:id/heartbeat
async heartbeat(streamId: string, data: HeartbeatData) {
  // 1. Validate stream ownership
  const stream = await this.streamsService.findOne(streamId);

  // 2. Update real-time cache (Redis)
  await this.redis.hset(`stream:${streamId}:realtime`, {
    listener_count: data.listener_count,
    bitrate: data.bitrate,
    uptime_seconds: data.uptime_seconds,
    current_track: data.current_track,
    last_seen: Date.now()
  });

  await this.redis.expire(`stream:${streamId}:realtime`, 300); // 5 min TTL

  // 3. Append to event stream for aggregation
  await this.redis.xadd(
    'stream:heartbeats',
    '*',
    'stream_id', streamId,
    'listener_count', data.listener_count,
    'timestamp', Date.now()
  );

  // 4. Emit WebSocket event for live updates
  this.wsGateway.emitStreamUpdate(streamId, {
    listener_count: data.listener_count,
    current_track: data.current_track
  });

  // 5. Store raw event in TimescaleDB
  await this.heartbeatsRepo.insert({
    stream_id: streamId,
    listener_count: data.listener_count,
    bitrate: data.bitrate,
    uptime_seconds: data.uptime_seconds,
    current_track: data.current_track,
    created_at: new Date()
  });

  return { status: 'ok', next_heartbeat_in: 30 };
}
```

### 2. Playlist Plays (On-Demand)

**Trigger:** User requests playlist stream

```typescript
// GET /v1/playlists/:id/stream.m3u8
async getPlaylistStream(playlistId: string, req: Request) {
  const userId = req.user?.id;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  // Record play event
  await this.analyticsService.recordPlaylistPlay({
    playlist_id: playlistId,
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    played_at: new Date()
  });

  // Increment real-time play count
  await this.redis.hincrby(`playlist:${playlistId}:stats`, 'play_count', 1);

  // Return HLS manifest
  return this.playlistsService.generateHLSManifest(playlistId);
}
```

### 3. Podcast Downloads (RSS Feed)

**Trigger:** RSS feed access or episode download

```typescript
// GET /v1/podcasts/:id/rss.xml
async getRSSFeed(podcastId: string, req: Request) {
  // Record RSS feed access
  await this.analyticsService.recordPodcastAccess({
    podcast_id: podcastId,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    accessed_at: new Date()
  });

  return this.podcastsService.generateRSSFeed(podcastId);
}

// GET /v1/podcasts/:podcastId/episodes/:episodeId/download
async downloadEpisode(podcastId: string, episodeId: string, req: Request) {
  // Record episode download
  await this.analyticsService.recordEpisodeDownload({
    podcast_id: podcastId,
    episode_id: episodeId,
    user_id: req.user?.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    downloaded_at: new Date()
  });

  return this.episodesService.getDownloadUrl(episodeId);
}
```

---

## Time-Series Data Storage

### TimescaleDB Setup

```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertable for stream heartbeats
CREATE TABLE stream_heartbeats (
  id BIGSERIAL,
  stream_id UUID NOT NULL,
  listener_count INTEGER NOT NULL,
  bitrate INTEGER NOT NULL,
  uptime_seconds INTEGER NOT NULL,
  current_track TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Convert to hypertable (partitioned by time)
SELECT create_hypertable('stream_heartbeats', 'created_at',
  chunk_time_interval => INTERVAL '1 day');

-- Create indexes for efficient queries
CREATE INDEX idx_heartbeats_stream_time
  ON stream_heartbeats (stream_id, created_at DESC);

-- Continuous aggregates for real-time queries
CREATE MATERIALIZED VIEW stream_hourly_stats
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', created_at) AS bucket,
  stream_id,
  AVG(listener_count) AS avg_listeners,
  MAX(listener_count) AS peak_listeners,
  COUNT(*) AS heartbeat_count
FROM stream_heartbeats
GROUP BY bucket, stream_id
WITH NO DATA;

-- Refresh policy (refresh every hour)
SELECT add_continuous_aggregate_policy('stream_hourly_stats',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');

-- Retention policy (keep raw data for 30 days)
SELECT add_retention_policy('stream_heartbeats', INTERVAL '30 days');
```

### Redis Cache Structure

```typescript
// Real-time stream stats (TTL: 5 minutes)
HSET stream:{stream_id}:realtime
  listener_count 145
  bitrate 128000
  uptime_seconds 3600
  current_track "Artist - Track Name"
  last_seen 1697123456789

// Daily aggregates cache (TTL: 24 hours)
HSET stream:{stream_id}:daily:{date}
  listeners 5420
  peak_listeners 245
  uptime_seconds 86400

// Playlist play counts (TTL: 1 hour)
HINCRBY playlist:{playlist_id}:stats play_count 1
HINCRBY playlist:{playlist_id}:stats unique_listeners 1

// Podcast download counts (TTL: 1 hour)
HINCRBY podcast:{podcast_id}:stats downloads 1
HINCRBY podcast:{podcast_id}:stats subscribers 1
```

---

## API Endpoints

### 1. Stream Analytics

```typescript
/**
 * GET /v1/analytics/streams/:id
 *
 * Query Parameters:
 *   from: string (YYYY-MM-DD) - Start date
 *   to: string (YYYY-MM-DD) - End date
 *   interval: string - Aggregation interval (hour, day, week, month)
 *
 * Response:
 * {
 *   stream_id: "uuid",
 *   stream_name: "DJ TechHouse Live",
 *   date_range: { from: "2025-10-01", to: "2025-10-12" },
 *   summary: {
 *     total_listeners: 15420,
 *     peak_listeners: 345,
 *     avg_listeners: 128,
 *     total_uptime_hours: 240,
 *     uptime_percentage: 95.2
 *   },
 *   timeseries: [
 *     { date: "2025-10-01", listeners: 1250, peak: 234, uptime_seconds: 82800 },
 *     { date: "2025-10-02", listeners: 1340, peak: 267, uptime_seconds: 86400 },
 *     ...
 *   ],
 *   real_time: {
 *     current_listeners: 145,
 *     current_track: "Artist - Track Name",
 *     status: "online",
 *     last_heartbeat: "2025-10-12T14:30:45Z"
 *   }
 * }
 */
@Get('streams/:id')
@UseGuards(JwtAuthGuard)
async getStreamAnalytics(
  @Param('id') streamId: string,
  @Query('from') from: string,
  @Query('to') to: string,
  @Query('interval') interval: string = 'day'
) {
  // Validate date range
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (toDate < fromDate) {
    throw new BadRequestException('End date must be after start date');
  }

  // Get aggregated data from analytics table
  const timeseries = await this.analyticsRepo
    .createQueryBuilder('a')
    .select('a.date', 'date')
    .addSelect('SUM(CASE WHEN a.metric = \'listeners\' THEN a.value ELSE 0 END)', 'listeners')
    .addSelect('MAX(CASE WHEN a.metric = \'peak_listeners\' THEN a.value ELSE 0 END)', 'peak')
    .addSelect('SUM(CASE WHEN a.metric = \'uptime_seconds\' THEN a.value ELSE 0 END)', 'uptime_seconds')
    .where('a.resource_type = :type', { type: 'stream' })
    .andWhere('a.resource_id = :id', { id: streamId })
    .andWhere('a.date >= :from', { from: fromDate })
    .andWhere('a.date <= :to', { to: toDate })
    .groupBy('a.date')
    .orderBy('a.date', 'ASC')
    .getRawMany();

  // Calculate summary stats
  const summary = {
    total_listeners: timeseries.reduce((sum, d) => sum + d.listeners, 0),
    peak_listeners: Math.max(...timeseries.map(d => d.peak)),
    avg_listeners: Math.round(
      timeseries.reduce((sum, d) => sum + d.listeners, 0) / timeseries.length
    ),
    total_uptime_hours: Math.round(
      timeseries.reduce((sum, d) => sum + d.uptime_seconds, 0) / 3600
    ),
    uptime_percentage: (
      (timeseries.reduce((sum, d) => sum + d.uptime_seconds, 0) /
       (timeseries.length * 86400)) * 100
    ).toFixed(2)
  };

  // Get real-time data from Redis
  const realtime = await this.redis.hgetall(`stream:${streamId}:realtime`);

  return {
    stream_id: streamId,
    stream_name: (await this.streamsService.findOne(streamId)).name,
    date_range: { from, to },
    summary,
    timeseries,
    real_time: {
      current_listeners: parseInt(realtime.listener_count || '0'),
      current_track: realtime.current_track || 'Unknown',
      status: realtime.last_seen &&
              (Date.now() - parseInt(realtime.last_seen)) < 60000
              ? 'online' : 'offline',
      last_heartbeat: new Date(parseInt(realtime.last_seen || '0')).toISOString()
    }
  };
}
```

### 2. Playlist Analytics

```typescript
/**
 * GET /v1/analytics/playlists/:id
 *
 * Response:
 * {
 *   playlist_id: "uuid",
 *   playlist_title: "Chill Vibes Playlist",
 *   summary: {
 *     total_plays: 1542,
 *     unique_listeners: 847,
 *     avg_completion_rate: 78.5,
 *     total_duration_played_hours: 245
 *   },
 *   timeseries: [
 *     { date: "2025-10-01", play_count: 145, unique_listeners: 89 },
 *     ...
 *   ],
 *   top_tracks: [
 *     { track_id: "uuid", title: "Track Name", play_count: 345 },
 *     ...
 *   ]
 * }
 */
@Get('playlists/:id')
@UseGuards(JwtAuthGuard)
async getPlaylistAnalytics(
  @Param('id') playlistId: string,
  @Query('from') from: string,
  @Query('to') to: string
) {
  // Similar implementation to stream analytics
  // Query analytics table for playlist metrics
  // Include track-level analytics
}
```

### 3. Podcast Analytics

```typescript
/**
 * GET /v1/analytics/podcasts/:id
 *
 * Response:
 * {
 *   podcast_id: "uuid",
 *   podcast_title: "Tech DJ Podcast",
 *   summary: {
 *     total_downloads: 5420,
 *     total_subscribers: 847,
 *     avg_downloads_per_episode: 245,
 *     total_episodes: 24
 *   },
 *   timeseries: [
 *     { date: "2025-10-01", downloads: 145, subscribers: 12 },
 *     ...
 *   ],
 *   episodes: [
 *     {
 *       episode_id: "uuid",
 *       title: "Episode 1",
 *       downloads: 567,
 *       published_date: "2025-09-15"
 *     },
 *     ...
 *   ]
 * }
 */
@Get('podcasts/:id')
@UseGuards(JwtAuthGuard)
async getPodcastAnalytics(
  @Param('id') podcastId: string,
  @Query('from') from: string,
  @Query('to') to: string
) {
  // Implementation similar to stream analytics
  // Include episode-level analytics
}
```

### 4. Dashboard Summary

```typescript
/**
 * GET /v1/analytics/dashboard
 *
 * Aggregated stats for user's dashboard
 *
 * Response:
 * {
 *   user_id: "uuid",
 *   summary: {
 *     total_streams: 5,
 *     active_streams: 3,
 *     total_listeners_today: 542,
 *     total_playlists: 12,
 *     total_plays_today: 245,
 *     total_podcasts: 2,
 *     total_downloads_today: 89
 *   },
 *   top_streams: [
 *     { stream_id: "uuid", name: "Stream Name", listeners: 145 },
 *     ...
 *   ],
 *   recent_activity: [
 *     { type: "stream", action: "started", timestamp: "..." },
 *     { type: "playlist", action: "played", timestamp: "..." },
 *     ...
 *   ]
 * }
 */
@Get('dashboard')
@UseGuards(JwtAuthGuard)
async getDashboardAnalytics(@Req() req: Request) {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  // Get user's resources
  const streams = await this.streamsService.findByUser(userId);
  const playlists = await this.playlistsService.findByUser(userId);
  const podcasts = await this.podcastsService.findByUser(userId);

  // Get today's metrics
  const streamMetrics = await this.getStreamMetricsForToday(
    streams.map(s => s.stream_id)
  );
  const playlistMetrics = await this.getPlaylistMetricsForToday(
    playlists.map(p => p.playlist_id)
  );
  const podcastMetrics = await this.getPodcastMetricsForToday(
    podcasts.map(p => p.podcast_id)
  );

  return {
    user_id: userId,
    summary: {
      total_streams: streams.length,
      active_streams: streamMetrics.active_count,
      total_listeners_today: streamMetrics.total_listeners,
      total_playlists: playlists.length,
      total_plays_today: playlistMetrics.total_plays,
      total_podcasts: podcasts.length,
      total_downloads_today: podcastMetrics.total_downloads
    },
    top_streams: streamMetrics.top_streams,
    recent_activity: await this.getRecentActivity(userId)
  };
}
```

---

## Monitoring Infrastructure

See [PROMETHEUS_METRICS.md](./PROMETHEUS_METRICS.md) and [GRAFANA_DASHBOARDS.md](./GRAFANA_DASHBOARDS.md) for detailed configuration.

### Key Metrics

1. **HTTP Request Metrics**
   - `http_requests_total` - Counter with labels: method, route, status_code
   - `http_request_duration_seconds` - Histogram with labels: method, route
   - `http_request_size_bytes` - Histogram
   - `http_response_size_bytes` - Histogram

2. **Stream Metrics**
   - `stream_listener_count` - Gauge with label: stream_id
   - `stream_uptime_seconds` - Counter with label: stream_id
   - `stream_heartbeat_total` - Counter with label: stream_id
   - `stream_errors_total` - Counter with labels: stream_id, error_type

3. **Upload Processing Metrics**
   - `upload_processing_duration_seconds` - Histogram with label: upload_id
   - `upload_processing_status` - Counter with labels: status (success, failed)
   - `upload_file_size_bytes` - Histogram

4. **Database Metrics**
   - `db_query_duration_seconds` - Histogram with labels: query_type, table
   - `db_connection_pool_size` - Gauge
   - `db_connection_pool_available` - Gauge
   - `db_query_errors_total` - Counter with label: error_type

---

## ML Feature Engineering

### Feature Extraction Pipeline

```python
# ml/feature_extraction.py

from typing import Dict, List
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class AnalyticsFeatureExtractor:
    """
    Extract ML-ready features from analytics data for:
    - Listener behavior analysis
    - Content recommendation
    - Churn prediction
    """

    def extract_listener_features(self, user_id: str, days: int = 30) -> Dict:
        """
        Extract listener behavior features for a user

        Features:
        - Listening frequency (sessions per week)
        - Average session duration
        - Preferred listening time (hour of day)
        - Genre diversity (unique genres listened to)
        - Content type preference (stream vs playlist vs podcast)
        - Engagement score (completion rate)
        - Recency (days since last listen)
        - Churn risk score
        """

        # Query listening history
        history = self.get_listening_history(user_id, days)

        features = {
            'user_id': user_id,
            'listening_frequency': self._calculate_frequency(history),
            'avg_session_duration': self._calculate_avg_duration(history),
            'preferred_time_of_day': self._extract_time_preference(history),
            'genre_diversity': self._calculate_genre_diversity(history),
            'content_type_distribution': self._analyze_content_types(history),
            'engagement_score': self._calculate_engagement(history),
            'days_since_last_listen': self._calculate_recency(history),
            'churn_risk': self._predict_churn_risk(history)
        }

        return features

    def extract_content_features(self, content_id: str, content_type: str) -> Dict:
        """
        Extract content features for recommendation engine

        Features:
        - Popularity score (plays/downloads)
        - Engagement rate (completion rate)
        - Growth rate (play count trend)
        - Peak listening time
        - Genre/category
        - Audio characteristics (BPM, key, energy)
        - Creator reputation score
        """

        analytics = self.get_content_analytics(content_id, content_type)

        features = {
            'content_id': content_id,
            'content_type': content_type,
            'popularity_score': self._calculate_popularity(analytics),
            'engagement_rate': analytics['avg_completion_rate'],
            'growth_rate': self._calculate_growth_rate(analytics),
            'peak_listening_hour': self._extract_peak_hour(analytics),
            'genre': analytics['genre'],
            'creator_reputation': self._calculate_creator_score(analytics['user_id']),
            'days_since_created': (datetime.now() - analytics['created_at']).days
        }

        return features

    def _calculate_churn_risk(self, history: pd.DataFrame) -> float:
        """
        Calculate churn risk score (0-1)

        High risk indicators:
        - Declining listening frequency
        - Shorter session durations
        - No activity in last 7 days
        - Low engagement scores
        """

        if len(history) == 0:
            return 1.0  # High risk if no history

        # Feature engineering for churn prediction
        recent_activity = history[history['timestamp'] > datetime.now() - timedelta(days=7)]
        older_activity = history[history['timestamp'] <= datetime.now() - timedelta(days=7)]

        # Calculate risk factors
        recency_risk = 1.0 if len(recent_activity) == 0 else 0.0
        frequency_decline = self._detect_frequency_decline(history)
        engagement_risk = 1.0 - history['completion_rate'].mean()

        # Weighted churn risk score
        churn_risk = (
            0.4 * recency_risk +
            0.3 * frequency_decline +
            0.3 * engagement_risk
        )

        return min(1.0, max(0.0, churn_risk))

    def generate_recommendations(self, user_id: str, top_k: int = 10) -> List[Dict]:
        """
        Generate personalized content recommendations

        Algorithm:
        1. Extract user features (preferences, behavior)
        2. Extract content features (all available content)
        3. Calculate similarity scores
        4. Apply collaborative filtering
        5. Return top-K recommendations
        """

        user_features = self.extract_listener_features(user_id)

        # Get all available content
        all_content = self.get_all_content()

        # Calculate recommendation scores
        recommendations = []
        for content in all_content:
            content_features = self.extract_content_features(
                content['id'],
                content['type']
            )

            similarity_score = self._calculate_similarity(
                user_features,
                content_features
            )

            recommendations.append({
                'content_id': content['id'],
                'content_type': content['type'],
                'title': content['title'],
                'score': similarity_score,
                'reason': self._explain_recommendation(user_features, content_features)
            })

        # Sort by score and return top-K
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:top_k]
```

### Feature Storage

```sql
-- ML features table
CREATE TABLE ml_features (
  feature_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('user', 'content')),
  entity_id UUID NOT NULL,
  feature_name VARCHAR(100) NOT NULL,
  feature_value NUMERIC NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, feature_name)
);

CREATE INDEX idx_ml_features_entity ON ml_features(entity_type, entity_id);
CREATE INDEX idx_ml_features_computed ON ml_features(computed_at DESC);

-- Pre-computed recommendations
CREATE TABLE ml_recommendations (
  recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL,
  content_id UUID NOT NULL,
  score NUMERIC NOT NULL,
  reason TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, content_id)
);

CREATE INDEX idx_recommendations_user_score ON ml_recommendations(user_id, score DESC);
CREATE INDEX idx_recommendations_expires ON ml_recommendations(expires_at);

-- Background job to refresh recommendations daily
CREATE OR REPLACE FUNCTION refresh_user_recommendations(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete old recommendations
  DELETE FROM ml_recommendations WHERE user_id = p_user_id;

  -- Generate new recommendations (call Python ML service)
  -- This would be implemented as a background job
  RAISE NOTICE 'Recommendations refreshed for user %', p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Deployment Architecture

### Docker Compose (Local Development)

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/prometheus/rules:/etc/prometheus/rules
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=redis-datasource
    volumes:
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki/loki-config.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./monitoring/loki/promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped

  redis-exporter:
    image: oliver006/redis_exporter:latest
    ports:
      - "9121:9121"
    environment:
      - REDIS_ADDR=redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    ports:
      - "9187:9187"
    environment:
      - DATA_SOURCE_NAME=postgresql://djunion:dev_password@postgres:5432/djunion_dev?sslmode=disable
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
  alertmanager_data:
```

### Kubernetes Deployment

```yaml
# k8s/analytics-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: analytics-service
  namespace: djunion
spec:
  replicas: 3
  selector:
    matchLabels:
      app: analytics-service
  template:
    metadata:
      labels:
        app: analytics-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: analytics-service
        image: djunion/analytics-service:latest
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: djunion-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: djunion-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: analytics-service
  namespace: djunion
spec:
  selector:
    app: analytics-service
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: metrics
    port: 9090
    targetPort: 9090
  type: ClusterIP
```

---

## Next Steps

1. Implement analytics service endpoints
2. Set up Prometheus metrics collection
3. Create Grafana dashboards
4. Configure log aggregation with Loki
5. Set up alerting rules
6. Implement ML feature extraction pipeline
7. Create background jobs for data aggregation
8. Write integration tests
9. Deploy to staging environment
10. Monitor and optimize performance

---

**Document Version:** 1.0
**Last Updated:** October 12, 2025
**Author:** ML/Data Engineering Ops Specialist
**Status:** Ready for Implementation
