---
phase: 04-admin-experience
plan: 03
subsystem: ui
tags: [admin, dashboard, expo-router, tanstack-query, nativewind, role-theme, lucide-icons, 4-state-contract]

# Dependency graph
requires:
  - phase: 04-admin-experience plan 02
    provides: useAdminStats() and useAdminDepartments() typed hooks consumed verbatim by the dashboard (id-less hooks, returning AdminStats and AdminDepartmentSummary[])
  - phase: 04-admin-experience plan 04
    provides: /(admin)/departments/[id] dynamic route — already live, so the dashboard's tap-through navigation works on first run
  - phase: 02-design-foundations plan 03
    provides: Card (variant=elevated), ListRow (leftIcon + onPress + auto-chevron), EmptyState, ErrorView, SkeletonCard, SkeletonListRow primitives via @/components/ui barrel
  - phase: 02-design-foundations plan 01
    provides: text-accent / text-fg-primary / text-fg-muted / bg-canvas / font-sans-semibold Tailwind classes that compose the dashboard layout
  - phase: 03-auth-router (admin layout setup)
    provides: RoleThemeProvider role="admin" wrapping the (admin) subtree — sets --color-accent to steel (#64748B) so text-accent on stat counts resolves to steel
provides:
  - components/admin/stat-card.tsx — StatCard primitive (label + count + optional Lucide icon, role-accent count color)
  - app/(admin)/(tabs)/index.tsx — real admin dashboard replacing the Phase 3 placeholder (2x2 stats grid + tappable departments list)
affects: [05-professor-experience (mirror dashboard pattern for "My Courses"), 06-student-experience (mirror dashboard pattern for "My Courses"), 08-polish-and-submit (audit empty/loading/error coverage — already enforced here)]

# Tech tracking
tech-stack:
  added: []  # No new dependencies — pure composition of existing primitives, hooks, and Lucide icons (Building2, GraduationCap, Library, Users — all ship with lucide-react-native)
  patterns:
    - "Per-section 4-state branching (error → pending OR !data → empty → success) — each section renders independently so a stats failure doesn't take down the departments list and vice versa"
    - "2-column grid via flex-row + flex-wrap + w-1/2 px-1.5 -mx-1.5 — equivalent to a 12px gutter with no third-party grid lib"
    - "Subtitle pluralization at the call site (count === 1 ? '1 professor' : `${count} professors`) — no i18n framework needed for this scale, kept inline next to the data"
    - "Bottom h-12 spacer inside ScrollView — prevents the last ListRow border sitting flush against the tab bar; mirror this on every list-tab screen in Phase 5/6"
    - "Admin-scoped composition lives in components/admin/ (NOT components/ui/) — the Phase 2 7-primitive contract is preserved; role-specific compositions get their own folder"

key-files:
  created:
    - components/admin/stat-card.tsx
  modified:
    - app/(admin)/(tabs)/index.tsx  # Replaced — was the Phase 3 'Dashboard ships in Phase 4' EmptyState placeholder

key-decisions:
  - "StatCard lives in components/admin/ (not components/ui/) — keeps the Phase 2 7-primitive contract intact; role-specific compositions are explicitly out of the global UI surface"
  - "Stat label uses text-fg-muted uppercase tracking-wide (NOT text-accent) — labels stay neutral, only the count gets the brand color; matches typical 'metric tile' design language"
  - "Lucide icons chosen by semantic mapping: Building2 (departments), GraduationCap (students), Library (courses), Users (professors) — all ship with the package, no install"
  - "Each section owns its 4-state branch (error → pending → empty → success) — sections fail independently, so a stats network blip doesn't gray out departments"
  - "Subtitle pluralization inline at the .map() call — for 2 cases (1 / N) a ternary is clearer than an i18n helper; revisit if more languages or more cases land"
  - "router.push uses `as never` cast — matches the established pattern in app/_layout.tsx ProtectedRouter for routes Expo Router 6 typed-routes don't statically know"

patterns-established:
  - "Admin dashboard pattern: ScrollView wraps {section: header text + 4-state branch}{section: header text + 4-state branch}{bottom spacer} — clean read order from top, each section independently queryable. Mirror in Phase 5/6 'My Courses' screens."
  - "StatCard composition: Card variant='elevated' padding='lg' > optional Icon (size 20, fgMuted color) > Text (label, xs uppercase tracking-wide, fgMuted) > Text (count, 3xl semibold, accent). Reusable across roles since text-accent is role-aware."
  - "2x2 grid layout via Tailwind/NativeWind (no react-native-grid-list dependency): flex-row flex-wrap -mx-1.5 outer + w-1/2 px-1.5 mb-3 inner. 12px gutter, 12px row gap. Works on every device width without media queries."
  - "Skeleton-mirror pattern: pending state renders the SAME number of skeleton items as the eventual success state — 4 SkeletonCards for the stats grid, 3 SkeletonListRows for the departments list (typical seed count) — minimizes layout shift on data resolve."

requirements-completed: [ADMIN-01, ADMIN-02]

# Metrics
duration: 2min
completed: 2026-04-26
---

# Phase 04 Plan 03: Admin Dashboard + Departments List Summary

**Real admin dashboard ships — replaces the Phase 3 placeholder with a 2x2 stats grid (Students/Professors/Courses/Departments via useAdminStats) above a tappable departments list (useAdminDepartments → /(admin)/departments/[id]) with full per-section 4-state coverage and steel role-accent styling, completing ADMIN-01 + ADMIN-02 on screen.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-26T05:20:42Z
- **Completed:** 2026-04-26T05:22:14Z
- **Tasks:** 2 of 2
- **Files modified:** 2 (1 created + 1 fully replaced)

## Accomplishments

- StatCard primitive shipped at `components/admin/stat-card.tsx` — label + count + optional icon, count uses `text-accent` (steel for admin via RoleThemeProvider)
- Phase 3 placeholder admin home (`app/(admin)/(tabs)/index.tsx`) **replaced** (not appended to) with the real dashboard — 2x2 stats grid + tappable departments list
- 4 stat tiles render Students/Professors/Courses/Departments with semantic Lucide icons (GraduationCap, Users, Library, Building2)
- Departments list shows "1 professor" / "N professors" with proper pluralization, Building2 left icon, auto-chevron from `onPress`
- Tap routes to `/(admin)/departments/${dept.id}` (Plan 04-04 route — already live)
- Per-section 4-state contract: each of the two sections (stats + departments) renders independently across pending → error → empty → success
- `npx tsc --noEmit` exits **0** across the entire project after both task commits

## Task Commits

Each task committed atomically:

1. **Task 1: Create components/admin/stat-card.tsx** — `a491019` (feat)
2. **Task 2: Replace app/(admin)/(tabs)/index.tsx with the real dashboard** — `198acf0` (feat)

**Plan metadata commit:** appended at end (SUMMARY.md, STATE.md, ROADMAP.md)

## Files Created/Modified

- **Created** `components/admin/stat-card.tsx` — `StatCard({ label, count, icon? })` renders an elevated Card with optional 20px icon, an `xs` uppercase tracking-wide label in `fg-muted`, and a `3xl` semibold count in `text-accent` (role-aware → steel for admin). Imports `Card` from `@/components/ui` and `tokens` from `@/theme/tokens` for the icon color.
- **Modified (full replacement)** `app/(admin)/(tabs)/index.tsx` — Was the Phase 3 placeholder (`EmptyState` titled "Dashboard ships in Phase 4"). Now renders the real dashboard: ScrollView → "Institution overview" heading → 2x2 stats grid (StatCard × 4) → "Departments" heading → ListRow stack → bottom h-12 spacer. Consumes `useAdminStats` and `useAdminDepartments` from `@/hooks/admin`. Each section has its own 4-state branch.

## Routes Wired

| Action | From | To | Mechanism |
|---|---|---|---|
| Department tap | `/(admin)/(tabs)/index.tsx` ListRow `onPress` | `/(admin)/departments/${dept.id}` | `router.push(... as never)` — Expo Router 6 |

The destination route was created in Plan 04-04 (same wave) — back-stack already verified there: `(tabs) dashboard → /(admin)/departments/[id] → /(admin)/professors/[id]` with React Navigation 7's default back-arrow.

## Visual Layout (text description)

```
┌────────────────────────────────────────────────────┐
│  ☰  Dashboard                                  ⏻   │  ← Tabs.Screen header (set in (tabs)/_layout.tsx)
├────────────────────────────────────────────────────┤
│                                                    │
│  Institution overview                              │  ← xl semibold, fg-primary
│                                                    │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ 🎓           │  │ 👥           │               │
│  │ STUDENTS     │  │ PROFESSORS   │               │  ← xs uppercase tracking-wide, fg-muted
│  │ 142          │  │ 8            │               │  ← 3xl semibold, text-accent (steel)
│  └──────────────┘  └──────────────┘               │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ 📚           │  │ 🏛️            │               │
│  │ COURSES      │  │ DEPARTMENTS  │               │
│  │ 24           │  │ 5            │               │
│  └──────────────┘  └──────────────┘               │
│                                                    │
│  Departments                                       │  ← xl semibold, fg-primary
│  ┌────────────────────────────────────────────┐   │
│  │ 🏛️  Computer Science                    ›  │   │  ← ListRow w/ Building2 icon + chevron
│  │     3 professors                            │   │
│  ├────────────────────────────────────────────┤   │
│  │ 🏛️  Mathematics                         ›  │   │
│  │     1 professor                             │   │  ← Singular pluralization branch
│  ├────────────────────────────────────────────┤   │
│  │ 🏛️  Physics                             ›  │   │
│  │     2 professors                            │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  [bottom spacer: h-12]                             │  ← Prevents last row sitting flush w/ tab bar
└────────────────────────────────────────────────────┘
```

(Counts above are illustrative — the dashboard renders whatever `useAdminStats` returns from Supabase. The seed data shipped in Phase 1 produces concrete counts that the user can verify in Supabase Studio with `select count(*) from courses` etc.)

## 4-State Coverage (per section)

Stats grid (top section):

| State | Rendering |
|---|---|
| Pending | 2x2 grid of `<SkeletonCard />` — same shape as the success grid, no layout shift on resolve |
| Error | `<ErrorView title="Couldn't load stats" onRetry={refetchStats} technical={statsError.message}>` |
| Empty | (Not applicable — counts can be 0 but never absent; success branch handles `0` natively) |
| Success | 4× `<StatCard label=... count={stats.X} icon={...} />` |

Departments section (below):

| State | Rendering |
|---|---|
| Pending | 3× `<SkeletonListRow />` (typical seed count) |
| Error | `<ErrorView title="Couldn't load departments" onRetry={refetchDept} technical={deptError.message}>` wrapped in `View className="px-4">` |
| Empty | `<EmptyState icon={Building2} title="No departments yet" description="Departments will appear here once they're added to Supabase.">` |
| Success | `departments.map(...)` → `<ListRow leftIcon={Building2} title={dept.name} subtitle={pluralize(dept.professorCount)} onPress={navigate}>` |

## Decisions Made

- **StatCard scoped to `components/admin/`, not `components/ui/`:** The Phase 2 spec defined a 7-primitive UI contract (Button/Card/Chip/ListRow/EmptyState/Skeleton/ErrorView). StatCard is a *composition* of `Card` + `Text`, not a new primitive — adding it to the global barrel would break the contract. Role-scoped folders (`components/admin/`, future `components/professor/`, `components/student/`) are the right home for compositions that have a role-specific feel even when technically reusable.
- **Stat label uses `text-fg-muted` (NOT `text-accent`):** Only the count gets the brand color. This is the standard "metric tile" treatment — the label is a quiet secondary, the number is the headline. Doing both in steel would muddy the visual hierarchy.
- **Per-section 4-state branches (not a single dashboard-level branch):** If we waited for both queries to resolve before rendering anything, a stats network blip would gray out the entire screen including departments. Independent branches mean the user always sees the data that *is* available.
- **Skeleton count mirrors success count where possible:** 4 stats → 4 SkeletonCards. For the dynamic departments list we picked 3 (matches the seed data shipped in Phase 1) — slightly arbitrary but minimizes "skeleton suddenly becomes 7 rows" jank in the typical case.
- **Subtitle pluralization inline at the call site:** A `pluralize()` helper would be over-engineered for a single use site with two cases. `count === 1 ? '1 professor' : `${count} professors`` reads cleanly and survives any future inspection. Revisit if more languages or pluralization rules land (the i18n decision is a Phase 7+ concern).
- **`router.push(... as never)` cast:** Matches the established pattern from `app/_layout.tsx` ProtectedRouter — Expo Router 6's typed routes don't yet handle dynamic `[id].tsx` paths well, and the Plan 04-04 SUMMARY confirms this is project-wide convention.

## Deviations from Plan

None — plan executed exactly as written.

Both files match the spec verbatim:
- StatCard JSX, prop names, Tailwind classes, and JSDoc are byte-identical to the plan
- Dashboard JSX matches the spec including: imports order, hook destructuring with renames (`isPending: statsPending` etc), 4-state branch structure, Tailwind class strings, ListRow `leftIcon={Building2}`, subtitle ternary, `router.push(... as never)` cast, bottom `h-12` spacer

The plan front-loaded every potential pitfall (4-state per section, role-aware accent via RoleThemeProvider, the `as never` cast for forward-referenced routes, Lucide icons that ship with the package, the singular-vs-plural ternary), and `npx tsc --noEmit` exited 0 on first compile of both files.

## Issues Encountered

None.

A few sanity checks performed during the read-first phase that didn't surface as problems:
- `text-accent` Tailwind class verified to resolve via `rgb(var(--color-accent) / <alpha-value>)` in `tailwind.config.js`, with `RoleThemeProvider` setting `--color-accent` to steel triplets in the (admin) subtree (Phase 2 work)
- `font-sans-semibold` confirmed mapped to `Inter_600SemiBold` (Phase 2 typography contract)
- `useAdminStats` and `useAdminDepartments` hooks barrel-exported from `@/hooks/admin/index.ts` (Plan 04-02)
- `/(admin)/departments/[id]` route confirmed live via `git log` showing Plan 04-04 commits (`1f0166c`, `34d6a4d`, etc) ahead of this plan

## Self-Check: PASSED

Verified after writing SUMMARY.md:

- All 2 created/modified files exist on disk:
  - `test -f components/admin/stat-card.tsx` → FOUND
  - `test -f app/(admin)/(tabs)/index.tsx` → FOUND
- Both commit hashes present in `git log --oneline -5`:
  - `a491019` (Task 1) → FOUND
  - `198acf0` (Task 2) → FOUND
- All 14 plan-spec grep checks pass (file existence, hook imports, all 4 stat labels, 4-state component references, navigation pattern)
- End-to-end verification block: 6 file/grep groups all green, `npx tsc --noEmit` exits **0** with empty output
- The Phase 3 placeholder string `"Dashboard ships in Phase 4"` is GONE from `app/(admin)/(tabs)/index.tsx` (the placeholder was fully replaced, not appended to)

## User Setup Required

None — no external service configuration required. Migration 04 (admin RLS unblock) was applied in Plan 04-01 and is already live in the Supabase project. The seed data shipped in Phase 1 produces non-zero counts that the dashboard will display on first sign-in.

## Next Phase Readiness

**Phase 4 is now COMPLETE (4/4 plans):**
- 04-01 RLS unblock ✓
- 04-02 Query hooks ✓
- 04-03 Dashboard + departments ✓ (this plan)
- 04-04 Detail screens ✓

**Ready to run `/gsd:transition`** to mark Phase 4 complete in ROADMAP.md and unblock Phase 5 (professor) + Phase 6 (student) — the two phases are independent of each other and can run in parallel.

**Pattern established for Phase 5/6 dashboard-style screens:**
- The "ScrollView → header text → 4-state branch → next section → bottom h-12 spacer" structure is the established convention for the role-home screen
- `components/{role}/` is the established home for role-scoped compositions (mirror `components/admin/stat-card.tsx` for `components/professor/course-card.tsx` etc)
- Per-section 4-state branches (not screen-level) is the established pattern for screens that consume multiple independent queries

**Manual smoke verification (live device):**
1. `npx expo start` → launch on simulator
2. Sign in as `admin@demo.scholera.test` / `demo-password-1234`
3. Lands on Dashboard tab — the 4 stats render with steel (`#64748B`) numbers
4. Counts match `select role, count(*) from profiles group by role` (students/professors) and `select count(*) from courses` / `from departments` in Supabase Studio
5. Departments list shows all departments alphabetically with "N professors" subtitles
6. Tapping a department row navigates to `/(admin)/departments/[id]` (Plan 04-04 detail)

(The smoke test above is part of the Phase 8 audit — not gating on this plan since the wiring is verified by `tsc` + the Plan 04-02/04-04 SUMMARY confirmations that the hooks and routes work in isolation.)

---
*Phase: 04-admin-experience*
*Completed: 2026-04-26*
