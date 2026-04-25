---
phase: 01-scaffold
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .gitignore
  - .env.example
  - .env.local
autonomous: false
requirements:
  - SUB-01
  - SUB-05
user_setup:
  - service: github
    why: "Git remote must point to user's repo, not Scholera's"
    dashboard_config:
      - task: "Confirm gh auth status shows KiumburaNGithinji logged in"
        location: "terminal: gh auth status"
  - service: supabase
    why: "Anon key needed for .env.local (values are NOT committed)"
    env_vars:
      - name: EXPO_PUBLIC_SUPABASE_ANON_KEY
        source: "Supabase Dashboard → Project (htlolqbwhulyihguwdoq) → Settings → API → anon public"

must_haves:
  truths:
    - "Git remote origin points to github.com/KiumburaNGithinji/scholera-mobile (never Scholera's repo)"
    - ".env.local exists locally with real Supabase credentials but is never tracked by git"
    - ".env.example is committed with placeholder values only (never real keys)"
    - "Any file matching .env* (except .env.example) is ignored by git"
  artifacts:
    - path: ".gitignore"
      provides: "Ignore rules for .env.local, .env.*, Supabase local dev folders"
      contains: ".env.local"
    - path: ".env.example"
      provides: "Placeholder template for Supabase env vars"
      contains: "EXPO_PUBLIC_SUPABASE_URL"
    - path: ".env.local"
      provides: "Real Supabase credentials for local dev"
      contains: "EXPO_PUBLIC_SUPABASE_ANON_KEY="
  key_links:
    - from: ".gitignore"
      to: ".env.local"
      via: "glob pattern .env.local or .env*"
      pattern: "\\.env(\\.local|\\*)"
    - from: "git remote origin"
      to: "github.com/KiumburaNGithinji/scholera-mobile"
      via: "git remote add origin"
      pattern: "KiumburaNGithinji/scholera-mobile"
---

<objective>
Establish the repository security baseline BEFORE any scaffold code is written. This plan creates the `.gitignore` + `.env.example` + `.env.local` triple and wires the git remote to the correct user-owned GitHub repo. Every Phase 1 submission-invalidator (SUB-01 wrong repo push, SUB-05 key leak) is eliminated at this step.

Purpose: Submission-invalidator elimination must happen first. Once Wave 2 runs `create-expo-app` and Wave 3 writes `lib/supabase.ts` referencing `process.env.EXPO_PUBLIC_SUPABASE_*`, the env files must already be correct and gitignored. Remote must be verified BEFORE any `git push` runs later in Phase 1.
Output: `.gitignore` with `.env*` rules committed; `.env.example` committed with placeholders; `.env.local` created locally with real values (NOT committed); git remote `origin` set to `https://github.com/KiumburaNGithinji/scholera-mobile.git`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-VALIDATION.md

<interfaces>
Key decisions locked in CONTEXT.md:
- D-23/D-24/D-25: Env var names are `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. The `EXPO_PUBLIC_` prefix is REQUIRED by Expo for runtime access from JS.
- D-26/D-27: Remote is `https://github.com/KiumburaNGithinji/scholera-mobile.git`. Initial branch is `main`.
- D-02: Supabase URL is `https://htlolqbwhulyihguwdoq.supabase.co`.
- D-31: service_role key NEVER in the app; only the anon key goes in `.env.local`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Configure .gitignore to exclude all env files and Supabase local dev folders</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/.gitignore</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.gitignore (if it exists — see what is already ignored)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"`.gitignore` (additions to standard Expo .gitignore)" (verbatim lines)
  </read_first>
  <action>
    Create or update `/Users/Kiumbura/Projects/scholera-mobile/.gitignore` at the repo root. The file does not exist yet (the current working tree is clean and has no .gitignore tracked). Write EXACTLY these contents (per D-24, D-30 from CONTEXT.md; verbatim from RESEARCH.md):

    ```
    # Dependencies
    node_modules/

    # Expo
    .expo/
    dist/
    web-build/
    expo-env.d.ts

    # Native
    *.orig.*
    *.jks
    *.p8
    *.p12
    *.key
    *.mobileprovision

    # Metro
    .metro-health-check*

    # Debug
    npm-debug.*
    yarn-debug.*
    yarn-error.*

    # macOS
    .DS_Store
    *.pem

    # Secrets (CRITICAL — per SUB-05)
    .env
    .env.local
    .env.*.local

    # Supabase local dev
    supabase/.branches
    supabase/.temp

    # Native build output
    ios/
    android/
    *.xcworkspace
    *.xcuserdatad
    ```

    NOTE: `create-expo-app` (Wave 2 / Plan 02) normally writes its own `.gitignore`. When that happens, the executor in Plan 02 MUST merge — preserving the `.env*` rules from this plan. The `.env*` lines are NON-NEGOTIABLE and must survive any regeneration.

    Do NOT add `.planning/` to gitignore — planning artifacts ARE tracked (they are docs, not secrets).
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && grep -q "^\.env\.local$" .gitignore && grep -q "^\.env$" .gitignore && grep -q "^\.env\.\*\.local$" .gitignore && ! grep -q "^\.planning" .gitignore && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - File `/Users/Kiumbura/Projects/scholera-mobile/.gitignore` exists
    - Contains the line `.env.local` on a line by itself
    - Contains the line `.env` on a line by itself
    - Contains the line `.env.*.local` on a line by itself
    - Does NOT contain a line starting with `.planning` (planning artifacts must be tracked)
    - Command `grep -c "^\.env" .gitignore` returns at least 3
  </acceptance_criteria>
  <done>
    `.gitignore` exists with env rules, Supabase local dev folders ignored, `.planning/` intentionally NOT ignored. Verification command from `<automated>` prints "OK".
  </done>
</task>

<task type="auto">
  <name>Task 2: Create .env.example with placeholder values (committed) and .env.local with real values (gitignored)</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/.env.example, /Users/Kiumbura/Projects/scholera-mobile/.env.local</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"`.env.example` (committed to git)" (verbatim lines)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md §"Environment variable naming" (D-23/D-24/D-25)
    - /Users/Kiumbura/Projects/scholera-mobile/.gitignore (confirm .env.local is ignored after Task 1 ran)
  </read_first>
  <action>
    Step 1 — Confirm `.gitignore` already ignores `.env.local` (Task 1 must be complete; run `grep -q "^\.env\.local$" /Users/Kiumbura/Projects/scholera-mobile/.gitignore` — abort if exit code is non-zero).

    Step 2 — Create `/Users/Kiumbura/Projects/scholera-mobile/.env.example` with these EXACT contents (per D-24 from CONTEXT.md):

    ```
    # Supabase — get values from Dashboard > Project Settings > API
    # NEVER commit .env.local
    EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder
    ```

    The value of `EXPO_PUBLIC_SUPABASE_ANON_KEY` MUST contain the word "placeholder" — this is what the smoke check in Plan 05 uses to distinguish a real key from the example.

    Step 3 — Create `/Users/Kiumbura/Projects/scholera-mobile/.env.local`. This is a CHECKPOINT for the user to supply the real anon key. Write this file with:

    ```
    # Real Supabase credentials — do NOT commit (gitignored)
    EXPO_PUBLIC_SUPABASE_URL=https://htlolqbwhulyihguwdoq.supabase.co
    EXPO_PUBLIC_SUPABASE_ANON_KEY=<PASTE ANON KEY HERE>
    ```

    Then PAUSE at the checkpoint (Task 3) for the user to replace `<PASTE ANON KEY HERE>` with the real anon key from Supabase Dashboard → Project (htlolqbwhulyihguwdoq) → Settings → API → "Project API keys" → "anon public" → Copy.

    DO NOT stage `.env.local` with git at any point. Never run `git add .env.local`. Never run `git add -A` or `git add .` in this task — use explicit file paths.

    Reference: D-03 (anon key supplied by user at execute time), D-31 (service_role NEVER in app).
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && test -f .env.example && test -f .env.local && grep -q "EXPO_PUBLIC_SUPABASE_URL" .env.example && grep -q "placeholder" .env.example && grep -q "htlolqbwhulyihguwdoq.supabase.co" .env.local && git check-ignore .env.local && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - File `/Users/Kiumbura/Projects/scholera-mobile/.env.example` exists
    - `.env.example` contains `EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co` (placeholder URL)
    - `.env.example` contains the word `placeholder` in the anon key line (distinguishes from real key)
    - File `/Users/Kiumbura/Projects/scholera-mobile/.env.local` exists
    - `.env.local` contains `htlolqbwhulyihguwdoq.supabase.co` (the real project URL from D-02)
    - `git check-ignore .env.local` exits 0 (file IS ignored)
    - `git check-ignore .env.example` exits 1 (file is NOT ignored — will be committed)
    - `git ls-files --error-unmatch .env.local` exits non-zero (file not tracked)
  </acceptance_criteria>
  <done>
    Both env files exist. `.env.example` committable with placeholders. `.env.local` gitignored with real URL. Anon key either already populated by user or placeholder `<PASTE ANON KEY HERE>` remains pending for the checkpoint below.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 3: User supplies Supabase anon key to .env.local</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/.env.local</files>
  <what-built>Task 2 created `/Users/Kiumbura/Projects/scholera-mobile/.env.local` with a placeholder `<PASTE ANON KEY HERE>` for the Supabase anon key.</what-built>
  <how-to-verify>
    1. Visit https://supabase.com/dashboard/project/htlolqbwhulyihguwdoq/settings/api (Supabase Dashboard → Project htlolqbwhulyihguwdoq → Project Settings → API).
    2. Under "Project API keys", locate the row labeled `anon` `public`.
    3. Click the copy icon next to that key — it begins with `eyJ...`.
    4. Open `/Users/Kiumbura/Projects/scholera-mobile/.env.local` and replace `<PASTE ANON KEY HERE>` with the copied anon key (no surrounding quotes).
    5. Save the file.
    6. CRITICAL: do NOT copy the `service_role` key — that key stays in the dashboard ONLY and must never land in the mobile app (per D-31).

    Why this is a human-action checkpoint: Claude cannot access the user's Supabase Dashboard session via CLI without an access token. No CLI shortcut exists for fetching an anon key without prior `supabase login` against THIS specific project (and per RESEARCH.md open question #1, this project isn't linked in the local CLI auth). User must paste the key manually once.
  </how-to-verify>
  <resume-signal>Type "key pasted" or "done" after updating .env.local. (If you ran into an issue — e.g. can't find the key — describe what you see in the dashboard.)</resume-signal>
  <action>
    User-only step. Pause execution and present `<what-built>` + `<how-to-verify>` instructions to the user. Wait for `<resume-signal>` before continuing. Do NOT proceed past this checkpoint with the placeholder string still in `.env.local` — Plan 03+ will silently fail at runtime if the anon key is the literal string `<PASTE ANON KEY HERE>`.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ" .env.local && ! grep -q "PASTE ANON KEY HERE" .env.local && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - File `/Users/Kiumbura/Projects/scholera-mobile/.env.local` does NOT contain the placeholder string `<PASTE ANON KEY HERE>`
    - `.env.local` contains a line starting with `EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ` (real JWT-shaped anon key)
    - `.env.local` is still gitignored (`git check-ignore .env.local` exits 0)
    - User has confirmed via the resume-signal that they pasted the `anon public` key (not `service_role`)
  </acceptance_criteria>
  <done>
    Real anon key is in `.env.local`. Plan 03's `lib/supabase.ts` will resolve `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY` to a working credential when bundled by Expo.
  </done>
</task>

<task type="auto">
  <name>Task 4: Configure git remote origin and verify the repo is KiumburaNGithinji/scholera-mobile (never Scholera's repo)</name>
  <files>git config (no file change — only git remote wiring)</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Git Workflow (push to existing remote)" (verbatim commands)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md §"GitHub repo" (D-26/D-27/D-28/D-29)
  </read_first>
  <action>
    Run these commands in order. Use absolute paths. Do NOT `cd` — pass `-C /Users/Kiumbura/Projects/scholera-mobile` to git OR run with explicit CWD via Bash.

    Step 1 — Check current remote state:
    ```bash
    git -C /Users/Kiumbura/Projects/scholera-mobile remote -v
    ```
    Expected: Empty output (no remotes set yet — confirmed at planning time).

    Step 2 — Add origin pointing to the user's repo:
    ```bash
    git -C /Users/Kiumbura/Projects/scholera-mobile remote add origin https://github.com/KiumburaNGithinji/scholera-mobile.git
    ```

    If `remote add` fails with "remote origin already exists", the remote was already set — verify it is correct with `git remote -v`. If it points anywhere other than `KiumburaNGithinji/scholera-mobile`, reset it:
    ```bash
    git -C /Users/Kiumbura/Projects/scholera-mobile remote set-url origin https://github.com/KiumburaNGithinji/scholera-mobile.git
    ```

    Step 3 — Verify origin URL is correct (this is the SUB-01 submission-invalidator gate):
    ```bash
    git -C /Users/Kiumbura/Projects/scholera-mobile remote -v
    ```
    Expected output contains `origin\thttps://github.com/KiumburaNGithinji/scholera-mobile.git (fetch)` AND `(push)`. If the URL shows `lucidopus/scholera-coding-assessments` OR any other owner, ABORT — this is a submission-invalidator.

    Step 4 — Set default branch to `main`:
    ```bash
    git -C /Users/Kiumbura/Projects/scholera-mobile branch -M main
    ```

    Step 5 — Verify gh auth status:
    ```bash
    gh auth status
    ```
    Expected: `Logged in to github.com as KiumburaNGithinji`. If not logged in, run `gh auth login` and follow prompts (this is a CLI-to-CLI interaction, not a user checkpoint).

    Do NOT push anything in this task. Push is the LAST task in Phase 1 (Plan 05), gated behind the full smoke script.

    Reference: D-26 (LOCKED — repo already created), D-29 (verify remote before first push).
  </action>
  <verify>
    <automated>git -C /Users/Kiumbura/Projects/scholera-mobile remote -v | grep -E "^origin\s+https://github\.com/KiumburaNGithinji/scholera-mobile\.git\s+\(push\)$" && ! git -C /Users/Kiumbura/Projects/scholera-mobile remote -v | grep -i "lucidopus\|scholera-coding-assessments" && git -C /Users/Kiumbura/Projects/scholera-mobile symbolic-ref --short HEAD | grep -q "^main$" && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - `git remote -v` output contains exactly one origin, with URL `https://github.com/KiumburaNGithinji/scholera-mobile.git`
    - `git remote -v` does NOT contain `lucidopus` or `scholera-coding-assessments` anywhere (submission-invalidator gate)
    - Current branch (via `git symbolic-ref --short HEAD`) is `main`
    - `gh auth status` exits 0 and output contains `KiumburaNGithinji` (case-insensitive match via grep)
  </acceptance_criteria>
  <done>
    Git remote `origin` points to user's repo (not Scholera's); current branch is `main`; `gh` is authenticated as `KiumburaNGithinji`. Ready for eventual push in Plan 05.
  </done>
</task>

</tasks>

<verification>
At the end of Plan 01, all of the following MUST be true:

1. `.gitignore` has `.env.local`, `.env`, and `.env.*.local` rules.
2. `.env.example` is committable (not gitignored) with placeholder values.
3. `.env.local` exists with real `EXPO_PUBLIC_SUPABASE_URL` for project `htlolqbwhulyihguwdoq` and a real anon key pasted by the user. File is gitignored.
4. `git remote -v` shows origin = `https://github.com/KiumburaNGithinji/scholera-mobile.git` and contains no other remotes.
5. Current branch is `main`.
6. No `.env.local` file is tracked by git (`git ls-files .env.local` returns empty).

Run these validation commands at end of plan:
```bash
cd /Users/Kiumbura/Projects/scholera-mobile
grep -q "^\.env\.local$" .gitignore && echo "✓ .gitignore excludes .env.local"
git check-ignore .env.local && echo "✓ .env.local is git-ignored"
git remote -v | grep -q "KiumburaNGithinji/scholera-mobile" && ! git remote -v | grep -q "lucidopus" && echo "✓ remote is correct"
```
</verification>

<success_criteria>
- [ ] SUB-05 submission-invalidator neutralized: `.env*` files cannot be accidentally committed
- [ ] SUB-01 submission-invalidator neutralized: git remote confirmed pointing at user's repo
- [ ] User's anon key is in `.env.local` and NOT in git history
- [ ] Branch is `main` (matches GitHub default)
- [ ] gh CLI authenticated (Plan 05 push will work without re-auth)
</success_criteria>

<output>
After completion, create `/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-scaffold-01-SUMMARY.md` documenting:
- Exact `.gitignore` contents written
- Confirmation that `.env.local` was populated by user (not exposing the key value in the SUMMARY)
- `git remote -v` output (to lock in remote state for later plans)
</output>
