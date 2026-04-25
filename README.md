# Scholera Mobile

Native mobile LMS companion for Scholera — a role-aware React Native app where admin, professor, and student each get a distinct home experience after login.

## Status

Phase 1 / 8 — **Scaffold complete.** Screens and auth wiring land in Phases 2 and 3. Full setup instructions, framework rationale, and screenshots will be added in Phase 8 (final).

## Stack

- **Expo SDK 54** + TypeScript (strict)
- **Expo Router v4** — file-based routing + native deep linking
- **NativeWind 4.2.3** — Tailwind in React Native, role-specific accent via CSS variables
- **Supabase** — Auth + Postgres + Storage (project: `htlolqbwhulyihguwdoq`)
- **TanStack Query v5** — server state + optimistic updates
- **Zod v3** + **react-hook-form** — form validation

## Running locally (placeholder — full guide in Phase 8)

```bash
# Install deps (first time only)
npm install

# Copy .env.example and fill in real Supabase values
cp .env.example .env.local
# Edit .env.local — set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# Start the dev server
npx expo start
```

Demo accounts (after applying `supabase/seed.sql`):
- `admin@demo.scholera.test` / `demo-password-1234`
- `prof@demo.scholera.test` / `demo-password-1234`
- `student@demo.scholera.test` / `demo-password-1234`

## Repo layout

```
app/              Expo Router routes (populated Phase 2+)
components/ui/    Shared UI primitives (Phase 2)
hooks/            TanStack Query wrappers (Phase 3+)
queries/          Supabase query functions (Phase 3+)
lib/supabase.ts   Supabase client singleton
providers/        AuthProvider, QueryClientProvider (Phase 3)
theme/            Design tokens (Phase 2)
types/            Database + app-level types
supabase/         SQL migrations + seed
scripts/          Dev/CI scripts (smoke checks)
.planning/        GSD planning artifacts (docs, not secrets)
reference/        Original assignment + design direction
```

## License

Private take-home assignment for Scholera Mobile Developer Intern role — not for public redistribution.
