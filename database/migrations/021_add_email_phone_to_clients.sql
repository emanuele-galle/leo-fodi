/**
 * Migration: Add email and phone to clients table
 * Description: Adds email and phone fields for web search enrichment
 * Created: 2025-01-29
 */

-- Add email column to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add phone column to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comments
COMMENT ON COLUMN clients.email IS 'Email del cliente per ricerca web pubblica (profili social, menzioni online)';
COMMENT ON COLUMN clients.phone IS 'Telefono del cliente per ricerca web pubblica (listing business, menzioni online)';

-- Create indexes for lookups (useful for deduplication and search)
CREATE INDEX IF NOT EXISTS idx_clients_email
ON clients(email)
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_phone
ON clients(phone)
WHERE phone IS NOT NULL;
