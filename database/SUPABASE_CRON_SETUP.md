# Supabase Cron Job Setup - raw_data_sc Cleanup

## Overview

This document explains how to set up the automatic cleanup of `raw_data_sc` data from old leads using Supabase's built-in cron job scheduler (`pg_cron`).

## Why Cleanup?

The `raw_data_sc` JSONB field stores complete API responses from ScrapeCreators (LinkedIn, Facebook, Instagram profiles). This data is:

- **Large**: Each profile can be 10-50KB
- **Temporary**: Only needed during OSINT enrichment
- **Expensive**: Wastes database storage if kept long-term

## Cleanup Strategy

We use a **two-tier approach**:

1. **Event-Driven Cleanup** (Primary): Immediate cleanup after enrichment in `extraction-worker.ts`
2. **Scheduled Cleanup** (Safety Net): Nightly cleanup of old leads (30+ days)

## Prerequisites

1. Ensure migration `012_add_raw_data_cleanup_function.sql` has been run
2. You have access to Supabase Dashboard
3. Your Supabase project has `pg_cron` extension enabled (it's enabled by default)

## Setup Instructions

### Step 1: Run Database Migration

Execute the migration in Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard -> SQL Editor
# Copy and paste content from:
database/migrations/012_add_raw_data_cleanup_function.sql
```

This creates the `fn_cleanup_lead_raw_data()` function.

### Step 2: Enable pg_cron Extension

1. Go to **Database → Extensions** in Supabase Dashboard
2. Search for `pg_cron`
3. Enable it if not already enabled

### Step 3: Create Cron Job

#### Option A: Using Supabase Dashboard (Recommended)

1. Navigate to **Database → Cron Jobs** in Supabase Dashboard
2. Click **Create a new cron job**
3. Fill in the form:

   **Job Name:**
   ```
   Pulizia Notturna Raw Data Leads
   ```

   **Schedule (Cron Syntax):**
   ```
   0 2 * * *
   ```
   *(Runs every night at 2:00 AM UTC)*

   **SQL Command:**
   ```sql
   SELECT fn_cleanup_lead_raw_data();
   ```

4. Click **Create** to save the cron job

#### Option B: Using SQL (Manual Setup)

If the Dashboard UI is not available, run this SQL:

```sql
-- Create cron job for nightly cleanup
SELECT cron.schedule(
  'cleanup_lead_raw_data',           -- Job name
  '0 2 * * *',                        -- Every day at 2:00 AM UTC
  $$SELECT fn_cleanup_lead_raw_data();$$ -- SQL to execute
);
```

### Step 4: Verify Cron Job

Check that the cron job was created successfully:

```sql
-- List all cron jobs
SELECT * FROM cron.job;

-- You should see:
-- jobid | schedule   | command                              | nodename  | active
-- ------|------------|--------------------------------------|-----------|--------
-- ...   | 0 2 * * *  | SELECT fn_cleanup_lead_raw_data();   | localhost | t
```

## Testing

### Test the Function Manually

Before the cron job runs, test the function:

```sql
-- Test cleanup function
SELECT * FROM fn_cleanup_lead_raw_data();

-- Expected output:
-- cleaned_count | execution_time_ms
-- --------------|------------------
-- 0             | 15
```

### Verify Cleanup Works

1. Create some test leads with `raw_data_sc`:
   ```sql
   -- Insert a test lead with old timestamp
   INSERT INTO leads (
     id, search_id, ragione_sociale,
     raw_data_sc, created_at, updated_at,
     validazione_status, attivo, da_contattare, priorita,
     data_estrazione
   ) VALUES (
     gen_random_uuid(),
     gen_random_uuid(),
     'Test Company',
     '{"test": "data"}'::jsonb,
     NOW() - INTERVAL '35 days',  -- 35 days old
     NOW() - INTERVAL '35 days',
     'pending', true, true, 'media',
     NOW() - INTERVAL '35 days'
   );
   ```

2. Run cleanup manually:
   ```sql
   SELECT * FROM fn_cleanup_lead_raw_data();
   ```

3. Verify the test lead's `raw_data_sc` is now NULL:
   ```sql
   SELECT ragione_sociale, raw_data_sc, created_at
   FROM leads
   WHERE ragione_sociale = 'Test Company';
   ```

### Monitor Cron Job Execution

Check cron job run history:

```sql
-- View cron job run history
SELECT *
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup_lead_raw_data')
ORDER BY start_time DESC
LIMIT 10;
```

## Customization

### Change Cleanup Age Threshold

Default is 30 days. To change it, modify the function:

```sql
-- Example: Clean leads older than 7 days instead
CREATE OR REPLACE FUNCTION fn_cleanup_lead_raw_data()
...
WHERE
  raw_data_sc IS NOT NULL
  AND created_at < (NOW() - INTERVAL '7 days');  -- Changed from 30 to 7 days
...
```

### Change Schedule

Cron syntax: `minute hour day_of_month month day_of_week`

Examples:
- `0 2 * * *` - Every day at 2:00 AM
- `0 3 * * 0` - Every Sunday at 3:00 AM
- `0 */6 * * *` - Every 6 hours
- `30 1 1 * *` - 1st of every month at 1:30 AM

To update the schedule:

```sql
-- Update cron job schedule
UPDATE cron.job
SET schedule = '0 3 * * 0'  -- New schedule
WHERE jobname = 'cleanup_lead_raw_data';
```

## Troubleshooting

### Cron Job Not Running

1. Check if `pg_cron` extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Check cron job status:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'cleanup_lead_raw_data';
   ```

3. Check for errors in logs:
   ```sql
   SELECT *
   FROM cron.job_run_details
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup_lead_raw_data')
   AND status = 'failed'
   ORDER BY start_time DESC;
   ```

### Function Permissions Error

Grant necessary permissions:

```sql
GRANT EXECUTE ON FUNCTION fn_cleanup_lead_raw_data() TO postgres, service_role;
```

### Delete Cron Job

If you need to remove the cron job:

```sql
-- Delete cron job
SELECT cron.unschedule('cleanup_lead_raw_data');
```

## Expected Impact

**Before cleanup:**
- Average lead size: ~50KB (with raw_data_sc)
- 10,000 leads = ~500MB database storage

**After cleanup:**
- Average lead size: ~5KB (without raw_data_sc)
- 10,000 leads = ~50MB database storage

**Storage saved: ~90%**

## Monitoring

Track cleanup effectiveness:

```sql
-- Count leads with raw_data_sc
SELECT
  COUNT(*) FILTER (WHERE raw_data_sc IS NOT NULL) AS leads_with_raw_data,
  COUNT(*) FILTER (WHERE raw_data_sc IS NULL) AS leads_cleaned,
  COUNT(*) AS total_leads,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE raw_data_sc IS NULL) / COUNT(*),
    2
  ) AS cleanup_percentage
FROM leads;
```

## Summary

✅ **Event-driven cleanup**: Immediate cleanup after enrichment (primary strategy)
✅ **Scheduled cleanup**: Nightly safety net for any missed leads
✅ **30-day retention**: Raw data kept for 30 days for debugging
✅ **Automatic & reliable**: No manual intervention needed

This two-tier approach ensures optimal database performance while maintaining data availability when needed!
