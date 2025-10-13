# Analytics Pipeline Deployment Guide

**Version:** 1.0
**Date:** October 12, 2025
**Component:** Analytics & Monitoring Infrastructure
**Status:** Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Monitoring Stack Setup](#monitoring-stack-setup)
6. [Database Migrations](#database-migrations)
7. [Configuration Management](#configuration-management)
8. [Testing & Validation](#testing--validation)
9. [Production Checklist](#production-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

```bash
# Minimum versions
Node.js 18+ (LTS)
Docker 20.10+
Kubernetes 1.25+
kubectl 1.25+
Helm 3.10+
PostgreSQL 14+
Redis 6+
```

### Required Access

- AWS/GCP/Azure account with admin access
- Kubernetes cluster (EKS/GKE/AKS) provisioned
- Docker registry access
- GitHub repository access
- Prometheus/Grafana Cloud account (optional)

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/djunion/backend.git
cd backend
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, MinIO, Prometheus, Grafana, Loki
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services are running
docker-compose ps

# Expected output:
# prometheus     Up      0.0.0.0:9090->9090/tcp
# grafana        Up      0.0.0.0:3000->3000/tcp
# loki           Up      0.0.0.0:3100->3100/tcp
# promtail       Up
# alertmanager   Up      0.0.0.0:9093->9093/tcp
# redis          Up      0.0.0.0:6379->6379/tcp
# postgres       Up      0.0.0.0:5432->5432/tcp
```

### 3. Set Up Environment Variables

```bash
# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=postgresql://djunion:dev_password@localhost:5432/djunion_dev
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Analytics Service
ANALYTICS_PORT=3001
ANALYTICS_LOG_LEVEL=info

# Prometheus
PROMETHEUS_URL=http://localhost:9090
PROMETHEUS_PUSH_GATEWAY=http://localhost:9091

# Grafana
GRAFANA_URL=http://localhost:3000
GRAFANA_API_KEY=your_api_key

# Loki
LOKI_URL=http://localhost:3100

# Feature Flags
ENABLE_ML_FEATURES=false
ENABLE_REALTIME_ANALYTICS=true
ENABLE_CHURN_PREDICTION=false

# Background Jobs
CRON_DAILY_AGGREGATION="0 0 * * *"
CRON_FEATURE_EXTRACTION="0 2 * * *"
CRON_MODEL_REFRESH="0 4 * * 0"

EOF
```

### 4. Run Database Migrations

```bash
cd backend/analytics-service

# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed initial data (optional)
npx prisma db seed
```

### 5. Start Analytics Service

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### 6. Verify Service Health

```bash
# Check health endpoint
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-12T14:30:00Z",
#   "services": {
#     "database": "connected",
#     "redis": "connected",
#     "prometheus": "reachable"
#   }
# }

# Check metrics endpoint
curl http://localhost:3001/metrics
```

---

## Docker Deployment

### 1. Build Docker Images

```bash
# Build analytics service image
docker build -t djunion/analytics-service:latest \
  -f Dockerfile.analytics .

# Build relay worker image (if needed)
docker build -t djunion/relay-worker:latest \
  -f Dockerfile.relay .

# Tag with version
docker tag djunion/analytics-service:latest \
  djunion/analytics-service:1.0.0
```

### 2. Push to Registry

```bash
# Login to Docker registry
docker login

# Push images
docker push djunion/analytics-service:1.0.0
docker push djunion/analytics-service:latest
```

### 3. Docker Compose Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  analytics-service:
    image: djunion/analytics-service:1.0.0
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: djunion_prod
      POSTGRES_USER: djunion
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - ./monitoring/grafana:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

### 4. Deploy with Docker Compose

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f analytics-service

# Scale analytics service
docker-compose -f docker-compose.prod.yml up -d --scale analytics-service=3
```

---

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace djunion
kubectl create namespace monitoring
```

### 2. Apply Secrets

```bash
# Create database secret
kubectl create secret generic djunion-db \
  --from-literal=url="postgresql://user:pass@postgres:5432/djunion" \
  --namespace=djunion

# Create Redis secret
kubectl create secret generic djunion-redis \
  --from-literal=url="redis://:pass@redis:6379" \
  --namespace=djunion

# Create JWT keys
kubectl create secret generic djunion-jwt \
  --from-file=private-key=./keys/jwt_private.pem \
  --from-file=public-key=./keys/jwt_public.pem \
  --namespace=djunion
```

### 3. Deploy PostgreSQL (StatefulSet)

```yaml
# k8s/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: djunion
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14-alpine
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_DB
          value: "djunion"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: djunion-db
              key: password
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: "standard"
      resources:
        requests:
          storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: djunion
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

### 4. Deploy Redis

```yaml
# k8s/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: djunion
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6-alpine
        ports:
        - containerPort: 6379
        command:
        - redis-server
        - --requirepass
        - $(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: djunion-redis
              key: password
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: djunion
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

### 5. Deploy Analytics Service

```yaml
# k8s/analytics-deployment.yaml
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
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: analytics-service
        image: djunion/analytics-service:1.0.0
        ports:
        - containerPort: 3001
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: djunion-db
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: djunion-redis
              key: url
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
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
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
  - port: 80
    targetPort: 3001
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: analytics-service-hpa
  namespace: djunion
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: analytics-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 6. Deploy Monitoring Stack

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values monitoring/prometheus/values.yaml

# Install Loki
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --values monitoring/loki/values.yaml
```

### 7. Apply All Resources

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/analytics-deployment.yaml

# Verify deployments
kubectl get pods -n djunion
kubectl get services -n djunion

# Check logs
kubectl logs -f deployment/analytics-service -n djunion
```

---

## Monitoring Stack Setup

### 1. Access Grafana

```bash
# Port forward Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Get admin password
kubectl get secret -n monitoring prometheus-grafana \
  -o jsonpath="{.data.admin-password}" | base64 --decode

# Open browser: http://localhost:3000
# Login: admin / <password>
```

### 2. Import Dashboards

```bash
# Import via Grafana UI
# - Go to Dashboards > Import
# - Upload JSON files from monitoring/grafana/dashboards/

# Or use API
curl -X POST http://localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <api_key>" \
  -d @monitoring/grafana/dashboards/api-performance.json
```

### 3. Configure Alerts

```bash
# AlertManager is automatically configured via Helm chart
# Verify it's running
kubectl get pods -n monitoring -l app.kubernetes.io/name=alertmanager

# View AlertManager UI
kubectl port-forward -n monitoring svc/prometheus-alertmanager 9093:9093
# Open: http://localhost:9093
```

---

## Database Migrations

### 1. Run Initial Migration

```bash
# From analytics-service directory
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

### 2. Create Custom Migration

```bash
# Generate migration
npx prisma migrate dev --name add_analytics_tables

# Apply to production
npx prisma migrate deploy
```

### 3. Seed Data (Optional)

```bash
# Run seed script
npx prisma db seed

# Or manually execute SQL
psql $DATABASE_URL -f scripts/seed_analytics.sql
```

---

## Configuration Management

### 1. ConfigMap for Analytics Service

```yaml
# k8s/analytics-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: analytics-config
  namespace: djunion
data:
  LOG_LEVEL: "info"
  ENABLE_REALTIME_ANALYTICS: "true"
  ENABLE_ML_FEATURES: "false"
  CRON_DAILY_AGGREGATION: "0 0 * * *"
  PROMETHEUS_URL: "http://prometheus-server.monitoring:9090"
```

### 2. Apply ConfigMap

```bash
kubectl apply -f k8s/analytics-configmap.yaml

# Mount in deployment
# Add to analytics-deployment.yaml:
# envFrom:
# - configMapRef:
#     name: analytics-config
```

---

## Testing & Validation

### 1. Unit Tests

```bash
cd backend/analytics-service

# Run tests
npm test

# Run with coverage
npm run test:cov

# Expected coverage: >80%
```

### 2. Integration Tests

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration

# Cleanup
docker-compose -f docker-compose.test.yml down
```

### 3. Load Testing

```bash
# Install k6
brew install k6  # macOS
# or
wget https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz

# Run load test
k6 run tests/load/analytics-endpoints.js

# Expected results:
# - P95 latency < 500ms
# - Error rate < 1%
# - Throughput > 1000 req/s
```

### 4. Smoke Tests (Production)

```bash
# Health check
curl https://api.djunion.com/v1/health

# Metrics endpoint
curl https://api.djunion.com/metrics

# Sample analytics query
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.djunion.com/v1/analytics/streams/$STREAM_ID?from=2025-10-01&to=2025-10-12"
```

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Secrets properly stored (AWS Secrets Manager / Vault)
- [ ] SSL/TLS certificates provisioned
- [ ] Monitoring stack deployed
- [ ] Alerting rules configured
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented

### Deployment

- [ ] Deploy to staging environment first
- [ ] Run smoke tests
- [ ] Verify metrics collection
- [ ] Test alerting rules
- [ ] Deploy to production with blue-green strategy
- [ ] Monitor error rates and latency
- [ ] Verify data collection pipeline

### Post-Deployment

- [ ] Monitor dashboards for 24 hours
- [ ] Verify daily aggregation job runs
- [ ] Check log aggregation in Loki
- [ ] Test failover scenarios
- [ ] Document any issues
- [ ] Update runbooks

---

## Troubleshooting

### Common Issues

#### 1. Analytics Service Not Starting

```bash
# Check pod status
kubectl describe pod -n djunion <pod-name>

# Check logs
kubectl logs -n djunion <pod-name>

# Common causes:
# - Database connection failed
# - Redis connection failed
# - Missing environment variables
```

#### 2. Metrics Not Appearing in Prometheus

```bash
# Verify service discovery
kubectl get servicemonitors -n djunion

# Check Prometheus targets
# Open Prometheus UI: Status > Targets
kubectl port-forward -n monitoring svc/prometheus-server 9090:80

# Verify metrics endpoint
curl http://<analytics-service-ip>:3001/metrics
```

#### 3. Grafana Dashboard Empty

```bash
# Check Prometheus data source
# Grafana > Configuration > Data Sources

# Verify queries in Prometheus
# Prometheus UI > Graph > Execute query

# Check time range in Grafana dashboard
```

#### 4. Daily Aggregation Not Running

```bash
# Check CronJob status
kubectl get cronjobs -n djunion

# View CronJob logs
kubectl logs -n djunion job/<cron-job-name>

# Manually trigger job
kubectl create job -n djunion manual-aggregation --from=cronjob/daily-aggregation
```

#### 5. High Memory Usage

```bash
# Check memory metrics
kubectl top pods -n djunion

# Analyze heap dump (if enabled)
kubectl exec -n djunion <pod-name> -- node --expose-gc --heap-prof

# Increase memory limits in deployment
# Update resources.limits.memory in k8s manifest
```

---

## Support & Documentation

- **Internal Wiki**: https://wiki.djunion.com/analytics
- **Runbooks**: https://runbooks.djunion.com
- **Slack Channel**: #analytics-ops
- **On-Call**: PagerDuty rotation

---

**Document Version:** 1.0
**Last Updated:** October 12, 2025
**Maintained By:** ML/Data Engineering Ops Team
