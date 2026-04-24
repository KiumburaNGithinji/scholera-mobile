# Project Research Summary

**Project:** Scholera Mobile
**Domain:** Native mobile companion app for an AI-native LMS (Supabase-backed, 3 roles)
**Researched:** 2026-04-23
**Confidence:** HIGH

## Executive Summary

Scholera Mobile is a React Native / Expo prototype for a take-home assignment, due 2026-04-25 (2-day window). The app must authenticate via Supabase, detect user role from the profile, and route the user into a completely separate admin, professor, or student experience — each graded as feeling native, polished, and distinct. All 11 spec features are buildable in the timeline with the proposed stack.

The verified stack (Expo SDK 54 + NativeWind 4.2.3 + Supabase JS 2.103.3 + TanStack Query 5 + Expo Router 4) has no unresolved blockers, provided three pinning decisions are respected: **NativeWind v4 not v5** (v5 is pre-release, incompatible with NativeWind v4 patterns), **Zod v3 not v4** (v4 crashes in RN due to unresolved GitHub issue #4690), and **AsyncStorage not SecureStore** as the Supabase session adapter (SecureStore's 2048-byte limit silently breaks session persistence, which is an explicit rubric item).

The biggest non-technical risk is scope creep inside a single role — most often professor module CRUD — leaving student or admin undemoed. Mitigation: breadth-first delivery across all 3 roles before depth on any one. The biggest technical risk is the 4 submission-invalidators (wrong repo, AI-generated AI_ASSISTANT_USAGE.md, incomplete demo video, committed keys) — all preventable in the first 30 minutes.

## Key Findings

### Recommended Stack

Detailed in [STACK.md](./STACK.md). Locked choices:

**Core technologies:**
- **Expo SDK 54** — `create-expo-app@latest` default as of April 2026; last SDK with stable NativeWind v4 support. SDK 55 mandates the New Architecture + NativeWind v5, which is pre-release.
- **TypeScript 5.x (strict)** — Catches role-type mismatches at compile time. Supabase types generated via CLI.
- **Expo Router ~4.0** — File-based routing. `app/courses/[courseId]/announcements/[id].tsx` auto-maps to `scholera://` deep link — no manual linking config required.
- **NativeWind 4.2.3 + tailwindcss ^3.4.17** — `vars()` CSS variable API enables single-token role-accent swap via `RoleThemeProvider`. Targets Tailwind v3, NOT v4.
- **@supabase/supabase-js 2.103.3** — Auth + data + storage in one client.
- **AsyncStorage (via @react-native-async-storage)** — Supabase session adapter. SecureStore is WRONG — session tokens exceed 2048-byte limit.
- **react-native-url-polyfill** — Must be first import in `lib/supabase.ts`; RN lacks URL API that supabase-js requires.
- **@tanstack/react-query 5.99.2** — Server state, optimistic updates, built-in loading/error states. v5: `isPending` not `isLoading`.
- **react-native-reanimated ~3** — NativeWind v4 requires Reanimated v3. Do NOT upgrade to v4.
- **react-hook-form 7.73.1 + zod 3.x** — Forms. Zod v4 crashes in RN; import from `'zod'` root (which resolves to v3), NOT `'zod/v4'`.
- **lucide-react-native 1.8.0** — SVG icons, responds to NativeWind color vars, tree-shakable.
- **expo-document-picker ~55 + expo-file-system + expo-image-picker** — PDF/PPT upload + avatar upload. Upload path: `fetch(uri).arrayBuffer()` → Supabase Storage. Blob/FormData produce 0-byte uploads in RN.

**Three version mistakes that break the submission:** NativeWind v5, `'zod/v4'` import, SecureStore for Supabase sessions.

### Expected Features

Detailed in [FEATURES.md](./FEATURES.md). All 11 spec features are table stakes — the rubric penalizes missing ones. Differentiators are about *how* they're built (polish, consistency, role-feel), not *what* is built.

**Must have (table stakes — rubric-penalized if missing):**
- Auth + session persistence + role-based routing
- Admin: dashboard stats + departments list + professor drill-down (read-only)
- Professor: My Courses → tabbed management (Announcements CRUD + Modules SectionList + file upload + roadmap with status + topic chips)
- Student: My Courses → tabbed read-only detail (announcements tap-to-read + modules with type icons) + roadmap with dual-status (professor coverage badge read-only + student own progress toggle writable)
- Shared: profile edit with avatar, deep linking to specific announcement
- Empty / loading / error states on every screen (rubric explicit)

**Should have (high-leverage differentiators):**
- **Role accent colors via `RoleThemeProvider`** (clay/steel/sage) — LOW effort, HIGH payoff, directly addresses "app should look and feel different per role" rubric item
- **Skeleton screens instead of spinners** — LOW / HIGH
- **Bottom sheet for create flows** (`@gorhom/bottom-sheet`) — LOW / HIGH, feels native
- **Dual-status student roadmap layout** (professor badge top-right non-interactive + student toggle bottom-left writable) — MEDIUM / HIGH, evaluator explicitly tests the distinction
- **Topic chips** on roadmap items — LOW / MEDIUM
- **Haptics** on status toggles — TRIVIAL / LOW polish signal

**Defer (anti-features — do not build):**
- Rich text editor for announcements
- Real-time announcements (stretch — not evaluated)
- Biometric auth, dark mode, push notifications
- Admin write operations (spec says admin is read-only)
- Drag-to-reorder modules
- Full offline sync, student file upload

### Architecture Approach

Detailed in [ARCHITECTURE.md](./ARCHITECTURE.md). Two-layer data pattern + route-group role separation.

**Major components:**
1. **`app/` (routing files only)** — Expo Router screens. No business logic, no raw Supabase calls. Screens import from `hooks/` only. Role groups: `app/(auth)`, `app/(admin)`, `app/(professor)`, `app/(student)` — each has its own `_layout.tsx` with `Stack.Protected` guard and `RoleThemeProvider`.
2. **`hooks/`** — TanStack Query wrappers. Each hook owns a queryKey. Example: `useCoursesForProfessor()`, `useRoadmapForCourse(courseId)`.
3. **`queries/`** — Pure async functions taking the typed Supabase client as first arg. Zero React dependency. Testable standalone.
4. **`lib/supabase.ts`** — Singleton client with AsyncStorage adapter and typed schema.
5. **`providers/AuthProvider.tsx`** — Two-step pattern: `getSession()` on mount + `onAuthStateChange` listener. Resolves session AND profile role before `SplashScreen.hideAsync()`. Single routing authority.
6. **`components/ui/`** — 7 primitives: `Button`, `Card`, `Chip`, `ListRow`, `EmptyState`, `Skeleton`, `ErrorView`. All read role accent via NativeWind `vars()`.
7. **`theme/`** — `tokens.ts` (colors/type/spacing/radii) + `roles.ts` (accent-per-role maps) + `tailwind.config.js`.

### Critical Pitfalls

From [PITFALLS.md](./PITFALLS.md). Top 5:

1. **Submission-invalidators (4 CRITICAL)** — (a) Push to wrong repo; check `git remote -v` before first push. (b) AI-generated `AI_ASSISTANT_USAGE.md`; hand-write in casual voice end of Day 1. (c) Demo video missing a role or <5 min; dry-run at 4pm Day 2. (d) Supabase keys committed; `.env*` in `.gitignore` before first commit, anon key only, never `service_role`.
2. **SecureStore silent session failure** — SecureStore's 2048-byte limit breaks Supabase session persistence silently. Use AsyncStorage. Impacts the explicit "session persists across restarts" rubric item.
3. **Redirect loop from root-layout auth guard** — Any `router.replace` or `<Redirect>` in root `_layout.tsx` causes infinite navigate-before-mount loop. Root = providers + `<Slot />` only; guards live in role-group layouts.
4. **`getUser()` inside `onAuthStateChange` deadlock** — Known `auth-js` issue; hangs all subsequent Supabase calls. Two-step pattern: `getSession()` for initial load, `onAuthStateChange` for subsequent changes. Never mix.
5. **Professor coverage vs student progress conflation** — The spec's explicit "key distinction to get right." Separate DB fields, queried independently, rendered as two distinct visual indicators. Single control or single color = rubric fail.

## Implications for Roadmap

Suggested 6-phase critical path: **Scaffold → Design Foundations → Auth/Router → Role Experiences (3 parallel plans) → Shared/Deep Link → Polish/Submit.** The three role experiences in the core feature phase can run in parallel after auth lands.

### Phase 1: Scaffold + Seed (0.5 hr)
**Rationale:** Addresses 4 of 4 CRITICAL submission-invalidators in the first 30 min.
**Delivers:** New public GitHub repo, `.gitignore` + `.env.local`, Expo project with all pinned packages, `lib/supabase.ts` with AsyncStorage adapter, generated Supabase types committed, SQL seed script for 3 role accounts + real courses/modules/items/roadmap/topics, `AI_ASSISTANT_USAGE.md` draft started by hand.
**Avoids:** Wrong repo push, committed keys, RLS silent failures, SecureStore failure, type drift.

### Phase 2: Design Foundations (2 hr)
**Rationale:** Pays for itself across every downstream screen; UI Quality is an explicit rubric dimension. Each primitive is role-aware from day one.
**Delivers:** `theme/tokens.ts` + `theme/roles.ts` + `tailwind.config.js`, 7 primitives (`Button`, `Card`, `Chip`, `ListRow`, `EmptyState`, `Skeleton`, `ErrorView`), `RoleThemeProvider` verified with sample screen, `QueryClient` configured.
**Uses:** NativeWind v4.2.3 `vars()` API.
**Avoids:** Inconsistent spacing/colors across screens, blank empty states (rubric ding), spinner-on-every-nav jank, Android safe area issues.

### Phase 3: Auth + Role Router (2 hr)
**Rationale:** Gating dependency for every feature phase. Five highest-consequence pitfalls converge here — it cannot be rushed.
**Delivers:** `AuthProvider` (two-step getSession + onAuthStateChange), root `_layout.tsx` (providers + Slot only), sign-in screen with validation, role-group `_layout.tsx` with `Stack.Protected` guards, `app/index.tsx` splash redirect, force-quit session persistence verified.
**Implements:** `AuthProvider` + route-group guards.
**Avoids:** Redirect loop, auth-state race, scattered routing authority, SecureStore session failure, flash-of-wrong-role, Day-1 auth over-investment.

### Phase 4: Role Experiences (can run as 3 parallel plans, ~8.5 hr total)
**Rationale:** After auth lands, the three role stacks are independent at the screen + hook layer (they share `queries/` + `components/ui/` only). Parallelization recovers time.
**Delivers (per role):**
- **4a — Admin (1.5 hr):** dashboard stats 2x2 grid, departments list, department detail, professor detail. Steel accent.
- **4b — Professor (4 hr):** My Courses, tabbed course management, announcements list + create (bottom sheet), modules (SectionList + create + add item with type icons + PDF/PPT upload via ArrayBuffer), professor roadmap (status toggle + topic chips + optimistic mutation). Clay accent.
- **4c — Student (3 hr):** My Courses, read-only tabbed course detail (tap-to-read announcement, read-only SectionList), student roadmap with dual-status layout. Sage accent.
**Avoids:** Blob/FormData upload corruption, SectionList full re-render on status toggle, missing onError rollback, professor/student status conflation.

### Phase 5: Shared + Deep Linking (2 hr)
**Rationale:** Profile is a shared component across role subtrees; deep link depends on the navigation stack already existing.
**Delivers:** Profile screen (avatar upload, display name, bio, unsaved-changes guard) wired into all 3 role subtrees, deep link target screen (`app/(student)/courses/[courseId]/announcements/[id].tsx`), `app.json` scheme `"scholera"`, sign-in `returnTo` param handling, cold-start deep link tested in dev build.
**Avoids:** Deep link destination lost on cold start, back-stack dead end, custom scheme tested in Expo Go (doesn't work).

### Phase 6: Polish + Submit (2 hr)
**Rationale:** The difference between "works" and "enjoyable" — which is how the UI Quality rubric dimension is scored.
**Delivers:** Empty/loading/error state audit on every screen, haptics on status toggles, pull-to-refresh on all lists, full smoke test (3 roles sequentially + deep link from killed state), `README.md` with setup + framework rationale + screenshots, `AI_ASSISTANT_USAGE.md` hand-finalized, demo video dry-run at 4pm, record 5–10 min demo.
**Avoids:** Demo missing a role, submission without README/AI_ASSISTANT_USAGE/demo video.

### Phase Ordering Rationale

- **Scaffold before everything** — 4 submission-invalidators are only preventable if handled in minute one.
- **Design Foundations before Auth** — Every subsequent screen consumes the primitives, including the sign-in screen. Building auth first means rewriting it.
- **Auth before roles** — Role routing is the gating dependency; no role screen is demo-able without a logged-in user of that role.
- **Roles in parallel** — Admin / professor / student experiences do not share screen code. After auth + foundations, all three plans can progress independently.
- **Shared last** — Profile + deep linking both depend on role subtrees existing.
- **Polish always last** — Don't polish a screen until the whole app is feature-complete; you'll waste time polishing screens you throw away.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Scaffold):** Schema verification — exact table/column names must be discovered by running `supabase gen types` against the live project ID. Storage bucket names and RLS policies need dashboard verification. (Listed in Open Questions below.)
- **Phase 4b (Professor):** Storage bucket INSERT policy must exist before file upload is testable. If missing, create manually in Supabase dashboard.
- **Phase 4c (Student):** Confirm actual DB column shape for `professor_status` vs `student_progress` before building the roadmap data layer.
- **Phase 5 (Deep linking):** Custom scheme requires a dev build (`npx expo run:ios`), not Expo Go. Budget 30 min for first successful cold-start deep link test.

Phases with standard patterns (minimal research needed):
- **Phase 2 (Design Foundations):** NativeWind + Expo tokens are well-documented.
- **Phase 3 (Auth):** Expo Router's `Stack.Protected` + Supabase auth quickstart are both official and stable.
- **Phase 4a (Admin):** Read-only list-drill-down pattern is standard FlatList + Expo Router.
- **Phase 6 (Polish):** Audit pass, no architectural decisions.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm + official changelogs as of 2026-04-23. Compatibility matrix confirmed. |
| Features | HIGH | Derived from spec. 11 features mapped to UX patterns, complexity, rubric dimensions. |
| Architecture | HIGH | Stack.Protected, NativeWind vars(), TanStack optimistic pattern all verified against official docs. |
| Pitfalls | HIGH (Expo/Supabase) / MEDIUM (time management) | Expo/Supabase pitfalls linked to GitHub issues and official docs; time-management advice is pattern-based. |

**Overall confidence:** HIGH

### Gaps to Address

Schema specifics are not discoverable until Phase 1 connects to the live Supabase project. Treat these as Phase 1 sub-tasks, not blockers:

- **Exact column names** — `profiles.role` vs `profiles.user_role`, `roadmap_items.professor_status` vs `coverage_status`, etc. Resolution: run `supabase gen types typescript --project-id <id>` first thing, commit output, reference the generated types everywhere.
- **Storage bucket names + INSERT policy** — Check dashboard; create bucket `module-files` and `avatars` if absent; add explicit INSERT + SELECT policies (bucket "public" does not grant INSERT).
- **RLS policies** — Query each table post-login in a smoke-test route. If empty with no error, RLS is denying access; add SELECT policies via dashboard SQL editor.
- **Roadmap/topic join shape** — Is `topics` linked via `roadmap_item_id` or a join table? Resolution: inspect generated types.
- **Course table name** — `courses` vs `course_sections` for professor My Courses. Resolution: inspect generated types.

## Sources

### Primary (HIGH confidence)
- Expo SDK 54 release notes + `create-expo-app` default behavior
- Supabase official React Native quickstart + auth/storage/types docs
- Expo Router official `/advanced/authentication/` + `/advanced/protected/` docs
- NativeWind v4 official docs (`vars()` API, theme guide)
- TanStack Query v5 official docs (React Native guide, optimistic updates)
- `@gorhom/bottom-sheet` official docs
- Confirmed GitHub issues: Zod v4 RN crash (#4690), Supabase auth-js deadlock
- Context7 verified versions

### Secondary (MEDIUM confidence)
- Canvas mobile UX case study (Medium) — informed role-distinct UX
- Community RN patterns for role theming + SectionList memoization

### Tertiary (LOW confidence — needs runtime verification)
- Exact Scholera Supabase schema (column names, RLS state, bucket config) — discovered at Phase 1

---
*Research completed: 2026-04-23*
*Ready for roadmap: yes*
