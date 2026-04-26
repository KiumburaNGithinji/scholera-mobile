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
