# Phase 1: Scaffold - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning
**Mode:** Auto (all gray areas resolved with recommended defaults, logged below)

<domain>
## Phase Boundary

**What Phase 1 delivers:** Project foundation locked and 4 submission-invalidators eliminated before a single screen is written.

**In scope:**
- New public GitHub repo at `github.com/Kiumbura/scholera-mobile` (or similar slug under Kiumbura's account)
- `.gitignore` + `.env.example` + `.env.local` structure so no keys ever reach git history
- Expo project scaffolded with all pinned packages from `research/STACK.md`
- Supabase project decision (use Scholera-provided creds if available, else create our own free-tier project)
- `lib/supabase.ts` singleton with correct session adapter (AsyncStorage; NOT SecureStore)
- Supabase types generated via CLI and committed to repo
- SQL seed script (at least: 1 admin, 1 professor with 2 courses of real modules + items + topics + roadmap, 1 student enrolled)
- First hand-written paragraph of `AI_ASSISTANT_USAGE.md` committed

**Not in scope (deferred to later phases):**
- UI / screens (Phase 2+)
- Auth flow wiring (Phase 3)
- Any role experience (Phases 4–6)

Requirements covered: **SUB-01, SUB-05.**
The other SUB-* requirements (README, demo video, `AI_ASSISTANT_USAGE.md` finalized) are Phase 8.

</domain>

<decisions>
## Implementation Decisions

### Supabase project provisioning

- **D-01:** **LOCKED — User has already provisioned the Supabase project.** No need to investigate Scholera's assessments repo.
- **D-02:** **Project ID:** `htlolqbwhulyihguwdoq`
  **URL:** `https://htlolqbwhulyihguwdoq.supabase.co`
  **Dashboard:** `https://supabase.com/dashboard/project/htlolqbwhulyihguwdoq`
- **D-03:** **Anon key** to be supplied by user when execute-phase 1 needs to write `.env.local` (Dashboard → Project Settings → API → "Project API keys" → `anon public`). NEVER commit `service_role`.
- **D-04:** Schema + seed get applied to this Supabase project via the Supabase SQL editor or `psql` connection during execute-phase. Migrations live in `supabase/migrations/`.

### Schema definition

- **D-05:** Define schema ourselves from the assignment spec since Scholera's exact schema isn't provided. Derive tables from the "How the Platform Works" and "Required Features" sections: `profiles`, `departments`, `programs`, `courses` (alias `course_sections`), `enrollments`, `announcements`, `modules`, `module_items`, `roadmap_items`, `topics`, `student_progress` (separate table for STUD-04 dual-status).
- **D-06:** Commit the schema as a single `supabase/migrations/00000000000001_initial_schema.sql` file plus a `supabase/seed.sql` file. No TypeORM / Prisma — just raw SQL + generated TS types.
- **D-07:** **Row-Level Security enabled from day one** with explicit policies per table (admin read-all; professor read/write own courses; student read/write own progress + read enrollments). Silent RLS failures are a PITFALLS critical item.
- **D-08:** Auto-selected (recommended): **(c) minimal schema from spec, adjust as needed.**

### Seed data strategy

- **D-09:** **SQL seed script in `supabase/seed.sql`**, invoked via `psql` or Supabase CLI. Reproducible, single source of truth, diff-able.
- **D-10:** Seed must include: 1 admin (`admin@demo.scholera.test`), 1 professor (`prof@demo.scholera.test`) with 2 courses × 2 modules × 3 items × 5 topics × roadmap nodes, 1 student (`student@demo.scholera.test`) enrolled in both courses with some progress pre-marked, 2 departments, 2 programs. Passwords: uniform `demo-password-1234` so demo is fast.
- **D-11:** Seed script is idempotent (uses `ON CONFLICT DO NOTHING` on stable fake UUIDs) so re-running is safe.
- **D-12:** Auto-selected (recommended): **(a) SQL seed script.**

### Repo structure (top-level)

- **D-13:** Follow the `research/ARCHITECTURE.md` layout:
  ```
  scholera-mobile/
  ├── app/                    # Expo Router routes only (role groups below)
  │   ├── _layout.tsx         # providers + Slot ONLY, no guards
  │   ├── (auth)/
  │   ├── (admin)/
  │   ├── (professor)/
  │   └── (student)/
  ├── components/
  │   └── ui/                 # Button, Card, Chip, ListRow, EmptyState, Skeleton, ErrorView
  ├── hooks/                  # TanStack Query wrappers
  ├── queries/                # Pure async fns (typed Supabase client arg)
  ├── lib/
  │   └── supabase.ts         # singleton client
  ├── providers/              # AuthProvider, RoleThemeProvider, QueryClientProvider wrap
  ├── theme/                  # tokens.ts, roles.ts, tailwind.config.js
  ├── types/                  # database.types.ts (generated)
  ├── supabase/
  │   ├── migrations/
  │   └── seed.sql
  ├── reference/              # mobile-developer.md, design-direction.md, shortlist email
  ├── .planning/              # GSD artifacts (already exists)
  ├── app.json                # Expo config — scheme "scholera", name, slug
  ├── babel.config.js
  ├── tailwind.config.js
  ├── tsconfig.json
  ├── package.json
  ├── .env.example            # committed placeholder
  ├── .env.local              # gitignored, real keys
  ├── AI_ASSISTANT_USAGE.md   # draft starts here
  └── README.md               # starts with minimal setup steps
  ```
- **D-14:** Auto-selected (recommended): **(c) ARCHITECTURE.md layout.**

### TypeScript path aliases

- **D-15:** Use `@/` aliases via `tsconfig.json` `paths`. Expo Router + Metro support this out of the box (`baseUrl: "."` + `paths: { "@/*": ["./*"] }`). Keeps imports stable if we move files.
- **D-16:** Auto-selected (recommended): **(a) `@/` aliases.**

### Expo dev client vs Expo Go

- **D-17:** **Start with Expo Go for Phase 1–2** (faster iteration), **switch to dev client before Phase 3 (Auth)** so custom deep linking scheme and Supabase storage work properly. `eas build --profile development --platform ios` once before Phase 3.
- **D-18:** Rationale: Expo Go is sufficient for scaffolding + tokens + primitives. Custom scheme deep linking in PITFALLS requires dev client — but that's Phase 7, not Phase 1. Expo Go is fine for rapid Phase 1/2 iteration.
- **D-19:** Auto-selected (recommended): **(a) Expo Go → dev client transition at Phase 3 boundary.** (Slight departure from initial research recommendation of "dev client from day one" — pragmatic compromise for 2-day timeline.)

### AI_ASSISTANT_USAGE.md strategy

- **D-20:** Hand-written paragraph committed in Phase 1 with: what I'm building, how I plan to use Claude Code (pair + verify), specifically that I'm using GSD (Get-Shit-Done) as a workflow orchestrator.
- **D-21:** Appended to throughout development with casual bullets after each phase (e.g., "ran into Supabase session bug, Claude helped debug", "generated seed data SQL, reviewed and tweaked"). NOT written at the end. Casual Slack-message voice.
- **D-22:** Auto-selected (recommended): **(b) stub now, append throughout.**

### Environment variable naming

- **D-23:** `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Expo's required prefix for runtime access from JS. Service role key is NEVER in the mobile app.
- **D-24:** `.env.example` committed with placeholder values; `.env.local` is real values and gitignored.
- **D-25:** Auto-selected (recommended): **(a) EXPO_PUBLIC_*.**

### GitHub repo

- **D-26:** **LOCKED — User has already created the repo:** `github.com/KiumburaNGithinji/scholera-mobile` (public).
- **D-27:** `origin` set via `git remote add origin https://github.com/KiumburaNGithinji/scholera-mobile.git`. Verified via `git remote -v` before first push. Initial branch: `main`.
- **D-28:** Push requires `gh auth status` to be logged in OR HTTPS auth via PAT. User to verify with `gh auth status` before execute-phase pushes.

### Submission-invalidator gates (done in Phase 1 or never)

- **D-29:** **Before first `git push`:** run `git remote -v` and verify origin is `github.com/KiumburaNGithinji/scholera-mobile`. Never push to `lucidopus/scholera-coding-assessments`.
- **D-30:** **Before first commit:** verify `.env*` is in `.gitignore`, do `git diff --cached | grep -Ei "(supabase\\.co|eyJ|sb_secret|service_role)"` to check nothing leaked.
- **D-31:** Keep Supabase `service_role` key out of the mobile app entirely. Only `anon` key (public by design) goes in `.env.local` with `EXPO_PUBLIC_` prefix.

### Claude's Discretion

- Exact Expo config values in `app.json` beyond `scheme: "scholera"` and basic name/slug.
- Exact Supabase migration file structure beyond the naming convention.
- Whether to add a `scripts/` folder for helper scripts (e.g., seed runner).
- `lucide-react-native` vs `@expo/vector-icons` selection — STACK.md recommends Lucide; planner can confirm during implementation.
- Whether to install Moti for skeletons in Phase 1 or wait for Phase 2.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Assignment spec (authoritative)
- `reference/mobile-developer.md` — Full assignment. **Read first** before planning.
- `reference/design-direction.md` — Design DNA supplement (Claude-inspired visual language, role-specific accents, stack preferences).
- `reference/shortlist-email.pdf` — Scholera shortlist email; confirms submission target (patelharshil@scholera-inc.com), due date (2026-04-25), read-only assessments repo location.

### Project-level decisions
- `.planning/PROJECT.md` — Core value, constraints, key decisions.
- `.planning/REQUIREMENTS.md` — 29 v1 requirements + traceability.
- `.planning/ROADMAP.md` §"Phase 1" — phase goal and success criteria.
- `.planning/config.json` — workflow settings (yolo / standard / parallel / no verifier).

### Research outputs (deep technical detail)
- `.planning/research/STACK.md` — Exact pinned library versions, 3 version mistakes to avoid (NativeWind v5, `zod/v4`, SecureStore for sessions).
- `.planning/research/FEATURES.md` — Feature-by-feature UX patterns.
- `.planning/research/ARCHITECTURE.md` — Directory structure, two-layer data pattern, NativeWind `vars()` role theming.
- `.planning/research/PITFALLS.md` §"CRITICAL" — 4 submission-invalidators; §Supabase — RLS silent failure, storage INSERT policy, auth deadlock.
- `.planning/research/SUMMARY.md` — Synthesis; Phase 1 implications bullet list.

### External (needs runtime verification in Phase 1)
- `github.com/lucidopus/scholera-coding-assessments` — Check for any provided Supabase credentials, schema file, or backend guidance. Read-only; do NOT push work there.

### Standards we're following
- Expo Router file-based routing conventions (official docs).
- Supabase RN quickstart (official; AsyncStorage adapter pattern).
- NativeWind v4.2.x theme guide (`vars()` API).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None.** Greenfield scaffold. The previous "working directory" (`~/Downloads/Mobile Developer Intern Assignment/`) was inside the user's home directory git repo; this phase creates a brand-new standalone repo at `~/Projects/scholera-mobile/` with no prior code.

### Established Patterns
- None in-codebase yet.
- **Research-established patterns** (to be implemented, not inherited):
  - Two-layer data: `queries/` (pure fns) + `hooks/` (TanStack Query wrappers) → screens call hooks only.
  - Role routing: root `_layout.tsx` = providers + `<Slot />`; guards in role-group `_layout.tsx` with `Stack.Protected`.
  - Theme: single-source tokens in `theme/tokens.ts`, role swap via NativeWind `vars()`.

### Integration Points
- None yet — this phase IS the integration point setup.

### Known constraints from user profile / memory
- User is **Kiumbura N. Githinji**, s1358017, Monmouth CS 414/514. Familiar with Supabase (FamilyFinance project uses Vite + Supabase + Netlify).
- **$0 budget** — free-tier Supabase only; no paid services.
- **2-day deadline** — Phase 1 must wrap in ~30 min to leave time for the other 7 phases.

</code_context>

<specifics>
## Specific Ideas

- The `AI_ASSISTANT_USAGE.md` opening paragraph should read like a Slack message to a teammate, not a technical report. Voice: first-person, casual, slightly self-deprecating where appropriate. Example tone: "I used Claude Code throughout this build, mostly as a pair-programmer + workflow orchestrator. I ran GSD (a multi-agent planning framework) on top of it — ..."
- The seed data should be **demo-story-complete**: the professor's course "Introduction to Neural Networks" has 2 modules ("Week 1 — Foundations", "Week 2 — Training"), each with 2–3 items (a lecture PDF, a video link, a note) and the roadmap should have pre-set coverage status (Week 1 items marked "complete", Week 2 items "in progress"). This gives the demo video real content to walk through.
- If the lucidopus/scholera-coding-assessments repo has an `.env.example` or schema file — use it. But don't block on it; their assessments repos historically provide only the assignment, not the backend.

</specifics>

<deferred>
## Deferred Ideas

- **Storage bucket creation + INSERT policy** — Needed for file upload (Phase 5 professor module items) and avatar upload (Phase 7 profile). Flagged in research as a manual dashboard step. If we're provisioning our own Supabase project in Phase 1, include bucket creation in the seed/setup script. If Scholera-provided, verify buckets exist when Phase 5 plans run.
- **Apple/Google OAuth or magic link auth** — Spec is email/password only. Out of scope, no change needed.
- **CI/CD / EAS build pipeline** — Out of scope for this take-home. Manual build + local demo only.
- **Production env config** — Out of scope. Dev only.
- **Schema evolution migrations** — We're writing one initial migration. If Phase 3+ discovers missing columns, we'll add migrations at that time.
- **Type regeneration CI hook** — Nice-to-have. Skip unless time allows.

### Reviewed Todos (not folded)
- None — todo scan found zero matches for Phase 1.

</deferred>

---

*Phase: 01-scaffold*
*Context gathered: 2026-04-23*
