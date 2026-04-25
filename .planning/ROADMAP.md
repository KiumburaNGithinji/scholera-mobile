# Roadmap: Scholera Mobile

## Overview

A 2-day sprint to build and submit a role-aware native mobile LMS companion. The path runs scaffold-first to kill submission-invalidators on minute one, then design foundations before any screen exists (so primitives pay for themselves downstream), then auth (the gating dependency for all role work), then three independent role experiences in parallel, then shared profile and deep linking (which depend on role subtrees existing), then a polish and submission pass last. Every v1 requirement maps to exactly one phase. All 29 requirements are covered.

## Phases

**Phase Numbering:**
- Integer phases (1–8): Planned milestone work
- Decimal phases (e.g. 2.1): Urgent insertions — created via `/gsd:insert-phase`

- [ ] **Phase 1: Scaffold** - New public repo, secrets config, Expo project with pinned packages, Supabase client + types, seed data, AI_ASSISTANT_USAGE.md draft
- [ ] **Phase 2: Design Foundations** - Token system, 7 UI primitives, RoleThemeProvider, QueryClient — everything downstream screens consume
- [ ] **Phase 3: Auth + Role Router** - Sign-in screen, AuthProvider, route-group guards, session persistence, sign-out
- [ ] **Phase 4: Admin Experience** - Dashboard stats, departments list, department detail, professor drill-down
- [ ] **Phase 5: Professor Experience** - My Courses, tabbed course management, announcements CRUD, module hierarchy + item creation + file upload, professor roadmap
- [ ] **Phase 6: Student Experience** - My Courses, read-only tabbed course detail, student roadmap with dual-status
- [ ] **Phase 7: Shared + Deep Linking** - Profile screen (all roles), deep link target + cold-start handling, scheme registered
- [ ] **Phase 8: Polish + Submit** - Empty/loading/error audit, pull-to-refresh, smoke test, README, AI_ASSISTANT_USAGE.md finalized, demo video recorded

## Phase Details

### Phase 1: Scaffold
**Goal**: Submission-invalidators eliminated and project foundation locked before one screen is written
**Depends on**: Nothing (first phase)
**Requirements**: SUB-01, SUB-05
**Success Criteria** (what must be TRUE):
  1. A new public GitHub repo exists at `github.com/KiumburaNGithinji/scholera-mobile`; `git remote -v` shows only that repo, never Scholera's assessments repo
  2. `.gitignore` includes `.env*`; `git log --all -p | grep "supabase.co"` returns no key values; `.env.example` exists with placeholder values
  3. `npx expo start` launches without errors; all pinned packages installed at correct versions (Expo SDK 54, NativeWind 4.2.3, Zod 3.x, AsyncStorage — no SecureStore for session)
  4. `lib/supabase.ts` uses AsyncStorage as session adapter (with `react-native-url-polyfill/auto` as the FIRST import); generated Supabase types committed to `types/database.types.ts`
  5. SQL seed script executed: at least 1 admin, 1 professor with 2 courses (modules + items + roadmap + topics), 1 student enrolled in both; `AI_ASSISTANT_USAGE.md` file exists with a hand-written draft paragraph
**Plans**: 5 plans
  - [ ] 01-01-repo-baseline-PLAN.md — gitignore + .env.example/.env.local + git remote pointing to KiumburaNGithinji/scholera-mobile (SUB-01, SUB-05)
  - [ ] 01-02-expo-scaffold-PLAN.md — create-expo-app SDK 54 in place + pinned deps from STACK.md + app.json (scheme: scholera, newArchEnabled: false)
  - [ ] 01-03-config-and-client-PLAN.md — NativeWind v4 wiring (3 points) + tsconfig strict + lib/supabase.ts (url-polyfill first, AsyncStorage) + types stubs + tsc --noEmit passes
  - [ ] 01-04-schema-seed-types-PLAN.md — supabase migration (11 tables + RLS) + seed (auth.users + auth.identities + demo data) + types regeneration from live schema
  - [ ] 01-05-smoke-and-push-PLAN.md — phase1-smoke.sh (5 checks) + AI_ASSISTANT_USAGE.md draft + README placeholder + first push to origin/main

### Phase 2: Design Foundations
**Goal**: Shared design system and UI primitives exist so every downstream screen starts from working components, not from scratch
**Depends on**: Phase 1
**Requirements**: UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. `theme/tokens.ts` exports all color, spacing, typography, and radius tokens; `tailwind.config.js` references them via NativeWind `vars()` API
  2. `RoleThemeProvider` can be wrapped around any subtree and switches the active accent to steel (admin), clay (professor), or sage (student) — a sample screen wrapped in each variant shows the correct accent color
  3. All 7 primitives exist and render without errors: `Button` (with `disabled` and `isPending` props), `Card`, `Chip`, `ListRow`, `EmptyState` (icon + title + optional CTA), `Skeleton` (shimmer), `ErrorView`
  4. `QueryClient` configured with `staleTime: 2 min` and `gcTime: 5 min`; a tab switch on a screen with cached data shows no spinner
  5. Every list screen that uses `EmptyState` shows the component (not a blank view) when its data array is empty; every async screen shows `Skeleton` during initial fetch, not a spinner or white flash
**Plans**: TBD
**UI hint**: yes

### Phase 3: Auth + Role Router
**Goal**: Users can sign in, have their role detected, and land in the correct role experience — with session surviving force-quit and expired sessions handled gracefully
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. User signs in with email and password; a Supabase Auth session is established; the app reads `role` from the `profiles` table (not from the JWT alone) and routes to the correct role group without showing the wrong role screen even briefly (splash screen held until session + role resolved)
  2. Admin logs in → lands in admin root; professor logs in → lands in professor root; student logs in → student root — all three verified in sequence with logout between each
  3. App is force-quit while logged in; on reopen the session rehydrates from AsyncStorage/localStorage and the user lands directly in their role home — no re-login required
  4. Session token is expired (or manually invalidated in Supabase); app detects this, clears the session, and returns the user to the sign-in screen without crashing
  5. Sign-out button (visible from any role's tab bar) clears the session and returns to sign-in; `onAuthStateChange` + `getSession()` two-step pattern in place with no `getUser()` call inside the listener
**Plans**: TBD
**UI hint**: yes

### Phase 4: Admin Experience
**Goal**: Admin can view institution-wide stats and drill from departments into professors and their assigned courses — all data live from Supabase
**Depends on**: Phase 3
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03
**Success Criteria** (what must be TRUE):
  1. Admin dashboard shows a 2×2 stats grid with total students, professors, courses, and departments — all four counts match the actual Supabase data (verify by checking the DB directly)
  2. Admin can see a list of all departments; each department row shows the department name and a count or preview of its professors
  3. Tapping a department navigates to a department detail screen showing all professors assigned to that department
  4. Tapping a professor in the department detail navigates to the professor's profile showing their assigned courses; back-stack is logical (department detail → professor detail → courses visible in list)
**Plans**: TBD
**UI hint**: yes

### Phase 5: Professor Experience
**Goal**: Professor can manage their courses end-to-end — view announcements, create announcements, organize module hierarchies, upload files, and mark roadmap coverage — with all mutations persisting to Supabase
**Depends on**: Phase 3
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, PROF-06
**Success Criteria** (what must be TRUE):
  1. Professor sees a list of all course sections they teach; tapping any course opens a tabbed Course Management screen with an Announcements tab and a Modules tab
  2. Professor can view existing announcements for a course and create a new announcement (title + body) via a bottom sheet or modal; the new announcement appears in the list immediately and persists after app restart
  3. Professor can see all modules for a course in order, with each module expanded to show its items; each item shows its type clearly (lecture / video / link / note / file icon + label)
  4. Professor can create a new module (title only), and within a module can add a link item (URL + title), a note item (plain text), and upload a file (PDF or PPT) — all three item types persist to Supabase and appear in the module list on next load
  5. Professor can view the course roadmap screen: modules as groups, items under each, AI-extracted topic chips visible on each item, and a status control per item (not started / in progress / complete) that optimistically updates with rollback on failure; status changes persist after app restart
**Plans**: TBD
**UI hint**: yes

### Phase 6: Student Experience
**Goal**: Student can browse enrolled courses, read course content and announcements, and track their own roadmap progress independently from the professor's coverage status
**Depends on**: Phase 3
**Requirements**: STUD-01, STUD-02, STUD-03, STUD-04
**Success Criteria** (what must be TRUE):
  1. Student sees a list of all courses they are enrolled in; tapping a course opens a tabbed Course Detail screen with an Announcements tab (read-only) and a Modules tab (read-only)
  2. Announcements tab shows all course announcements; tapping any announcement opens the full announcement text; the tab is read-only (no create button visible)
  3. Modules tab shows all modules and their items; each item shows its type visually (icon + label); the tab is read-only
  4. Student can view the course roadmap: same module/item structure the professor built, with AI-extracted topic chips per item, the professor's coverage status visible as a read-only indicator (cannot be changed by student), and the student's own progress toggleable independently (not started / in progress / complete); the two statuses are visually distinct
  5. Student's personal progress changes persist to Supabase independently; changing the professor's coverage status (from the professor login) does NOT affect the student's own progress field and vice versa — verified by toggling each role in sequence
**Plans**: TBD
**UI hint**: yes

### Phase 7: Shared + Deep Linking
**Goal**: Any role can view and edit their own profile, and a cold-start deep link to a specific announcement navigates correctly after authentication
**Depends on**: Phase 4, Phase 5, Phase 6
**Requirements**: SHARED-01, SHARED-02
**Success Criteria** (what must be TRUE):
  1. Profile screen is reachable from the tab bar of all three role experiences; any role can edit their display name, bio, and avatar; saving writes back to Supabase and the updated values are visible immediately and after app restart
  2. Avatar upload: selecting an image from the photo library uploads it to Supabase Storage and the new avatar URL is reflected in the profile screen
  3. `app.json` has `expo.scheme: "scholera"`; the app is built as a dev build (`npx expo run:ios`); triggering `xcrun simctl openurl booted "scholera://courses/{id}/announcements/{id}"` while the app is in the foreground navigates directly to the correct announcement screen
  4. Cold-start deep link: app is fully killed; the same deep link URL is triggered; app opens, the pending URL is captured before the auth redirect fires, user is taken to sign-in, after successful login the app navigates to the correct announcement — not to the role home screen
**Plans**: TBD
**UI hint**: yes

### Phase 8: Polish + Submit
**Goal**: The app is demo-ready across all three roles with no blank states, no crashes on error, a recorded demo video, and all required submission artifacts in the public repo
**Depends on**: Phase 7
**Requirements**: UI-03, SUB-02, SUB-03, SUB-04
**Success Criteria** (what must be TRUE):
  1. Every list screen in all three role experiences shows an `EmptyState` component (not a blank view) when its data is empty; every async screen shows a `Skeleton` on initial load and a friendly `ErrorView` when the network or Supabase call fails
  2. All major lists have pull-to-refresh; haptics fire on roadmap status toggles; no obvious jank during tab switches on cached data
  3. Full end-to-end smoke test passes in one continuous session: sign in as admin → drill to professor courses → log out → sign in as professor → create module → add item → view roadmap → mark item → log out → sign in as student → view roadmap → mark own progress → trigger deep link from Notes app → correct announcement opens
  4. `README.md` in the public repo contains setup instructions (runnable in under 5 minutes), framework and key library rationale, and screenshots of key screens across all three roles
  5. `AI_ASSISTANT_USAGE.md` in the public repo is written in Kiumbura's own voice (not AI-generated), describing how AI tools were used; 5–10 minute demo video is recorded, covers all 3 roles plus deep link, and is linked or included in the repo

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → 5 → 6 (4/5/6 parallelizable) → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold | 0/TBD | Not started | - |
| 2. Design Foundations | 0/TBD | Not started | - |
| 3. Auth + Role Router | 0/TBD | Not started | - |
| 4. Admin Experience | 0/TBD | Not started | - |
| 5. Professor Experience | 0/TBD | Not started | - |
| 6. Student Experience | 0/TBD | Not started | - |
| 7. Shared + Deep Linking | 0/TBD | Not started | - |
| 8. Polish + Submit | 0/TBD | Not started | - |
