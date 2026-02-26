-- ============================================
-- Migration: Add User Analytics and Statistics
-- Aggiunge tabelle per tracciare attività e statistiche utente
-- ============================================

-- Tabella per tracciare attività utente dettagliate
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('profile_created', 'plan_created', 'lead_generated', 'client_added', 'login', 'search_performed')),
  entity_type VARCHAR(50), -- 'client', 'profile', 'plan', 'lead'
  entity_id UUID, -- ID dell'entità correlata
  metadata JSONB, -- Dati aggiuntivi (nome cliente, query, etc)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity_log(user_id, created_at DESC);

-- Tabella per statistiche aggregate giornaliere/mensili
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Contatori
  clients_created INTEGER DEFAULT 0,
  profiles_created INTEGER DEFAULT 0,
  plans_created INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  searches_performed INTEGER DEFAULT 0,

  -- Metriche qualitative
  avg_profile_completion_time INTEGER, -- in secondi
  avg_plan_creation_time INTEGER, -- in secondi

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: un solo record per user/period
  UNIQUE(user_id, period_type, period_start)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_period ON user_statistics(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_period ON user_statistics(user_id, period_type, period_start DESC);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own activity logs
CREATE POLICY "users_select_own_activity"
  ON user_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own activity logs
CREATE POLICY "users_insert_own_activity"
  ON user_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own statistics
CREATE POLICY "users_select_own_statistics"
  ON user_statistics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all statistics (for background jobs)
CREATE POLICY "service_manage_all_statistics"
  ON user_statistics
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Helper Functions
-- ============================================

-- Funzione per loggare attività utente
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type VARCHAR(50),
  p_entity_type VARCHAR(50) DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO user_activity_log (user_id, activity_type, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_activity_type, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere statistiche utente per periodo
CREATE OR REPLACE FUNCTION get_user_stats_for_period(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  activity_type VARCHAR(50),
  count BIGINT,
  latest_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ual.activity_type,
    COUNT(*)::BIGINT as count,
    MAX(ual.created_at) as latest_activity
  FROM user_activity_log ual
  WHERE ual.user_id = p_user_id
    AND ual.created_at >= p_start_date
    AND ual.created_at <= p_end_date
  GROUP BY ual.activity_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere trend mensile
CREATE OR REPLACE FUNCTION get_user_monthly_trend(
  p_user_id UUID,
  p_months INTEGER DEFAULT 6
) RETURNS TABLE (
  month_start DATE,
  clients_count INTEGER,
  profiles_count INTEGER,
  plans_count INTEGER,
  leads_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT
      DATE_TRUNC('month', CURRENT_DATE - (n || ' months')::INTERVAL)::DATE as month_start
    FROM generate_series(0, p_months - 1) n
  )
  SELECT
    m.month_start,
    COALESCE(
      (SELECT COUNT(*)::INTEGER
       FROM clients c
       WHERE c.user_id = p_user_id
         AND DATE_TRUNC('month', c.created_at)::DATE = m.month_start),
      0
    ) as clients_count,
    COALESCE(
      (SELECT COUNT(*)::INTEGER
       FROM profiles p
       WHERE p.user_id = p_user_id
         AND DATE_TRUNC('month', p.created_at)::DATE = m.month_start),
      0
    ) as profiles_count,
    COALESCE(
      (SELECT COUNT(*)::INTEGER
       FROM financial_plans fp
       WHERE fp.user_id = p_user_id
         AND DATE_TRUNC('month', fp.created_at)::DATE = m.month_start),
      0
    ) as plans_count,
    COALESCE(
      (SELECT COUNT(*)::INTEGER
       FROM leads l
       WHERE l.user_id = p_user_id
         AND DATE_TRUNC('month', l.created_at)::DATE = m.month_start),
      0
    ) as leads_count
  FROM months m
  ORDER BY m.month_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE user_activity_log IS 'Log dettagliato delle attività utente per analytics e timeline';
COMMENT ON TABLE user_statistics IS 'Statistiche aggregate per periodo (daily/weekly/monthly)';

COMMENT ON COLUMN user_activity_log.activity_type IS 'Tipo di attività: profile_created, plan_created, lead_generated, etc';
COMMENT ON COLUMN user_activity_log.metadata IS 'Dati aggiuntivi in formato JSON (nome cliente, query, etc)';

COMMENT ON FUNCTION log_user_activity IS 'Helper per registrare attività utente nel log';
COMMENT ON FUNCTION get_user_stats_for_period IS 'Restituisce statistiche utente per un periodo specifico';
COMMENT ON FUNCTION get_user_monthly_trend IS 'Restituisce trend mensile delle attività utente (ultimi N mesi)';
