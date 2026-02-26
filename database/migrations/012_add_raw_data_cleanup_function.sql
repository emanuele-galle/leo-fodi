-- Migration: Add automatic cleanup function for raw_data_sc
-- Purpose: Clean up ScrapeCreators raw data from old leads to save database space
-- Date: 2025-01-24

-- ===== CLEANUP FUNCTION =====
-- This function removes raw_data_sc from leads older than 30 days
-- It's designed to be called by a cron job but can also be run manually

CREATE OR REPLACE FUNCTION fn_cleanup_lead_raw_data()
RETURNS TABLE(
  cleaned_count INTEGER,
  execution_time_ms INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  start_time TIMESTAMP;
  cleaned INTEGER;
BEGIN
  start_time := clock_timestamp();

  -- Update leads older than 30 days to remove raw_data_sc
  UPDATE leads
  SET
    raw_data_sc = NULL,
    updated_at = NOW()
  WHERE
    raw_data_sc IS NOT NULL
    AND created_at < (NOW() - INTERVAL '30 days');

  -- Get the number of rows updated
  GET DIAGNOSTICS cleaned = ROW_COUNT;

  -- Log the cleanup operation
  RAISE NOTICE 'Cleaned raw_data_sc from % leads (execution time: % ms)',
    cleaned,
    EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time)::INTEGER;

  -- Return results
  RETURN QUERY SELECT
    cleaned,
    EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time)::INTEGER;
END;
$$;

-- Add comment to document the function
COMMENT ON FUNCTION fn_cleanup_lead_raw_data() IS
  'Removes raw_data_sc JSONB field from leads older than 30 days to save database space. ' ||
  'Raw data is only needed temporarily during OSINT enrichment. ' ||
  'Designed to be called by scheduled cron job but can be run manually.';

-- ===== MANUAL TEST =====
-- To test this function manually, run:
-- SELECT * FROM fn_cleanup_lead_raw_data();

-- ===== GRANT PERMISSIONS =====
-- Ensure the function can be executed by service role
GRANT EXECUTE ON FUNCTION fn_cleanup_lead_raw_data() TO postgres, service_role;
