#!/usr/bin/env node
// Phase 4 plan 04-01 verification: confirm migration 04 (admin_read_all) is applied.
//
// Acceptance (cumulative — runs all 3 checks before exiting):
//   - admin     signs in -> sees 3 profiles (FAIL message: "expected 3, got <n>")
//   - professor signs in -> sees 1 profile (FAIL message: "expected 1, got <n>")
//   - student   signs in -> sees 1 profile (FAIL message: "expected 1, got <n>")
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
