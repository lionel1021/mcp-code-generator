-- =====================================================
-- Migration Tracking System
-- Ensures migrations run in order and are not duplicated
-- =====================================================

-- Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  checksum TEXT,
  execution_time_ms INTEGER
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at 
  ON schema_migrations(executed_at DESC);

-- Migration metadata
INSERT INTO schema_migrations (version, name, executed_at) 
VALUES ('000', 'migration_tracking', NOW())
ON CONFLICT (version) DO NOTHING;