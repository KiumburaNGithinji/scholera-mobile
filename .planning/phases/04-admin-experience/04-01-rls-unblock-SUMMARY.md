---
phase: 04-admin-experience
plan: 01
status: complete
completed: 2026-04-26
mode: standard (with manual SQL apply checkpoint)
requires:
  - phase 02 migration (RLS recursion fix dropping admin-read-all)
provides:
  - public.is_admin(uuid) SECURITY DEFINER helper function
  - profiles RLS policy "profiles: admin read all" via is_admin()
  - scripts/verify-admin-rls.mjs smoke verification
requirements: [ADMIN-01, ADMIN-02, ADMIN-03]
---

# Phase 04 / Plan 01 — RLS Unblock Summary

**Restored admin-read-all access on `public.profiles` via a SECURITY DEFINER helper, unblocking every Phase 4 admin query.**

## Why this plan existed

Migration 02 dropped the original `"profiles: admin read all"` policy because it had infinite recursion (the policy queried `profiles` inside its own USING clause). Without the policy, admin can only read their own profile — every Phase 4 read across other profiles (count students/professors, list department professors, professor detail) would return empty.

## What ships

- **Migration:** `supabase/migrations/00000000000004_admin_read_all.sql`
  - `public.is_admin(uid uuid) returns boolean` — SECURITY DEFINER, stable, search_path locked to public, exposes `exists(select 1 from profiles where id = uid and role = 'admin')`. SECURITY DEFINER bypasses RLS internally → no recursion.
  - `grant execute on function public.is_admin(uuid) to anon, authenticated`
  - `create policy "profiles: admin read all" on public.profiles for select using (public.is_admin(auth.uid()))`
- **Smoke script:** `scripts/verify-admin-rls.mjs` — signs in as admin/professor/student via Supabase REST and verifies admin sees all 3 profiles, others see only their own.

## Verification

```
=== Phase 4 plan 04-01: verify admin RLS unblock ===

[admin     ] PASS sees 3 profile(s); own role = admin
[professor ] PASS sees 1 profile(s); own role = professor
[student   ] PASS sees 1 profile(s); own role = student
```

`node scripts/verify-admin-rls.mjs` exits 0 against the live Supabase project (`htlolqbwhulyihguwdoq`).

## Commits
- `6c0cae6` feat(04-01): write migration 04 — SECURITY DEFINER is_admin + admin-read-all
- `debc5b8` feat(04-01): add verify-admin-rls.mjs smoke script
- (manual SQL apply by user via Supabase dashboard — no commit; verified via smoke script above)

## Notes for downstream plans
- 04-02 query hooks can now safely call `.from('profiles').select(...)` for any profile when signed in as admin
- The `courses: admin read all` policy from initial_schema.sql is non-recursive (uses `auth.uid()` directly) and was never broken — so admin can already read all courses
- Departments + programs already use `auth.role() = 'authenticated'` for select — admin reads work fine
