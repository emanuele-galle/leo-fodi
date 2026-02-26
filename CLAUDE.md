# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LEO-FODI is an AI-powered OSINT profiling and financial planning system for the insurance sector. It features:
- Multi-agent AI system using XAI (grok-4-fast-reasoning)
- OSINT profiler for client analysis
- Financial planner for personalized insurance recommendations
- Lead finder with Google Places, Pagine Gialle, and InfoCamere integration
- Authentication system with user approval workflow

## Tech Stack

### Core Framework
- **Next.js**: 15.5.5 (App Router with Turbopack)
- **React**: 19.1.0
- **TypeScript**: Strict mode enabled
- **Node.js**: v18+ required

### UI & Styling
- **Tailwind CSS**: 4.x
- **Shadcn/ui**: Component library based on Radix UI
- **Lucide React**: Icon system (v0.545.0)
- **Radix UI**: Accessible component primitives

### Backend & Database
- **Next.js API Routes**: RESTful endpoints
- **Server Actions**: Server-side mutations
- **Supabase**: PostgreSQL with Row Level Security (RLS)
  - `@supabase/supabase-js`: v2.75.0
  - `@supabase/ssr`: v0.7.0

### AI & Agents
- **XAI API**: Grok models (grok-4-fast-reasoning)
- **LangChain**: v1.0.1 (agent orchestration)
  - `@langchain/core`: v1.0.1
  - `@langchain/langgraph`: v1.0.0

### Data Sources & Scraping
- **ScrapeCreators API**: Professional social media scraping (LinkedIn, Facebook, Instagram, Google Search)
- **Google Places API**: `@googlemaps/google-maps-services-js` v3.4.2
- **Puppeteer**: v24.25.0 (headless browser for scraping)
- **Cheerio**: v1.1.2 (HTML parsing)
- **Axios**: v1.12.2 (HTTP client)
- **Apify**: Third-party API integration

### Validation & Forms
- **Zod**: v4.1.12 (schema validation)
- **React Hook Form**: v7.65.0
- **@hookform/resolvers**: v5.2.2

### Testing
- **Jest**: Unit and integration testing (configured)

## Key Commands

```bash
# Development (uses Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Quick Start

### First Time Setup

1. **Clone the repository** and install dependencies:
```bash
git clone <repository-url>
cd leo-fodi
npm install
```

2. **Configure environment variables**:
```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your API keys
# Required: SUPABASE_*, XAI_API_KEY
# Recommended: GOOGLE_PLACES_API_KEY, SCRAPECREATORS_API_KEY
```

3. **Set up Supabase database**:
   - Create a project at https://supabase.com
   - Run the schema in `lib/supabase/schema.sql` via SQL Editor
   - Copy the project URL and keys to `.env.local`

4. **Start development server**:
```bash
npm run dev
```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Register a new account
   - Wait for admin approval (or manually set `approved: true` in `user_profiles` table)

### Verify Installation

**Check database connection**:
```bash
# Use Supabase MCP if configured, or check Supabase dashboard
```

**Check API keys**:
- XAI: Test OSINT profiler or Financial planner
- Google Places: Test lead generation with query
- ScrapeCreators: Test social media enrichment

**Check server health**:
- Visit http://localhost:3000
- Check browser console for errors
- Monitor terminal for API errors

## Project Structure

```
leo-fodi/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API endpoints
│   │   ├── admin/               # Admin operations (user approvals)
│   │   ├── financial-planner/   # Financial planning agent
│   │   ├── leads/               # Lead generation & enrichment
│   │   ├── osint/               # OSINT profiling agent
│   │   ├── planning/            # Legacy financial planning
│   │   └── profiling/           # Legacy OSINT profiling
│   ├── dashboard/               # Admin dashboard (user approvals)
│   ├── financial-planner/       # Financial planning UI
│   ├── lead-finder/             # Lead generation UI
│   ├── osint-profiler/          # OSINT profiling UI
│   ├── login/                   # Auth pages
│   ├── register/
│   └── pending-approval/
├── lib/                          # Core business logic
│   ├── ai/                      # AI client & agent logic
│   ├── auth/                    # Supabase auth utilities
│   ├── cache/                   # In-memory caching layer
│   ├── leads/                   # Lead data extraction
│   ├── monitoring/              # API cost tracking
│   ├── osint/                   # OSINT processing
│   ├── prompts/                 # AI prompt templates
│   ├── supabase/                # DB client & schema
│   ├── types/                   # TypeScript definitions
│   └── validations/             # Zod schemas
├── components/                   # React components
│   ├── auth/                    # Auth forms
│   ├── layout/                  # Header, nav, footer
│   ├── leads/                   # Lead finder components
│   ├── planning/                # Financial plan displays
│   ├── profiling/               # OSINT profile displays
│   └── ui/                      # Shadcn/ui base components
├── middleware.ts                 # Auth & routing middleware
└── database/                     # Database schema & migrations
```

## Core Architecture Concepts

### 1. Multi-Agent AI System

Two separate XAI agents with dedicated API keys:

- **OSINT Profiler** (`lib/ai/osint-profiler.ts`): Analyzes client data to generate comprehensive profiles with 10 sections (identity, digital presence, authority signals, work model, vision/goals, lifestyle, needs mapping, engagement levers, product recommendations, contact plan)

- **Financial Planner** (`lib/prompts/financial-agent.ts`): Creates financial plans based on OSINT profiles with 6 sections (financial goals, gap analysis, recommended sequence, tax insights, product recommendations, value summary)

Both agents use structured JSON output and are called via `lib/ai/xai-client.ts` with retry logic.

### 2. Authentication & Authorization Flow

**Middleware** (`middleware.ts`):
- Checks Supabase session using `getUser()` (not `getSession()`)
- Public routes: `/login`, `/register`, `/pending-approval`
- Protected routes require authentication
- Admin routes (`/dashboard`, `/monitoring`) require `role: 'admin'`
- Non-approved users redirected to `/pending-approval`

**User Flow**:
1. Register → creates user in Supabase Auth + `user_profiles` table with `approved: false`
2. Wait on `/pending-approval`
3. Admin approves via `/dashboard/user-approvals`
4. User can access protected routes

### 3. Lead Generation System

**Three-tier data extraction** (`lib/leads/`):

**Priority 1 - Official APIs** (highest reliability):
- Google Places API: business info, reviews, contact data
- InfoCamere API: official Italian business registry (P.IVA, C.F., revenue, employees)

**Priority 2 - Third-party APIs**:
- Apify Pagine Gialle scraper: business directory data via managed API

**Priority 3 - Headless scraping**:
- Puppeteer + Cheerio: direct scraping of Pagine Gialle when APIs unavailable

**AI Enrichment**:
- XAI Grok: extracts emails, mobile phones, key contacts from websites

**Caching**:
- In-memory cache with TTL (`lib/cache/cache-service.ts`)
- TTL presets: SHORT (5m), MEDIUM (30m), LONG (2h), DAY (24h), WEEK (7d)
- Reduces API costs and improves performance

### 4. Database Schema

**Main Tables** (see `lib/supabase/schema.sql`):

- `user_profiles`: User accounts with roles (admin/sales/partner) and approval status
- `clients`: Basic client information
- `profiles`: OSINT analysis results (JSONB sections)
- `financial_plans`: Financial planning results (JSONB sections)
- `leads`: Generated leads with business data
- `enrichment_history`: Track lead enrichment operations
- `api_usage_logs`: Monitor API costs and usage

**Security**:
- Row Level Security (RLS) enabled on all tables
- Policies enforce user-level data isolation
- Cascade deletes maintain referential integrity
- Auto-updating `updated_at` timestamps

### 5. API Cost Monitoring

**Tracking** (`lib/monitoring/api-cost-tracker.ts`):
- Logs every API call with cost, tokens, provider
- Calculates daily/monthly spending
- Alerts at 80% of budget (`MONTHLY_API_BUDGET`)
- Stored in `api_usage_logs` table

**Dashboard** (`/monitoring`):
- Real-time cost visualization
- Provider breakdown
- Usage trends

## Environment Variables

**Configuration Files**:
- `.env.example`: Template file with all available variables (committed to git)
- `.env.local`: Your actual API keys and secrets (NEVER commit to git, protected by .gitignore)

**Setup Instructions**:
1. Copy `.env.example` to `.env.local`: `cp .env.example .env.local`
2. Replace placeholder values with your actual API keys
3. Restart dev server to apply changes

**Required Variables** (see `.env.example` for full list):

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# XAI AI (required for core features)
XAI_API_KEY=
XAI_API_URL=https://api.x.ai/v1
XAI_MODEL=grok-4-fast-non-reasoning

# Google Places (recommended)
GOOGLE_PLACES_API_KEY=

# Apify (optional - Pagine Gialle)
APIFY_API_TOKEN=
APIFY_PAGINE_GIALLE_ACTOR_ID=nmdmnd/pagine-gialle

# InfoCamere (optional - official registry)
INFOCAMERE_API_KEY=
INFOCAMERE_API_SECRET=

# Monitoring
MONTHLY_API_BUDGET=200
```

## Working with Database

**Schema location**: `lib/supabase/schema.sql`

**To update schema**:
1. Edit `schema.sql` with new migrations
2. Run in Supabase SQL Editor
3. Update TypeScript types in `lib/types/database.ts`
4. Restart dev server to pick up changes

**Client usage**:
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

**Server-side**: Use `createServerClient` from `@supabase/ssr` in API routes or Server Components.

## Working with AI Agents

**OSINT Profiling**:
```typescript
import { createProfile } from '@/lib/ai/osint-profiler'

const profile = await createProfile(clientId, clientData)
// Returns structured JSON with 10 sections
```

**Financial Planning**:
```typescript
import { callFinancialPlannerAgent } from '@/lib/prompts/financial-agent'

const plan = await callFinancialPlannerAgent(profileData)
// Returns structured JSON with 6 sections
```

**XAI Client** (`lib/ai/xai-client.ts`):
- Retry logic with exponential backoff (3 attempts)
- Error handling and logging
- Token usage tracking
- Supports both grok-4-fast-reasoning and grok-4-fast-non-reasoning models

## Working with Lead Generation

**Generate leads**:
```typescript
import { extractBusinessData } from '@/lib/leads/data-extractor'

const businessData = await extractBusinessData({
  query: 'dentista',
  location: 'Milano'
})
```

**Priority cascade**:
1. Try Google Places API first (if configured)
2. Fall back to Apify Pagine Gialle
3. Fall back to Puppeteer headless scraping
4. Enrich with XAI if website available

**Caching**: All data sources use cache to minimize API costs.

## MCP (Model Context Protocol) Servers

**What are MCP Servers?**
MCP servers extend Claude Code capabilities by providing integrations with external services like databases, APIs, and tools.

**Configured Servers** (in `~/.config/claude-code/config.json`):

### 1. Supabase MCP ✅
- **Type**: HTTP
- **URL**: `https://mcp.supabase.com/mcp`
- **Authentication**: Configured with project-specific headers
  - `X-Supabase-Url`: Your Supabase project URL
  - `X-Supabase-Key`: Your Supabase anon key
- **Usage**: Database queries, table inspection, migrations
- **Note**: If you change Supabase projects, update the headers in config.json

### 2. GitHub MCP ✅
- **Type**: stdio (npx)
- **Package**: `@modelcontextprotocol/server-github`
- **Usage**: Repository management, issues, pull requests, commits

### 3. Vercel MCP ✅
- **Type**: HTTP
- **URL**: `https://mcp.vercel.com`
- **Usage**: Deployments, project management, logs

### 4. Hostinger MCP ✅
- **Type**: stdio (npx)
- **Package**: `hostinger-api-mcp`
- **Usage**: VPS management, domains, MySQL databases
- **Environment**: API token configured in env

### 5. Semgrep MCP ✅
- **Type**: stdio (uvx)
- **Package**: `semgrep-mcp`
- **Usage**: Code analysis, security scanning

### 6. Ref MCP ✅
- **Type**: HTTP
- **URL**: `https://api.ref.tools/mcp`
- **Usage**: Documentation search for 1000+ frameworks and libraries
- **API Key**: Configured in headers

**Verify MCP Status**:
```bash
# In Claude Code, use:
/mcp
```

**Important Notes**:
- All MCP configurations are centralized in `~/.config/claude-code/config.json`
- No `.mcp.json` files in project directories
- Supabase MCP requires authentication headers to be updated if you change projects
- To reconfigure an MCP, edit the config.json file and restart Claude Code

## Adding New Features

### Adding a new page/route:
1. Create folder in `app/` with `page.tsx`
2. Add middleware rules in `middleware.ts` if auth required
3. Import Supabase client for data access
4. Use existing UI components from `components/ui/`

### Adding a new API endpoint:
1. Create `route.ts` in `app/api/your-endpoint/`
2. Use `createServerClient` for database access
3. Add Zod validation for request body
4. Handle errors with try-catch and return proper status codes
5. Log API costs if calling external services

### Adding a new AI prompt:
1. Create template in `lib/prompts/`
2. Define system + user prompt with clear instructions
3. Specify JSON output schema
4. Call via `callXAIAgent` from `lib/ai/xai-client.ts`
5. Parse and validate response

### Adding a new data source:
1. Create extractor in `lib/leads/`
2. Implement caching via `CacheService`
3. Add cost tracking via `ApiCostTracker`
4. Update fallback chain in `data-extractor.ts`
5. Add API key to `.env.example`

## Project Maintenance & Best Practices

### File Organization

**Keep the project clean**:
- Only essential files in root directory (CLAUDE.md, README.md, configs)
- No temporary documentation files (status reports, setup guides, etc.)
- No duplicate screenshot/test scripts
- All utilities in `scripts/` directory
- Tests organized in `tests/` directory

**Protected by .gitignore**:
- Temporary docs: `*_STATUS.md`, `*_SUMMARY.md`, `*_REPORT.md`, etc.
- Temp scripts: `capture-*.js`, `screenshot-*.js`, `quick-*.js`, etc.
- Build artifacts: `.next/`, `out/`, `*.tsbuildinfo`
- Environment files: `.env*`

**Root directory structure**:
```
leo-fodi/
├── CLAUDE.md              # Claude Code instructions
├── README.md              # Project documentation
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── next.config.ts         # Next.js config
├── components.json        # Shadcn/ui config
├── middleware.ts          # Auth middleware
├── .eslintrc.json        # ESLint rules
├── .gitignore            # Git ignore patterns
├── app/                  # Next.js pages
├── lib/                  # Business logic
├── components/           # React components
├── database/             # DB schema
├── scripts/              # Utility scripts (3 files)
│   ├── test-cost-tracker.js
│   ├── test-system.js
│   └── verify-database.js
└── tests/                # Integration tests
```

**When adding new files**:
1. Ask: "Is this temporary or permanent?"
2. Temporary docs → add to .gitignore pattern
3. Scripts → place in `scripts/` directory
4. Tests → place in `tests/` directory
5. Code → place in appropriate `app/`, `lib/`, or `components/` folder

### Development Workflow

**Before starting work**:
1. Check if dev server is running (`lsof -i:3000`)
2. Kill old processes if needed: `lsof -ti:3000 | xargs kill -9`
3. Start fresh server: `npm run dev`

**During development**:
- Use TodoWrite tool to track multi-step tasks
- Mark todos as completed immediately after finishing
- Keep context focused on current task
- Avoid creating temporary documentation files

**After major changes**:
- Review for temporary files to remove
- Update CLAUDE.md if architecture changed
- Run tests to verify nothing broke
- Check .gitignore patterns are working

## Important Notes

- **Always use Turbopack**: `npm run dev` uses `--turbopack` flag for faster builds
- **Middleware runs on every request**: Keep logic minimal and fast
- **RLS is enabled**: All database queries are scoped to authenticated user
- **API keys are server-side only**: Never expose XAI/Google keys to client
- **Cost tracking is automatic**: Every external API call is logged
- **Cache is in-memory**: Resets on server restart (upgrade to Redis for production)
- **TypeScript strict mode**: All types must be properly defined
- **Zod validates all inputs**: Never trust user input without validation
- **Keep project clean**: No temporary docs or scripts in root (see Project Maintenance)

### Current System Status (as of 2025-10-30)

**Environment Configuration**:
- ✅ `.env.local` configured with all API keys (Supabase, XAI, Google, ScrapeCreators)
- ✅ `.env.example` template available for new developers
- ⚠️ Never commit `.env.local` to git (protected by .gitignore)

**Database Status**:
- ✅ Supabase project: https://qojkzwggtblyzboqgvro.supabase.co
- ✅ 15 tables configured and operational
- ✅ Active users: 2 (1 admin: emanuelegalle@gmail.com, 1 user: info@fodisrl.it)
- ✅ Data populated: 197 leads, 3 OSINT profiles, 6 clients, 27 OSINT jobs completed

**MCP Servers**:
- ✅ 6 MCP servers configured in `~/.config/claude-code/config.json`
- ✅ Supabase MCP authenticated with project-specific headers
- ⚠️ If changing Supabase projects, update headers in config.json

**Development Server**:
- ✅ Next.js 15.5.5 with Turbopack
- ✅ Running on port 3000
- ✅ Build time: ~1s with Turbopack

## Troubleshooting

**Port already in use**:
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2 && npm run dev
```

**Clear build cache**:
```bash
rm -rf .next && npm run dev
```

**Database connection issues**:
- Verify Supabase credentials in `.env.local`
- Check RLS policies in Supabase dashboard
- Ensure user is authenticated and approved

**AI agent errors**:
- Check XAI API key validity
- Verify API quota/credits
- Review prompt format (must return valid JSON)
- Check retry logic logs

**Lead generation not working**:
- Verify API keys (Google Places, Apify)
- Check cache TTL (may need to clear)
- Review Puppeteer logs for scraping errors
- Ensure browser dependencies installed

## Deployment

**Vercel (recommended)**:
1. Connect GitHub repo
2. Add all environment variables from `.env.local`
3. Deploy automatically on push to main

**Database**:
- Supabase project must be created first
- Run `schema.sql` in Supabase SQL Editor
- Configure RLS policies

**Post-deployment**:
- Test authentication flow
- Verify API keys work in production
- Monitor costs via `/monitoring` dashboard
- Set up backup schedule in Supabase

## Changelog

### 2025-10-30 - Configurazione Iniziale Completata & Rimozione Playwright

**Rimozione Playwright**:
- ❌ Rimosso Playwright dal progetto (mai funzionato correttamente)
- ❌ Eliminato `playwright.config.ts`
- ❌ Eliminata cartella `e2e/`
- ❌ Rimosso MCP Playwright da `~/.config/claude-code/config.json`

**Configurazione API Keys**:
- ✅ Configurato `.env.local` con tutte le chiavi API
- ✅ Creato template `.env.example` per nuovi sviluppatori
- ✅ XAI API (Grok) configurato per agent OSINT e Financial Planner
- ✅ ScrapeCreators API configurata per social scraping
- ✅ Google Places API configurata per lead generation
- ✅ Supabase database verificato e operativo

**Database Verification**:
- ✅ 15 tabelle configurate e operative
- ✅ 197 leads presenti nel database
- ✅ 3 profili OSINT creati
- ✅ 6 clienti registrati
- ✅ 2 utenti attivi (1 admin: emanuelegalle@gmail.com, 1 user: info@fodisrl.it)
- ✅ 27 job OSINT completati

**MCP Configuration**:
- ✅ Supabase MCP autenticato con headers X-Supabase-Url e X-Supabase-Key
- ✅ GitHub MCP attivo
- ✅ Vercel MCP attivo
- ✅ Hostinger MCP attivo
- ✅ Semgrep MCP attivo
- ✅ Ref MCP attivo (documentazione tecnica)

**Dev Server**:
- ✅ Next.js 15.5.5 con Turbopack avviato su porta 3000
- ✅ Tempo di build: ~1054ms
- ✅ Tutti i processi background puliti

### 2025-01-24 - ScrapeCreators Integration V2 (Complete)
**Implemented professional social media scraping** with automatic raw data cleanup:

**New Features**:
- ✅ LinkedIn extractor via ScrapeCreators API (`lib/leads/extractors/linkedin.ts`)
- ✅ Facebook extractor via ScrapeCreators API (`lib/leads/extractors/facebook.ts`)
- ✅ Instagram extractor via ScrapeCreators API (`lib/leads/extractors/instagram.ts`)
- ✅ Centralized ScrapeCreators client (`lib/scrapecreators/client.ts`)
- ✅ Google Search API integration for OSINT enrichment (`lib/leads/enrichment/osint-enricher.ts`)

**Database Updates**:
- Added `raw_data_sc` JSONB column to `leads` table (migration `011_add_raw_data_sc_column.sql`)
- Stores complete API responses temporarily during enrichment
- Added GIN index for query performance
- Updated Lead TypeScript type to include `raw_data_sc` field

**Raw Data Cleanup Strategy** (Two-Tier Approach):
1. **Event-Driven Cleanup** (Primary): Automatic cleanup in `extraction-worker.ts` immediately after enrichment
2. **Scheduled Cleanup** (Safety Net): Nightly cron job removes raw data from leads older than 30 days

**Database Functions**:
- Created `fn_cleanup_lead_raw_data()` function (migration `012_add_raw_data_cleanup_function.sql`)
- Returns cleanup statistics (cleaned_count, execution_time_ms)
- Designed for pg_cron but can be run manually
- Complete setup guide in `database/SUPABASE_CRON_SETUP.md`

**Benefits**:
- 5x faster than Puppeteer (3-5s vs 15-30s per profile)
- 95%+ success rate (vs ~70% with headless browsers)
- Richer data extraction (employees, locations, industry data)
- ~90% database storage saved with automatic cleanup
- Cost: ~$0.10 per profile (predictable pricing)

**Environment Variables**:
- `SCRAPECREATORS_API_KEY`: API key for ScrapeCreators
- `SCRAPECREATORS_BASE_URL`: https://api.scrapecreators.com

**Updated Source Configuration**:
- LinkedIn: Active (reliability 90%)
- Facebook: Active (reliability 85%)
- Instagram: Active (reliability 80%)
- All marked as Priority 2 (Managed Social APIs)

**Documentation**:
- Added comprehensive cron job setup guide (`database/SUPABASE_CRON_SETUP.md`)
- Updated extraction worker with cleanup logic
- Updated OSINT enricher to use ScrapeCreators for search
- Updated `.env.example` with ScrapeCreators configuration

### 2025-01-24 - Project Cleanup
**Removed 50 obsolete files** to improve context and maintainability:
- 36 temporary documentation files (STATUS, SUMMARY, REPORT, etc.)
- 11 duplicate screenshot capture scripts
- 3 obsolete utility scripts

**Added protection**:
- Updated `.gitignore` with comprehensive patterns for temporary files
- Added "Project Maintenance & Best Practices" section to CLAUDE.md
- Documented clean root directory structure

**Current state**:
- Clean root with only essential files
- 3 utility scripts in `scripts/` directory
- Organized test structure in `tests/` directory
- Dev server verified working (Next.js 15.5.5 + Turbopack)
