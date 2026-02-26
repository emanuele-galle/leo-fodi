-- Migration 004: Add User Approval System
-- Cambia il sistema di verifica da email a approvazione admin

-- 1. Aggiungi colonna 'approved' alla tabella user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- 2. Imposta tutti gli admin esistenti come approvati
UPDATE user_profiles
SET approved = true
WHERE role = 'admin';

-- 3. Modifica il trigger per impostare approved=true solo per admin
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Determina il ruolo basato sull'email
  IF NEW.email = 'emanuelegalle@gmail.com' THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  -- Inserisci il profilo utente con approvazione automatica solo per admin
  INSERT INTO public.user_profiles (id, email, full_name, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role,
    CASE WHEN user_role = 'admin' THEN true ELSE false END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Aggiungi indice per query più veloci
CREATE INDEX IF NOT EXISTS idx_user_profiles_approved ON user_profiles(approved);

-- 5. Aggiungi policy RLS per permettere agli utenti di vedere il proprio stato di approvazione
CREATE POLICY "Users can view their own approval status"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 6. Aggiungi policy per permettere agli admin di aggiornare lo stato di approvazione
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

-- 7. Commenti per documentazione
COMMENT ON COLUMN user_profiles.approved IS 'Indica se l''utente è stato approvato da un admin. Solo utenti approvati possono accedere alla piattaforma.';
