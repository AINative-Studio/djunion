#!/bin/bash

################################################################################
# DJ Union - Database Backup Script
# Creates compressed backup and uploads to S3
################################################################################

set -e

# Configuration
DB_NAME="${DB_NAME:-djunion_production}"
DB_USER="${DB_USER:-djunion}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"
S3_BUCKET="${S3_BUCKET:-djunion-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/djunion_$TIMESTAMP.dump"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}ℹ${NC} Starting database backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup: $BACKUP_FILE"
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -Fc \
    -Z 9 \
    -f $BACKUP_FILE \
    $DB_NAME

# Get backup size
BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo -e "${GREEN}✓${NC} Backup created: $BACKUP_SIZE"

# Upload to S3 (if configured)
if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
    echo "Uploading to S3..."
    aws s3 cp $BACKUP_FILE "s3://$S3_BUCKET/daily/$(basename $BACKUP_FILE)"
    echo -e "${GREEN}✓${NC} Uploaded to S3"
fi

# Clean up old backups
find $BACKUP_DIR -name "djunion_*.dump" -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✓${NC} Cleaned up backups older than $RETENTION_DAYS days"

echo ""
echo "Backup complete!"
echo "  File: $BACKUP_FILE"
echo "  Size: $BACKUP_SIZE"
