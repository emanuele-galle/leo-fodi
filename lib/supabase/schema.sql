-- ============================================
-- LEO-FODI Database Schema
-- Supabase PostgreSQL Schema for OSINT Profiling & Financial Planning
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: clients
-- Stores client basic information
-- ============================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  localita VARCHAR(200),
  ruolo VARCHAR(200),
  settore VARCHAR(200),
  link_social TEXT[], -- Array of social media URLs
  sito_web VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT clients_nome_check CHECK (char_length(nome) >= 2),
  CONSTRAINT clients_cognome_check CHECK (char_length(cognome) >= 2)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_nome_cognome ON clients(nome, cognome);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- ============================================
-- TABLE: profiles
-- Stores OSINT profile analysis results
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- OSINT Profile Sections (JSONB for structured data)
  identita_presenza_online JSONB NOT NULL,
  presenza_digitale JSONB NOT NULL,
  segnali_autorita JSONB NOT NULL,
  modello_lavorativo JSONB NOT NULL,
  visione_obiettivi JSONB NOT NULL,
  stile_vita JSONB NOT NULL,
  mappatura_bisogni JSONB NOT NULL,
  leve_ingaggio JSONB NOT NULL,
  raccomandazioni_prodotti JSONB NOT NULL,
  piano_contatto JSONB NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT profiles_client_id_unique UNIQUE(client_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- JSONB indexes for common queries (optional, add as needed)
CREATE INDEX IF NOT EXISTS idx_profiles_identita_gin ON profiles USING GIN (identita_presenza_online);

-- ============================================
-- TABLE: financial_plans
-- Stores financial planning analysis results
-- ============================================

CREATE TABLE IF NOT EXISTS financial_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Financial Plan Sections (JSONB for structured data)
  obiettivi_finanziari JSONB NOT NULL,
  analisi_gap JSONB NOT NULL,
  sequenza_raccomandata JSONB NOT NULL,
  spunti_fiscali JSONB NOT NULL,
  raccomandazioni_prodotti JSONB NOT NULL,
  sintesi_valore JSONB NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT financial_plans_profile_id_unique UNIQUE(profile_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_plans_profile_id ON financial_plans(profile_id);
CREATE INDEX IF NOT EXISTS idx_financial_plans_created_at ON financial_plans(created_at DESC);

-- ============================================
-- TABLE: api_keys
-- Stores encrypted API keys for XAI agents
-- ============================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name VARCHAR(50) NOT NULL CHECK (agent_name IN ('osint', 'financial')),
  api_key_encrypted TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT api_keys_agent_name_unique UNIQUE(agent_name)
);

-- Index for active keys lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_agent_active ON api_keys(agent_name, is_active);

-- ============================================
-- TRIGGER: Auto-update timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies for clients table
-- Allow authenticated users to read all clients
CREATE POLICY "Allow authenticated users to read clients"
  ON clients FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert clients
CREATE POLICY "Allow authenticated users to insert clients"
  ON clients FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own clients
CREATE POLICY "Allow authenticated users to update clients"
  ON clients FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own clients
CREATE POLICY "Allow authenticated users to delete clients"
  ON clients FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies for profiles table
-- Allow authenticated users to read all profiles
CREATE POLICY "Allow authenticated users to read profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert profiles
CREATE POLICY "Allow authenticated users to insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update profiles
CREATE POLICY "Allow authenticated users to update profiles"
  ON profiles FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policies for financial_plans table
-- Allow authenticated users to read all plans
CREATE POLICY "Allow authenticated users to read plans"
  ON financial_plans FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert plans
CREATE POLICY "Allow authenticated users to insert plans"
  ON financial_plans FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update plans
CREATE POLICY "Allow authenticated users to update plans"
  ON financial_plans FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policies for api_keys table (restrict access)
-- Only service role can access api_keys
CREATE POLICY "Service role only for api_keys"
  ON api_keys FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE clients IS 'Stores client basic information for OSINT profiling';
COMMENT ON TABLE profiles IS 'Stores OSINT profile analysis results with 10 structured sections';
COMMENT ON TABLE financial_plans IS 'Stores financial planning analysis based on OSINT profiles';
COMMENT ON TABLE api_keys IS 'Stores encrypted API keys for XAI agents (osint/financial)';

COMMENT ON COLUMN clients.link_social IS 'Array of social media profile URLs';
COMMENT ON COLUMN profiles.identita_presenza_online IS 'Section 1: Identity and online presence';
COMMENT ON COLUMN profiles.presenza_digitale IS 'Section 2: Digital presence analysis';
COMMENT ON COLUMN profiles.segnali_autorita IS 'Section 3: Authority signals (awards, publications)';
COMMENT ON COLUMN profiles.modello_lavorativo IS 'Section 4: Work model and revenue sources';
COMMENT ON COLUMN profiles.visione_obiettivi IS 'Section 5: Vision and declared goals';
COMMENT ON COLUMN profiles.stile_vita IS 'Section 6: Lifestyle and values';
COMMENT ON COLUMN profiles.mappatura_bisogni IS 'Section 7: Needs mapping (personal, professional)';
COMMENT ON COLUMN profiles.leve_ingaggio IS 'Section 8: Engagement levers and scripts';
COMMENT ON COLUMN profiles.raccomandazioni_prodotti IS 'Section 9: Product recommendations';
COMMENT ON COLUMN profiles.piano_contatto IS 'Section 10: Contact plan and strategy';

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO clients (nome, cognome, localita, ruolo, settore, link_social, sito_web)
VALUES
  ('Mario', 'Rossi', 'Milano, Italia', 'CEO', 'Technology',
   ARRAY['https://linkedin.com/in/mariorossi'], 'https://mariorossi.com'),
  ('Laura', 'Bianchi', 'Roma, Italia', 'CFO', 'Finance',
   ARRAY['https://linkedin.com/in/laurabianchi', 'https://twitter.com/laurabianchi'],
   'https://laurabianchi.com');
*/

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Drop all tables (use with caution!)
/*
DROP TABLE IF EXISTS financial_plans CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
*/

-- View all clients with their profiles
/*
SELECT
  c.id,
  c.nome,
  c.cognome,
  c.localita,
  c.created_at,
  p.id as profile_id,
  p.created_at as profile_created_at,
  fp.id as plan_id,
  fp.created_at as plan_created_at
FROM clients c
LEFT JOIN profiles p ON c.id = p.client_id
LEFT JOIN financial_plans fp ON p.id = fp.profile_id
ORDER BY c.created_at DESC;
*/
