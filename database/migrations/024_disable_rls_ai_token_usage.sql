-- Disable RLS on ai_token_usage table
-- This table contains only analytics/metrics data, no sensitive user information
-- All authenticated users should be able to insert and view token usage logs
-- Created: 2025-10-30

-- Disable Row Level Security
ALTER TABLE ai_token_usage DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (no longer needed without RLS)
DROP POLICY IF EXISTS "Users can view ai token usage" ON ai_token_usage;
DROP POLICY IF EXISTS "Authenticated users can insert token usage" ON ai_token_usage;
DROP POLICY IF EXISTS "Service role can insert token usage" ON ai_token_usage;
DROP POLICY IF EXISTS "allow_all_ai_token_usage" ON ai_token_usage;

-- Add comment explaining why RLS is disabled
COMMENT ON TABLE ai_token_usage IS 'AI token usage tracking table. RLS disabled because this contains only analytics/metrics data shared across all users, no sensitive information.';
