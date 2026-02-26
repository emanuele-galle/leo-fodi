-- ============================================
-- Migration: Add Lead Contact Status Tracking
-- Aggiunge sistema di tracking per lo stato di contatto dei lead
-- ============================================

-- Tabella per tracciare lo stato di contatto di ogni lead
CREATE TABLE IF NOT EXISTS lead_contact_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  contact_status VARCHAR(20) NOT NULL CHECK (contact_status IN ('none', 'contacted', 'do_not_contact')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contacted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: un solo record per lead (aggiornabile)
  UNIQUE(lead_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_lead_contact_status_lead_id ON lead_contact_status(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_contact_status_user_id ON lead_contact_status(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_contact_status_status ON lead_contact_status(contact_status);
CREATE INDEX IF NOT EXISTS idx_lead_contact_status_contacted_at ON lead_contact_status(contacted_at DESC);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_lead_contact_status_updated_at
  BEFORE UPDATE ON lead_contact_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE lead_contact_status ENABLE ROW LEVEL SECURITY;

-- Tutti gli utenti autenticati possono vedere tutti gli stati di contatto
-- (importante: se un utente A ha marcato un lead come contattato,
-- anche l'utente B deve vederlo per evitare duplicati)
CREATE POLICY "authenticated_users_select_all_contact_status"
  ON lead_contact_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Gli utenti possono inserire nuovi stati di contatto per qualsiasi lead
CREATE POLICY "authenticated_users_insert_contact_status"
  ON lead_contact_status
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Gli utenti possono aggiornare gli stati di contatto che hanno creato
CREATE POLICY "users_update_own_contact_status"
  ON lead_contact_status
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Gli admin possono gestire tutti gli stati di contatto
CREATE POLICY "admins_manage_all_contact_status"
  ON lead_contact_status
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- Helper Functions
-- ============================================

-- Funzione per impostare lo stato di contatto di un lead
CREATE OR REPLACE FUNCTION set_lead_contact_status(
  p_lead_id UUID,
  p_contact_status VARCHAR(20),
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  status_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Validate status
  IF p_contact_status NOT IN ('none', 'contacted', 'do_not_contact') THEN
    RAISE EXCEPTION 'Invalid contact status: %', p_contact_status;
  END IF;

  -- Insert or update status
  INSERT INTO lead_contact_status (lead_id, contact_status, user_id, notes)
  VALUES (p_lead_id, p_contact_status, current_user_id, p_notes)
  ON CONFLICT (lead_id) DO UPDATE
  SET
    contact_status = EXCLUDED.contact_status,
    user_id = EXCLUDED.user_id,
    notes = EXCLUDED.notes,
    contacted_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO status_id;

  RETURN status_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere lo stato di contatto di un lead
CREATE OR REPLACE FUNCTION get_lead_contact_status(
  p_lead_id UUID
) RETURNS TABLE (
  contact_status VARCHAR(20),
  user_email TEXT,
  user_name TEXT,
  contacted_at TIMESTAMPTZ,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lcs.contact_status,
    au.email as user_email,
    up.nome || ' ' || up.cognome as user_name,
    lcs.contacted_at,
    lcs.notes
  FROM lead_contact_status lcs
  LEFT JOIN auth.users au ON lcs.user_id = au.id
  LEFT JOIN user_profiles up ON lcs.user_id = up.id
  WHERE lcs.lead_id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere statistiche di contatto per utente
CREATE OR REPLACE FUNCTION get_user_contact_stats(
  p_user_id UUID DEFAULT NULL
) RETURNS TABLE (
  total_leads BIGINT,
  contacted_leads BIGINT,
  do_not_contact_leads BIGINT,
  uncontacted_leads BIGINT
) AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Use provided user_id or current user
  target_user_id := COALESCE(p_user_id, auth.uid());

  RETURN QUERY
  SELECT
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN lcs.contact_status = 'contacted' THEN l.id END) as contacted_leads,
    COUNT(DISTINCT CASE WHEN lcs.contact_status = 'do_not_contact' THEN l.id END) as do_not_contact_leads,
    COUNT(DISTINCT CASE WHEN lcs.contact_status IS NULL OR lcs.contact_status = 'none' THEN l.id END) as uncontacted_leads
  FROM leads l
  LEFT JOIN lead_contact_status lcs ON l.id = lcs.lead_id
  WHERE l.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE lead_contact_status IS 'Traccia lo stato di contatto per ogni lead (contacted, do_not_contact, none)';
COMMENT ON COLUMN lead_contact_status.contact_status IS 'Stato: none (non contattato), contacted (contattato), do_not_contact (da non contattare)';
COMMENT ON COLUMN lead_contact_status.user_id IS 'Utente che ha impostato lo stato';
COMMENT ON COLUMN lead_contact_status.contacted_at IS 'Data/ora in cui è stato impostato lo stato';
COMMENT ON COLUMN lead_contact_status.notes IS 'Note opzionali sullo stato del contatto';

COMMENT ON FUNCTION set_lead_contact_status IS 'Imposta lo stato di contatto per un lead (crea o aggiorna)';
COMMENT ON FUNCTION get_lead_contact_status IS 'Ottiene lo stato di contatto di un lead con info utente';
COMMENT ON FUNCTION get_user_contact_stats IS 'Statistiche di contatto per un utente (totale, contattati, da non contattare, non contattati)';
