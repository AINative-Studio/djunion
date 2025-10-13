# DJ Union Deployment Guide

**Version:** 1.0.0
**Last Updated:** October 12, 2025
**Target Audience:** DevOps Engineers, Platform Engineers

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Docker Configuration](#docker-configuration)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring and Observability](#monitoring-and-observability)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Overview

The DJ Union platform is a containerized microservices architecture deployed on Kubernetes. This guide covers the complete deployment lifecycle from local development to production environments.

### Architecture Components

- **API Server**: NestJS REST API (Port 3000)
- **Relay Workers**: Shoutcast/Icecast stream processors (dynamic pods)
- **Transcoder Workers**: FFmpeg-based audio processing (Kubernetes Jobs)
- **PostgreSQL**: Primary database (version 14+)
- **Redis**: Cache and job queue (version 7+)
- **MinIO/S3**: Object storage for audio files and HLS segments
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Loki**: Log aggregation

---

## Prerequisites

### Required Tools

```bash
# Development machine requirements
- Docker Desktop (v24.0+)
- kubectl (v1.28+)
- Helm (v3.13+)
- Node.js (v18 LTS)
- Git
- AWS CLI (for S3 operations)
```

### Cloud Infrastructure

**Staging Environment:**
- Kubernetes cluster: 3 nodes (t3.medium)
- PostgreSQL: RDS db.t3.medium (20GB)
- Redis: ElastiCache cache.t3.micro
- S3 bucket: djunion-staging

**Production Environment:**
- Kubernetes cluster: 5+ nodes (t3.large)
- PostgreSQL: RDS db.t3.large (100GB) with read replica
- Redis: ElastiCache cache.t3.small with replication
- S3 bucket: djunion-production with lifecycle policies
- CloudFront CDN for HLS delivery

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/AINative-Studio/djunion.git
cd djunion
```

### 2. Start Infrastructure Services

```bash
cd backend

# Start PostgreSQL, Redis, MinIO, Prometheus, Grafana, Loki
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check service health
docker-compose logs -f postgres redis minio
```

### 3. Configure Environment Variables

```bash
# Create .env file in backend directory
cat > .env << EOF
# Database
DATABASE_URL="postgresql://djunion:dev_password@localhost:5432/djunion_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Keys (generate with script below)
JWT_PRIVATE_KEY_PATH="./keys/jwt_private.pem"
JWT_PUBLIC_KEY_PATH="./keys/jwt_public.pem"

# S3/MinIO
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin123"
S3_BUCKET="djunion-dev"
S3_REGION="us-east-1"
S3_FORCE_PATH_STYLE="true"

# Application
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="debug"
CORS_ORIGINS="http://localhost:3002,http://localhost:3003"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX_REQUESTS="100"

# Upload Limits
UPLOAD_MAX_SIZE_BYTES="104857600"  # 100MB
EOF
```

### 4. Generate JWT Keys

```bash
mkdir -p keys

# Generate RSA private key (4096 bits)
openssl genrsa -out keys/jwt_private.pem 4096

# Extract public key
openssl rsa -in keys/jwt_private.pem -pubout -out keys/jwt_public.pem

# Secure the private key
chmod 600 keys/jwt_private.pem
```

### 5. Initialize Database

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run seed
```

### 6. Start Development Server

```bash
# API server with hot-reload
npm run start:dev

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

### 7. Access Local Services

| Service | URL | Credentials |
|---------|-----|-------------|
| API Server | http://localhost:3000 | N/A |
| API Docs | http://localhost:3000/docs | N/A |
| PostgreSQL | localhost:5432 | djunion / dev_password |
| Redis | localhost:6379 | No password |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin123 |
| Prometheus | http://localhost:9090 | N/A |
| Grafana | http://localhost:3001 | admin / admin123 |

---

## Docker Configuration

### Building Images Locally

```bash
# Build API image
docker build -t djunion/api:local -f Dockerfile.api .

# Build Relay Worker image
docker build -t djunion/relay-worker:local -f Dockerfile.relay .

# Build Transcoder image
docker build -t djunion/transcoder:local -f Dockerfile.transcoder .

# Verify images
docker images | grep djunion
```

### Multi-Architecture Builds

```bash
# Set up Docker Buildx
docker buildx create --name djunion-builder --use
docker buildx inspect --bootstrap

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t djunion/api:1.0.0 \
  -f Dockerfile.api \
  --push \
  .
```

### Image Security Scanning

```bash
# Scan for vulnerabilities with Trivy
trivy image djunion/api:latest

# Scan with specific severity
trivy image --severity HIGH,CRITICAL djunion/api:latest

# Generate SBOM (Software Bill of Materials)
trivy image --format cyclonedx --output sbom.json djunion/api:latest
```

### Docker Compose Profiles

```bash
# Start only infrastructure (default)
docker-compose up -d

# Start with API server
docker-compose --profile full up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: data loss)
docker-compose down -v
```

---

## Kubernetes Deployment

### 1. Configure kubectl Context

```bash
# For staging
kubectl config use-context staging-cluster

# For production
kubectl config use-context production-cluster

# Verify context
kubectl config current-context
```

### 2. Create Namespaces

```bash
# Staging namespace
kubectl create namespace audio-api-staging

# Production namespace
kubectl create namespace audio-api-production

# Verify
kubectl get namespaces
```

### 3. Create Secrets

```bash
# Generate base64-encoded secrets
echo -n "postgresql://user:pass@host:5432/db" | base64

# Create secrets file (DO NOT COMMIT)
cat > staging-secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: djunion-secrets
  namespace: audio-api-staging
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  jwt-private-key: <base64-encoded-jwt-private-key>
  jwt-public-key: <base64-encoded-jwt-public-key>
  redis-url: <base64-encoded-redis-url>
  s3-access-key: <base64-encoded-s3-access-key>
  s3-secret-key: <base64-encoded-s3-secret-key>
EOF

# Apply secrets
kubectl apply -f staging-secrets.yaml

# Verify (should show 6 items)
kubectl get secret djunion-secrets -n audio-api-staging
```

### 4. Deploy API Server with Helm

```bash
# Add custom values for staging
cat > values-staging.yaml << EOF
environment: staging

image:
  repository: ghcr.io/ainative-studio/djunion/api
  tag: "develop-abc123"

replicaCount: 2

resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

secrets:
  database:
    url: "postgresql://user:pass@staging-db:5432/djunion_staging"
  jwt:
    privateKey: "<jwt-private-key>"
    publicKey: "<jwt-public-key>"
  redis:
    url: "redis://staging-redis:6379"
  s3:
    endpoint: "https://s3.amazonaws.com"
    accessKey: "<access-key>"
    secretKey: "<secret-key>"
    bucket: "djunion-staging"

config:
  corsOrigins: "https://staging.djunion.com"
EOF

# Install/upgrade API
helm upgrade --install djunion-api ./helm/api \
  --namespace audio-api-staging \
  --values values-staging.yaml \
  --wait \
  --timeout 5m

# Verify deployment
kubectl rollout status deployment/djunion-api -n audio-api-staging
kubectl get pods -n audio-api-staging
```

### 5. Deploy Relay Worker (Per Stream)

```bash
# Deploy relay worker for a specific stream
helm upgrade --install djunion-relay-stream-abc123 ./helm/relay-worker \
  --namespace audio-api-staging \
  --set stream.id="abc123" \
  --set stream.shoutcastUrl="http://stream.example.com:8000" \
  --set stream.mount="/live" \
  --set stream.streamKey="secret_key" \
  --set s3.endpoint="https://s3.amazonaws.com" \
  --set s3.accessKey="<access-key>" \
  --set s3.secretKey="<secret-key>" \
  --set redis.url="redis://staging-redis:6379" \
  --wait

# Verify relay worker
kubectl get pods -n audio-api-staging -l stream-id=abc123
kubectl logs -f -n audio-api-staging -l stream-id=abc123
```

### 6. Verify Deployment Health

```bash
# Check pod status
kubectl get pods -n audio-api-staging

# Check service endpoints
kubectl get svc -n audio-api-staging

# Check ingress
kubectl get ingress -n audio-api-staging

# View pod logs
kubectl logs -f deployment/djunion-api -n audio-api-staging

# Execute commands in pod
kubectl exec -it deployment/djunion-api -n audio-api-staging -- sh

# Port-forward for local testing
kubectl port-forward svc/djunion-api 3000:80 -n audio-api-staging
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml` and includes:

1. **Lint**: ESLint, Prettier, TypeScript checks
2. **Test**: Unit and integration tests with PostgreSQL and Redis
3. **Security**: Trivy vulnerability scanning, npm audit
4. **Build**: Docker image builds for API, Relay, Transcoder
5. **Deploy Staging**: Automatic deployment on `develop` branch
6. **Deploy Production**: Manual approval on `main` branch

### Required GitHub Secrets

Configure these secrets in GitHub Settings > Secrets and variables > Actions:

**Container Registry:**
- `GITHUB_TOKEN` (automatically provided)

**Staging Environment:**
- `KUBE_CONFIG_STAGING` (base64-encoded kubeconfig)
- `STAGING_DATABASE_URL`
- `STAGING_JWT_PRIVATE_KEY`
- `STAGING_JWT_PUBLIC_KEY`
- `STAGING_REDIS_URL`
- `STAGING_S3_ENDPOINT`
- `STAGING_S3_ACCESS_KEY`
- `STAGING_S3_SECRET_KEY`

**Production Environment:**
- `KUBE_CONFIG_PRODUCTION`
- `PRODUCTION_DATABASE_URL`
- `PRODUCTION_JWT_PRIVATE_KEY`
- `PRODUCTION_JWT_PUBLIC_KEY`
- `PRODUCTION_REDIS_URL`
- `PRODUCTION_S3_ENDPOINT`
- `PRODUCTION_S3_ACCESS_KEY`
- `PRODUCTION_S3_SECRET_KEY`

**Notifications:**
- `SLACK_WEBHOOK_URL` (for deployment notifications)
- `CODECOV_TOKEN` (for code coverage reports)

### Manual Deployment

```bash
# Trigger workflow manually
gh workflow run ci-cd.yml --ref main

# Monitor workflow
gh run list --workflow=ci-cd.yml

# View workflow logs
gh run view <run-id> --log
```

### Deployment Approval

Production deployments require manual approval in GitHub:

1. Navigate to Actions tab
2. Select the workflow run
3. Click "Review deployments"
4. Approve "production" environment

---

## Monitoring and Observability

### Prometheus Metrics

**Key Metrics Exposed:**
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency histogram
- `process_cpu_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_heap_size_total_bytes` - Heap size
- `active_streams_count` - Number of active relay workers
- `db_query_duration_seconds` - Database query latency

**Query Examples:**

```promql
# Request rate per minute
rate(http_requests_total[5m])

# P95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate (4xx/5xx)
rate(http_requests_total{status_code=~"4..|5.."}[5m])

# Memory usage per pod
process_resident_memory_bytes / 1024 / 1024
```

### Grafana Dashboards

**Pre-configured Dashboards:**

1. **API Overview** - Request rate, latency, errors
2. **System Resources** - CPU, memory, disk usage
3. **Database Metrics** - Connections, query performance
4. **Stream Health** - Active streams, listener counts
5. **Business Metrics** - User registrations, uploads

**Access:**
- Staging: https://grafana.staging.djunion.com
- Production: https://grafana.djunion.com

### Log Aggregation (Loki)

```bash
# Query logs via LogCLI
logcli query '{app="djunion-api", level="error"}' --limit=50

# Stream logs in real-time
logcli query --tail '{app="djunion-api"}'

# Filter by namespace
kubectl logs -f -n audio-api-staging -l app=djunion-api
```

### Health Check Endpoints

```bash
# Health check (returns 200 OK if healthy)
curl https://api.djunion.com/v1/health

# Response format:
{
  "status": "ok",
  "timestamp": "2025-10-12T10:30:00.000Z",
  "uptime": 86400,
  "database": "connected",
  "redis": "connected"
}

# Readiness check
curl https://api.djunion.com/v1/health/ready

# Liveness check
curl https://api.djunion.com/v1/health/live
```

---

## Security Considerations

### Secret Management

**Best Practices:**
1. Never commit secrets to version control
2. Use Kubernetes Secrets or external secret managers (AWS Secrets Manager, HashiCorp Vault)
3. Rotate secrets regularly (every 90 days)
4. Use separate credentials for staging and production
5. Audit secret access with CloudTrail/audit logs

### Network Security

**Kubernetes Network Policies:**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: audio-api-production
spec:
  podSelector:
    matchLabels:
      app: djunion-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### Container Security

**Image Hardening:**
- Use minimal base images (alpine)
- Run as non-root user (UID 1001)
- Drop all capabilities
- Read-only root filesystem where possible
- Regular vulnerability scanning with Trivy

### TLS/SSL Certificates

**cert-manager Configuration:**

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat > letsencrypt-prod.yaml << EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: devops@djunion.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

kubectl apply -f letsencrypt-prod.yaml
```

---

## Troubleshooting

### Common Issues

#### 1. Pod CrashLoopBackOff

```bash
# Check pod logs
kubectl logs <pod-name> -n audio-api-staging

# Describe pod for events
kubectl describe pod <pod-name> -n audio-api-staging

# Common causes:
# - Missing environment variables
# - Database connection failure
# - Out of memory
# - Application crash on startup
```

#### 2. Database Connection Issues

```bash
# Test database connectivity from pod
kubectl exec -it <pod-name> -n audio-api-staging -- sh
apk add postgresql-client
psql $DATABASE_URL

# Check database credentials in secret
kubectl get secret djunion-secrets -n audio-api-staging -o yaml

# Verify database endpoint is reachable
kubectl exec -it <pod-name> -n audio-api-staging -- wget -O- telnet://<db-host>:5432
```

#### 3. Image Pull Errors

```bash
# Check image pull secrets
kubectl get secret -n audio-api-staging | grep regcred

# Verify image exists in registry
docker pull ghcr.io/ainative-studio/djunion/api:latest

# Create image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=<username> \
  --docker-password=<token> \
  -n audio-api-staging
```

#### 4. Ingress Not Working

```bash
# Check ingress status
kubectl get ingress -n audio-api-staging

# Describe ingress for events
kubectl describe ingress djunion-api -n audio-api-staging

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Verify DNS resolution
nslookup api.staging.djunion.com
```

#### 5. High Memory Usage

```bash
# Check pod resource usage
kubectl top pods -n audio-api-staging

# Increase memory limits in values.yaml
resources:
  limits:
    memory: 1Gi

# Restart pods
kubectl rollout restart deployment/djunion-api -n audio-api-staging
```

---

## Rollback Procedures

### Rollback Helm Deployment

```bash
# View deployment history
helm history djunion-api -n audio-api-staging

# Rollback to previous revision
helm rollback djunion-api -n audio-api-staging

# Rollback to specific revision
helm rollback djunion-api 3 -n audio-api-staging

# Verify rollback
kubectl get pods -n audio-api-staging
kubectl rollout status deployment/djunion-api -n audio-api-staging
```

### Rollback Kubernetes Deployment

```bash
# View deployment history
kubectl rollout history deployment/djunion-api -n audio-api-staging

# Rollback to previous version
kubectl rollout undo deployment/djunion-api -n audio-api-staging

# Rollback to specific revision
kubectl rollout undo deployment/djunion-api --to-revision=2 -n audio-api-staging

# Verify rollback status
kubectl rollout status deployment/djunion-api -n audio-api-staging
```

### Emergency Procedures

**Complete Outage:**

```bash
# 1. Scale down to zero
kubectl scale deployment/djunion-api --replicas=0 -n audio-api-production

# 2. Investigate root cause
kubectl logs -n audio-api-production -l app=djunion-api --previous

# 3. Apply fix or rollback
helm rollback djunion-api -n audio-api-production

# 4. Scale back up
kubectl scale deployment/djunion-api --replicas=3 -n audio-api-production

# 5. Monitor recovery
watch kubectl get pods -n audio-api-production
```

**Database Migration Failure:**

```bash
# 1. Connect to database
kubectl exec -it <api-pod> -n audio-api-production -- sh
npx prisma migrate resolve --rolled-back <migration-name>

# 2. Manually fix database state
psql $DATABASE_URL < rollback-script.sql

# 3. Mark migration as applied
npx prisma migrate resolve --applied <migration-name>

# 4. Restart pods
kubectl rollout restart deployment/djunion-api -n audio-api-production
```

---

## Appendix

### A. Resource Limits Reference

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-------------|-----------|----------------|--------------|
| API Server | 250m | 500m | 256Mi | 512Mi |
| Relay Worker | 100m | 500m | 128Mi | 256Mi |
| Transcoder | 500m | 2000m | 512Mi | 2Gi |

### B. Port Reference

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| API Server | 3000 | HTTP | REST API |
| Prometheus | 9090 | HTTP | Metrics UI |
| Grafana | 3001 | HTTP | Dashboard UI |
| PostgreSQL | 5432 | TCP | Database |
| Redis | 6379 | TCP | Cache |
| MinIO | 9000 | HTTP | S3 API |
| MinIO Console | 9001 | HTTP | MinIO UI |
| Loki | 3100 | HTTP | Logs API |

### C. Environment-Specific URLs

**Staging:**
- API: https://api.staging.djunion.com
- Grafana: https://grafana.staging.djunion.com
- MinIO: https://minio.staging.djunion.com

**Production:**
- API: https://api.djunion.com
- Grafana: https://grafana.djunion.com
- CDN: https://cdn.djunion.com

### D. Contact Information

**DevOps Team:**
- Email: devops@djunion.com
- Slack: #devops-alerts
- PagerDuty: 1-800-XXX-XXXX

**Escalation:**
1. On-call DevOps Engineer (immediate)
2. Lead DevOps Engineer (15 minutes)
3. Engineering Manager (30 minutes)
4. VP of Engineering (1 hour)

---

**Document Maintained By:** DevOps Team
**Review Cycle:** Quarterly
**Next Review Date:** January 12, 2026
