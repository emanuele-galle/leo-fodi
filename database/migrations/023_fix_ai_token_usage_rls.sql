-- Fix RLS policy for ai_token_usage table
-- Allow authenticated users to insert token usage logs
-- Created: 2025-10-30

-- Drop old policy that only allowed service_role
DROP POLICY IF EXISTS "Only service can insert token usage" ON ai_token_usage;

-- Create new policy that allows authenticated users to insert
CREATE POLICY "Authenticated users can insert token usage"
  ON ai_token_usage FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow service_role (for backward compatibility)
CREATE POLICY "Service role can insert token usage"
  ON ai_token_usage FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON POLICY "Authenticated users can insert token usage" ON ai_token_usage IS 'Allow authenticated users to log AI token usage';
COMMENT ON POLICY "Service role can insert token usage" ON ai_token_usage IS 'Allow service role to log AI token usage (backward compatibility)';
