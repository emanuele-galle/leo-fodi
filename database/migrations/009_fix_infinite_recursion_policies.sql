-- Migration 009: Fix Infinite Recursion in Admin Policies
-- Problema: Le policy admin causano ricorsione infinita perché fanno SELECT su user_profiles
-- Soluzione: Usare una funzione SECURITY DEFINER che bypassa RLS

-- ============================================
-- PARTE 1: RIMUOVI LE POLICY ADMIN RECURSIVE
-- ============================================

DROP POLICY IF EXISTS "admins_select_all" ON user_profiles;
DROP POLICY IF EXISTS "admins_update_all" ON user_profiles;
DROP POLICY IF EXISTS "admins_delete_all" ON user_profiles;

-- ============================================
-- PARTE 2: CREA FUNZIONE HELPER PER CHECK ADMIN
-- ============================================

-- Questa funzione bypassa RLS e non causa ricorsione
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Questa query bypassa RLS grazie a SECURITY DEFINER
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- ============================================
-- PARTE 3: RICREA LE POLICY ADMIN SENZA RICORSIONE
-- ============================================

-- Policy per permettere agli admin di vedere TUTTI gli utenti
CREATE POLICY "admins_select_all"
ON user_profiles
FOR SELECT
TO authenticated
USING (is_admin());

-- Policy per permettere agli admin di modificare TUTTI gli utenti
CREATE POLICY "admins_update_all"
ON user_profiles
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Policy per permettere agli admin di eliminare utenti
CREATE POLICY "admins_delete_all"
ON user_profiles
FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================
-- PARTE 4: VERIFICA
-- ============================================

SELECT 'Migration 009 completed successfully' as status;

-- Verifica policy
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_profiles'
ORDER BY policyname;
