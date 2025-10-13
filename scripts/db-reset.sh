#!/bin/bash

################################################################################
# DJ Union - Database Reset Script
# Drops and recreates database (DEVELOPMENT ONLY)
################################################################################

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DB_NAME="${DB_NAME:-djunion_dev}"
DB_USER="${DB_USER:-djunion}"
DB_PASSWORD="${DB_PASSWORD:-dev_password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
ENVIRONMENT="${ENVIRONMENT:-development}"

# Safety check
if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${RED}✗${NC} Cannot reset production database!"
    exit 1
fi

echo -e "${YELLOW}⚠${NC} This will PERMANENTLY DELETE all data in '$DB_NAME'"
read -p "Are you sure you want to continue? (yes/NO): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Reset cancelled"
    exit 0
fi

echo "Dropping database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "Running initialization..."
./scripts/db-init.sh

echo "Database reset complete!"
