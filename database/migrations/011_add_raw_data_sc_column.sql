-- Migration: Add raw_data_sc column to leads table
-- Purpose: Store full ScrapeCreators API responses to avoid duplicate API calls
-- Date: 2025-01-24

-- Add raw_data_sc JSONB column to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS raw_data_sc JSONB;

-- Add index for better query performance on raw_data_sc
CREATE INDEX IF NOT EXISTS idx_leads_raw_data_sc_gin
ON leads USING GIN (raw_data_sc);

-- Add comment to document the column
COMMENT ON COLUMN leads.raw_data_sc IS 'Full JSON response from ScrapeCreators API (LinkedIn, Facebook, Instagram) - stored to avoid duplicate API calls during OSINT analysis';
