-- ============================================
-- Migration: Fix Lead Contact Status Foreign Key
-- Cambia foreign key da auth.users a user_profiles per permettere JOIN
-- ============================================

-- 1. Drop la foreign key esistente verso auth.users
ALTER TABLE lead_contact_status
  DROP CONSTRAINT IF EXISTS lead_contact_status_user_id_fkey;

-- 2. Aggiungi foreign key verso user_profiles
ALTER TABLE lead_contact_status
  ADD CONSTRAINT lead_contact_status_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES user_profiles(id)
  ON DELETE CASCADE;

-- 3. Aggiorna il commento
COMMENT ON COLUMN lead_contact_status.user_id IS 'Utente che ha impostato lo stato (FK verso user_profiles)';

-- ============================================
-- Verifica: la relazione ora funziona per PostgREST
-- ============================================
-- Test query (da eseguire manualmente per verificare):
-- SELECT
--   lcs.*,
--   user_profiles (id, nome, cognome, email)
-- FROM lead_contact_status lcs
-- LIMIT 1;
