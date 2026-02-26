-- Check profile with ID 8e5dfc0d-3a98-4056-bd9b-972552676e4d
SELECT 
  id,
  target_id,
  nome,
  cognome,
  created_at,
  jsonb_object_keys(profile_data) as data_keys
FROM osint_profiles
WHERE target_id = '8e5dfc0d-3a98-4056-bd9b-972552676e4d'
   OR id::text = '8e5dfc0d-3a98-4056-bd9b-972552676e4d';
