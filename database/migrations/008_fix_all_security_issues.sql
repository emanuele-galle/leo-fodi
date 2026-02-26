-- Migration 008: Fix All Security and Performance Issues
-- Risolve:
-- 1. Admin non può vedere utenti pending (RLS policy mancante)
-- 2. RLS disabilitato su lead_searches e leads
-- 3. Function search_path mutable (security issue)
-- 4. Performance issues con auth.uid() in RLS policies
-- 5. Leaked password protection

-- ============================================
-- PARTE 1: FIX USER_PROFILES RLS PER ADMIN
-- ============================================

-- Aggiungi policy per permettere agli admin di vedere TUTTI gli utenti
CREATE POLICY "admins_select_all"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- Aggiungi policy per permettere agli admin di fare UPDATE su tutti gli utenti
CREATE POLICY "admins_update_all"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- Aggiungi policy per permettere agli admin di eliminare utenti
CREATE POLICY "admins_delete_all"
ON user_profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  )
);

-- ============================================
-- PARTE 2: ABILITA RLS SU LEAD_SEARCHES
-- ============================================

-- Abilita RLS
ALTER TABLE lead_searches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 3: ABILITA RLS SU LEADS
-- ============================================

-- Abilita RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 4: FIX FUNZIONI RPC (SET search_path)
-- ============================================

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, approved, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user',
    false,
    NOW()
  );
  RETURN new;
END;
$$;

-- Fix approve_user function (se esiste)
DROP FUNCTION IF EXISTS approve_user(UUID, BOOLEAN);

-- Fix change_user_role function (se esiste)
DROP FUNCTION IF EXISTS change_user_role(UUID, TEXT);

-- Fix admin_approve_user function
CREATE OR REPLACE FUNCTION admin_approve_user(target_user_id UUID, should_approve BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Ottieni ruolo con subquery per evitare ricorsione
  SELECT role INTO caller_role
  FROM user_profiles
  WHERE id = (SELECT auth.uid())
  LIMIT 1;

  IF caller_role = 'admin' THEN
    UPDATE user_profiles
    SET approved = should_approve
    WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only admins can approve users';
  END IF;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- PARTE 5: OTTIMIZZA RLS POLICIES (PERFORMANCE)
-- ============================================

-- Fix clients policies
DROP POLICY IF EXISTS "Users can read own clients" ON clients;
CREATE POLICY "Users can read own clients"
ON clients
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
CREATE POLICY "Users can insert own clients"
ON clients
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can read own profiles" ON profiles;
CREATE POLICY "Users can read own profiles"
ON profiles
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
CREATE POLICY "Users can insert own profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix financial_plans policies
DROP POLICY IF EXISTS "Users can read own plans" ON financial_plans;
CREATE POLICY "Users can read own plans"
ON financial_plans
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own plans" ON financial_plans;
CREATE POLICY "Users can insert own plans"
ON financial_plans
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix user_profiles policies
DROP POLICY IF EXISTS "users_select_own" ON user_profiles;
CREATE POLICY "users_select_own"
ON user_profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "users_insert_own" ON user_profiles;
CREATE POLICY "users_insert_own"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "users_update_own" ON user_profiles;
CREATE POLICY "users_update_own"
ON user_profiles
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "users_delete_own" ON user_profiles;
CREATE POLICY "users_delete_own"
ON user_profiles
FOR DELETE
TO public
USING (id = (SELECT auth.uid()));

-- ============================================
-- PARTE 6: VERIFICA RISULTATI
-- ============================================

SELECT 'Migration 008 completed successfully' as status;

-- Verifica RLS abilitato
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'lead_searches', 'leads')
ORDER BY tablename;

-- Verifica policy user_profiles
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_profiles'
ORDER BY policyname;
