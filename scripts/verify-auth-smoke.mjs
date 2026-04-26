#!/usr/bin/env node
// Smoke-test Phase 3 auth at the Supabase API level.
// For each demo user: sign in -> fetch role from profiles -> sign out.
// Pass = same role flow that AuthProvider runs at app startup.
//
// Usage: node scripts/verify-auth-smoke.mjs

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

const users = [
  { label: 'admin',     email: 'admin@demo.scholera.test',   expectedRole: 'admin' },
  { label: 'professor', email: 'prof@demo.scholera.test',    expectedRole: 'professor' },
  { label: 'student',   email: 'student@demo.scholera.test', expectedRole: 'student' },
]
const password = 'demo-password-1234'

let allPass = true
for (const u of users) {
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const tag = `[${u.label.padEnd(10)}]`

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: u.email,
    password,
  })
  if (signInError) {
    console.log(`${tag} FAIL sign-in: ${signInError.message}`)
    allPass = false
    continue
  }
  if (!signInData.session) {
    console.log(`${tag} FAIL sign-in: no session returned`)
    allPass = false
    continue
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', signInData.user.id)
    .single()

  if (profileError) {
    console.log(`${tag} FAIL profile fetch: ${profileError.message}`)
    allPass = false
  } else if (!profile) {
    console.log(`${tag} FAIL profile fetch: no row`)
    allPass = false
  } else if (profile.role !== u.expectedRole) {
    console.log(`${tag} FAIL role mismatch: expected ${u.expectedRole}, got ${profile.role}`)
    allPass = false
  } else {
    console.log(`${tag} PASS sign-in + role=${profile.role}`)
  }

  await supabase.auth.signOut()
}

if (allPass) {
  console.log('\nAll 3 demo users authenticated and resolved roles. AuthProvider logic verified at the Supabase layer.')
  process.exit(0)
} else {
  console.log('\nSome users failed. Inspect above and check Supabase project/seed status.')
  process.exit(1)
}
