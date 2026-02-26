/**
 * Migration: Add website_url to clients table
 * Description: Adds website_url field for deep website content analysis
 * Created: 2025-01-29
 */

-- Add website_url column to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add comment
COMMENT ON COLUMN clients.website_url IS 'Website URL del cliente/azienda per analisi approfondita contenuti (opzionale)';

-- Create index for website_url lookups (useful for deduplication)
CREATE INDEX IF NOT EXISTS idx_clients_website_url
ON clients(website_url)
WHERE website_url IS NOT NULL;
