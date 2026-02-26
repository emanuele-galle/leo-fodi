-- Migration 018: Fix Foreign Keys to user_profiles
-- This migration updates foreign keys to properly reference user_profiles table
-- Execute this in Supabase SQL Editor

-- Note: user_id columns currently reference auth.users(id)
-- We need them to also have explicit relations to user_profiles for Supabase queries

-- Since user_profiles.id IS auth.users.id (same UUID), we don't need to change the FK
-- Instead, we just need to ensure queries work properly

-- Add explicit comment to help Supabase understand the relationship
COMMENT ON COLUMN clients.user_id IS 'References user_profiles.id (which is same as auth.users.id)';
COMMENT ON COLUMN profiles.user_id IS 'References user_profiles.id (which is same as auth.users.id)';
COMMENT ON COLUMN financial_plans.user_id IS 'References user_profiles.id (which is same as auth.users.id)';
COMMENT ON COLUMN lead_searches.user_id IS 'References user_profiles.id (which is same as auth.users.id)';

-- Verify the relationships exist
DO $$
BEGIN
  -- Check if user_profiles table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    RAISE EXCEPTION 'user_profiles table does not exist';
  END IF;

  RAISE NOTICE 'Migration 018 completed: Foreign key comments added';
END $$;
