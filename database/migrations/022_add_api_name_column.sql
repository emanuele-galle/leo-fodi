-- ============================================
-- Migration: Add api_name column to api_usage_logs
-- Purpose: Track API provider name for cost monitoring dashboard
-- ============================================

-- Check if table exists and add column if missing
DO $$
BEGIN
  -- Add api_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'api_usage_logs'
      AND column_name = 'api_name'
  ) THEN
    ALTER TABLE api_usage_logs
    ADD COLUMN api_name TEXT NOT NULL DEFAULT 'unknown';

    RAISE NOTICE 'Column api_name added to api_usage_logs';
  ELSE
    RAISE NOTICE 'Column api_name already exists in api_usage_logs';
  END IF;

  -- Create index for faster filtering by api_name
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'api_usage_logs'
      AND indexname = 'idx_api_usage_logs_api_name'
  ) THEN
    CREATE INDEX idx_api_usage_logs_api_name ON api_usage_logs(api_name);
    RAISE NOTICE 'Index idx_api_usage_logs_api_name created';
  ELSE
    RAISE NOTICE 'Index idx_api_usage_logs_api_name already exists';
  END IF;

  -- Create index for dashboard queries (api_name + created_at)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'api_usage_logs'
      AND indexname = 'idx_api_usage_logs_api_created'
  ) THEN
    CREATE INDEX idx_api_usage_logs_api_created
    ON api_usage_logs(api_name, created_at DESC);
    RAISE NOTICE 'Index idx_api_usage_logs_api_created created';
  ELSE
    RAISE NOTICE 'Index idx_api_usage_logs_api_created already exists';
  END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN api_usage_logs.api_name IS 'API provider name (google_places, xai, etc.) for cost tracking';
