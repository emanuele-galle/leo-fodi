-- Migration 005: Fix RLS Policies for User Profiles
-- Risolve i problemi di accesso alla tabella user_profiles

-- 1. Disabilita temporaneamente RLS per verificare
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Rimuovi TUTTE le policy esistenti
DROP POLICY IF EXISTS "Users can view their own approval status" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update approval status" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;

-- 3. Abilita nuovamente RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Crea policy SEMPLICE per SELECT (lettura)
-- Permetti a TUTTI gli utenti autenticati di leggere il proprio profilo
CREATE POLICY "allow_read_own_profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 5. Crea policy per INSERT (creazione)
-- Permetti agli utenti di creare il proprio profilo
CREATE POLICY "allow_insert_own_profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 6. Crea policy per UPDATE (aggiornamento)
-- Permetti agli utenti di aggiornare il proprio profilo
CREATE POLICY "allow_update_own_profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Crea policy SPECIALE per admin per aggiornare altri utenti
-- Gli admin possono aggiornare qualsiasi profilo
CREATE POLICY "allow_admin_update_all"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- 8. Verifica che il profilo esista per emanuelegalle@gmail.com
DO $$
DECLARE
  user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Trova l'ID utente
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'emanuelegalle@gmail.com'
  LIMIT 1;

  IF user_id IS NULL THEN
    RAISE NOTICE 'ERRORE: Nessun utente auth trovato con email emanuelegalle@gmail.com';
    RETURN;
  END IF;

  -- Verifica se il profilo esiste
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = user_id) INTO profile_exists;

  IF NOT profile_exists THEN
    RAISE NOTICE 'Profilo NON trovato, creazione in corso...';

    INSERT INTO public.user_profiles (id, email, full_name, role, approved, created_at)
    VALUES (
      user_id,
      'emanuelegalle@gmail.com',
      '',
      'admin',
      true,
      NOW()
    );

    RAISE NOTICE 'Profilo creato con successo per user_id: %', user_id;
  ELSE
    RAISE NOTICE 'Profilo già esistente, aggiornamento...';

    UPDATE user_profiles
    SET
      role = 'admin',
      approved = true,
      email = 'emanuelegalle@gmail.com'
    WHERE id = user_id;

    RAISE NOTICE 'Profilo aggiornato con successo per user_id: %', user_id;
  END IF;
END $$;

-- 9. Output di verifica finale
SELECT
  'Verification Results:' as status,
  id,
  email,
  role,
  approved,
  created_at
FROM user_profiles
WHERE email = 'emanuelegalle@gmail.com';

-- 10. Verifica le policy attive
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
