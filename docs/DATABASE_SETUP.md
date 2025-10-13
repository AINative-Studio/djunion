# DJ Union - Database Setup Guide

**Version:** 1.0
**Date:** October 12, 2025
**Target Audience:** Backend Engineers, DevOps

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Database Schema](#database-schema)
5. [Migrations](#migrations)
6. [Seeding Data](#seeding-data)
7. [Environment Configuration](#environment-configuration)
8. [Common Operations](#common-operations)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option 1: Docker (Recommended for Development)

```bash
# Start PostgreSQL, Redis, and MinIO
npm run docker:up

# Initialize database
npm run db:init

# Open Prisma Studio (Database GUI)
npm run db:studio
```

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Set environment variables
export DB_USER=djunion
export DB_PASSWORD=dev_password
export DB_NAME=djunion_dev

# Initialize database
npm run db:init
```

---

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: 14.x or higher
- **Docker** (optional): For containerized development

### Install Dependencies

```bash
npm install
```

This installs:
- `@prisma/client` - Prisma ORM client
- `prisma` - Prisma CLI
- `bcrypt` - Password hashing for seed data
- `tsx` - TypeScript execution for seed script

---

## Local Development Setup

### Step 1: Start Infrastructure

**Option A: Docker Compose (Easiest)**

```bash
# Start all services
npm run docker:up

# Verify services are running
docker ps

# Expected output:
# djunion-postgres    (port 5432)
# djunion-redis       (port 6379)
# djunion-minio       (ports 9000, 9001)
# djunion-adminer     (port 8080)
```

**Option B: Local PostgreSQL**

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14
sudo systemctl start postgresql

# Create user
psql postgres -c "CREATE USER djunion WITH PASSWORD 'dev_password' CREATEDB;"
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Minimum Required Variables:**

```bash
DATABASE_URL="postgresql://djunion:dev_password@localhost:5432/djunion_dev"
DIRECT_DATABASE_URL="postgresql://djunion:dev_password@localhost:5432/djunion_dev"
```

### Step 3: Initialize Database

```bash
# Run initialization script
npm run db:init
```

This script will:
1. ✓ Check prerequisites (psql, node, npm)
2. ✓ Test database connection
3. ✓ Create database (if not exists)
4. ✓ Enable PostgreSQL extensions (uuid-ossp, pg_trgm)
5. ✓ Run Prisma migrations
6. ✓ Generate Prisma client
7. ✓ Seed development data
8. ✓ Verify schema (14 tables)

**Expected Output:**

```
════════════════════════════════════════════════════════════════
  DJ Union Database Initialization Complete
════════════════════════════════════════════════════════════════

  Database:     djunion_dev
  Host:         localhost:5432
  User:         djunion
  Environment:  development

Connection String:
  postgresql://djunion:dev_password@localhost:5432/djunion_dev

Test Accounts (Development):
  Admin: admin@djunion.com / AdminPass123!
  DJ:    dj@djunion.com / DJPass123!

Next Steps:
  1. Configure .env file with DATABASE_URL
  2. Start the API server: npm run dev
  3. Access API docs: http://localhost:3000/docs

════════════════════════════════════════════════════════════════
```

### Step 4: Verify Setup

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Navigate to http://localhost:5555
```

You should see:
- 3 users (1 admin, 2 DJs)
- 2 streams
- 3 uploads
- 2 playlists
- 2 podcasts
- Sample analytics data

---

## Database Schema

### Overview

DJ Union uses **14 database tables** organized into logical domains:

```
┌─────────────────────────────────────────────────────────────┐
│                     Database Schema                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AUTHENTICATION                                             │
│  ├─ users                  (DJs and admins)                 │
│  ├─ refresh_tokens         (JWT refresh tokens)            │
│  └─ password_resets        (Password reset tokens)         │
│                                                             │
│  LIVE STREAMING                                             │
│  ├─ streams                (Shoutcast sources)              │
│  └─ streams_ads            (Ad markers)                     │
│                                                             │
│  FILE UPLOADS                                               │
│  ├─ uploads                (MP3 files)                      │
│  └─ hls_segments           (Transcoded HLS segments)        │
│                                                             │
│  ON-DEMAND CONTENT                                          │
│  ├─ playlists              (On-demand playlists)            │
│  └─ tracks                 (Playlist tracks)                │
│                                                             │
│  PODCASTS                                                   │
│  ├─ podcasts               (Podcast series)                 │
│  ├─ episodes               (Podcast episodes)               │
│  └─ domains                (Custom domains)                 │
│                                                             │
│  MONETIZATION                                               │
│  ├─ monetization_plans     (Subscription tiers)             │
│  └─ subscriptions          (User subscriptions)            │
│                                                             │
│  ANALYTICS                                                  │
│  └─ analytics              (Time-series metrics)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

**1. UUID Primary Keys**
- All tables use `gen_random_uuid()` for IDs
- Better distribution, security, and cross-database merging

**2. Soft Deletes**
- Most tables have `deleted_at` timestamp
- Enables GDPR compliance (30-day recovery window)
- Actual deletion happens via background job

**3. Timestamps**
- `created_at`: Record creation time
- `updated_at`: Last modification time (auto-updated)
- `deleted_at`: Soft delete marker

**4. Enums**
- Type-safe status fields (e.g., `UserRole`, `UploadStatus`)
- Enforced at database level with CHECK constraints

**5. Indexes**
- Foreign keys are auto-indexed
- Additional indexes on frequently queried fields
- Composite indexes for common query patterns

### Table Sizes (Estimated)

```
users              ~1,000 rows       (1 MB)
streams            ~500 rows         (500 KB)
uploads            ~10,000 rows      (10 MB)
hls_segments       ~1,000,000 rows   (100 MB)
playlists          ~5,000 rows       (5 MB)
tracks             ~50,000 rows      (50 MB)
podcasts           ~1,000 rows       (1 MB)
episodes           ~10,000 rows      (10 MB)
analytics          ~500,000 rows     (500 MB)
subscriptions      ~2,000 rows       (2 MB)
```

**Total Database Size (Production):** ~1 GB

---

## Migrations

### Creating New Migrations

```bash
# Development mode (creates migration files)
npm run db:migrate

# Prisma will prompt for migration name
# Example: "add_user_avatar_field"
```

This generates:
```
prisma/migrations/
  └─ 20251012_add_user_avatar_field/
     └─ migration.sql
```

### Applying Migrations

**Development:**
```bash
npm run db:migrate
```

**Production:**
```bash
npm run db:migrate:deploy
```

### Migration Workflow

```mermaid
graph LR
    A[Update schema.prisma] --> B[Run db:migrate]
    B --> C[Review migration.sql]
    C --> D[Test locally]
    D --> E[Commit to git]
    E --> F[Deploy to staging]
    F --> G[Run db:migrate:deploy]
    G --> H[Verify in staging]
    H --> I[Deploy to production]
```

### Common Migration Patterns

**1. Adding a Column:**

```prisma
model User {
  // ... existing fields
  avatarUrl String? @map("avatar_url") @db.Text
}
```

Generated SQL:
```sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
```

**2. Adding an Index:**

```prisma
@@index([email, deletedAt])
```

Generated SQL:
```sql
CREATE INDEX idx_users_email_deleted_at ON users(email, deleted_at);
```

**3. Changing a Column (Non-Breaking):**

```prisma
model Stream {
  description String? @db.Text  // Changed from VarChar(1000)
}
```

**4. Adding a Relation:**

```prisma
model User {
  notifications Notification[]
}

model Notification {
  userId String @map("user_id") @db.Uuid
  user   User   @relation(fields: [userId], references: [userId])
}
```

### Migration Best Practices

1. **Always review generated SQL before applying**
2. **Test migrations in development first**
3. **Use transactions for multiple changes**
4. **Backup production before major migrations**
5. **Plan for zero-downtime deployments**

### Rolling Back Migrations

Prisma doesn't support automatic rollback. Manual steps:

```bash
# 1. Identify migration to rollback
ls prisma/migrations/

# 2. Manually reverse the SQL changes
psql djunion_production < rollback.sql

# 3. Delete migration directory
rm -rf prisma/migrations/20251012_problematic_migration/

# 4. Reset Prisma migration state
npx prisma migrate resolve --rolled-back 20251012_problematic_migration
```

---

## Seeding Data

### Default Seed Data

The `prisma/seed.ts` script creates:

**Users:**
- `admin@djunion.com` (admin role)
- `dj@djunion.com` (DJ role)
- `techno.dj@djunion.com` (DJ role)

**Live Streams:**
- Live House Mix (public, monetized)
- Underground Techno (public, free)

**Uploads:**
- 2 ready uploads with HLS segments
- 1 processing upload

**Playlists:**
- Chill House Collection (3 tracks)
- Techno Classics (mixed upload + external)

**Podcasts:**
- DJ Union Podcast (2 episodes)
- Techno Talk (custom domain)

**Analytics:**
- 7 days of listener/play/download metrics

### Running Seed Script

```bash
# Seed database
npm run db:seed

# Or as part of initialization
npm run db:init  # Includes seeding
```

### Custom Seed Data

Edit `prisma/seed.ts` to add your own test data:

```typescript
// Example: Add more users
const dj3 = await prisma.user.create({
  data: {
    email: 'house.dj@djunion.com',
    passwordHash: await bcrypt.hash('DJPass123!', 12),
    name: 'House DJ',
    role: 'dj',
  },
});
```

---

## Environment Configuration

### Required Variables

```bash
# Database connection (Prisma)
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"

# For migrations (bypasses connection pooling)
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

### Production Configuration

```bash
# Use connection pooling with PgBouncer
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/djunion?pgbouncer=true&connection_limit=20"

# Direct connection for migrations
DIRECT_DATABASE_URL="postgresql://user:pass@postgres:5432/djunion"
```

### Environment-Specific Databases

```bash
# Development
DATABASE_URL="postgresql://djunion:dev_password@localhost:5432/djunion_dev"

# Staging
DATABASE_URL="postgresql://djunion:staging_pass@staging-db.example.com:5432/djunion_staging"

# Production
DATABASE_URL="postgresql://djunion:prod_pass@prod-db.example.com:5432/djunion_production"
```

---

## Common Operations

### Reset Database (Development Only)

```bash
# WARNING: This deletes ALL data
npm run db:reset

# You will be prompted to confirm:
# "Are you sure you want to continue? (yes/NO):"
```

### Backup Database

```bash
# Create backup
npm run db:backup

# Output:
# /tmp/backups/djunion_20251012_143022.dump
```

### Restore Database

```bash
# Restore from backup file
pg_restore -d djunion_dev /tmp/backups/djunion_20251012_143022.dump
```

### Connect to Database

```bash
# Using psql
psql postgresql://djunion:dev_password@localhost:5432/djunion_dev

# Using Adminer (Docker)
open http://localhost:8080
```

### View Database Stats

```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Optimize Database

```bash
# Vacuum and analyze all tables
psql djunion_dev -c "VACUUM ANALYZE;"

# Reindex all tables
psql djunion_dev -c "REINDEX DATABASE djunion_dev;"
```

---

## Troubleshooting

### Issue: "Database does not exist"

**Solution:**
```bash
# Create database manually
psql postgres -c "CREATE DATABASE djunion_dev OWNER djunion;"

# Or run init script
npm run db:init
```

### Issue: "Connection refused"

**Cause:** PostgreSQL is not running

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps  # For Docker
brew services list  # For macOS Homebrew

# Start PostgreSQL
npm run docker:up  # Docker
brew services start postgresql@14  # macOS
```

### Issue: "Migration failed"

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# Mark failed migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Retry migration
npm run db:migrate
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
# Regenerate Prisma Client
npm run db:generate
```

### Issue: "Seed script fails"

**Common causes:**
- Database not initialized
- Conflicting data (email already exists)

**Solution:**
```bash
# Reset database and reseed
npm run db:reset
```

### Issue: "Permission denied on scripts"

**Solution:**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/14/)
- [Data Model Reference](./datamodel.md)
- [Data Pipeline Architecture](./data-pipeline-architecture.md)
- [Caching Strategy](./caching-strategy.md)

---

## Support

For database-related issues:
1. Check this guide's troubleshooting section
2. Review Prisma migration status: `npx prisma migrate status`
3. Check database logs: `npm run docker:logs` (Docker)
4. Contact backend team lead

---

**Last Updated:** October 12, 2025
**Maintainer:** Backend Engineering Team
