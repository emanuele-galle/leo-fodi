-- Migration: Add raw_data_sc column to leads table
-- This column stores full API responses from ScrapeCreators temporarily during enrichment

-- Add raw_data_sc column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS raw_data_sc JSONB;

-- Add comment
COMMENT ON COLUMN leads.raw_data_sc IS 'Temporary storage for ScrapeCreators API responses (cleaned after enrichment)';

-- Add index for query performance
CREATE INDEX IF NOT EXISTS idx_leads_raw_data_sc ON leads USING GIN (raw_data_sc);
