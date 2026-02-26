-- Migration 012: Fix is_admin() function returning NULL instead of boolean
-- Problema: is_admin() ritorna NULL quando non trova risultati, causando fallimento delle policy RLS
-- Soluzione: Usare COALESCE per garantire sempre un valore booleano

-- ============================================
-- PARTE 1: FIX FUNZIONE is_admin()
-- ============================================

-- Ricrea la funzione con gestione NULL esplicita
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
BEGIN
  -- Ottieni l'ID utente corrente
  current_user_id := auth.uid();

  -- Se non c'è un utente autenticato, ritorna FALSE
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Cerca il ruolo dell'utente
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = current_user_id
  LIMIT 1;

  -- Ritorna TRUE solo se il ruolo è esattamente 'admin'
  -- COALESCE garantisce che non ritorni mai NULL
  RETURN COALESCE(user_role = 'admin', FALSE);

EXCEPTION
  WHEN OTHERS THEN
    -- In caso di errore, ritorna FALSE per sicurezza
    RETURN FALSE;
END;
$$;

-- Aggiungi commento alla funzione
COMMENT ON FUNCTION is_admin() IS 'Verifica se l''utente corrente è un admin. Ritorna sempre un booleano (mai NULL).';

-- ============================================
-- PARTE 2: VERIFICA FUNZIONE
-- ============================================

SELECT 'Migration 012 completed successfully' as status;

-- Test della funzione per utenti admin
SELECT
  'Test is_admin() for admin users' as test_name,
  id,
  email,
  role,
  is_admin() as is_admin_result
FROM user_profiles
WHERE role = 'admin'
LIMIT 5;

-- Test della funzione per utenti non-admin
SELECT
  'Test is_admin() for non-admin users' as test_name,
  id,
  email,
  role,
  is_admin() as is_admin_result
FROM user_profiles
WHERE role != 'admin'
LIMIT 5;

-- Verifica che la funzione non ritorni mai NULL
SELECT
  'Verify is_admin() never returns NULL' as test_name,
  CASE
    WHEN is_admin() IS NULL THEN 'FAIL: Returned NULL'
    WHEN is_admin() = TRUE THEN 'PASS: Returned TRUE'
    WHEN is_admin() = FALSE THEN 'PASS: Returned FALSE'
    ELSE 'FAIL: Unexpected value'
  END as result;
