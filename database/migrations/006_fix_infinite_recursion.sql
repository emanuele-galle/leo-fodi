-- Migration 006: Fix Infinite Recursion in RLS Policies
-- Risolve il problema di ricorsione infinita nelle policy

-- 1. Disabilita RLS temporaneamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Rimuovi TUTTE le policy
DROP POLICY IF EXISTS "allow_read_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_update_all" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own approval status" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update approval status" ON user_profiles;

-- 3. Ri-abilita RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Crea policy SEMPLICE per SELECT (lettura)
-- Ogni utente può leggere SOLO il proprio profilo
CREATE POLICY "select_own_profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 5. Crea policy per INSERT (creazione)
CREATE POLICY "insert_own_profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 6. Crea policy per UPDATE (aggiornamento)
-- Permetti agli utenti di aggiornare SOLO il proprio full_name
-- Gli admin possono aggiornare anche role e approved
CREATE POLICY "update_own_profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 7. NON creiamo una policy separata per admin che causa ricorsione
-- Invece, gestiamo le approvazioni tramite una funzione SECURITY DEFINER

-- 8. Crea funzione per approvare utenti (solo admin)
CREATE OR REPLACE FUNCTION approve_user(target_user_id UUID, should_approve BOOLEAN)
RETURNS VOID AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Ottieni il ruolo dell'utente che chiama la funzione
  SELECT role INTO caller_role
  FROM user_profiles
  WHERE id = auth.uid();

  -- Verifica che sia admin
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can approve users';
  END IF;

  -- Aggiorna lo stato di approvazione
  UPDATE user_profiles
  SET approved = should_approve
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Crea funzione per cambiare ruolo utente (solo admin)
CREATE OR REPLACE FUNCTION change_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Ottieni il ruolo dell'utente che chiama la funzione
  SELECT role INTO caller_role
  FROM user_profiles
  WHERE id = auth.uid();

  -- Verifica che sia admin
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;

  -- Aggiorna il ruolo
  UPDATE user_profiles
  SET role = new_role
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Verifica e crea profilo per emanuelegalle@gmail.com
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Trova l'ID utente
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'emanuelegalle@gmail.com'
  LIMIT 1;

  IF user_id IS NULL THEN
    RAISE NOTICE 'Nessun utente trovato con email emanuelegalle@gmail.com';
    RETURN;
  END IF;

  -- Inserisci o aggiorna il profilo
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
    email = EXCLUDED.email,
    role = 'admin',
    approved = true;

  RAISE NOTICE 'Profilo creato/aggiornato per user_id: %', user_id;
END $$;

-- 11. Output di verifica
SELECT
  'User Profile:' as info,
  id,
  email,
  role,
  approved,
  created_at
FROM user_profiles
WHERE email = 'emanuelegalle@gmail.com';

-- 12. Verifica policy attive
SELECT
  'Active Policies:' as info,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
