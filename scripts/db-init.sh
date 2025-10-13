#!/bin/bash

################################################################################
# DJ Union - Database Initialization Script
# Initializes PostgreSQL database with schema and seed data
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="${DB_NAME:-djunion_dev}"
DB_USER="${DB_USER:-djunion}"
DB_PASSWORD="${DB_PASSWORD:-dev_password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
ENVIRONMENT="${ENVIRONMENT:-development}"

################################################################################
# Helper Functions
################################################################################

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if PostgreSQL client is installed
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL client (psql) not found. Please install it first."
        exit 1
    fi

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install it first."
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install it first."
        exit 1
    fi

    log_success "All prerequisites satisfied"
}

check_database_connection() {
    log_info "Checking database connection..."

    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
        log_success "Database connection successful"
        return 0
    else
        log_error "Cannot connect to PostgreSQL server at $DB_HOST:$DB_PORT"
        return 1
    fi
}

create_database() {
    log_info "Creating database '$DB_NAME'..."

    # Check if database exists
    DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

    if [ "$DB_EXISTS" == "1" ]; then
        log_warning "Database '$DB_NAME' already exists"

        if [ "$ENVIRONMENT" == "development" ]; then
            read -p "Drop and recreate database? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log_info "Dropping database..."
                PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE $DB_NAME;"
                PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
                log_success "Database recreated"
            else
                log_info "Keeping existing database"
            fi
        fi
    else
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
        log_success "Database '$DB_NAME' created"
    fi
}

enable_extensions() {
    log_info "Enabling PostgreSQL extensions..."

    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<-EOSQL
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pg_trgm";
        CREATE EXTENSION IF NOT EXISTS "btree_gin";
EOSQL

    log_success "Extensions enabled"
}

run_migrations() {
    log_info "Running Prisma migrations..."

    # Set DATABASE_URL environment variable
    export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

    # Generate Prisma client
    npx prisma generate

    if [ "$ENVIRONMENT" == "development" ]; then
        # Run migrations in dev mode (creates migration files if needed)
        npx prisma migrate dev --name init
    else
        # Run migrations in production mode (only applies existing migrations)
        npx prisma migrate deploy
    fi

    log_success "Migrations completed"
}

seed_database() {
    if [ "$ENVIRONMENT" != "production" ]; then
        log_info "Seeding database with development data..."

        export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

        npx tsx prisma/seed.ts

        log_success "Database seeded"
    else
        log_warning "Skipping seed for production environment"
    fi
}

verify_schema() {
    log_info "Verifying database schema..."

    TABLES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'")

    if [ "$TABLES" -ge "14" ]; then
        log_success "Schema verification passed ($TABLES tables found)"
    else
        log_error "Schema verification failed (expected >= 14 tables, found $TABLES)"
        return 1
    fi
}

print_summary() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  DJ Union Database Initialization Complete"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  Database:     $DB_NAME"
    echo "  Host:         $DB_HOST:$DB_PORT"
    echo "  User:         $DB_USER"
    echo "  Environment:  $ENVIRONMENT"
    echo ""
    echo "Connection String:"
    echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo ""

    if [ "$ENVIRONMENT" != "production" ]; then
        echo "Test Accounts (Development):"
        echo "  Admin: admin@djunion.com / AdminPass123!"
        echo "  DJ:    dj@djunion.com / DJPass123!"
        echo ""
    fi

    echo "Next Steps:"
    echo "  1. Configure .env file with DATABASE_URL"
    echo "  2. Start the API server: npm run dev"
    echo "  3. Access API docs: http://localhost:3000/docs"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  DJ Union - Database Initialization"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    check_prerequisites

    if ! check_database_connection; then
        log_error "Please ensure PostgreSQL is running and credentials are correct"
        exit 1
    fi

    create_database
    enable_extensions
    run_migrations
    verify_schema
    seed_database

    print_summary
}

# Run main function
main
