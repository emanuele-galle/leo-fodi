-- Migration 007: Simple RLS Fix - Nessuna Ricorsione
-- Approccio minimalista senza ricorsione

-- 1. Disabilita completamente RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Forza la rimozione di TUTTE le policy (anche se già fatto manualmente)
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'user_profiles' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.user_profiles';
  END LOOP;
END $$;

-- 3. Ri-abilita RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Crea UNA SOLA policy semplicissima per SELECT
-- Gli utenti autenticati possono leggere SOLO il proprio profilo
CREATE POLICY "users_select_own"
ON user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 5. Policy per INSERT
CREATE POLICY "users_insert_own"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 6. Policy per UPDATE - SENZA controlli admin per evitare ricorsione
CREATE POLICY "users_update_own"
ON user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 7. Verifica e crea il profilo per emanuelegalle@gmail.com
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'emanuelegalle@gmail.com'
  LIMIT 1;

  IF user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, email, full_name, role, approved, created_at)
    VALUES (
      user_id,
      'emanuelegalle@gmail.com',
      '',
      'admin',
      true,
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      role = 'admin',
      approved = true;
  END IF;
END $$;

-- 8. Crea funzione RPC per admin (SECURITY DEFINER bypassa RLS)
CREATE OR REPLACE FUNCTION admin_approve_user(target_user_id UUID, should_approve BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Ottieni ruolo direttamente senza subquery che causa ricorsione
  SELECT role INTO caller_role FROM user_profiles WHERE id = auth.uid() LIMIT 1;

  IF caller_role = 'admin' THEN
    UPDATE user_profiles SET approved = should_approve WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only admins can approve users';
  END IF;
END;
$$;

-- 9. Output verifica
SELECT 'Migration completed' as status;

SELECT 'User Profile:' as info, id, email, role, approved
FROM user_profiles
WHERE email = 'emanuelegalle@gmail.com';

SELECT 'Active Policies:' as info, policyname
FROM pg_policies
WHERE tablename = 'user_profiles';
