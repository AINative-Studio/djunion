-- DJ Union Database Initialization Script
-- This script runs on first database creation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create application user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'djunion') THEN
    CREATE USER djunion WITH PASSWORD 'dev_password';
  END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE djunion_dev TO djunion;

-- Create schema version table
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT
);

-- Insert initial version
INSERT INTO schema_version (version, description)
VALUES (0, 'Initial database setup')
ON CONFLICT (version) DO NOTHING;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'DJ Union database initialized successfully';
END
$$;
