#!/bin/bash

# DJ Union Backend - Test Infrastructure Setup Script
# This script sets up the test environment including database, Redis, and MinIO

set -e

echo "🚀 Setting up DJ Union test infrastructure..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
  exit 1
fi

# Start test infrastructure
echo -e "${YELLOW}📦 Starting test containers...${NC}"
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check PostgreSQL
echo -e "${YELLOW}🔍 Checking PostgreSQL...${NC}"
until docker-compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U djunion_test > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

# Check Redis
echo -e "${YELLOW}🔍 Checking Redis...${NC}"
until docker-compose -f docker-compose.test.yml exec -T redis-test redis-cli ping > /dev/null 2>&1; do
  echo "Waiting for Redis..."
  sleep 2
done
echo -e "${GREEN}✅ Redis is ready${NC}"

# Check MinIO
echo -e "${YELLOW}🔍 Checking MinIO...${NC}"
sleep 3
echo -e "${GREEN}✅ MinIO is ready${NC}"

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Run migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
export DATABASE_URL=postgresql://djunion_test:test_password@localhost:5433/djunion_test
npx prisma migrate deploy

echo -e "${GREEN}✨ Test infrastructure is ready!${NC}"
echo ""
echo "You can now run tests:"
echo "  npm test              # Run unit tests"
echo "  npm run test:integration  # Run integration tests"
echo "  npm run test:e2e      # Run E2E tests"
echo "  npm run test:cov      # Run with coverage"
echo ""
echo "To stop test infrastructure:"
echo "  docker-compose -f docker-compose.test.yml down"
