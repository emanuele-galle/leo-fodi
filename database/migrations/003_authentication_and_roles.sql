-- Migration: Add Authentication and User Roles System
-- Execute this script in your Supabase SQL Editor

-- 1. Create users profile table with roles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add user_id column to existing tables
ALTER TABLE lead_searches ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE financial_plans ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Create indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_lead_searches_user_id ON lead_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_plans_user_id ON financial_plans(user_id);

-- 4. Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Update RLS policies for lead_searches
DROP POLICY IF EXISTS "Users can read own searches" ON lead_searches;
CREATE POLICY "Users can read own searches"
  ON lead_searches
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admin can read all searches"
  ON lead_searches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own searches"
  ON lead_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 7. Update RLS policies for clients
DROP POLICY IF EXISTS "Users can read own clients" ON clients;
CREATE POLICY "Users can read own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admin can read all clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 8. Update RLS policies for profiles
DROP POLICY IF EXISTS "Users can read own profiles" ON profiles;
CREATE POLICY "Users can read own profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IS NULL OR
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- 9. Update RLS policies for financial_plans
DROP POLICY IF EXISTS "Users can read own plans" ON financial_plans;
CREATE POLICY "Users can read own plans"
  ON financial_plans
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IS NULL OR
    profile_id IN (
      SELECT p.id FROM profiles p
      JOIN clients c ON p.client_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can read all plans"
  ON financial_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own plans"
  ON financial_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    profile_id IN (
      SELECT p.id FROM profiles p
      JOIN clients c ON p.client_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- 10. Function to automatically create user_profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.email = 'emanuelegalle@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 12. Insert admin user profile if exists
INSERT INTO public.user_profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name', 'admin'
FROM auth.users
WHERE email = 'emanuelegalle@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 13. Update existing records to link to users (optional - run if you have existing data)
-- UPDATE clients SET user_id = (SELECT id FROM auth.users WHERE email = 'emanuelegalle@gmail.com' LIMIT 1) WHERE user_id IS NULL;
-- UPDATE lead_searches SET user_id = (SELECT id FROM auth.users WHERE email = 'emanuelegalle@gmail.com' LIMIT 1) WHERE user_id IS NULL;
