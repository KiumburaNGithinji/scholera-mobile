---
phase: 01-scaffold
plan: 04
subsystem: database
tags: [supabase, postgres, sql, migration, seed, rls, typescript-types]

requires:
  - phase: 01-scaffold/03
    provides: lib/supabase.ts (singleton), types/database.types.ts (stub)
provides:
  - 11-table schema in live Supabase project (htlolqbwhulyihguwdoq) with RLS enabled
  - Seed data with 3 demo users (admin/professor/student) + 2 courses + 4 modules + 6 items + 6 roadmap nodes + 16 topics + 5 student progress rows
  - Fully-typed types/database.types.ts mirroring the migration (hand-typed; CLI gen blocked by cross-account)
affects: [02-design-foundations, 03-auth-and-router, 04-admin, 05-professor, 06-student, 07-shared-and-deep-link]

tech-stack:
  added: []
  patterns:
    - "Idempotent SQL seed via stable UUIDs + ON CONFLICT DO NOTHING (UPSERT for student_progress)"
    - "Postgres DO block guard for ALTER TABLE ADD CONSTRAINT (no IF NOT EXISTS in DDL)"
    - "auth.users + auth.identities pair for email-password login (PITFALLS P1-E)"
    - "Two-status roadmap pattern: roadmap_items.professor_status + student_progress.status (independent, separate tables)"

key-files:
  created:
    - supabase/migrations/00000000000001_initial_schema.sql
    - supabase/seed.sql
  modified:
    - types/database.types.ts (replaced stub with fully-typed schema)

key-decisions:
  - "Hand-typed database.types.ts because Supabase CLI gen-types is blocked: project htlolqbwhulyihguwdoq is owned by an account the local CLI is not logged into. Hand types mirror the migration 1:1 — regenerate via --db-url fallback if schema changes."
  - "Migration ADD CONSTRAINT wrapped in pg_constraint guard DO block (Postgres has no native ADD CONSTRAINT IF NOT EXISTS). Caught when first SQL Editor run failed; fixed and re-ran clean."
  - "Topics table has no unique constraint on (roadmap_item_id, label), so seed wraps topic inserts in an existence check to avoid duplication on re-run."
  - "auth.identities ON CONFLICT clause uses (provider, provider_id) — the actual unique constraint, not (id) which the original draft had."

patterns-established:
  - "Two-status roadmap: professor_status lives on roadmap_items, student_progress.status lives on a separate table — Phase 6 (student) will read both in one query, never conflate."
  - "All 11 tables RLS-enabled with explicit policies for admin (read-all), professor (CRUD own course), student (CRUD own progress + read enrolled). No silent allow-all."

requirements-completed: []

duration: ~30min (across 2 SQL editor runs + 1 hand-typed types file + sql syntax fix)
completed: 2026-04-25
---

# Phase 01 / Plan 04 — Schema, Seed, Types Summary

**Live Supabase schema applied to project `htlolqbwhulyihguwdoq` — 11 tables with RLS, 3 demo accounts (admin/prof/student) ready for sign-in, fully-typed `database.types.ts` so every Phase 2+ query gets full TypeScript autocomplete.**

## Performance

- **Duration:** ~30 min (one SQL syntax fix mid-run; one types regeneration fallback)
- **Started:** 2026-04-25
- **Completed:** 2026-04-25
- **Tasks:** 5

## Accomplishments

- Migration applied to live Supabase project — 11 tables (`profiles`, `departments`, `programs`, `courses`, `enrollments`, `announcements`, `modules`, `module_items`, `roadmap_items`, `topics`, `student_progress`), all with RLS enabled and ~22 policies covering admin / professor / student access patterns
- Seed populated:
  - 3 auth.users + 3 auth.identities rows (email login functional for all 3 demo accounts)
  - 3 profiles (Alex Admin, Dr. Priya Nair, Sam Student)
  - 2 departments, 1 program
  - 2 courses (CS-411 Neural Networks, CS-201 DSA), enrolled student in both
  - 2 announcements on Course 1
  - 4 modules (2 per course) with 6 module items (file/link/note types)
  - 6 roadmap items with realistic professor_status mix (4 complete, 1 in_progress, 1 not_started)
  - 16 AI-extracted-style topics across 4 roadmap items
  - 5 student_progress rows (Sam has personal progress on most Week 1 items)
- `types/database.types.ts` hand-rewritten with full Row / Insert / Update typing for all 11 tables — `npx tsc --noEmit` passes

## Task Commits

1. **Task 1: Write initial schema migration SQL** — `e646acf` (feat)
2. **Task 2: Apply migration in Supabase SQL Editor** — checkpoint, no commit (live DB only)
   - **Mid-task fix:** `a8ffbbc` (fix) — replaced `add constraint if not exists` with a `pg_constraint` guard DO block, after first paste returned `ERROR 42601: syntax error at or near "not"`
3. **Task 3: Write seed.sql** — `689df35` (feat)
4. **Task 4: Apply seed in Supabase SQL Editor** — checkpoint, no commit (live DB only)
5. **Task 5: Replace types stub with fully-typed schema** — `<this-commit>` (feat)

## Files Created/Modified

- `supabase/migrations/00000000000001_initial_schema.sql` — 327 lines (schema + RLS policies + ADD CONSTRAINT guard)
- `supabase/seed.sql` — 200+ lines (idempotent demo data)
- `types/database.types.ts` — 280 lines, all 11 tables, full typing

## Decisions Made

- **Hand-typed database.types.ts** instead of regenerating from live schema. Rationale: the `htlolqbwhulyihguwdoq` Supabase project is owned by a different account than the one this machine's `supabase` CLI is logged into (CLI shows ATLAS, KNG Cuts, monmouth.edu, IEEE-ACM but not htlolqbwhulyihguwdoq). `gen types --project-id` returns 401. Alternatives were: (a) login-switch the CLI; (b) `gen types --db-url` with the DB password. Hand-typing was the lowest-friction path given the schema is small and matches the migration 1:1.
- **Topics seed wrapped in existence check** instead of relying on `ON CONFLICT` because the `topics` table has no unique constraint on `(roadmap_item_id, label)`. Prevents duplicate seed rows on re-run.
- **auth.identities `ON CONFLICT (provider, provider_id)`** instead of `(id)` because the actual unique constraint Supabase enforces is on the (provider, provider_id) pair, not the primary key. This is documented in the Supabase auth schema.

## Deviations from Plan

### Auto-fixed Issues

**1. [Postgres syntax] `ADD CONSTRAINT IF NOT EXISTS` not supported**
- **Found during:** Task 2 (first SQL Editor run)
- **Issue:** Migration line 32 used `alter table public.profiles add constraint if not exists fk_profiles_department ...` — Postgres has no `IF NOT EXISTS` clause for `ADD CONSTRAINT`, only for `CREATE TABLE` / `CREATE INDEX` etc.
- **Fix:** Wrapped the `ALTER TABLE ... ADD CONSTRAINT` in a `DO $$` block that first checks `pg_constraint` for an existing constraint by name, only adds if absent.
- **Files modified:** `supabase/migrations/00000000000001_initial_schema.sql`
- **Verification:** Migration re-paste in SQL Editor returned success; user confirmed 11 tables visible.
- **Committed in:** `a8ffbbc` (separate fix commit; the original migration was committed in `e646acf`)

**2. [Cross-account auth] `supabase gen types --project-id` returns 401**
- **Found during:** Task 5
- **Issue:** Local `supabase` CLI is logged into a Supabase account that does not own project `htlolqbwhulyihguwdoq`. `gen types --project-id htlolqbwhulyihguwdoq` returns "Your account does not have the necessary privileges".
- **Fix:** Hand-wrote `types/database.types.ts` from the migration spec (small, stable schema makes this reliable). Documented in the file header how to regenerate via `--db-url` fallback if/when schema changes.
- **Files modified:** `types/database.types.ts`
- **Verification:** `npx tsc --noEmit` exits 0; `app.types.ts` types resolve to fully-typed Row shapes.
- **Committed in:** Task 5 commit.

---

**Total deviations:** 2 auto-fixed (1 SQL syntax, 1 CLI auth fallback)
**Impact on plan:** Migration fix was necessary (would have blocked Phase 2 entirely); types fallback is functionally equivalent to gen-types output. No scope creep.

## Issues Encountered

- The CLI cross-account problem is a recurring nuisance — every time we'd want to refresh types, we'd hit the same wall. If schema changes are needed in Phases 3+, either (a) update the CLI auth via `npx supabase login` with a token from the htlolqbwhulyihguwdoq dashboard, or (b) run `npx supabase gen types --db-url ...` with the DB password. Documented in the types file header.

## User Setup Required

None remaining — both SQL applies completed at user checkpoints.

## Next Phase Readiness

- Live Supabase schema + seed + working email auth = Phase 3 (auth + role router) can sign in immediately with `prof@demo.scholera.test` / `demo-password-1234` against the real backend.
- Fully-typed `Database` interface = Phases 2+ get autocomplete on every query (e.g., `.from('roadmap_items').select('professor_status')` is type-checked).
- Two-status data model (roadmap_items.professor_status separate from student_progress.status) is in place — Phase 6 (student roadmap) builds the dual-display UI on top of this.

---
*Phase: 01-scaffold*
*Completed: 2026-04-25*
