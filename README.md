# LEO-FODI - Sistema AI di Profilazione e Pianificazione Finanziaria

Sistema avanzato basato su agenti AI per la profilazione OSINT di clienti e la pianificazione finanziaria nel settore assicurativo.

## Caratteristiche Principali

- **Agente OSINT Profiler**: Analisi approfondita della presenza online e dei bisogni assicurativi del cliente
- **Agente Financial Planner**: Pianificazione finanziaria personalizzata basata sul profilo OSINT
- **Interfaccia Dashboard**: UI moderna e intuitiva con visualizzazione completa dei dati
- **Architettura Multi-Agente**: Utilizzo di XAI (grok-4-fast-reasoning) con API keys separate per ogni agente
- **Database PostgreSQL**: Storage sicuro su Supabase

## Stack Tecnologico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, Shadcn/ui components
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **AI**: XAI API (grok-4-fast-reasoning)
- **Validazione**: Zod, React Hook Form

## Setup del Progetto

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Configurazione Supabase

1. Crea un account su [Supabase](https://supabase.com)
2. Crea un nuovo progetto
3. Vai su SQL Editor ed esegui lo script `lib/supabase/schema.sql`
4. Copia URL e ANON KEY del progetto

### 3. Configurazione Variabili Ambiente

Edita il file `.env.local` con le tue credenziali:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# XAI API Configuration
XAI_API_KEY_OSINT=your-xai-osint-key
XAI_API_KEY_FINANCIAL=your-xai-financial-key
XAI_API_URL=https://api.x.ai/v1
XAI_MODEL=grok-4-fast-reasoning
```

### 4. Ottenere API Keys XAI

1. Registrati su [X.AI](https://x.ai)
2. Genera due API keys separate:
   - Una per l'agente OSINT (`XAI_API_KEY_OSINT`)
   - Una per l'agente Financial (`XAI_API_KEY_FINANCIAL`)

### 5. Avvio del Server di Sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## Utilizzo dell'Applicazione

### Area di Profilazione

1. **Inserimento Dati Cliente**
   - Compila il form con dati anagrafici del cliente
   - Aggiungi link ai profili social (LinkedIn, Twitter, ecc.)
   - Inserisci sito web se disponibile
   - Click su "Avvia Profilazione OSINT"

2. **Analisi OSINT**
   - L'agente AI analizza i dati pubblici disponibili
   - Genera un profilo completo con insight azionabili

### Area Pianificazione Finanziaria

1. **Attivazione**
   - Disponibile solo dopo completamento profilo OSINT
   - Click su "Avvia Pianificazione Finanziaria"

2. **Analisi Finanziaria**
   - L'agente AI analizza il profilo OSINT
   - Genera un piano completo con raccomandazioni

## Architettura Sistema Multi-Agente

### Agente OSINT Profiler
- Analizza la presenza online del cliente
- Mappa bisogni assicurativi
- Propone strategie di ingaggio

### Agente Financial Planner
- Crea piano finanziario personalizzato
- Analizza gap e priorità
- Raccomanda prodotti con razionale

## API Endpoints

- `POST /api/profiling` - Crea cliente ed esegue profilazione OSINT
- `GET /api/profiling?clientId={id}` - Recupera profilo esistente
- `POST /api/planning` - Crea piano finanziario
- `GET /api/planning?clientId={id}` - Recupera piano esistente

## Deployment su Vercel

1. Collega il repository GitHub a Vercel
2. Configura le variabili ambiente
3. Deploy automatico

```bash
npm run build
vercel --prod
```

## Troubleshooting

### Errore "Missing Supabase environment variables"
Verifica che `.env.local` contenga tutte le variabili necessarie

### Errore "XAI API Error"
Verifica che le API keys XAI siano valide e non abbiano raggiunto il limite

### Errore "Failed to save profile"
Verifica che lo schema database sia stato creato correttamente in Supabase

## Sicurezza

- API keys gestite lato server
- Connessione Supabase con RLS
- Validazione input con Zod
- Nessun tracciamento GDPR

---

**Sviluppato con Next.js 14, XAI, e Supabase**
