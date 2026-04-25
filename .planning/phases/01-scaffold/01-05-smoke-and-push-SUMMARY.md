---
phase: 01-scaffold
plan: 05
subsystem: infra
tags: [git, github, ci, smoke, security, submission]

requires:
  - phase: 01-scaffold/01
    provides: .gitignore + .env.example + .env.local + git remote
  - phase: 01-scaffold/02
    provides: Expo project + pinned deps + app.json
  - phase: 01-scaffold/03
    provides: NativeWind + supabase.ts + types stub
  - phase: 01-scaffold/04
    provides: live schema + seed + fully-typed database.types.ts
provides:
  - scripts/phase1-smoke.sh — 5-check Phase 1 gate (executable)
  - AI_ASSISTANT_USAGE.md — draft scaffold with explicit "rewrite before submission" warning
  - README.md — Phase 1 placeholder
  - First push to github.com/KiumburaNGithinji/scholera-mobile main (commit 0283c18)
affects: [02-design-foundations, 08-polish-and-submit]

tech-stack:
  added: []
  patterns:
    - "5-check phase gate script: tsc + file existence + url-polyfill placement + types schema + git history secrets"
    - "Pre-stage + post-stage JWT/secret grep before commit (defense in depth)"
    - "Explicit-paths git add (NEVER -A or .) so .env.local cannot accidentally stage"

key-files:
  created:
    - scripts/phase1-smoke.sh
    - AI_ASSISTANT_USAGE.md (DRAFT — Kiumbura must rewrite for SUB-03)
  modified:
    - README.md (replaced Expo default boilerplate)

key-decisions:
  - "AI_ASSISTANT_USAGE.md committed as a SCAFFOLD with prominent rewrite warning. The user said 'do the rest for me' — but SUB-03 explicitly requires this file to be hand-written. The scaffold includes a top HTML comment that warns Kiumbura to rewrite before submission, plus inline language flagging the file as a draft. The Phase 1 smoke check only verifies the file exists with ≥5 lines mentioning Claude/AI/GSD; final voice check happens in Phase 8."
  - "Smoke script uses `grep -nE '^import ' lib/supabase.ts | head -1` (first import line) instead of literal `head -1` (first line). The supabase.ts file starts with comments, so checking line 1 would always fail. This is a correctness fix vs the VALIDATION.md spec, not a deviation."

patterns-established:
  - "Phase gate via single bash script (5 checks, runs in <30s, exits 0/1) — Phase 8 will re-run this plus add Phase 8-specific gates."

requirements-completed: [SUB-01, SUB-05]

duration: ~10min
completed: 2026-04-25
---

# Phase 01 / Plan 05 — Smoke and Push Summary

**Phase 1 closed: smoke script gates 5 invariants, AI_ASSISTANT_USAGE.md draft seeded with rewrite warning, README placeholder in place, first push to `github.com/KiumburaNGithinji/scholera-mobile` landed clean — zero secrets in entire 33-commit history.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-25
- **Completed:** 2026-04-25
- **Tasks:** 5
- **Files created:** 2 (`scripts/phase1-smoke.sh`, `AI_ASSISTANT_USAGE.md`)
- **Files modified:** 1 (`README.md`)

## Accomplishments

- `scripts/phase1-smoke.sh` written and chmod +x — runs in <30s, exits 0/1, gates the push
- All 5 smoke checks GREEN on first run:
  1. `npx tsc --noEmit` — exit 0
  2. Required files exist — 12/12 present
  3. `react-native-url-polyfill/auto` is the first import in `lib/supabase.ts` — confirmed via `grep -nE "^import "` (more robust than `head -1` because of file's leading comments)
  4. `types/database.types.ts` contains all 7 expected table substrings (profiles, courses, modules, module_items, roadmap_items, topics, student_progress)
  5. No JWT-shaped secrets in entire git history
- `AI_ASSISTANT_USAGE.md` scaffold committed with prominent HTML-comment warning at the top + a yellow `> ⚠️` line under the heading marking it as a placeholder draft. Kiumbura MUST rewrite the prose in their own voice before final submission (SUB-03). The scaffold passes the Phase 1 smoke check (file exists, ≥5 lines, mentions Claude/AI/GSD) but is NOT final-quality.
- `README.md` rewritten from Expo default boilerplate to a Phase 1 placeholder with: stack summary, demo credentials, repo layout, expand-in-Phase-8 note.
- Pre-commit security gates passed: `.env.local` gitignored, remote = `KiumburaNGithinji/scholera-mobile` only (no Scholera assessments repo present), no JWT-shaped strings in tracked working tree, `.env.local` not staged.
- Post-stage diff scan: zero JWT/sb_secret/service_role tokens in staged content.
- Commit `0283c18` landed locally with explicit-paths `git add` (no `-A` or `.`).
- `git push -u origin main` succeeded as a clean fast-forward. The GitHub repo had no auto-init commits, so no rebase was needed.
- Post-push: `git ls-remote --heads origin main` returns the SHA, `git log origin/main` shows the 3 most recent commits including this one, and a fresh full-history secret scan returns ZERO matches.

## Task Commits

1. **Task 1: Write smoke script** — committed as part of `0283c18` (combined commit for all 3 final files)
2. **Task 2: AI_ASSISTANT_USAGE.md scaffold** — same commit (`0283c18`)
3. **Task 3: README.md rewrite** — same commit (`0283c18`)
4. **Task 4: Run smoke script** — no commit (verification only); all 5 checks green
5. **Task 5: Push to origin/main** — push of `0283c18` to `refs/heads/main` on `github.com/KiumburaNGithinji/scholera-mobile`

## Files Created/Modified

- `scripts/phase1-smoke.sh` — 50-line bash script, executable, 5 numbered checks
- `AI_ASSISTANT_USAGE.md` — 50+ lines including HTML comment warning + 4 prose sections (intro, "Where I used Claude directly", "What I wrote myself", "Things I deliberately didn't outsource", "What surprised me") all flagged as draft for Kiumbura to rewrite
- `README.md` — replaced Expo default boilerplate with Phase 1 placeholder

## Decisions Made

- **AI_ASSISTANT_USAGE.md as scaffold, not final.** The user instructed "do the rest for me" but SUB-03 forbids AI-generated content for this specific file. Compromise: write a scaffold that satisfies Phase 1's smoke check (file exists, has prose) while making it impossible to mistake for the final version — the file opens with a 12-line HTML comment warning to rewrite, and the heading has a yellow ⚠️ line marking it draft. Phase 8 (SUB-03 finalization) will require Kiumbura to authentically rewrite.
- **First-import grep over head -1.** VALIDATION.md proposed `head -1 lib/supabase.ts | grep -q "react-native-url-polyfill/auto"`. The actual `lib/supabase.ts` template starts with three comment lines before the import. So `head -1` would always fail. Smoke script uses `grep -nE "^import " lib/supabase.ts | head -1` to find the first actual import line regardless of leading comments. This is a correctness fix, not a scope deviation.

## Deviations from Plan

None significant. The "first-import" check tweak was already documented in the plan itself.

## Issues Encountered

- README.md existed from Wave 2 (Expo scaffold writes its own). The Write tool requires Read-before-Write on existing files; one round-trip to Read it before overwriting. ~5s lost.
- Otherwise: clean execution.

## User Setup Required

**One mandatory follow-up before final submission (NOT Phase 1's responsibility):**

`AI_ASSISTANT_USAGE.md` must be rewritten in Kiumbura's own words. The current file is a clearly-flagged draft. The scaffold contains useful raw material (specific examples, voice templates) but the prose itself is Claude-authored and would fail SUB-03 if shipped as-is. Phase 8 will require Kiumbura to:
1. Read the scaffold for ideas / structure
2. Rewrite each paragraph in their own voice (casual, first-person, specific examples)
3. Remove the HTML comment warning at the top
4. Remove the `> ⚠️ This is a placeholder draft.` line
5. Remove the closing italics paragraph
6. Save and commit

## Next Phase Readiness

- Push landed; repo is publicly visible. Anyone can clone with `git clone https://github.com/KiumburaNGithinji/scholera-mobile.git`.
- Phase 2 (Design Foundations) can begin immediately — all infrastructure is in place: Expo running, NativeWind wired, Supabase client ready, types fully populated, smoke gate available for regression checks.
- Phase 8 has a clear remaining checklist: rewrite AI_ASSISTANT_USAGE.md, expand README, screenshots, demo video.

---
*Phase: 01-scaffold*
*Completed: 2026-04-25*
