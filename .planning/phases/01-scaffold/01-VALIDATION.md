---
phase: 1
slug: scaffold
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 1 is infrastructure scaffolding. There are no behavioral tests yet — validation is smoke checks (file existence, command exit codes, compile checks, API connectivity).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None yet (Phase 1 is pre-implementation; Phase 2 may introduce a test framework) |
| **Config file** | None |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `bash scripts/phase1-smoke.sh` (script created in Phase 1 task list) |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit` (typecheck — fast, ~3s after first run)
- **After every plan wave:** Run `bash scripts/phase1-smoke.sh` (full smoke check — ~30s)
- **Before `/gsd:verify-work`:** All five smoke checks below pass
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

(Filled by planner once PLAN.md tasks are written. Each task gets either an automated command or an explicit "Manual: <reason>".)

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | SUB-05 | smoke | `grep -q "^\.env\.local$" .gitignore && grep -q "^\.env$" .gitignore && grep -q "^\.env\.\*\.local$" .gitignore && ! grep -q "^\.planning" .gitignore` | ✅ | ⬜ pending |
| 1-01-02 | 01 | 1 | SUB-05 | smoke | `test -f .env.example && test -f .env.local && grep -q "placeholder" .env.example && git check-ignore .env.local` | ✅ | ⬜ pending |
| 1-01-03 | 01 | 1 | SUB-05 | smoke | `grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ" .env.local && ! grep -q "PASTE ANON KEY HERE" .env.local` (post-checkpoint) | ✅ | ⬜ pending |
| 1-01-04 | 01 | 1 | SUB-01 | smoke | `git remote -v \| grep -E "^origin\s+https://github\.com/KiumburaNGithinji/scholera-mobile\.git\s+\(push\)$"` | ✅ | ⬜ pending |
| 1-02-01 | 02 | 2 | — | smoke | `test -f package.json && grep -q "\"expo\"" package.json && grep -q "^\.env\.local$" .gitignore && ! test -d "app/(tabs)"` | ✅ | ⬜ pending |
| 1-02-02 | 02 | 2 | — | smoke | `node -e "require('./package.json').dependencies['@supabase/supabase-js']"` (every pinned dep present) | ✅ | ⬜ pending |
| 1-02-03 | 02 | 2 | — | smoke | `node -e "const c=require('./app.json'); if(c.expo.scheme!=='scholera'\|\|c.expo.newArchEnabled!==false)throw 1"` | ✅ | ⬜ pending |
| 1-03-01 | 03 | 3 | — | smoke | `grep -q "nativewind/preset" tailwind.config.js && grep -q "@tailwind base" global.css && grep -q "jsxImportSource.*nativewind" babel.config.js && grep -q "withNativeWind(config" metro.config.js` | ✅ | ⬜ pending |
| 1-03-02 | 03 | 3 | — | smoke | `node -e "const c=require('./tsconfig.json'); if(c.compilerOptions.strict!==true\|\|!c.compilerOptions.paths['@/*'])throw 1"` | ✅ | ⬜ pending |
| 1-03-03 | 03 | 3 | — | smoke | `test -d "app/(auth)" && test -d "app/(admin)/(tabs)" && test -d lib && test -d types && test -d supabase/migrations` | ✅ | ⬜ pending |
| 1-03-04 | 03 | 3 | — | smoke | `head -5 lib/supabase.ts \| grep -q "react-native-url-polyfill/auto" && grep -q "storage: AsyncStorage" lib/supabase.ts && ! grep -q "SecureStore" lib/supabase.ts` | ✅ | ⬜ pending |
| 1-03-05 | 03 | 3 | — | smoke | `head -2 app/_layout.tsx \| grep -q "global.css" && grep -q "SafeAreaProvider" app/_layout.tsx` | ✅ | ⬜ pending |
| 1-03-06 | 03 | 3 | — | smoke | `grep -q "export interface Database" types/database.types.ts && grep -q "export type Role" types/app.types.ts` | ✅ | ⬜ pending |
| 1-03-07 | 03 | 3 | — | gate | `npx tsc --noEmit` exits 0 (Wave 3 gate) | ✅ | ⬜ pending |
| 1-04-01 | 04 | 4 | — | smoke | `grep -c "create table if not exists public\." supabase/migrations/00000000000001_initial_schema.sql` returns 11 + RLS enable lines | ✅ | ⬜ pending |
| 1-04-02 | 04 | 4 | — | manual | User confirms via Dashboard: 11 tables visible with RLS enabled (post-checkpoint) | ⚠️ | ⬜ pending |
| 1-04-03 | 04 | 4 | — | smoke | `grep -q "demo-password-1234" supabase/seed.sql && grep -q "auth.identities" supabase/seed.sql && wc -l supabase/seed.sql ≥ 130` | ✅ | ⬜ pending |
| 1-04-04 | 04 | 4 | — | manual | User confirms 5 SQL count queries match: auth.users=3, auth.identities=3, profiles=3, courses=2, items/roadmap/topics/progress per spec (post-checkpoint) | ⚠️ | ⬜ pending |
| 1-04-05 | 04 | 4 | — | smoke | `wc -l types/database.types.ts > 100 && grep -q "profiles:" types/database.types.ts && npx tsc --noEmit` | ✅ | ⬜ pending |
| 1-05-01 | 05 | 5 | — | smoke | `test -x scripts/phase1-smoke.sh && grep -q "1/5 TypeScript" scripts/phase1-smoke.sh` | ✅ | ⬜ pending |
| 1-05-02 | 05 | 5 | SUB-03 (seed) | smoke | `test -f AI_ASSISTANT_USAGE.md && wc -l AI_ASSISTANT_USAGE.md ≥ 5` (post-checkpoint) | ✅ | ⬜ pending |
| 1-05-03 | 05 | 5 | — | smoke | `grep -q "Scholera Mobile" README.md && grep -q "EXPO_PUBLIC_SUPABASE" README.md` | ✅ | ⬜ pending |
| 1-05-04 | 05 | 5 | SUB-01, SUB-05 | gate | `bash scripts/phase1-smoke.sh` — all 5 checks green | ✅ | ⬜ pending |
| 1-05-05 | 05 | 5 | SUB-01, SUB-05 | gate | `git ls-remote --heads origin main \| grep refs/heads/main` AND `git log --all -p \| grep -Ei "(eyJ[a-zA-Z]{20,})" \| grep -v placeholder` returns EMPTY | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky / manual*

Total: 24 tasks across 5 plans / 5 waves. Of those: 19 fully automated, 2 partial (file-state checks bracket the manual Supabase Dashboard verification), 3 user-action checkpoints (Plan 01 Task 3 anon key paste, Plan 04 Tasks 2/4 SQL apply, Plan 05 Task 2 AI_ASSISTANT_USAGE.md authoring) — all with file-state automated post-checks.

---

## Phase 1 Smoke Check Script

Tasks should produce a `scripts/phase1-smoke.sh` file. Contents (target — created during Phase 1 tasks):

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ 1/5 TypeScript compiles..."
npx tsc --noEmit
echo "  ✓ ok"

echo "→ 2/5 Required files exist..."
test -f app.json || { echo "  ✗ app.json missing"; exit 1; }
test -f babel.config.js || { echo "  ✗ babel.config.js missing"; exit 1; }
test -f metro.config.js || { echo "  ✗ metro.config.js missing"; exit 1; }
test -f tailwind.config.js || { echo "  ✗ tailwind.config.js missing"; exit 1; }
test -f global.css || { echo "  ✗ global.css missing"; exit 1; }
test -f lib/supabase.ts || { echo "  ✗ lib/supabase.ts missing"; exit 1; }
test -f types/database.types.ts || { echo "  ✗ database types missing"; exit 1; }
test -f .env.example || { echo "  ✗ .env.example missing"; exit 1; }
test -f .env.local || { echo "  ✗ .env.local missing (run setup)"; exit 1; }
test -f AI_ASSISTANT_USAGE.md || { echo "  ✗ AI_ASSISTANT_USAGE.md missing"; exit 1; }
test -f supabase/migrations/00000000000001_initial_schema.sql || { echo "  ✗ initial migration missing"; exit 1; }
test -f supabase/seed.sql || { echo "  ✗ seed.sql missing"; exit 1; }
echo "  ✓ ok"

echo "→ 3/5 url-polyfill is FIRST import in lib/supabase.ts..."
head -1 lib/supabase.ts | grep -q "react-native-url-polyfill/auto" \
  || { echo "  ✗ url-polyfill must be the FIRST import"; exit 1; }
echo "  ✓ ok"

echo "→ 4/5 Database types contain expected tables..."
grep -q "profiles:" types/database.types.ts \
  && grep -q "courses:" types/database.types.ts \
  && grep -q "modules:" types/database.types.ts \
  && grep -q "module_items:" types/database.types.ts \
  && grep -q "roadmap_items:" types/database.types.ts \
  && grep -q "topics:" types/database.types.ts \
  && grep -q "student_progress:" types/database.types.ts \
  || { echo "  ✗ types missing one or more expected tables"; exit 1; }
echo "  ✓ ok"

echo "→ 5/5 No secrets in git history..."
LEAK=$(git log --all -p 2>/dev/null | grep -Ei "(eyJ[a-zA-Z]{20,})" | grep -v "placeholder" || true)
if [ -n "$LEAK" ]; then
  echo "  ✗ possible secret detected in git history:"
  echo "$LEAK" | head -5
  exit 1
fi
echo "  ✓ ok"

echo
echo "Phase 1 smoke checks: ALL GREEN ✓"
```

This script is **part of Phase 1's deliverables** and gets executed at the end of Phase 1 to gate the transition to Phase 2.

---

## Phase Requirements → Verification Map

| Req ID | Behavior | Verification |
|--------|----------|--------------|
| **SUB-01** | New public GitHub repo at `github.com/KiumburaNGithinji/scholera-mobile` is the only `origin`, never Scholera's read-only assessments repo | Manual one-time check: `git remote -v` matches expected value, then `git push -u origin main` succeeds against the locked remote |
| **SUB-05** | No Supabase keys (or other secrets) ever committed to the public repo | Smoke (script item #5): `git log --all -p \| grep -Ei "(eyJ[a-zA-Z]{20,})" \| grep -v placeholder` returns empty AND `.env*` is in `.gitignore` |

---

## Wave 0 Requirements

Phase 1 is itself the "Wave 0" for the entire project — it creates the test surface that future phases will validate against. Within Phase 1:

- [ ] `tsconfig.json` exists with strict mode + `@/*` paths so `npx tsc --noEmit` works
- [ ] `types/database.types.ts` exists (even if empty stub initially) so future imports compile
- [ ] `scripts/phase1-smoke.sh` exists and is executable (`chmod +x`)
- [ ] No test framework needed for Phase 1 itself

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub repo is public + correctly named | SUB-01 | Requires browser visit to verify visibility | Visit `github.com/KiumburaNGithinji/scholera-mobile` — repo is reachable without auth, has public badge |
| GitHub Actions / repo settings sane | SUB-01 | One-time setup item | Confirm "Issues", "Wiki", etc. set to defaults; no GitHub Pages enabled (not needed) |
| Supabase migration applied successfully | SUB-01 (indirectly) | Requires Supabase Dashboard or `psql` connection | After running migration: visit Supabase Dashboard → Table Editor → confirm 11 tables present |
| Supabase seed data populated | SUB-01 (indirectly) | Same | After seed: 1 admin + 1 professor + 1 student in `auth.users` AND `profiles`; 2 courses with full module/item/roadmap/topic data |
| `.env.local` not in any commit | SUB-05 | The script checks for token patterns but a defense-in-depth check via `git log --all --diff-filter=A` for `.env.local` confirms it never staged | `git log --all --diff-filter=A --name-only \| grep '\\.env\\.local'` returns empty |

---

## Validation Sign-Off

- [ ] All Phase 1 tasks have `<automated>` verify (smoke command) or are flagged Manual with reason
- [ ] Sampling continuity: smoke script covers every Phase 1 deliverable
- [ ] Wave 0 covers all MISSING references (tsconfig, types stub, smoke script)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (smoke script runs fast)
- [ ] `nyquist_compliant: true` set in frontmatter (set after planner finishes per-task verification map)

**Approval:** pending — set `nyquist_compliant: true` after Phase 1 PLAN.md is written and per-task map is filled.
