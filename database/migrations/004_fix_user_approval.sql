-- Migration 004 FIX: User Approval System
-- Fix per trigger e creazione profilo utente

-- 1. Verifica se la colonna approved esiste, altrimenti creala
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'approved'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN approved BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 2. Imposta tutti gli admin esistenti come approvati
UPDATE user_profiles
SET approved = true
WHERE role = 'admin';

-- 3. Rimuovi il trigger esistente se presente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Ricrea la funzione del trigger con la gestione corretta
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_approved BOOLEAN;
BEGIN
  -- Determina il ruolo basato sull'email
  IF NEW.email = 'emanuelegalle@gmail.com' THEN
    user_role := 'admin';
    user_approved := true;
  ELSE
    user_role := 'user';
    user_approved := false;
  END IF;

  -- Inserisci il profilo utente
  INSERT INTO public.user_profiles (id, email, full_name, role, approved, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role,
    user_approved,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    approved = EXCLUDED.approved;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ricrea il trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 6. Aggiungi indice per query più veloci se non esiste
CREATE INDEX IF NOT EXISTS idx_user_profiles_approved ON user_profiles(approved);

-- 7. FIX MANUALE: Crea il profilo per l'utente esistente emanuelegalle@gmail.com se non esiste
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Trova l'ID utente dalla tabella auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'emanuelegalle@gmail.com'
  LIMIT 1;

  -- Se l'utente esiste, crea o aggiorna il profilo
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
      email = EXCLUDED.email,
      role = 'admin',
      approved = true;

    RAISE NOTICE 'Profilo creato/aggiornato per utente con ID: %', user_id;
  ELSE
    RAISE NOTICE 'Nessun utente trovato con email emanuelegalle@gmail.com';
  END IF;
END $$;

-- 8. Verifica policy RLS esistenti e ricreale se necessario
DROP POLICY IF EXISTS "Users can view their own approval status" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update approval status" ON user_profiles;

CREATE POLICY "Users can view their own approval status"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update approval status"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Commenti per documentazione
COMMENT ON COLUMN user_profiles.approved IS 'Indica se l''utente è stato approvato da un admin. Solo utenti approvati possono accedere alla piattaforma.';

-- 10. Output di verifica
SELECT
  'Migration completed. User profiles:' as status,
  COUNT(*) as total_users,
  SUM(CASE WHEN approved = true THEN 1 ELSE 0 END) as approved_users,
  SUM(CASE WHEN approved = false THEN 1 ELSE 0 END) as pending_users
FROM user_profiles;
