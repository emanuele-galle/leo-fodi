# Supabase Schema Cache Fix

## Problema
```
Could not find the 'raw_data_sc' column of 'leads' in the schema cache
```

La colonna `raw_data_sc` esiste nel database ma Supabase PostgREST non ha aggiornato il suo schema cache.

## Soluzione

### Opzione 1: Riavvio Progetto Supabase (RACCOMANDATO)

1. Vai su **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il progetto: **qojkzwggtblyzboqgvro**
3. Settings → Database → **Connection pooling**
4. Click su **"Restart"** o **"Refresh schema cache"**

### Opzione 2: SQL Command (Manuale)

Esegui nel **SQL Editor** di Supabase:

```sql
-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leads'
AND column_name = 'raw_data_sc';
```

### Opzione 3: PostgREST API (Automatico)

```bash
curl -X POST \
  https://qojkzwggtblyzboqgvro.supabase.co/rest/v1/rpc/reload_schema \
  -H "apikey: ANON_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

## Verifica Fix

Dopo il riavvio, esegui una nuova estrazione lead per verificare che l'errore sia scomparso.

**Log atteso**:
```
[Worker] ✅ Cleaned raw_data_sc for 3 leads
```

---

**Nota**: Questo problema si verifica quando si aggiungono nuove colonne al database mentre PostgREST è in esecuzione. Il cache viene normalmente aggiornato ogni 10 minuti, ma un riavvio manuale è più veloce.
