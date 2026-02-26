-- Migration 010: Add RLS Policies for lead_searches and leads
-- Problema: Le tabelle hanno RLS abilitato ma nessuna policy, quindi nessuno può accedere

-- ============================================
-- PARTE 1: POLICY PER LEAD_SEARCHES
-- ============================================

-- Gli utenti possono vedere le proprie ricerche
CREATE POLICY "users_select_own_searches"
ON lead_searches
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Gli utenti possono inserire le proprie ricerche
CREATE POLICY "users_insert_own_searches"
ON lead_searches
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- Gli utenti possono aggiornare le proprie ricerche
CREATE POLICY "users_update_own_searches"
ON lead_searches
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Gli utenti possono eliminare le proprie ricerche
CREATE POLICY "users_delete_own_searches"
ON lead_searches
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Admin possono vedere tutte le ricerche
CREATE POLICY "admins_select_all_searches"
ON lead_searches
FOR SELECT
TO authenticated
USING (is_admin());

-- ============================================
-- PARTE 2: POLICY PER LEADS
-- ============================================

-- Gli utenti possono vedere i propri lead
CREATE POLICY "users_select_own_leads"
ON leads
FOR SELECT
TO authenticated
USING (
  search_id IN (
    SELECT id FROM lead_searches WHERE user_id = (SELECT auth.uid())
  )
);

-- Gli utenti possono inserire lead nelle proprie ricerche
CREATE POLICY "users_insert_own_leads"
ON leads
FOR INSERT
TO authenticated
WITH CHECK (
  search_id IN (
    SELECT id FROM lead_searches WHERE user_id = (SELECT auth.uid())
  )
);

-- Gli utenti possono aggiornare i propri lead
CREATE POLICY "users_update_own_leads"
ON leads
FOR UPDATE
TO authenticated
USING (
  search_id IN (
    SELECT id FROM lead_searches WHERE user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  search_id IN (
    SELECT id FROM lead_searches WHERE user_id = (SELECT auth.uid())
  )
);

-- Gli utenti possono eliminare i propri lead
CREATE POLICY "users_delete_own_leads"
ON leads
FOR DELETE
TO authenticated
USING (
  search_id IN (
    SELECT id FROM lead_searches WHERE user_id = (SELECT auth.uid())
  )
);

-- Admin possono vedere tutti i lead
CREATE POLICY "admins_select_all_leads"
ON leads
FOR SELECT
TO authenticated
USING (is_admin());

-- ============================================
-- PARTE 3: FIX USER_ID NULL NEI RECORD ESISTENTI
-- ============================================

-- Aggiorna i record esistenti con user_id NULL
-- Assegniamo al primo admin trovato (fallback)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Trova il primo admin
  SELECT id INTO admin_user_id
  FROM user_profiles
  WHERE role = 'admin'
  LIMIT 1;

  -- Se esiste un admin, aggiorna i record con user_id NULL
  IF admin_user_id IS NOT NULL THEN
    UPDATE lead_searches
    SET user_id = admin_user_id
    WHERE user_id IS NULL;

    RAISE NOTICE 'Updated % lead_searches with user_id NULL',
                 (SELECT count(*) FROM lead_searches WHERE user_id = admin_user_id);
  END IF;
END $$;

-- ============================================
-- PARTE 4: VERIFICA
-- ============================================

SELECT 'Migration 010 completed successfully' as status;

-- Verifica policy lead_searches
SELECT
  'lead_searches policies' as table_name,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'lead_searches'
ORDER BY policyname;

-- Verifica policy leads
SELECT
  'leads policies' as table_name,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'leads'
ORDER BY policyname;

-- Conta lead_searches con user_id
SELECT
  'lead_searches count' as info,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as with_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as without_user_id
FROM lead_searches;
