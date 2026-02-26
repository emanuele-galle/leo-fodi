-- Migration 011: Cleanup Duplicate Policies
-- Rimuove le vecchie policy per evitare conflitti e migliorare performance

-- ============================================
-- PARTE 1: RIMUOVI VECCHIE POLICY LEAD_SEARCHES
-- ============================================

-- Rimuovi le vecchie policy generiche
DROP POLICY IF EXISTS "Allow authenticated users to delete searches" ON lead_searches;
DROP POLICY IF EXISTS "Allow authenticated users to insert searches" ON lead_searches;
DROP POLICY IF EXISTS "Allow authenticated users to read all searches" ON lead_searches;
DROP POLICY IF EXISTS "Allow authenticated users to update searches" ON lead_searches;

-- ============================================
-- PARTE 2: RIMUOVI VECCHIE POLICY LEADS
-- ============================================

-- Rimuovi le vecchie policy generiche
DROP POLICY IF EXISTS "Users can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can read own leads" ON leads;
DROP POLICY IF EXISTS "Users can update own leads" ON leads;

-- ============================================
-- PARTE 3: VERIFICA FINALE
-- ============================================

SELECT 'Migration 011 completed successfully' as status;

-- Verifica policy rimanenti su lead_searches
SELECT
  'lead_searches' as table_name,
  COUNT(*) as policy_count,
  array_agg(policyname ORDER BY policyname) as policies
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'lead_searches';

-- Verifica policy rimanenti su leads
SELECT
  'leads' as table_name,
  COUNT(*) as policy_count,
  array_agg(policyname ORDER BY policyname) as policies
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'leads';
