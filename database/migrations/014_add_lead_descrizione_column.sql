-- Migration: Add descrizione column to leads table
-- This column stores business description from various sources

-- Add descrizione column
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS descrizione TEXT;

-- Add comment
COMMENT ON COLUMN leads.descrizione IS 'Business description/bio from social profiles or business listings';
