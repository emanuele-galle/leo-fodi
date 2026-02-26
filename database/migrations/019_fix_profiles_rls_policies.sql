-- Migration 019: Fix Profiles RLS Policies
-- Problema: Le policy attuali non permettono agli utenti di vedere i propri profili
-- Soluzione: Ricrea le policy con condizioni corrette per user_id

-- ============================================
-- PARTE 1: RIMUOVI LE VECCHIE POLICY
-- ============================================

DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;

-- ============================================
-- PARTE 2: CREA NUOVE POLICY CORRETTE
-- ============================================

-- Policy SELECT: Permetti agli utenti di vedere i propri profili
-- Include anche profili con user_id NULL per retrocompatibilità
CREATE POLICY "users_can_read_own_profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  user_id IS NULL
);

-- Policy INSERT: Permetti agli utenti di creare profili
-- Il user_id deve corrispondere all'utente autenticato o essere NULL
CREATE POLICY "users_can_insert_own_profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  user_id IS NULL
);

-- Policy UPDATE: Permetti agli utenti di aggiornare i propri profili
CREATE POLICY "users_can_update_own_profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Policy DELETE: Permetti agli utenti di eliminare i propri profili
CREATE POLICY "users_can_delete_own_profiles"
ON profiles
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- PARTE 3: FIX ANCHE PER CLIENTS
-- ============================================

-- Rimuovi vecchie policy clients
DROP POLICY IF EXISTS "Allow authenticated users to read clients" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to insert clients" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to update clients" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to delete clients" ON clients;
DROP POLICY IF EXISTS "Users can read own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- Crea nuove policy clients
CREATE POLICY "users_can_read_own_clients"
ON clients
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "users_can_insert_own_clients"
ON clients
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "users_can_update_own_clients"
ON clients
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "users_can_delete_own_clients"
ON clients
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- PARTE 4: VERIFICA
-- ============================================

SELECT 'Migration 019 completed successfully' as status;

-- Verifica policy profiles
SELECT
  'profiles' as table_name,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Verifica policy clients
SELECT
  'clients' as table_name,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'clients'
ORDER BY policyname;
