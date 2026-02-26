# Migration 020: Add website_url to clients table

## Overview
Aggiunge il campo `website_url` alla tabella `clients` per abilitare l'analisi approfondita dei contenuti del sito web aziendale/personale tramite WebsiteContentAnalyzer + XAI.

## Changes
- Adds `website_url TEXT` column to `clients` table
- Creates index on `website_url` for lookups
- Adds column comment

## How to Apply

### Option 1: Supabase SQL Editor (Recommended)
1. Login to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy the content of `020_add_website_url_to_clients.sql`
5. Paste and click **Run**

### Option 2: Supabase CLI
```bash
# From project root
supabase db push --file database/migrations/020_add_website_url_to_clients.sql
```

## Verification

After applying the migration, verify with:

```sql
-- Check column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name = 'website_url';

-- Check index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'clients'
  AND indexname = 'idx_clients_website_url';
```

Expected output:
```
column_name  | data_type | is_nullable
website_url  | text      | YES

indexname                 | indexdef
idx_clients_website_url   | CREATE INDEX ... ON clients(website_url) WHERE website_url IS NOT NULL
```

## Rollback

If needed, rollback with:

```sql
-- Drop index
DROP INDEX IF EXISTS idx_clients_website_url;

-- Drop column
ALTER TABLE clients DROP COLUMN IF EXISTS website_url;
```

## Impact
- **Breaking**: No (column is nullable)
- **Data Loss**: No
- **Performance**: Minimal (index on nullable column)
- **Downtime**: None

## Related Changes
- ProfilingTarget type: Added `website_url?: string` field
- WebsiteContentAnalyzer: New class for deep content analysis with XAI
- DataGatheringCoordinator: Integrated website analysis
- UI Form: Added website_url input field

## Next Steps
After migration:
1. Test with real website URL (e.g., https://fodisrl.it)
2. Verify XAI analysis results in console logs
3. Check `website_analysis` field in RawOSINTData
