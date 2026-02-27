# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

LEO-FODI is an AI-powered OSINT profiling and financial planning system for the insurance sector. It features:
- Multi-agent AI system using XAI (grok-4-fast-reasoning)
- OSINT profiler for client analysis (async via pg-boss job queue)
- Financial planner for personalized insurance recommendations
- Lead finder with Google Places, Pagine Gialle, and InfoCamere integration
- Authentication system with user approval workflow (Better Auth)

## Tech Stack

### Core Framework
- **Next.js**: 16.1.6 (App Router with Turbopack)
- **React**: 19.2.4
- **TypeScript**: Strict mode enabled
- **Node.js**: v18+ required

### UI & Styling
- **Tailwind CSS**: 4.x
- **Shadcn/ui**: Component library based on Radix UI
- **Lucide React**: Icon system
- **Framer Motion**: Animations
- **Recharts**: Charts and data visualization

### Backend & Database
- **Prisma**: 7.4.1 (ORM with PostgreSQL adapter)
- **PostgreSQL**: Shared via `vps-panel-postgres` on Docker network `panel-internal`
- **Redis**: ioredis 5.9.3 (rate limiting, caching)
- **pg-boss**: 10.4.2 (durable job queue for async OSINT profiling)

### Authentication
- **Better Auth**: 1.4.19
  - Email/password authentication
  - Admin plugin for user management
  - Cookie cache (5 min) for session performance
  - Custom fields: `role` (string), `approved` (boolean)

### AI & Agents
- **XAI API**: Grok models (grok-4-fast-reasoning, grok-4-fast-non-reasoning)
- Multi-agent OSINT orchestrator (`lib/osint/orchestrator.ts`)
- Financial planner agent (`lib/ai/financial-planner.ts`)

### Data Sources & Scraping
- **ScrapeCreators API**: Social media scraping (LinkedIn, Facebook, Instagram)
- **Google Places API**: `@googlemaps/google-maps-services-js`
- **Cheerio**: HTML parsing
- **Apify**: Third-party scraping integration

### Validation
- **Zod**: 4.1.12 (schema validation)
- **React Hook Form**: 7.65.0

### Testing
- **Vitest**: 4.x (unit and integration testing)

## Key Commands

```bash
npm run dev          # Development (Turbopack)
npm run build        # Production build (prisma generate + next build)
npm start            # Start production server
npm run lint         # ESLint
npm test             # Run all tests (vitest)
npm run test:unit    # Unit tests only
npm run test:integration  # Integration tests (requires running server)
```

## Project Structure

```
leo-fodi/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API endpoints
│   │   ├── admin/               # Admin operations (user management)
│   │   ├── debug/               # Debug endpoints (dev only)
│   │   ├── financial-planner/   # Financial planning (archive)
│   │   ├── health/              # Health check (DB + Redis)
│   │   ├── lead-finder/         # Lead search archive
│   │   ├── leads/               # Lead extraction (POST/GET)
│   │   ├── osint/               # OSINT profiling (profile, profiles, jobs)
│   │   ├── planning/            # Legacy financial planning
│   │   └── profiling/           # Legacy OSINT profiling (deprecated)
│   ├── dashboard/               # Admin dashboard
│   ├── login/ register/         # Auth pages
│   └── pending-approval/        # Waiting room
├── lib/                          # Core business logic
│   ├── ai/                      # XAI client & legacy agents
│   ├── auth.ts                  # Better Auth configuration
│   ├── auth-client.ts           # Client-side auth
│   ├── auth/                    # Server auth utilities
│   ├── cache/                   # In-memory caching
│   ├── db.ts                    # Prisma client
│   ├── leads/                   # Lead extraction workers
│   ├── osint/                   # OSINT orchestrator, agents, job queue
│   ├── prompts/                 # AI prompt templates
│   ├── queue/                   # pg-boss queue setup
│   ├── redis.ts                 # Redis client
│   ├── types/                   # TypeScript definitions
│   └── validations/             # Zod schemas
├── components/                   # React components
│   ├── auth/                    # AuthProvider, login/register forms
│   ├── ui/                      # Shadcn/ui base components
│   └── ...                      # Feature-specific components
├── prisma/
│   └── schema.prisma            # Database schema (11 models + auth)
├── tests/                        # Test suites
│   ├── unit/                    # Unit tests (middleware, validations)
│   └── integration/             # Integration tests (API auth, health)
├── middleware.ts                 # Auth & routing middleware
└── vitest.config.ts             # Test configuration
```

## Authentication & Authorization

### Better Auth Configuration (`lib/auth.ts`)
- `additionalFields`: `role` (string, default "user"), `approved` (boolean, default false)
- `cookieCache`: enabled, 5-minute TTL
- `plugins`: admin()
- Session type exported as `Session` from `lib/auth`

### Middleware (`middleware.ts`)
- Reads session cookie via `getSessionCookie()` from better-auth
- Public routes: `/login`, `/register`, `/pending-approval`, `/api/auth`
- Protected routes redirect to `/login` without cookie
- Dashboard/app routes verify `approved` flag via `auth.api.getSession()`
- Non-approved users redirected to `/pending-approval`

### User Flow
1. Register → creates user with `approved: false`
2. Wait on `/pending-approval`
3. Admin approves via `/dashboard/user-approvals`
4. User accesses protected routes

### API Auth Pattern
All API routes use `getServerSession()` from `lib/auth/server.ts`:
```typescript
const session = await getServerSession()
if (!session?.user) return 401
const userId = session.user.id
// Use userId in queries for data isolation
```

## Database

### Connection
- Host: `vps-panel-postgres` (Docker network)
- Prisma schema: `prisma/schema.prisma`
- Prisma client output: `app/generated/prisma`

### Key Models
- `User` → Better Auth managed, with `role` and `approved` fields
- `OsintProfile` → OSINT analysis results (JSON profileData), unique `targetId`
- `LeadSearch` → Lead extraction jobs with status tracking
- `Lead` → Individual leads with affidabilita scores
- `FinancialPlan` → Financial recommendations
- `OsintJob` → Async job tracking for pg-boss queue

### Migrations
```bash
npx prisma migrate dev    # Dev migration
npx prisma generate       # Regenerate client
npx prisma db push        # Push schema changes
```

## Deployment

- **Docker** on VPS fodivps2.cloud
- **Domain**: leo-fodi.fodivps2.cloud
- **CI/CD**: GitHub Actions (push to main → deploy)
- **Rebuild**: `/home/sviluppatore/scripts/docker-smart-rebuild.sh app --no-cache`

## Important Notes

- **IDOR Protection**: All data queries filter by `userId` — never return data belonging to other users
- **No CORS wildcard**: CORS is handled by Traefik/Next.js, not custom OPTIONS handlers
- **Debug endpoints**: Protected by `NODE_ENV !== 'development'` guard
- **Rate limiting**: OSINT profiling endpoint has rate limits (disabled in dev)
- **Legacy endpoints**: `/api/profiling` and `/api/planning` are deprecated — use `/api/osint/profile` and `/api/financial-planner/*`
- **Session typing**: Use `(session.user as { role?: string })?.role` — never `as any`
- **Async jobs**: OSINT profiling uses pg-boss queue with fallback to in-process execution
