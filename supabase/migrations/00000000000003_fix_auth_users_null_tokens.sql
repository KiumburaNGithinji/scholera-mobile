-- ============================================================
-- Fix: NULL token columns in auth.users for demo accounts
-- File: supabase/migrations/00000000000003_fix_auth_users_null_tokens.sql
-- ============================================================
-- The seed inserted auth.users rows with only the bare minimum columns.
-- Newer Supabase Auth versions enforce NOT NULL on several token columns
-- (confirmation_token, recovery_token, email_change_*, phone_change_*,
-- reauthentication_token). When gotrue runs SELECT on auth.users during
-- sign-in, it deserializes those columns into Go structs that reject NULL,
-- producing a generic HTTP 500 "Database error querying schema".
--
-- Fix: backfill empty strings (the gotrue default for unused token fields).
-- Apply once in the Supabase SQL editor.

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email LIKE '%@demo.scholera.test';
