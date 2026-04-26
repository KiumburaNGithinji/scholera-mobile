---
phase: 04-admin-experience
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/00000000000004_admin_read_all.sql
  - scripts/verify-admin-rls.mjs
autonomous: false
requirements: [ADMIN-01, ADMIN-02, ADMIN-03]
must_haves:
  truths:
    - "is_admin(uuid) SECURITY DEFINER function exists in public schema and returns true for the admin demo user"
    - "profiles: admin read all SELECT policy exists on public.profiles using is_admin(auth.uid())"
    - "Authenticated admin can read ALL 3 demo profiles via REST (not just their own)"
    - "Authenticated professor still only reads their own profile (admin policy is admin-scoped)"
    - "No infinite recursion error (42P17) on profile reads"
  artifacts:
    - path: "supabase/migrations/00000000000004_admin_read_all.sql"
      provides: "Re-enables admin-read-all on profiles via SECURITY DEFINER helper (per migration 02 deferral)"
      contains: "create or replace function public.is_admin"
    - path: "scripts/verify-admin-rls.mjs"
      provides: "Smoke test that confirms admin reads ALL profiles, professor only reads own"
      exports: []
  key_links:
    - from: "Phase 4 dashboard query (use-stats.ts in plan 04-02)"
      to: "public.profiles SELECT"
      via: "supabase.from('profiles').select('id, role', { count: 'exact', head: true })"
      pattern: "Without this RLS fix, count returns 1 not 3 — stats grid breaks"
    - from: "is_admin(uid) function"
      to: "public.profiles.role = 'admin'"
      via: "SECURITY DEFINER bypasses RLS internally — breaks the recursion loop migration 02 hit"
      pattern: "language sql security definer set search_path = public stable"
---

<objective>
Restore admin-read-all access on the profiles table that was dropped in migration 02 to fix infinite recursion. Without this, every Phase 4 admin query that touches profiles (stats counts, departments-with-professor-counts, professors-in-department, professor-detail) returns empty or admin-only data — breaking ADMIN-01, ADMIN-02, ADMIN-03 simultaneously.

This is a pure data-layer unblocker. No app code changes. The fix is the SECURITY DEFINER pattern called out in migration 02's own comment block: a helper function that bypasses RLS internally so the policy can call it without recursing.

Purpose: Unblock all four Phase 4 success criteria at the data layer before any UI work begins.
Output: Migration 04 applied to live Supabase + a smoke script that proves admin sees all profiles + professor still sees only own.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/research/PITFALLS.md

# Migration 02 dropped the recursive admin-read-all policy and documented the fix in its own comment.
# This plan implements that documented fix.
@supabase/migrations/00000000000002_fix_profiles_recursion.sql

# Read the original schema to see the policy that was dropped + understand the table structure.
@supabase/migrations/00000000000001_initial_schema.sql

# Phase 3 left a working REST sign-in script — we'll model the new verify script on it.
@scripts/verify-auth-smoke.mjs

# Phase 3 SUMMARY documents the demo user emails + password (admin/prof/student @demo.scholera.test / demo-password-1234).
@.planning/phases/03-auth-and-role-router/03-SUMMARY.md

<interfaces>
<!-- Demo users (from 03-SUMMARY.md): -->
<!-- admin@demo.scholera.test    / demo-password-1234   role=admin -->
<!-- prof@demo.scholera.test     / demo-password-1234   role=professor -->
<!-- student@demo.scholera.test  / demo-password-1234   role=student -->

<!-- Supabase client config (from .env.local — DO NOT commit, already gitignored): -->
<!-- EXPO_PUBLIC_SUPABASE_URL=https://htlolqbwhulyihguwdoq.supabase.co -->
<!-- EXPO_PUBLIC_SUPABASE_ANON_KEY=<jwt> -->

<!-- The verify-auth-smoke.mjs pattern that this plan extends:
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const { data: { session, user }, error } = await supabase.auth.signInWithPassword({ email, password })
const { data: profiles, error } = await supabase.from('profiles').select('id, role')
-->

<!-- Migration 02 comment block contains the exact fix template we'll apply (with grants added): -->
<!-- create or replace function public.is_admin(uid uuid) returns boolean -->
<!--   language sql security definer stable set search_path = public as $$ -->
<!--   select exists (select 1 from public.profiles where id = uid and role = 'admin'); -->
<!-- $$; -->
<!-- create policy "profiles: admin read all" on public.profiles -->
<!--   for select using (public.is_admin(auth.uid())); -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write migration 04 SQL — SECURITY DEFINER helper + admin policy</name>
  <files>supabase/migrations/00000000000004_admin_read_all.sql</files>
  <read_first>
    - supabase/migrations/00000000000002_fix_profiles_recursion.sql (the comment block in this file IS the spec for migration 04)
    - supabase/migrations/00000000000001_initial_schema.sql (verify the original `profiles: admin read all` policy at lines 209-212 used the recursive subquery pattern; verify courses/enrollments/announcements policies do NOT use the recursive pattern and remain unchanged)
  </read_first>
  <action>
Create the new migration file at `supabase/migrations/00000000000004_admin_read_all.sql` with EXACTLY this content (verbatim — do not paraphrase the SQL):

```sql
-- ============================================================
-- Phase 4: Re-enable admin-read-all on profiles via SECURITY DEFINER helper
-- File: supabase/migrations/00000000000004_admin_read_all.sql
-- ============================================================
-- Migration 02 dropped "profiles: admin read all" because the original policy
-- (initial_schema.sql) queried public.profiles inside its own USING clause —
-- causing Postgres error 42P17 (infinite recursion) on every profile read,
-- including gotrue's auth lookup during sign-in.
--
-- Phase 4's admin dashboard, departments list, department detail, and professor
-- detail screens all need to read OTHER profiles (count students/professors,
-- list professors in a department, show a professor's name). Without admin-
-- read-all, every Phase 4 admin query returns only the admin's own row.
--
-- Fix (per migration 02's own deferral note): wrap the recursive check in a
-- SECURITY DEFINER function. Inside a SECURITY DEFINER function the RLS check
-- is bypassed, so the function can read public.profiles safely. The policy then
-- calls the function — no recursion.
--
-- Apply this in the Supabase SQL editor (same path used for migrations 02 and 03).

-- ─── is_admin(uid) helper ──────────────────────────────────
-- SECURITY DEFINER: runs as the function owner (postgres), bypasses RLS
-- stable: same input → same output within a query (lets planner cache calls)
-- set search_path: prevents search_path-injection attacks on definer functions
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- Grant execute so the anon and authenticated roles can call the function
-- (RLS policies run as the calling role; the function body runs as definer)
grant execute on function public.is_admin(uuid) to anon, authenticated;

-- ─── profiles: admin read all (re-enabled) ─────────────────
-- Drop first in case a previous attempt left it behind, then create fresh.
drop policy if exists "profiles: admin read all" on public.profiles;

create policy "profiles: admin read all" on public.profiles
  for select using (public.is_admin(auth.uid()));

-- ─── Verification queries (run these in the SQL editor after applying) ─────
-- 1. Function exists and works:
--    select public.is_admin('<admin-user-id-uuid>');  -- expect: true
--    select public.is_admin('<professor-user-id-uuid>');  -- expect: false
--
-- 2. Policy is in place:
--    select polname from pg_policy
--    where polrelid = 'public.profiles'::regclass and polname = 'profiles: admin read all';
--    -- expect: one row
--
-- The mobile app verification path is scripts/verify-admin-rls.mjs (see plan task 2).
```

Then: open the file you just wrote, read it back, and confirm character-perfect match against the spec above (especially the `$$` quoted blocks — escaping in heredocs and shell tools can corrupt them).

Do NOT attempt to apply the SQL — that's the human-action task below. This task only WRITES the file.

Per migration 02 comment: this is the documented and intended fix path. The SECURITY DEFINER pattern is standard Supabase practice (see https://supabase.com/docs/guides/database/postgres/row-level-security#policies-with-security-definer-functions).
  </action>
  <verify>
    <automated>test -f supabase/migrations/00000000000004_admin_read_all.sql && grep -q "create or replace function public.is_admin" supabase/migrations/00000000000004_admin_read_all.sql && grep -q "security definer" supabase/migrations/00000000000004_admin_read_all.sql && grep -q "grant execute on function public.is_admin(uuid) to anon, authenticated" supabase/migrations/00000000000004_admin_read_all.sql && grep -q 'create policy "profiles: admin read all" on public.profiles' supabase/migrations/00000000000004_admin_read_all.sql && grep -q "for select using (public.is_admin(auth.uid()))" supabase/migrations/00000000000004_admin_read_all.sql</automated>
  </verify>
  <acceptance_criteria>
    - File `supabase/migrations/00000000000004_admin_read_all.sql` exists
    - Contains exactly: `create or replace function public.is_admin(uid uuid)`
    - Contains exactly: `security definer`
    - Contains exactly: `set search_path = public`
    - Contains exactly: `grant execute on function public.is_admin(uuid) to anon, authenticated;`
    - Contains exactly: `create policy "profiles: admin read all" on public.profiles`
    - Contains exactly: `for select using (public.is_admin(auth.uid()));`
    - Does NOT contain `service_role` (admin policy uses helper, not impersonation)
    - Does NOT contain any DML against existing tables (read-only schema change)
  </acceptance_criteria>
  <done>Migration file written with verbatim SQL; grep verification passes for all 6 required strings.</done>
</task>

<task type="auto">
  <name>Task 2: Write smoke script verify-admin-rls.mjs</name>
  <files>scripts/verify-admin-rls.mjs</files>
  <read_first>
    - scripts/verify-auth-smoke.mjs (we'll model the env-loading + signInWithPassword pattern on this)
    - .planning/phases/03-auth-and-role-router/03-SUMMARY.md (for the demo user emails / password)
  </read_first>
  <action>
Create `scripts/verify-admin-rls.mjs` with EXACTLY this content (verbatim):

```javascript
#!/usr/bin/env node
// Phase 4 plan 04-01 verification: confirm migration 04 (admin_read_all) is applied.
//
// Acceptance:
//   - Admin signs in -> /rest/v1/profiles?select=id,role returns ALL 3 demo profiles
//   - Professor signs in -> /rest/v1/profiles?select=id,role returns 1 row (own only)
//   - is_admin RPC returns true for admin's uid, false for professor's uid
//
// Run AFTER pasting supabase/migrations/00000000000004_admin_read_all.sql into the Supabase SQL editor.
//
// Usage: node scripts/verify-admin-rls.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const [k, ...rest] = l.split('=')
      return [k.trim(), rest.join('=').trim()]
    }),
)

const url = env.EXPO_PUBLIC_SUPABASE_URL
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('FAIL: missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const password = 'demo-password-1234'

async function signInAndQueryProfiles(label, email, expectedCount, expectedRole) {
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const tag = `[${label.padEnd(10)}]`

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError || !signInData.session) {
    console.log(`${tag} FAIL sign-in: ${signInError?.message ?? 'no session'}`)
    return { pass: false }
  }

  const userId = signInData.user.id

  // Query 1: how many profiles can this user see?
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, role, department_id')

  if (profilesError) {
    console.log(`${tag} FAIL profiles query: ${profilesError.message}`)
    await supabase.auth.signOut()
    return { pass: false }
  }

  const count = profiles?.length ?? 0
  const ownProfile = profiles?.find((p) => p.id === userId)
  const ownRoleMatches = ownProfile?.role === expectedRole

  let pass = true
  if (count !== expectedCount) {
    console.log(`${tag} FAIL profile count: expected ${expectedCount}, got ${count}`)
    pass = false
  }
  if (!ownRoleMatches) {
    console.log(`${tag} FAIL own role: expected ${expectedRole}, got ${ownProfile?.role ?? 'undefined'}`)
    pass = false
  }
  if (pass) {
    console.log(`${tag} PASS sees ${count} profile(s); own role = ${expectedRole}`)
  }

  await supabase.auth.signOut()
  return { pass, userId }
}

let allPass = true

console.log('=== Phase 4 plan 04-01: verify admin RLS unblock ===\n')

// Admin should see ALL 3 profiles
const adminResult = await signInAndQueryProfiles('admin', 'admin@demo.scholera.test', 3, 'admin')
if (!adminResult.pass) allPass = false

// Professor should see ONLY own profile (1)
const profResult = await signInAndQueryProfiles('professor', 'prof@demo.scholera.test', 1, 'professor')
if (!profResult.pass) allPass = false

// Student should see ONLY own profile (1)
const studentResult = await signInAndQueryProfiles('student', 'student@demo.scholera.test', 1, 'student')
if (!studentResult.pass) allPass = false

if (allPass) {
  console.log('\nAll RLS checks passed. Migration 04 is applied. Phase 4 plans 04-02..04-04 are unblocked.')
  process.exit(0)
} else {
  console.log('\nSome checks failed. Most common cause: migration 04 has not been applied yet.')
  console.log('Fix: open supabase/migrations/00000000000004_admin_read_all.sql, copy ALL content, paste into the Supabase SQL editor (https://supabase.com/dashboard/project/htlolqbwhulyihguwdoq/sql/new), click Run.')
  process.exit(1)
}
```

This script intentionally does NOT call the `is_admin` RPC directly (the function isn't exposed via PostgREST unless you `comment on function` or set up the RPC schema). The implicit verification is: if admin sees 3 profiles, the policy + helper both work; if admin sees 1, either is missing.

Make the script executable (helpful but not required, since we run it via `node`):
```bash
chmod +x scripts/verify-admin-rls.mjs
```
  </action>
  <verify>
    <automated>test -f scripts/verify-admin-rls.mjs && node -c scripts/verify-admin-rls.mjs && grep -q "signInWithPassword" scripts/verify-admin-rls.mjs && grep -q "expected 3, got" scripts/verify-admin-rls.mjs</automated>
  </verify>
  <acceptance_criteria>
    - File `scripts/verify-admin-rls.mjs` exists
    - `node -c scripts/verify-admin-rls.mjs` exits 0 (syntactically valid ESM)
    - Contains `signInWithPassword` calls for all 3 demo users (admin/prof/student)
    - Contains `expected 3` for the admin path (asserts admin sees all 3 profiles)
    - Contains `expected 1` for prof + student paths (asserts non-admin sees only own)
    - Loads credentials from `.env.local` via the same parse logic as `verify-auth-smoke.mjs`
    - Does NOT exit on first failure (runs all 3 checks, reports cumulative result)
  </acceptance_criteria>
  <done>Script written, syntactically valid, ready to run after migration is applied.</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Checkpoint: Apply migration 04 to Supabase</name>
  <files>supabase/migrations/00000000000004_admin_read_all.sql (read-only — to be pasted into the Supabase dashboard SQL editor by the user)</files>
  <action>
    Pause execution. Display the "how-to-verify" steps to the user. The user must manually paste the migration SQL into the Supabase SQL editor and confirm `node scripts/verify-admin-rls.mjs` passes before resuming. This step cannot be automated because the local Supabase CLI is not authenticated against project htlolqbwhulyihguwdoq (different owner).
  </action>
  <verify>
    <automated>node scripts/verify-admin-rls.mjs</automated>
  </verify>
  <done>User has applied migration 04 via the Supabase SQL editor AND `node scripts/verify-admin-rls.mjs` exits 0 with three PASS lines (admin sees 3 profiles, professor sees 1, student sees 1).</done>
  <what-built>
    - `supabase/migrations/00000000000004_admin_read_all.sql` written to disk (Task 1)
    - `scripts/verify-admin-rls.mjs` written to disk (Task 2)
    - Migration is NOT yet applied to the live Supabase project (requires manual paste — same path used for migrations 02 and 03)
  </what-built>
  <how-to-verify>
    1. Open the migration file you just wrote: `cat supabase/migrations/00000000000004_admin_read_all.sql`
    2. Copy the ENTIRE file contents (every line including the `$$` blocks)
    3. Open https://supabase.com/dashboard/project/htlolqbwhulyihguwdoq/sql/new
    4. Paste the SQL into the SQL editor
    5. Click "Run" (or hit Cmd+Enter)
    6. Confirm the SQL editor reports "Success. No rows returned."
       - If you see error 42P17 (recursion): something is wrong with the SECURITY DEFINER setup — re-check the function body
       - If you see "function already exists": that's fine, the `create or replace` handles it
       - If you see "policy already exists": that's fine, we drop it first before re-creating
    7. Run the smoke script from the project root:
       ```bash
       node scripts/verify-admin-rls.mjs
       ```
    8. EXPECTED OUTPUT (on success):
       ```
       === Phase 4 plan 04-01: verify admin RLS unblock ===

       [admin     ] PASS sees 3 profile(s); own role = admin
       [professor ] PASS sees 1 profile(s); own role = professor
       [student   ] PASS sees 1 profile(s); own role = student

       All RLS checks passed. Migration 04 is applied. Phase 4 plans 04-02..04-04 are unblocked.
       ```
    9. If you see `[admin] FAIL profile count: expected 3, got 1` — the migration didn't apply OR the policy is wrong. Re-check the SQL editor output for errors.

    Why this is human-action: There is no Supabase CLI session linked to this project (the project is owned by a different account than the local Supabase login — see types/database.types.ts comment). Migrations 02 and 03 were applied the same way. Once migration 04 is in, plans 04-02..04-04 can run autonomously.
  </how-to-verify>
  <resume-signal>Type "applied" once `node scripts/verify-admin-rls.mjs` exits 0 with all 3 PASS lines, or describe any errors seen in the SQL editor or the smoke script.</resume-signal>
</task>

</tasks>

<verification>
End-to-end check that this plan is complete:

```bash
# 1. Migration file exists and contains required SQL
test -f supabase/migrations/00000000000004_admin_read_all.sql
grep "create or replace function public.is_admin" supabase/migrations/00000000000004_admin_read_all.sql
grep "security definer" supabase/migrations/00000000000004_admin_read_all.sql
grep "grant execute on function public.is_admin(uuid) to anon, authenticated" supabase/migrations/00000000000004_admin_read_all.sql
grep 'create policy "profiles: admin read all" on public.profiles' supabase/migrations/00000000000004_admin_read_all.sql

# 2. Smoke script exists and is syntactically valid
test -f scripts/verify-admin-rls.mjs
node -c scripts/verify-admin-rls.mjs

# 3. Smoke script passes against live Supabase (REQUIRES checkpoint completion)
node scripts/verify-admin-rls.mjs
# Expected exit: 0 with three PASS lines
```
</verification>

<success_criteria>
- [ ] Migration 04 file written verbatim per spec
- [ ] is_admin SECURITY DEFINER helper defined with `set search_path = public stable`
- [ ] Execute permission granted to `anon, authenticated`
- [ ] `profiles: admin read all` policy re-created using `public.is_admin(auth.uid())`
- [ ] Smoke script `verify-admin-rls.mjs` written, syntactically valid
- [ ] Migration applied to live Supabase via SQL editor (human-action)
- [ ] `node scripts/verify-admin-rls.mjs` exits 0 with admin=3, professor=1, student=1 PASS lines
- [ ] Phase 4 plans 04-02..04-04 unblocked (admin can now read all profiles)
</success_criteria>

<output>
After completion, create `.planning/phases/04-admin-experience/04-01-SUMMARY.md` documenting:
- The exact SQL applied (paste from migration file)
- The smoke script output (paste verbatim — proves admin sees 3 profiles)
- The two API contract changes that downstream plans now rely on:
  1. Authenticated admin can `select * from public.profiles` and get all rows
  2. Authenticated admin can `select count(*) from public.profiles where role = 'student'` and get the true count
- Any deviations or surprises during apply
</output>
