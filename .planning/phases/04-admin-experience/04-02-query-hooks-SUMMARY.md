---
phase: 04-admin-experience
plan: 02
subsystem: data-layer
tags: [tanstack-query, supabase, react-query-v5, hooks, admin]

# Dependency graph
requires:
  - phase: 04-admin-experience plan 01
    provides: SECURITY DEFINER is_admin() + admin-read-all RLS on profiles (so professor/student counts and detail reads return real data)
  - phase: 02-design-foundations plan 02
    provides: QueryClientProvider with staleTime 2m / gcTime 5m / mutations.retry 0 defaults — hooks inherit these globally
  - phase: 01-scaffold
    provides: singleton supabase client, hand-typed Database schema, @/* path alias
provides:
  - useAdminStats() — 4 parallel HEAD count queries returning AdminStats
  - useAdminDepartments() — departments list with per-row professor counts (Map-merge)
  - useAdminDepartmentDetail(id) — single department + its professors, gated by enabled flag
  - useAdminProfessorDetail(id) — single professor + their courses, gated by enabled flag
  - hooks/admin/index.ts barrel — single import path for screens
affects: [04-03 dashboard-and-departments, 04-04 detail-screens, 05-professor-experience, 06-student-experience]

# Tech tracking
tech-stack:
  added: []  # No new dependencies — leveraged existing @tanstack/react-query 5.100.5
  patterns:
    - "queryKey namespacing: ['admin', resource, ...id?] — keeps Phase 5/6 hooks collision-free"
    - "Detail-hook contract: accepts id | undefined + enabled: Boolean(id) — tolerates raw useLocalSearchParams() values"
    - "Result-type co-export: each hook file exports both the hook AND the typed result interface — zero ambiguity for consumers"
    - "Aggregate stats bundling: 4 dashboard counts in one cache entry (one skeleton, one error path)"
    - "Map-merge for grouped counts: client-side aggregation avoids needing PostgREST views"

key-files:
  created:
    - hooks/admin/use-stats.ts
    - hooks/admin/use-departments.ts
    - hooks/admin/use-department-detail.ts
    - hooks/admin/use-professor-detail.ts
    - hooks/admin/index.ts
  modified: []

key-decisions:
  - "Stats bundled in one useQuery (not 4 separate hooks) — single skeleton + single error UX matches dashboard rendering"
  - "Two-query Map-merge for department professor counts (instead of PostgREST view) — small data volume makes client-side merge essentially free"
  - "Detail hooks return FULL Profile/Course rows (not slimmed projections) — screens get bio/avatar/code without secondary queries"
  - "Defensive role filter on professor detail (.eq('id', id).eq('role', 'professor')) — wrong route param yields no row instead of misleading data"
  - "queryKey for detail hooks includes id (['admin', 'department', id]) — switching ids never serves stale data from another resource"

patterns-established:
  - "Hook file structure: top JSDoc → result interface → async fetcher → useQuery wrapper. Mirrored across all 4 hooks."
  - "Error surfacing: throw new Error(`Failed to load X: ${err.message}`) rather than returning null — gives TanStack Query a typed Error"
  - "Promise.all parallelization: anywhere a hook needs 2+ supabase calls, they go through Promise.all (4x lower wall-clock latency vs sequential)"
  - "Barrel re-export via export * — mirrors components/ui/index.ts convention, enables import { ... } from '@/hooks/admin'"

requirements-completed: [ADMIN-01, ADMIN-02, ADMIN-03]

# Metrics
duration: 4min
completed: 2026-04-26
---

# Phase 04 Plan 02: TanStack Query Hooks for Admin Screens Summary

**Four typed TanStack Query v5 hooks (useAdminStats, useAdminDepartments, useAdminDepartmentDetail, useAdminProfessorDetail) plus a barrel export — pure data layer with namespaced queryKeys ready for Plan 04-03 dashboard and Plan 04-04 detail screens.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-26T05:05:47Z
- **Completed:** 2026-04-26T05:09:34Z
- **Tasks:** 5 of 5
- **Files modified:** 5 (all created)

## Accomplishments

- 4 typed hooks shipped with complete UseQueryResult<T, Error> contract — consumers destructure { data, isPending, error } with zero unknowns
- queryKeys namespaced under `['admin', ...]` so Phase 5/6 hooks (professor/student) won't collide on cache invalidation
- Detail hooks gate on `enabled: Boolean(id)` so screens can pass raw `useLocalSearchParams()` values without `!` assertions
- Barrel export at `hooks/admin/index.ts` mirrors `components/ui/index.ts` pattern — single import path
- `npx tsc --noEmit` exits 0 across the entire project

## Task Commits

Each task was committed atomically:

1. **Task 1: Create hooks/admin/use-stats.ts** — `814b4f2` (feat)
2. **Task 2: Create hooks/admin/use-departments.ts** — `3462bd9` (feat)
3. **Task 3: Create hooks/admin/use-department-detail.ts** — `8424430` (feat)
4. **Task 4: Create hooks/admin/use-professor-detail.ts** — `6aa62e6` (feat)
5. **Task 5: Create hooks/admin/index.ts (barrel)** — `92a304a` (feat)

**Plan metadata commit:** (added at end — see final commit)

## Files Created

- `hooks/admin/use-stats.ts` — `useAdminStats(): UseQueryResult<AdminStats, Error>` returning 4 dashboard counts via Promise.all of HEAD queries on profiles (filtered student/professor), courses, departments
- `hooks/admin/use-departments.ts` — `useAdminDepartments(): UseQueryResult<AdminDepartmentSummary[], Error>` returning departments sorted by name with per-row professorCount via client-side Map merge
- `hooks/admin/use-department-detail.ts` — `useAdminDepartmentDetail(id): UseQueryResult<AdminDepartmentDetail, Error>` returning `{ department, professors[] }` for one department, gated by `enabled: Boolean(id)`
- `hooks/admin/use-professor-detail.ts` — `useAdminProfessorDetail(id): UseQueryResult<AdminProfessorDetail, Error>` returning `{ professor, courses[] }` for one professor, gated by `enabled: Boolean(id)`
- `hooks/admin/index.ts` — barrel re-exports all 4 hooks + their result interfaces

### Hook Signatures (verbatim — for Plan 04-03 / 04-04 consumers)

```typescript
// hooks/admin/use-stats.ts
export interface AdminStats {
  studentCount: number
  professorCount: number
  courseCount: number
  departmentCount: number
}
export function useAdminStats(): UseQueryResult<AdminStats, Error>

// hooks/admin/use-departments.ts
export interface AdminDepartmentSummary {
  id: string
  name: string
  description: string | null
  professorCount: number
}
export function useAdminDepartments(): UseQueryResult<AdminDepartmentSummary[], Error>

// hooks/admin/use-department-detail.ts
export interface AdminDepartmentDetail {
  department: Department
  professors: Profile[]
}
export function useAdminDepartmentDetail(
  departmentId: string | undefined,
): UseQueryResult<AdminDepartmentDetail, Error>

// hooks/admin/use-professor-detail.ts
export interface AdminProfessorDetail {
  professor: Profile
  courses: Course[]
}
export function useAdminProfessorDetail(
  professorId: string | undefined,
): UseQueryResult<AdminProfessorDetail, Error>
```

### queryKeys In Use (for cache invalidation in Plan 04-03 / 04-04)

| Hook | queryKey |
|------|----------|
| `useAdminStats` | `['admin', 'stats']` |
| `useAdminDepartments` | `['admin', 'departments']` |
| `useAdminDepartmentDetail(id)` | `['admin', 'department', id]` |
| `useAdminProfessorDetail(id)` | `['admin', 'professor', id]` |

To invalidate everything admin: `queryClient.invalidateQueries({ queryKey: ['admin'] })`.
To invalidate just stats: `queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })`.

## Decisions Made

- **One-query for stats (not four):** All 4 dashboard counts share one cache entry. The dashboard renders them as a single 2x2 grid — they should load and error as a unit. Splitting into 4 hooks would mean 4 skeletons appearing/disappearing independently, which feels janky.
- **Two-query Map-merge for department counts:** Considered a PostgREST view that pre-aggregates `profiles GROUP BY department_id`. Rejected — the data volume (departments < 20, professors < 100) makes a client-side `Map<string, number>` essentially free, and avoids creating + maintaining a SQL view for one screen.
- **`enabled: Boolean(id)` for detail hooks:** TanStack Query's standard pattern for "wait for the route param". When `enabled` is false, `data` is undefined and `isPending` is true — the consuming screen renders the skeleton while we wait for `useLocalSearchParams()` to resolve. Avoids `!` non-null assertions in the screen.
- **Defensive `.eq('role', 'professor')` on professor detail:** If the screen receives a student/admin uuid via the route, the fetch returns no row (and we throw "Professor X not found") instead of returning a Profile that the screen will mislabel as a professor.
- **Result interfaces co-located with hooks (not in `types/app.types.ts`):** Each hook file exports its own result type. They're hook-specific shapes (e.g., `AdminDepartmentSummary` is not a DB row), so co-locating keeps the contract obvious to anyone reading the hook. The barrel re-exports them so consumers still import from one path.

## Deviations from Plan

None — plan executed exactly as written. Every file matches the spec verbatim, including JSDoc comments, error message formatting, sort orders, and queryKey shapes.

## Issues Encountered

None. The plan front-loaded every potential pitfall (TanStack Query v5 isPending vs isLoading, RLS recursion concerns on courses, head:true HEAD count syntax, nullsFirst:false ordering), and `npx tsc --noEmit` passed on first run for every file.

## Self-Check: PASSED

Verified after writing SUMMARY.md:

- All 5 hook files exist on disk
- All 5 commits exist in git log: `814b4f2`, `3462bd9`, `8424430`, `6aa62e6`, `92a304a`
- queryKeys grep-confirmed in all 4 hook files
- 8 expected exports (4 functions + 4 interfaces) confirmed via `grep -hE "^export (function|interface) " hooks/admin/use-*.ts`
- Smoke import test (8 imports from `@/hooks/admin`) compiled cleanly
- Final `npx tsc --noEmit` exits 0

## User Setup Required

None — no external service configuration required. Migration 04 (admin RLS unblock) was applied in Plan 04-01 and is already live.

## Next Phase Readiness

**Plan 04-03 (dashboard-and-departments) ready to start:**
- Dashboard screen imports `useAdminStats` + `useAdminDepartments` from `@/hooks/admin`
- 4-state contract (Pending/Error/Empty/Success) drives off `isPending`, `error`, and `data?.length === 0`
- staleTime 2m means tab-switch returns instantly without a spinner — matches Phase 2 SC4

**Plan 04-04 (detail-screens) ready to start:**
- Department detail at `app/(admin)/departments/[id].tsx` consumes `useAdminDepartmentDetail`
- Professor detail at `app/(admin)/professors/[id].tsx` consumes `useAdminProfessorDetail`
- Both hooks already gated on `enabled: Boolean(id)` — screens can pass `useLocalSearchParams<{ id: string }>().id` directly

**Phase 5/6 (professor + student experiences):**
- queryKey namespace `['admin', ...]` is reserved; Phase 5 should use `['professor', ...]` and Phase 6 `['student', ...]`
- Same hook-file structure (JSDoc → interface → fetcher → useQuery wrapper) is the established convention to mirror

---
*Phase: 04-admin-experience*
*Completed: 2026-04-26*
