---
phase: 01-scaffold
plan: 04
type: execute
wave: 4
depends_on:
  - 03
files_modified:
  - supabase/migrations/00000000000001_initial_schema.sql
  - supabase/seed.sql
  - types/database.types.ts
requirements: []
autonomous: false

must_haves:
  truths:
    - "11 tables exist in the Supabase project (htlolqbwhulyihguwdoq) public schema with RLS enabled on every table"
    - "Seed has inserted exactly 3 users into auth.users + matching auth.identities rows (admin, professor, student)"
    - "profiles table has 3 rows — one for each auth user — with roles admin/professor/student"
    - "2 courses × 2 modules × 6 module_items × 6 roadmap_items × 15+ topics × 5 student_progress rows seeded per RESEARCH.md §Seed SQL"
    - "`types/database.types.ts` regenerated from live schema and contains real Row/Insert/Update shapes for all 11 tables"
    - "`npx tsc --noEmit` still passes after type regeneration"
  artifacts:
    - path: "supabase/migrations/00000000000001_initial_schema.sql"
      provides: "Full schema DDL + RLS policies verbatim from RESEARCH.md"
      contains: "create table if not exists public.profiles"
      min_lines: 250
    - path: "supabase/seed.sql"
      provides: "Idempotent seed: 3 users + departments + programs + courses + modules + items + roadmap + topics + progress"
      contains: "demo-password-1234"
      min_lines: 150
    - path: "types/database.types.ts"
      provides: "Real generated types from live schema (overwrites Plan 03 stub)"
      contains: "profiles:"
  key_links:
    - from: "supabase/migrations/00000000000001_initial_schema.sql"
      to: "live Supabase project htlolqbwhulyihguwdoq public schema"
      via: "applied via SQL editor or psql"
      pattern: "create table.*profiles"
    - from: "supabase/seed.sql"
      to: "auth.users + auth.identities"
      via: "bcrypt password insert"
      pattern: "insert into auth\\.(users|identities)"
    - from: "types/database.types.ts"
      to: "live schema (11 tables)"
      via: "supabase gen types typescript --project-id"
      pattern: "export type Database.*Tables.*profiles"
---

<objective>
Apply the schema + seed to the live Supabase project and regenerate TypeScript types. This is the "make the database real" plan — after it, Plan 05 can run a smoke script that greps `types/database.types.ts` for real table definitions and find them.

Purpose: The schema + seed are BOTH stored verbatim in RESEARCH.md (§Schema SQL, §Seed SQL) — this plan copies them into migration files and applies them. The non-trivial part is the seed inserting into `auth.users` AND `auth.identities` (per PITFALLS P1-E — skipping identities means email login silently fails). A verify-after-seed sub-task confirms the rows landed before declaring Wave 4 done.
Output: 11 tables in live DB, 3 authenticatable users, full demo-story content, real database types committed.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md

<interfaces>
The migration SQL and seed SQL are stored VERBATIM in RESEARCH.md. Do not rewrite them — copy them.

- RESEARCH.md §"Schema SQL" has the entire migration file contents (~250 lines: CREATE TABLE for 11 tables + updated_at triggers + RLS enable + RLS policies).
- RESEARCH.md §"Seed SQL" has the entire seed file contents (~200 lines: auth.users + auth.identities + departments + programs + profiles + courses + enrollments + announcements + modules + module_items + roadmap_items + topics + student_progress).
- RESEARCH.md §"Type Generation Command" has the CLI command and the `--db-url` fallback.

After this plan, `types/database.types.ts` replaces Plan 03's stub. `types/app.types.ts` imports from it — no changes needed to app.types.ts because the import path stays the same.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write supabase/migrations/00000000000001_initial_schema.sql verbatim from RESEARCH.md</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/supabase/migrations/00000000000001_initial_schema.sql</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Schema SQL" (lines 373–696, approximately — the entire fenced SQL block under that heading)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md §"Schema definition" (D-05, D-06, D-07 — 11 tables, single migration file, RLS from day one)
  </read_first>
  <action>
    Create `/Users/Kiumbura/Projects/scholera-mobile/supabase/migrations/00000000000001_initial_schema.sql` with the COMPLETE schema SQL verbatim from RESEARCH.md §"Schema SQL".

    The file has 8 sections:
    1. `create extension if not exists "pgcrypto"` (for bcrypt in seed)
    2. Profiles table + FK to departments (added in step 3)
    3. Departments / Programs / Courses / Enrollments
    4. Announcements / Modules / Module_items
    5. Roadmap_items / Topics (with `unique (module_item_id)` on roadmap_items)
    6. Student_progress (with `unique (roadmap_item_id, student_id)`)
    7. `updated_at` trigger function + triggers on 5 tables
    8. RLS enable on all 11 tables + 15+ policies

    READ RESEARCH.md carefully and copy the entire fenced SQL block starting with `-- =============== Scholera Mobile — Initial Schema Migration` and ending just before the next `## Seed SQL` heading. The SQL is approximately 250 lines.

    DO NOT:
    - Truncate the RLS policies section (all 15+ policies are critical — without them, D-07 fails and PITFALLS silent RLS failure is triggered)
    - Change any table names (the downstream app.types.ts hardcodes them — `profiles`, `departments`, etc.)
    - Change column names (type gen will faithfully reflect whatever is applied — if you rename `professor_status` here, app.types.ts's ProfessorStatus no longer matches)
    - Add extra tables the seed doesn't reference
    - Change the `check (...)` constraint values for `role`, `status`, `type`, `professor_status` — they must match app.types.ts literal types

    Reference: RESEARCH.md §Schema SQL, CONTEXT.md D-05/D-06/D-07.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && test -f supabase/migrations/00000000000001_initial_schema.sql && grep -q "create table if not exists public.profiles" supabase/migrations/00000000000001_initial_schema.sql && grep -q "create table if not exists public.departments" supabase/migrations/00000000000001_initial_schema.sql && grep -q "create table if not exists public.courses" supabase/migrations/00000000000001_initial_schema.sql && grep -q "create table if not exists public.modules" supabase/migrations/00000000000001_initial_schema.sql && grep -q "create table if not exists public.module_items" supabase/migrations/00000000000001_initial_schema.sql && grep -q "create table if not exists public.roadmap_items" supabase/migrations/00000000000001_initial_schema.sql && grep -q "create table if not exists public.topics" supabase/migrations/00000000000001_initial_schema.sql && grep -q "create table if not exists public.student_progress" supabase/migrations/00000000000001_initial_schema.sql && grep -q "enable row level security" supabase/migrations/00000000000001_initial_schema.sql && grep -q "create extension if not exists \"pgcrypto\"" supabase/migrations/00000000000001_initial_schema.sql && test $(wc -l < supabase/migrations/00000000000001_initial_schema.sql) -ge 200 && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - File `supabase/migrations/00000000000001_initial_schema.sql` exists
    - Contains `create extension if not exists "pgcrypto"` (bcrypt dependency)
    - Contains `create table if not exists public.profiles`
    - Contains `create table if not exists public.departments`
    - Contains `create table if not exists public.programs`
    - Contains `create table if not exists public.courses`
    - Contains `create table if not exists public.enrollments`
    - Contains `create table if not exists public.announcements`
    - Contains `create table if not exists public.modules`
    - Contains `create table if not exists public.module_items`
    - Contains `create table if not exists public.roadmap_items`
    - Contains `create table if not exists public.topics`
    - Contains `create table if not exists public.student_progress`
    - Contains at least 11 occurrences of `enable row level security` (one per table) — verify via `grep -c "enable row level security" ...`
    - Contains `check (role in ('admin', 'professor', 'student'))` for profiles
    - Contains `check (type in ('link', 'note', 'file'))` for module_items
    - Contains `check (professor_status in ('not_started', 'in_progress', 'complete'))` for roadmap_items
    - Contains `check (status in ('not_started', 'in_progress', 'complete'))` for student_progress
    - File length ≥ 200 lines (full schema is ~250)
  </acceptance_criteria>
  <done>
    Migration file ready to apply. Contains all 11 tables, RLS enable on all tables, explicit policies, and the updated_at trigger function + triggers.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: User applies migration to live Supabase project via SQL Editor</name>
  <files>(no local file change — applies migration to remote Supabase database)</files>
  <what-built>Task 1 wrote `supabase/migrations/00000000000001_initial_schema.sql` to the repo. Next, apply it to the live project.</what-built>
  <how-to-verify>
    Apply the migration via Supabase Dashboard SQL Editor (preferred — no DB password needed):

    1. Open https://supabase.com/dashboard/project/htlolqbwhulyihguwdoq/sql/new (Supabase Dashboard → Project htlolqbwhulyihguwdoq → SQL Editor → New query).
    2. Open `/Users/Kiumbura/Projects/scholera-mobile/supabase/migrations/00000000000001_initial_schema.sql` locally and copy the ENTIRE contents (Cmd+A, Cmd+C).
    3. Paste into the SQL editor.
    4. Click "Run" (or Cmd+Enter).
    5. Expected: Success message. If errors appear:
       - `relation "auth.users" does not exist` → Highly unlikely in a fresh Supabase project; if it happens, contact me.
       - `extension "pgcrypto" already exists` → Safe to ignore; the `if not exists` guard handles this.
       - `column "department_id" already exists` → Migration was partially applied; re-run should be idempotent given `if not exists` on every CREATE TABLE and `add constraint if not exists` on ALTER TABLE.
    6. Verify in the Dashboard: Database → Tables → Schema `public` → confirm all 11 tables are listed: `profiles`, `departments`, `programs`, `courses`, `enrollments`, `announcements`, `modules`, `module_items`, `roadmap_items`, `topics`, `student_progress`.
    7. On each table row, confirm "RLS" column shows "Enabled" (green icon). If any table shows RLS disabled, re-run the migration — the `enable row level security` statement for that table didn't apply.

    Why this is a human-verify checkpoint: No local psql or Supabase CLI link is currently configured for this project (per RESEARCH.md open question #1 — the project is under a different account than the CLI auth). The SQL Editor is the most reliable path. After Plan 04, Plan 05 can still run types regen via `--project-id` because that command uses the user's supabase access token, not a db connection.

    Fallback if you prefer CLI: `npx supabase db push --db-url "postgresql://postgres.htlolqbwhulyihguwdoq:[DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"` — replace `[DB_PASSWORD]` with the password from Dashboard → Project Settings → Database → Connection string. Use the pooler (port 6543) host for IPv4 connectivity.
  </how-to-verify>
  <resume-signal>Type "migration applied" after the 11 tables are visible with RLS enabled. If a table is missing or RLS is off, describe what you see.</resume-signal>
  <action>
    User-only step. Pause execution. Present `<what-built>` + `<how-to-verify>` to the user. Wait for `<resume-signal>` confirming all 11 tables are present in the Supabase Dashboard with RLS enabled. Do NOT proceed to Task 3 (seed) or Task 5 (type gen) until migration is applied — type gen against an empty schema will produce empty types and break PITFALLS P1-G.
  </action>
  <verify>
    <automated>MISSING — Verification of remote schema requires either (a) `psql` connection with DB password, or (b) querying via REST API with anon key. Both are out-of-band for this task. The user verifies the 11 tables are visible in the Supabase Dashboard Table Editor as part of `<how-to-verify>`. Plan 05's smoke check #4 indirectly verifies via `types/database.types.ts` (which only contains real tables if migration was applied before Plan 04 Task 5 ran).</automated>
  </verify>
  <acceptance_criteria>
    - User has confirmed via resume-signal that all 11 tables (`profiles`, `departments`, `programs`, `courses`, `enrollments`, `announcements`, `modules`, `module_items`, `roadmap_items`, `topics`, `student_progress`) are visible in Supabase Dashboard → Database → Tables → schema `public`
    - Each of those 11 table rows shows RLS enabled (green icon in dashboard)
    - User encountered no migration errors (or any errors were `if not exists`/`if not exists` idempotency guards firing — safe)
  </acceptance_criteria>
  <done>
    11 tables exist in live Supabase project with RLS enabled on all of them. Ready for seed application in Task 4.
  </done>
</task>

<task type="auto">
  <name>Task 3: Write supabase/seed.sql verbatim from RESEARCH.md (auth.users + auth.identities + full demo data)</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/supabase/seed.sql</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Seed SQL" (verbatim fenced SQL block — ~200 lines)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Pitfall P1-E: Schema Migration Applied Without Verifying `auth.identities`" (why both tables are needed)
  </read_first>
  <action>
    Create `/Users/Kiumbura/Projects/scholera-mobile/supabase/seed.sql` with the COMPLETE seed SQL verbatim from RESEARCH.md §"Seed SQL".

    The file has 9 insert sections inside a `do $$ ... end $$` block:
    1. Variable declarations (stable fake UUIDs for idempotency + `v_pw` bcrypt hash)
    2. `auth.users` (3 users — admin, prof, student — with `encrypted_password = crypt('demo-password-1234', gen_salt('bf'))`)
    3. `auth.identities` (3 identity rows — REQUIRED for email login per PITFALLS P1-E)
    4. `departments` (2 rows — Computer Science, Mathematics)
    5. `programs` (1 row — BS Computer Science)
    6. `profiles` (3 rows — admin, professor, student — references auth.users ids)
    7. `courses` (2 rows — Neural Networks, DSA — taught by professor)
    8. `enrollments` (2 rows — student enrolled in both courses)
    9. `announcements` (2 rows — welcome + week 2 reading)
    10. `modules` (4 rows — 2 per course)
    11. `module_items` (6 rows — mixed file/link/note types)
    12. `roadmap_items` (6 rows — one per module_item, with pre-set professor_status)
    13. `topics` (15 rows — AI-extracted labels per roadmap_item)
    14. `student_progress` (5 rows — student's personal progress, different from professor_status)

    Copy the full `do $$ ... end $$` block verbatim. All inserts use `on conflict (...) do nothing` except `student_progress` which uses `on conflict (...) do update` so re-runs update status.

    DO NOT:
    - Change `v_pw := crypt('demo-password-1234', gen_salt('bf'))` — this is the demo password locked in CONTEXT.md D-10.
    - Change the fake UUIDs — they're what makes the seed idempotent (`on conflict (id) do nothing`).
    - Remove the `auth.identities` insert — without it, email login fails silently (PITFALLS P1-E).
    - Remove the `topics` inserts even though they lack `on conflict` — re-running the seed may duplicate topics, which is acceptable per RESEARCH.md open question #2.

    Reference: RESEARCH.md §Seed SQL, PITFALLS P1-E, CONTEXT.md D-10/D-11.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && test -f supabase/seed.sql && grep -q "demo-password-1234" supabase/seed.sql && grep -q "insert into auth.users" supabase/seed.sql && grep -q "insert into auth.identities" supabase/seed.sql && grep -q "insert into public.profiles" supabase/seed.sql && grep -q "insert into public.courses" supabase/seed.sql && grep -q "insert into public.modules" supabase/seed.sql && grep -q "insert into public.module_items" supabase/seed.sql && grep -q "insert into public.roadmap_items" supabase/seed.sql && grep -q "insert into public.topics" supabase/seed.sql && grep -q "insert into public.student_progress" supabase/seed.sql && grep -q "admin@demo.scholera.test" supabase/seed.sql && grep -q "prof@demo.scholera.test" supabase/seed.sql && grep -q "student@demo.scholera.test" supabase/seed.sql && grep -q "Introduction to Neural Networks" supabase/seed.sql && test $(wc -l < supabase/seed.sql) -ge 130 && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - File `supabase/seed.sql` exists
    - Contains `demo-password-1234` (the locked demo password)
    - Contains `insert into auth.users` (3 user rows)
    - Contains `insert into auth.identities` (3 identity rows — PITFALLS P1-E)
    - Contains `insert into public.profiles` (3 profile rows)
    - Contains `insert into public.departments` (2 dept rows)
    - Contains `insert into public.courses` (2 course rows)
    - Contains `insert into public.modules` (4 module rows)
    - Contains `insert into public.module_items` (6 item rows)
    - Contains `insert into public.roadmap_items` (6 roadmap rows)
    - Contains `insert into public.topics` (15 topic rows)
    - Contains `insert into public.student_progress` (5 progress rows)
    - Contains the 3 expected demo emails: `admin@demo.scholera.test`, `prof@demo.scholera.test`, `student@demo.scholera.test`
    - Contains the course title `Introduction to Neural Networks` (demo story content)
    - Uses `on conflict (id) do nothing` for idempotency on auth.users, profiles, courses, etc.
    - File length ≥ 130 lines
  </acceptance_criteria>
  <done>
    Seed file ready to apply. Includes demo-story-complete content per CONTEXT.md specifics.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: User applies seed to live Supabase and verifies 3 users + 3 profiles + 2 courses</name>
  <files>(no local file change — applies seed to remote Supabase database)</files>
  <what-built>Task 3 wrote `supabase/seed.sql`. Next, apply it and verify row counts.</what-built>
  <how-to-verify>
    Apply the seed via Supabase SQL Editor (same method as Task 2):

    1. Open https://supabase.com/dashboard/project/htlolqbwhulyihguwdoq/sql/new (SQL Editor → New query).
    2. Open `/Users/Kiumbura/Projects/scholera-mobile/supabase/seed.sql` locally and copy the entire contents.
    3. Paste into the SQL editor and click "Run".
    4. Expected: Success message. If you see `duplicate key value violates unique constraint`, that's the `on conflict do nothing` guard working — re-runs are safe.

    After applying the seed, run these verification queries in the SAME SQL editor (delete the seed text, paste each one, run):

    **Query 1 — Count auth users:**
    ```sql
    select count(*) from auth.users where email like '%@demo.scholera.test';
    ```
    Expected: `3` (admin, prof, student).

    **Query 2 — Count auth identities (PITFALLS P1-E gate):**
    ```sql
    select count(*) from auth.identities where provider = 'email';
    ```
    Expected: `3`. If this returns `0`, seed is broken — re-apply or fix seed.sql.

    **Query 3 — Count profiles:**
    ```sql
    select count(*) from public.profiles;
    ```
    Expected: `3`.

    **Query 4 — Verify courses and demo story:**
    ```sql
    select title, code from public.courses order by title;
    ```
    Expected 2 rows:
    - `Data Structures and Algorithms` / `CS-201`
    - `Introduction to Neural Networks` / `CS-411`

    **Query 5 — Verify module items full count:**
    ```sql
    select count(*) as items, (select count(*) from public.roadmap_items) as roadmap, (select count(*) from public.topics) as topics, (select count(*) from public.student_progress) as progress from public.module_items;
    ```
    Expected: items=6, roadmap=6, topics=15, progress=5.

    **Optional sanity check — try logging in:**
    1. Still in Dashboard → Authentication → Users.
    2. Confirm you see `admin@demo.scholera.test`, `prof@demo.scholera.test`, `student@demo.scholera.test` in the list. Email-confirmed status should be green (the seed sets `email_confirmed_at = now()`).

    If any count is wrong, resume with the count/error — I'll help diagnose. If all 5 queries match expected values, proceed to Task 5.
  </how-to-verify>
  <resume-signal>Type "seed verified — 3/3/3/2/6/6/15/5" or describe the mismatched counts. Include any error messages from the seed insert step.</resume-signal>
  <action>
    User-only step. Pause execution. Present `<what-built>` + `<how-to-verify>` (the 5 verification queries) to the user. Wait for `<resume-signal>` with the count tuple. Do NOT proceed to Task 5 (type gen) until counts match expected: auth.users=3, auth.identities=3, profiles=3, courses=2 (Neural Networks + DSA), module_items=6, roadmap_items=6, topics=15+, student_progress=5. PITFALLS P1-E: if auth.identities count is 0, email login is broken — re-apply seed.
  </action>
  <verify>
    <automated>MISSING — Same as Task 2: verifying remote row counts requires a live DB connection. The 5 SQL queries in `<how-to-verify>` are the verification surface. Plan 05's smoke check #4 indirectly proves seed worked by relying on real types in `database.types.ts` (which only have shape if both migration and seed succeeded enough for `gen types` to introspect properly).</automated>
  </verify>
  <acceptance_criteria>
    - User has confirmed via resume-signal that all 5 verification queries returned expected counts
    - `select count(*) from auth.users where email like '%@demo.scholera.test'` = 3
    - `select count(*) from auth.identities where provider = 'email'` = 3 (PITFALLS P1-E gate)
    - `select count(*) from public.profiles` = 3
    - 2 courses exist with titles `Data Structures and Algorithms` and `Introduction to Neural Networks`
    - module_items=6, roadmap_items=6, topics≥15, student_progress=5
  </acceptance_criteria>
  <done>
    Seed applied successfully. Live database now contains 3 authenticatable users, 2 demo courses with full module/item/roadmap/topic/progress hierarchy. Ready for type generation in Task 5.
  </done>
</task>

<task type="auto">
  <name>Task 5: Run npx supabase gen types to regenerate types/database.types.ts from live schema</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/types/database.types.ts</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Type Generation Command" (primary + fallback commands)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Open Questions" item 1 (the project may not be in CLI auth's project list)
    - /Users/Kiumbura/Projects/scholera-mobile/types/database.types.ts (Plan 03 stub — will be overwritten)
  </read_first>
  <action>
    Step 1 — Try the primary command (requires `supabase login` to have been run, which RESEARCH.md confirms for this machine):
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile && npx supabase gen types typescript --project-id htlolqbwhulyihguwdoq --schema public > types/database.types.ts
    ```

    Check exit code:
    - **Success (exit 0):** `types/database.types.ts` will be overwritten with real generated types. Inspect the file (`head -30 types/database.types.ts`) — expect to see `export type Database = { public: { Tables: { profiles: { Row: { id: string; role: string; ... } ... }`. Proceed to Step 3.
    - **Failure ("Not logged in" or "Project not found"):** fall through to Step 2 (the `--db-url` fallback).

    Step 2 — Fallback: use `--db-url` with DB password from the Supabase Dashboard. This is documented as the fallback in RESEARCH.md open question #1.

    STOP HERE and convert this step into a checkpoint asking the user for the DB password:
    - User visits https://supabase.com/dashboard/project/htlolqbwhulyihguwdoq/settings/database
    - User clicks "Reset database password" OR copies the existing password if they remember it (passwords are one-time-display)
    - User pastes the password into a temporary shell variable: `export SUPABASE_DB_PASSWORD='xxx'`
    - Then run:
      ```bash
      cd /Users/Kiumbura/Projects/scholera-mobile && npx supabase gen types typescript --db-url "postgresql://postgres.htlolqbwhulyihguwdoq:${SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres" --schema public > types/database.types.ts
      ```
    - Unset: `unset SUPABASE_DB_PASSWORD`

    If this bash call encounters the "Not logged in" / "Project not found" error at Step 1, PAUSE execution and output a message to the user: "Type gen Step 1 failed. Please provide DB password from Supabase Dashboard → Project Settings → Database → Connection string (or reset). Do not paste into chat — set it in your shell via `export SUPABASE_DB_PASSWORD='xxx'` before resuming."

    Step 3 — Verify the output file is non-trivial and contains expected tables:
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile
    wc -l types/database.types.ts   # should be > 100 (stub was ~30 lines)
    grep -c "profiles:" types/database.types.ts  # should be > 0
    grep -c "courses:" types/database.types.ts  # should be > 0
    ```

    Step 4 — Run `npx tsc --noEmit` again to confirm the new types still compile (the stub was lax; the real types are stricter — `app.types.ts` should still compile since it only extracts `['Row']` types):
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile && npx tsc --noEmit
    ```

    Expected: exit 0 (no errors). If errors appear, they typically mean:
    - Table naming mismatch between schema and app.types.ts (e.g., you wrote `profile` instead of `profiles` in migration) — fix migration and re-seed.
    - The schema wasn't applied before type gen — tables show up as `Record<string, never>`; re-run type gen after confirming tables exist in the dashboard.

    Reference: RESEARCH.md §Type Generation Command, §Open Questions, PITFALLS P1-G (type gen before migration applied).
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && test -f types/database.types.ts && test $(wc -l < types/database.types.ts) -gt 100 && grep -q "profiles:" types/database.types.ts && grep -q "courses:" types/database.types.ts && grep -q "modules:" types/database.types.ts && grep -q "module_items:" types/database.types.ts && grep -q "roadmap_items:" types/database.types.ts && grep -q "topics:" types/database.types.ts && grep -q "student_progress:" types/database.types.ts && grep -q "departments:" types/database.types.ts && grep -q "announcements:" types/database.types.ts && npx tsc --noEmit && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - File `types/database.types.ts` exists and is > 100 lines (real generated types; stub was ~30 lines)
    - Contains table name `profiles:` (note: the colon is part of the TypeScript type syntax for generated supabase types)
    - Contains `courses:`, `modules:`, `module_items:`, `roadmap_items:`, `topics:`, `student_progress:`, `departments:`, `announcements:`
    - `npx tsc --noEmit` exits 0 after regeneration (types are consistent with app.types.ts)
    - `lib/supabase.ts`'s `import type { Database }` still resolves (no file-move / path-change regressions)
  </acceptance_criteria>
  <done>
    Real TypeScript types generated from live schema. `types/database.types.ts` has all 11 tables. `tsc` still passes. Ready for the smoke script and final push in Plan 05.
  </done>
</task>

</tasks>

<verification>
At the end of Plan 04, these must be true:

```bash
cd /Users/Kiumbura/Projects/scholera-mobile

# Migration file exists and has the 11 tables
grep -c "create table if not exists public\." supabase/migrations/00000000000001_initial_schema.sql
# Expected: 11

# Seed has all insert sections
grep -c "^  insert into " supabase/seed.sql
# Expected: ≥12 (auth.users, auth.identities, departments, programs, profiles, courses, enrollments, announcements, modules, module_items, roadmap_items, topics, student_progress)

# Real types generated
wc -l types/database.types.ts
# Expected: >100 lines (real), not ~30 (stub)

# Still compiles
npx tsc --noEmit && echo "✓ types compile"
```

Manual verification (in Supabase dashboard):
- 3 users in Authentication → Users (admin@demo.scholera.test etc.)
- 11 tables visible in Database → Tables
- profiles table has 3 rows
- courses table has 2 rows
</verification>

<success_criteria>
- [ ] Schema migration SQL file exists and is complete (11 tables + RLS + policies + triggers)
- [ ] Seed SQL file exists with auth.users + auth.identities + all domain tables
- [ ] Migration applied to live Supabase — 11 tables visible with RLS enabled
- [ ] Seed applied — 3 users, 3 profiles, 2 courses, 6 module items, 15 topics confirmed by count queries
- [ ] `types/database.types.ts` regenerated from live schema (>100 lines, contains all 11 table names)
- [ ] `npx tsc --noEmit` still passes after regeneration
</success_criteria>

<output>
After completion, create `/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-scaffold-04-SUMMARY.md` documenting:
- Confirm migration file committed to repo
- Paste the 5 verification query results (counts: auth.users, auth.identities, profiles, courses list, item counts)
- Confirm which type-gen command path was used (primary --project-id vs fallback --db-url)
- Note any deviations from RESEARCH.md verbatim SQL (ideally: none)
</output>
