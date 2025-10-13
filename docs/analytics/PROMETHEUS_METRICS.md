# Prometheus Metrics Configuration

**Version:** 1.0
**Date:** October 12, 2025
**Component:** Monitoring Infrastructure

---

## Overview

This document defines all Prometheus metrics collected from the DJ Union platform for monitoring, alerting, and performance analysis.

---

## Metric Categories

### 1. HTTP Request Metrics

```typescript
// metrics/http.metrics.ts
import { Counter, Histogram, Registry } from 'prom-client';

export const register = new Registry();

// Total HTTP requests
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// HTTP request duration
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

// HTTP request size
export const httpRequestSize = new Histogram({
  name: 'http_request_size_bytes',
  help: 'HTTP request size in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
  registers: [register]
});

// HTTP response size
export const httpResponseSize = new Histogram({
  name: 'http_response_size_bytes',
  help: 'HTTP response size in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
  registers: [register]
});

// HTTP errors
export const httpErrorsTotal = new Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'error_type'],
  registers: [register]
});
```

### 2. Stream Metrics

```typescript
// metrics/stream.metrics.ts
import { Counter, Gauge, Histogram } from 'prom-client';
import { register } from './http.metrics';

// Current listener count per stream
export const streamListenerCount = new Gauge({
  name: 'stream_listener_count',
  help: 'Current number of listeners for a stream',
  labelNames: ['stream_id', 'stream_name'],
  registers: [register]
});

// Stream uptime
export const streamUptimeSeconds = new Counter({
  name: 'stream_uptime_seconds_total',
  help: 'Total uptime of stream in seconds',
  labelNames: ['stream_id', 'stream_name'],
  registers: [register]
});

// Stream heartbeat count
export const streamHeartbeatTotal = new Counter({
  name: 'stream_heartbeat_total',
  help: 'Total number of heartbeats received from stream',
  labelNames: ['stream_id'],
  registers: [register]
});

// Stream errors
export const streamErrorsTotal = new Counter({
  name: 'stream_errors_total',
  help: 'Total number of stream errors',
  labelNames: ['stream_id', 'error_type'],
  registers: [register]
});

// Stream bitrate
export const streamBitrate = new Gauge({
  name: 'stream_bitrate_kbps',
  help: 'Current bitrate of stream in kbps',
  labelNames: ['stream_id'],
  registers: [register]
});

// Total active streams
export const activeStreamsTotal = new Gauge({
  name: 'active_streams_total',
  help: 'Total number of currently active streams',
  registers: [register]
});

// Stream start/stop events
export const streamEvents = new Counter({
  name: 'stream_events_total',
  help: 'Total number of stream start/stop events',
  labelNames: ['event_type'], // 'started', 'stopped'
  registers: [register]
});
```

### 3. Upload Processing Metrics

```typescript
// metrics/upload.metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';
import { register } from './http.metrics';

// Upload processing duration
export const uploadProcessingDuration = new Histogram({
  name: 'upload_processing_duration_seconds',
  help: 'Time taken to process an upload',
  labelNames: ['upload_type', 'status'], // status: success, failed
  buckets: [1, 5, 10, 30, 60, 120, 300, 600],
  registers: [register]
});

// Upload processing status
export const uploadProcessingStatus = new Counter({
  name: 'upload_processing_status_total',
  help: 'Total number of uploads by status',
  labelNames: ['status'], // processing, ready, failed
  registers: [register]
});

// Upload file size
export const uploadFileSize = new Histogram({
  name: 'upload_file_size_bytes',
  help: 'Size of uploaded files in bytes',
  labelNames: ['file_type'],
  buckets: [
    1024 * 1024,        // 1MB
    5 * 1024 * 1024,    // 5MB
    10 * 1024 * 1024,   // 10MB
    50 * 1024 * 1024,   // 50MB
    100 * 1024 * 1024,  // 100MB
    500 * 1024 * 1024   // 500MB
  ],
  registers: [register]
});

// Transcoding queue length
export const transcodingQueueLength = new Gauge({
  name: 'transcoding_queue_length',
  help: 'Number of uploads waiting in transcoding queue',
  registers: [register]
});

// Transcoding workers active
export const transcodingWorkersActive = new Gauge({
  name: 'transcoding_workers_active',
  help: 'Number of active transcoding workers',
  registers: [register]
});
```

### 4. Database Metrics

```typescript
// metrics/database.metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';
import { register } from './http.metrics';

// Database query duration
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query execution time',
  labelNames: ['query_type', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
  registers: [register]
});

// Database connection pool size
export const dbConnectionPoolSize = new Gauge({
  name: 'db_connection_pool_size',
  help: 'Total size of database connection pool',
  registers: [register]
});

// Database connections available
export const dbConnectionPoolAvailable = new Gauge({
  name: 'db_connection_pool_available',
  help: 'Number of available database connections',
  registers: [register]
});

// Database connections in use
export const dbConnectionPoolInUse = new Gauge({
  name: 'db_connection_pool_in_use',
  help: 'Number of database connections currently in use',
  registers: [register]
});

// Database query errors
export const dbQueryErrors = new Counter({
  name: 'db_query_errors_total',
  help: 'Total number of database query errors',
  labelNames: ['error_type', 'table'],
  registers: [register]
});

// Database transactions
export const dbTransactions = new Counter({
  name: 'db_transactions_total',
  help: 'Total number of database transactions',
  labelNames: ['status'], // committed, rolled_back
  registers: [register]
});
```

### 5. Redis Metrics

```typescript
// metrics/redis.metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';
import { register } from './http.metrics';

// Redis command duration
export const redisCommandDuration = new Histogram({
  name: 'redis_command_duration_seconds',
  help: 'Redis command execution time',
  labelNames: ['command'],
  buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register]
});

// Redis commands total
export const redisCommandsTotal = new Counter({
  name: 'redis_commands_total',
  help: 'Total number of Redis commands executed',
  labelNames: ['command', 'status'],
  registers: [register]
});

// Redis connection status
export const redisConnectionStatus = new Gauge({
  name: 'redis_connection_status',
  help: 'Redis connection status (1 = connected, 0 = disconnected)',
  registers: [register]
});

// Redis keys total
export const redisKeysTotal = new Gauge({
  name: 'redis_keys_total',
  help: 'Total number of keys in Redis',
  labelNames: ['pattern'],
  registers: [register]
});

// Redis memory usage
export const redisMemoryUsage = new Gauge({
  name: 'redis_memory_usage_bytes',
  help: 'Redis memory usage in bytes',
  registers: [register]
});
```

### 6. Business Metrics

```typescript
// metrics/business.metrics.ts
import { Counter, Gauge } from 'prom-client';
import { register } from './http.metrics';

// Total users
export const usersTotal = new Gauge({
  name: 'users_total',
  help: 'Total number of registered users',
  labelNames: ['role'], // dj, admin
  registers: [register]
});

// User registrations
export const userRegistrations = new Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  registers: [register]
});

// User logins
export const userLogins = new Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['method'], // password, oauth
  registers: [register]
});

// Content items
export const contentItemsTotal = new Gauge({
  name: 'content_items_total',
  help: 'Total number of content items',
  labelNames: ['content_type'], // stream, playlist, podcast
  registers: [register]
});

// Playlist plays
export const playlistPlaysTotal = new Counter({
  name: 'playlist_plays_total',
  help: 'Total number of playlist plays',
  labelNames: ['playlist_id'],
  registers: [register]
});

// Podcast downloads
export const podcastDownloadsTotal = new Counter({
  name: 'podcast_downloads_total',
  help: 'Total number of podcast downloads',
  labelNames: ['podcast_id'],
  registers: [register]
});

// Subscriptions
export const subscriptionsActive = new Gauge({
  name: 'subscriptions_active',
  help: 'Number of active subscriptions',
  labelNames: ['plan_id'],
  registers: [register]
});
```

---

## Metrics Middleware Implementation

```typescript
// middleware/metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  httpRequestsTotal,
  httpRequestDuration,
  httpRequestSize,
  httpResponseSize
} from '../metrics/http.metrics';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Track request size
    const requestSize = parseInt(req.headers['content-length'] || '0');
    const route = this.normalizeRoute(req.route?.path || req.path);

    // Intercept response finish
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const responseSize = parseInt(res.getHeader('content-length') as string || '0');

      // Record metrics
      httpRequestsTotal.labels(req.method, route, res.statusCode.toString()).inc();
      httpRequestDuration.labels(req.method, route, res.statusCode.toString()).observe(duration);
      httpRequestSize.labels(req.method, route).observe(requestSize);
      httpResponseSize.labels(req.method, route).observe(responseSize);
    });

    next();
  }

  private normalizeRoute(path: string): string {
    // Normalize dynamic routes to avoid high cardinality
    return path
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '/:id')
      .replace(/\/\d+/g, '/:id');
  }
}
```

---

## Metrics Endpoint

```typescript
// metrics/metrics.controller.ts
import { Controller, Get, Header } from '@nestjs/common';
import { register } from './http.metrics';

@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Content-Type', register.contentType)
  async getMetrics() {
    return register.metrics();
  }
}
```

---

## Prometheus Configuration

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'djunion-prod'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Load alerting rules
rule_files:
  - '/etc/prometheus/rules/*.yml'

# Scrape configurations
scrape_configs:
  # API Service
  - job_name: 'api'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - djunion
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: djunion-api
        action: keep
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        regex: true
        action: keep
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2

  # Analytics Service
  - job_name: 'analytics'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - djunion
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: analytics-service
        action: keep

  # Relay Workers
  - job_name: 'relay-workers'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - djunion
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: relay-worker
        action: keep

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets:
          - redis-exporter:9121

  # PostgreSQL Exporter
  - job_name: 'postgres'
    static_configs:
      - targets:
          - postgres-exporter:9187

  # Node Exporter (system metrics)
  - job_name: 'node'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)

  # Kubernetes API Server
  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
      - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https
```

---

## Recording Rules

```yaml
# monitoring/prometheus/rules/recording-rules.yml
groups:
  - name: api_performance
    interval: 30s
    rules:
      # API request rate (per second)
      - record: api:http_requests:rate5m
        expr: rate(http_requests_total[5m])

      # API error rate
      - record: api:http_errors:rate5m
        expr: rate(http_errors_total[5m])

      # API latency percentiles
      - record: api:http_request_duration:p50
        expr: histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))

      - record: api:http_request_duration:p95
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

      - record: api:http_request_duration:p99
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

  - name: stream_metrics
    interval: 30s
    rules:
      # Total listeners across all streams
      - record: streams:listeners:total
        expr: sum(stream_listener_count)

      # Average listeners per stream
      - record: streams:listeners:avg
        expr: avg(stream_listener_count)

      # Stream uptime percentage
      - record: streams:uptime:percentage
        expr: |
          (sum(rate(stream_uptime_seconds_total[24h])) / (count(stream_uptime_seconds_total) * 86400)) * 100

  - name: database_performance
    interval: 30s
    rules:
      # Database query rate
      - record: db:queries:rate5m
        expr: rate(db_query_duration_seconds_count[5m])

      # Database query latency percentiles
      - record: db:query_duration:p95
        expr: histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))

      # Connection pool utilization
      - record: db:connection_pool:utilization
        expr: (db_connection_pool_in_use / db_connection_pool_size) * 100
```

---

## Service Discovery

```yaml
# k8s/prometheus-service-discovery.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: monitoring
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
  - apiGroups: [""]
    resources:
      - nodes
      - nodes/proxy
      - services
      - endpoints
      - pods
    verbs: ["get", "list", "watch"]
  - apiGroups:
      - extensions
    resources:
      - ingresses
    verbs: ["get", "list", "watch"]
  - nonResourceURLs: ["/metrics"]
    verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
  - kind: ServiceAccount
    name: prometheus
    namespace: monitoring
```

---

## Usage Examples

### Recording Stream Heartbeat

```typescript
import { streamListenerCount, streamHeartbeatTotal } from './metrics/stream.metrics';

async function handleStreamHeartbeat(streamId: string, data: HeartbeatData) {
  // Update metrics
  streamListenerCount.labels(streamId, data.stream_name).set(data.listener_count);
  streamHeartbeatTotal.labels(streamId).inc();

  // Process heartbeat...
}
```

### Recording Upload Processing

```typescript
import { uploadProcessingDuration, uploadProcessingStatus } from './metrics/upload.metrics';

async function processUpload(uploadId: string, file: Buffer) {
  const timer = uploadProcessingDuration.startTimer({ upload_type: 'audio' });

  try {
    await transcodeAudio(file);
    uploadProcessingStatus.labels('ready').inc();
    timer({ status: 'success' });
  } catch (error) {
    uploadProcessingStatus.labels('failed').inc();
    timer({ status: 'failed' });
    throw error;
  }
}
```

### Recording Database Query

```typescript
import { dbQueryDuration, dbQueryErrors } from './metrics/database.metrics';

async function executeQuery(sql: string, table: string) {
  const timer = dbQueryDuration.startTimer({ query_type: 'select', table });

  try {
    const result = await database.query(sql);
    timer();
    return result;
  } catch (error) {
    dbQueryErrors.labels('timeout', table).inc();
    timer();
    throw error;
  }
}
```

---

## Metrics Naming Conventions

1. **Use underscores**: `http_requests_total` (not `httpRequestsTotal`)
2. **Add unit suffix**: `_seconds`, `_bytes`, `_total`
3. **Use base units**: seconds (not milliseconds), bytes (not kilobytes)
4. **Counter suffix**: Always end counters with `_total`
5. **Label cardinality**: Keep label values bounded (avoid user IDs, use categories)

---

**Document Version:** 1.0
**Last Updated:** October 12, 2025
**Status:** Production Ready
