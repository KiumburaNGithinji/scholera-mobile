---
phase: 04-admin-experience
plan: 02
type: execute
wave: 2
depends_on: [04-01]
files_modified:
  - hooks/admin/use-stats.ts
  - hooks/admin/use-departments.ts
  - hooks/admin/use-department-detail.ts
  - hooks/admin/use-professor-detail.ts
  - hooks/admin/index.ts
autonomous: true
requirements: [ADMIN-01, ADMIN-02, ADMIN-03]
must_haves:
  truths:
    - "useAdminStats() returns { studentCount, professorCount, courseCount, departmentCount } as 4 numbers"
    - "useAdminDepartments() returns AdminDepartmentSummary[] with each row carrying { id, name, description, professorCount }"
    - "useAdminDepartmentDetail(id) returns { department, professors } where professors is Profile[]"
    - "useAdminProfessorDetail(id) returns { professor, courses } where courses is Course[]"
    - "All hooks expose isPending and error from TanStack Query useQuery v5"
    - "Hooks reuse the singleton supabase client from lib/supabase.ts (no duplicate clients)"
    - "Detail hooks use enabled: Boolean(id) so they wait for the route param before firing"
    - "All queryKeys are namespaced under ['admin', ...] so Phase 5/6 hooks don't collide"
  artifacts:
    - path: "hooks/admin/use-stats.ts"
      provides: "Single useQuery returning the 4 dashboard counts via parallel HEAD queries"
      exports: ["useAdminStats", "AdminStats"]
      contains: "queryKey: ['admin', 'stats']"
    - path: "hooks/admin/use-departments.ts"
      provides: "List of departments with per-department professor counts"
      exports: ["useAdminDepartments", "AdminDepartmentSummary"]
      contains: "queryKey: ['admin', 'departments']"
    - path: "hooks/admin/use-department-detail.ts"
      provides: "Single department + list of its professors"
      exports: ["useAdminDepartmentDetail", "AdminDepartmentDetail"]
      contains: "queryKey: ['admin', 'department'"
    - path: "hooks/admin/use-professor-detail.ts"
      provides: "Single professor profile + list of their courses"
      exports: ["useAdminProfessorDetail", "AdminProfessorDetail"]
      contains: "queryKey: ['admin', 'professor'"
    - path: "hooks/admin/index.ts"
      provides: "Barrel export — screens import from '@/hooks/admin'"
      exports: ["useAdminStats", "useAdminDepartments", "useAdminDepartmentDetail", "useAdminProfessorDetail", "AdminStats", "AdminDepartmentSummary", "AdminDepartmentDetail", "AdminProfessorDetail"]
  key_links:
    - from: "hooks/admin/use-stats.ts"
      to: "lib/supabase.ts (singleton)"
      via: "import { supabase } from '@/lib/supabase'"
      pattern: "supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')"
    - from: "hooks/admin/use-stats.ts"
      to: "@tanstack/react-query useQuery"
      via: "single queryFn that runs 4 parallel HEAD count queries via Promise.all"
      pattern: "Promise.all([studentCount, professorCount, courseCount, departmentCount])"
    - from: "Phase 4 dashboard + detail screens (plans 04-03, 04-04)"
      to: "all 4 hooks in this plan"
      via: "import { useAdminStats } from '@/hooks/admin'"
      pattern: "useAdminStats() destructured for { data, isPending, error }"
---

<objective>
Build the four TanStack Query hooks the Phase 4 admin screens consume. Each hook is a pure data layer that wraps `supabase-js` calls in a `useQuery` with explicit `queryKey` namespacing under `['admin', ...]` so cache invalidation stays scoped when Phase 5/6 add their own hooks.

The return shape is contract-driven: each hook exports both the hook AND the result type so the consuming screen has zero ambiguity about what it's destructuring. No screen logic, no UI primitives — just data plumbing.

Purpose: Separate data fetching from rendering so Plan 04-03 (dashboard) and Plan 04-04 (detail screens) can focus on layout and the 4-state contract (Pending/Error/Empty/Success) without re-implementing query logic.
Output: 5 files (4 hooks + 1 barrel) under `hooks/admin/`. All return TanStack Query result objects with typed data.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/research/STACK.md

# Plan 04-01 unblocked profile reads — admin can now select all profiles
@.planning/phases/04-admin-experience/04-01-rls-unblock-PLAN.md

# The singleton supabase client every hook will use
@lib/supabase.ts

# Database type definitions — Profile, Department, Course type aliases
@types/database.types.ts
@types/app.types.ts

# QueryClient defaults (staleTime 2m, gcTime 5m, mutations.retry 0) — already applied globally
@providers/query-provider.tsx

# AuthProvider is NOT needed inside queryFn — hooks only run inside the admin route group,
# which means the user is already authenticated as admin. JWT travels with every supabase call.
@providers/auth-provider.tsx

<interfaces>
<!-- Shape contracts the screens (Plans 04-03, 04-04) will consume from these hooks -->

<!-- Hook 1: useAdminStats() -->
export interface AdminStats {
  studentCount: number
  professorCount: number
  courseCount: number
  departmentCount: number
}
export function useAdminStats(): UseQueryResult<AdminStats, Error>

<!-- Hook 2: useAdminDepartments() -->
export interface AdminDepartmentSummary {
  id: string
  name: string
  description: string | null
  professorCount: number
}
export function useAdminDepartments(): UseQueryResult<AdminDepartmentSummary[], Error>

<!-- Hook 3: useAdminDepartmentDetail(id) -->
export interface AdminDepartmentDetail {
  department: Department
  professors: Profile[]
}
export function useAdminDepartmentDetail(
  departmentId: string | undefined,
): UseQueryResult<AdminDepartmentDetail, Error>

<!-- Hook 4: useAdminProfessorDetail(id) -->
export interface AdminProfessorDetail {
  professor: Profile
  courses: Course[]
}
export function useAdminProfessorDetail(
  professorId: string | undefined,
): UseQueryResult<AdminProfessorDetail, Error>

<!-- Type re-exports already available from types/app.types.ts: -->
<!-- export type Profile      = Database['public']['Tables']['profiles']['Row'] -->
<!-- export type Department   = Database['public']['Tables']['departments']['Row'] -->
<!-- export type Course       = Database['public']['Tables']['courses']['Row'] -->

<!-- Supabase HEAD count pattern (canonical — no rows returned, just the count): -->
<!-- const { count, error } = await supabase -->
<!--   .from('profiles') -->
<!--   .select('*', { count: 'exact', head: true }) -->
<!--   .eq('role', 'student') -->
<!-- // count: number | null, error: PostgrestError | null -->

<!-- TanStack Query v5 useQuery signature reminder: -->
<!-- useQuery({ queryKey: ['namespace', 'subkey', id], queryFn: async () => {...}, enabled: bool }) -->
<!-- v5 returns isPending (NOT isLoading), isError, data, error, refetch -->

<!-- Pitfall to avoid (PITFALLS 5.1): granular query keys per resource so we can -->
<!-- invalidate one without re-fetching everything. ['admin','stats'] separate from -->
<!-- ['admin','departments'] separate from ['admin','department',id] etc. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create hooks/admin/use-stats.ts (the dashboard 4-count hook)</name>
  <files>hooks/admin/use-stats.ts</files>
  <read_first>
    - lib/supabase.ts (confirm `supabase` is the named export — it is)
    - types/app.types.ts (confirm Profile / Department / Course aliases — they exist)
    - providers/query-provider.tsx (confirm staleTime/gcTime defaults — already 2m/5m, no per-hook override needed)
  </read_first>
  <action>
Create `hooks/admin/use-stats.ts` with EXACTLY this content:

```typescript
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Aggregate counts powering the admin dashboard 2x2 stats grid.
 * All four counts come from a single useQuery — staying as one cache entry
 * means a single skeleton during the initial load and a single error path.
 *
 * Each subquery uses Supabase's HEAD-count pattern:
 *   .select('*', { count: 'exact', head: true })
 * — no rows transferred, server returns the count in the Content-Range header.
 *
 * Why students/professors are separate counts on the same table:
 *   public.profiles has a `role` column — we filter twice with .eq('role', X).
 *
 * Requires migration 04 (admin RLS unblock) — without it studentCount and
 * professorCount return 1 (admin's own row) instead of the true count.
 */
export interface AdminStats {
  studentCount: number
  professorCount: number
  courseCount: number
  departmentCount: number
}

async function fetchAdminStats(): Promise<AdminStats> {
  // Run all 4 counts in parallel — 4x lower latency than sequential
  const [studentRes, professorRes, courseRes, departmentRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'professor'),
    supabase
      .from('courses')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('departments')
      .select('*', { count: 'exact', head: true }),
  ])

  // Surface the first error if any subquery failed.
  const firstError =
    studentRes.error ?? professorRes.error ?? courseRes.error ?? departmentRes.error
  if (firstError) {
    throw new Error(`Failed to load admin stats: ${firstError.message}`)
  }

  return {
    studentCount: studentRes.count ?? 0,
    professorCount: professorRes.count ?? 0,
    courseCount: courseRes.count ?? 0,
    departmentCount: departmentRes.count ?? 0,
  }
}

export function useAdminStats(): UseQueryResult<AdminStats, Error> {
  return useQuery<AdminStats, Error>({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
  })
}
```

Notes:
- TanStack Query v5 uses `isPending` (NOT `isLoading`). Consumers in Plan 04-03 destructure `{ data, isPending, error }`.
- We do NOT set `staleTime` per-hook — the QueryClient defaults (staleTime: 2m, gcTime: 5m) apply.
- `Error` as the second type parameter ensures the `error` field is typed (not `unknown`).
- The 4 counts are intentionally bundled into ONE cache entry — they're rendered together, they should refresh together.
  </action>
  <verify>
    <automated>test -f hooks/admin/use-stats.ts && grep -q "queryKey: \['admin', 'stats'\]" hooks/admin/use-stats.ts && grep -q "Promise.all" hooks/admin/use-stats.ts && grep -q "count: 'exact', head: true" hooks/admin/use-stats.ts && grep -q "export interface AdminStats" hooks/admin/use-stats.ts && grep -q "export function useAdminStats" hooks/admin/use-stats.ts && npx tsc --noEmit 2>&1 | grep -E "use-stats\.ts.*error TS" | grep -v "^$" ; test "${PIPESTATUS[7]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `hooks/admin/use-stats.ts`
    - Exports interface `AdminStats` with exactly 4 number fields: studentCount, professorCount, courseCount, departmentCount
    - Exports function `useAdminStats(): UseQueryResult<AdminStats, Error>`
    - Uses `Promise.all` to parallelize the 4 count queries
    - Uses `{ count: 'exact', head: true }` on every count query (no row payload)
    - queryKey is exactly `['admin', 'stats']`
    - Imports `supabase` from `@/lib/supabase` (singleton — no `createClient` call)
    - Throws an Error (not returns null) on any subquery failure
    - `npx tsc --noEmit` produces NO errors mentioning use-stats.ts
  </acceptance_criteria>
  <done>Hook compiles, exports the right shape, uses head:true counts, parallel-fetches via Promise.all.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create hooks/admin/use-departments.ts (departments list with professor counts)</name>
  <files>hooks/admin/use-departments.ts</files>
  <read_first>
    - hooks/admin/use-stats.ts (just written — same conventions; mirror its structure)
    - types/database.types.ts (Department.Row + Profile.Row shapes — note department_id lives ON profiles, NOT on a join table)
  </read_first>
  <action>
Create `hooks/admin/use-departments.ts` with EXACTLY this content:

```typescript
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Departments list for the admin dashboard.
 *
 * Each row carries a per-department professor count, so the ListRow can show
 * a meaningful subtitle like "3 professors" instead of just the department name.
 *
 * Implementation:
 *   1. Fetch all departments (small table — no pagination needed for v1).
 *   2. Fetch all professor profiles with their department_id in one query.
 *   3. Build a Map<department_id, count> client-side.
 *   4. Merge counts into the departments list.
 *
 * Why two queries instead of a JOIN: PostgREST does not expose a "count
 * children grouped by parent" aggregate without an SQL VIEW. Two small
 * queries + a Map is cheaper than maintaining a view for v1, and the data
 * volume here (departments < 20, professors < 100 in a real institution)
 * makes the merge essentially free.
 *
 * Requires migration 04 — without it the professors query returns empty
 * (admin can't read other profiles).
 */
export interface AdminDepartmentSummary {
  id: string
  name: string
  description: string | null
  professorCount: number
}

async function fetchAdminDepartments(): Promise<AdminDepartmentSummary[]> {
  const [deptRes, profRes] = await Promise.all([
    supabase
      .from('departments')
      .select('id, name, description')
      .order('name', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, department_id')
      .eq('role', 'professor'),
  ])

  if (deptRes.error) {
    throw new Error(`Failed to load departments: ${deptRes.error.message}`)
  }
  if (profRes.error) {
    throw new Error(`Failed to load professors for department counts: ${profRes.error.message}`)
  }

  const departments = deptRes.data ?? []
  const professors = profRes.data ?? []

  // Build Map<departmentId, count>
  const countByDept = new Map<string, number>()
  for (const p of professors) {
    if (!p.department_id) continue
    countByDept.set(p.department_id, (countByDept.get(p.department_id) ?? 0) + 1)
  }

  return departments.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    professorCount: countByDept.get(d.id) ?? 0,
  }))
}

export function useAdminDepartments(): UseQueryResult<AdminDepartmentSummary[], Error> {
  return useQuery<AdminDepartmentSummary[], Error>({
    queryKey: ['admin', 'departments'],
    queryFn: fetchAdminDepartments,
  })
}
```

Notes:
- Sort by name (ascending) so the list is deterministic between renders.
- An empty result is a valid state — the consuming screen will check `data.length === 0` and render `EmptyState`.
- We pull only the columns we need (`id, name, description` and `id, department_id`) — saves bandwidth.
  </action>
  <verify>
    <automated>test -f hooks/admin/use-departments.ts && grep -q "queryKey: \['admin', 'departments'\]" hooks/admin/use-departments.ts && grep -q "export interface AdminDepartmentSummary" hooks/admin/use-departments.ts && grep -q "professorCount: number" hooks/admin/use-departments.ts && grep -q "Map<string, number>" hooks/admin/use-departments.ts && npx tsc --noEmit 2>&1 | grep -E "use-departments\.ts.*error TS" | grep -v "^$" ; test "${PIPESTATUS[5]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `hooks/admin/use-departments.ts`
    - Exports interface `AdminDepartmentSummary` with exactly { id, name, description, professorCount }
    - Exports function `useAdminDepartments()`
    - queryKey is exactly `['admin', 'departments']`
    - Uses `Promise.all` for the two parallel queries
    - Builds a `Map<string, number>` keyed on department_id to compute counts
    - Sorts departments by name ascending (`.order('name', { ascending: true })`)
    - Filters professors via `.eq('role', 'professor')`
    - `npx tsc --noEmit` produces NO errors mentioning use-departments.ts
  </acceptance_criteria>
  <done>Hook compiles, returns sorted department list with professor counts merged in client-side.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Create hooks/admin/use-department-detail.ts (single department + its professors)</name>
  <files>hooks/admin/use-department-detail.ts</files>
  <read_first>
    - hooks/admin/use-departments.ts (just written — same Map-merge approach is NOT needed here; we filter directly)
    - types/app.types.ts (confirm Profile and Department type aliases)
  </read_first>
  <action>
Create `hooks/admin/use-department-detail.ts` with EXACTLY this content:

```typescript
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Department, Profile } from '@/types/app.types'

/**
 * Single department detail + all professors assigned to it.
 *
 * Powers `app/(admin)/departments/[id].tsx`. The screen shows the department
 * name in the Stack header and a list of professors below.
 *
 * The hook accepts `departmentId | undefined` so it can be called with a
 * raw `useLocalSearchParams()` value without `!` non-null assertions in
 * the screen. When undefined, `enabled: false` prevents the query from
 * firing and `data` stays undefined.
 *
 * Requires migration 04 — without it the professors query returns empty
 * (admin can't see other professors' profiles).
 */
export interface AdminDepartmentDetail {
  department: Department
  professors: Profile[]
}

async function fetchDepartmentDetail(departmentId: string): Promise<AdminDepartmentDetail> {
  const [deptRes, profRes] = await Promise.all([
    supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .single(),
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'professor')
      .eq('department_id', departmentId)
      .order('display_name', { ascending: true, nullsFirst: false }),
  ])

  if (deptRes.error) {
    throw new Error(`Failed to load department: ${deptRes.error.message}`)
  }
  if (!deptRes.data) {
    throw new Error(`Department ${departmentId} not found`)
  }
  if (profRes.error) {
    throw new Error(`Failed to load professors: ${profRes.error.message}`)
  }

  return {
    department: deptRes.data,
    professors: profRes.data ?? [],
  }
}

export function useAdminDepartmentDetail(
  departmentId: string | undefined,
): UseQueryResult<AdminDepartmentDetail, Error> {
  return useQuery<AdminDepartmentDetail, Error>({
    queryKey: ['admin', 'department', departmentId],
    queryFn: () => fetchDepartmentDetail(departmentId as string),
    enabled: Boolean(departmentId),
  })
}
```

Notes:
- `enabled: Boolean(departmentId)` is the standard TanStack Query pattern for "wait for the param to arrive". When `enabled` is false, `data` is undefined and `isPending` is true.
- We sort professors by `display_name` ascending with `nullsFirst: false` so unset display names appear last.
- Returns the FULL Profile row (not a slimmed projection) so the consuming screen can show display_name + bio + avatar_url without a second query.
- The queryKey includes `departmentId` so each department gets its own cache entry — switching departments doesn't reuse stale data.
  </action>
  <verify>
    <automated>test -f hooks/admin/use-department-detail.ts && grep -q "queryKey: \['admin', 'department', departmentId\]" hooks/admin/use-department-detail.ts && grep -q "enabled: Boolean(departmentId)" hooks/admin/use-department-detail.ts && grep -q "export interface AdminDepartmentDetail" hooks/admin/use-department-detail.ts && grep -q "department: Department" hooks/admin/use-department-detail.ts && grep -q "professors: Profile\[\]" hooks/admin/use-department-detail.ts && npx tsc --noEmit 2>&1 | grep -E "use-department-detail\.ts.*error TS" | grep -v "^$" ; test "${PIPESTATUS[7]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `hooks/admin/use-department-detail.ts`
    - Exports interface `AdminDepartmentDetail` with exactly { department: Department, professors: Profile[] }
    - Exports function `useAdminDepartmentDetail(departmentId: string | undefined)`
    - queryKey is exactly `['admin', 'department', departmentId]`
    - Uses `enabled: Boolean(departmentId)` (no firing without an id)
    - Department fetch uses `.eq('id', departmentId).single()`
    - Professors fetch uses BOTH `.eq('role', 'professor')` AND `.eq('department_id', departmentId)`
    - Imports `Department` and `Profile` from `@/types/app.types`
    - `npx tsc --noEmit` produces NO errors mentioning use-department-detail.ts
  </acceptance_criteria>
  <done>Hook compiles, returns single department + professors filtered by department_id, gated by enabled flag.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Create hooks/admin/use-professor-detail.ts (single professor + their courses)</name>
  <files>hooks/admin/use-professor-detail.ts</files>
  <read_first>
    - hooks/admin/use-department-detail.ts (just written — same enabled-flag pattern; mirror its structure)
    - types/app.types.ts (confirm Course type alias — Course = Database['public']['Tables']['courses']['Row'])
    - supabase/migrations/00000000000001_initial_schema.sql lines 222-234 (confirm `courses: admin read all` policy exists and uses the recursive subquery — this WORKS because the subquery checks profiles.role and the SECURITY DEFINER from migration 04 bypasses any recursion. Verify by reading the migration.)
  </read_first>
  <action>
Create `hooks/admin/use-professor-detail.ts` with EXACTLY this content:

```typescript
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, Profile } from '@/types/app.types'

/**
 * Single professor's profile + all courses they teach.
 *
 * Powers `app/(admin)/professors/[id].tsx`. The screen shows the professor's
 * display_name + bio + avatar in a Card and lists their courses below.
 *
 * Notes on RLS:
 *   - profiles read: requires migration 04's admin-read-all policy (Plan 04-01)
 *   - courses read: original schema (initial_schema.sql line 232) already has
 *     "courses: admin read all" — that policy uses an EXISTS subquery against
 *     profiles, but it's NOT recursive because it's checking the calling user's
 *     own row (which the "profiles: own read/write" policy permits). Works fine.
 *
 * The hook accepts `professorId | undefined` so screens can pass raw
 * useLocalSearchParams() values; `enabled: false` prevents firing without an id.
 */
export interface AdminProfessorDetail {
  professor: Profile
  courses: Course[]
}

async function fetchProfessorDetail(professorId: string): Promise<AdminProfessorDetail> {
  const [profRes, courseRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', professorId)
      .eq('role', 'professor')
      .single(),
    supabase
      .from('courses')
      .select('*')
      .eq('professor_id', professorId)
      .order('title', { ascending: true }),
  ])

  if (profRes.error) {
    throw new Error(`Failed to load professor: ${profRes.error.message}`)
  }
  if (!profRes.data) {
    throw new Error(`Professor ${professorId} not found`)
  }
  if (courseRes.error) {
    throw new Error(`Failed to load courses: ${courseRes.error.message}`)
  }

  return {
    professor: profRes.data,
    courses: courseRes.data ?? [],
  }
}

export function useAdminProfessorDetail(
  professorId: string | undefined,
): UseQueryResult<AdminProfessorDetail, Error> {
  return useQuery<AdminProfessorDetail, Error>({
    queryKey: ['admin', 'professor', professorId],
    queryFn: () => fetchProfessorDetail(professorId as string),
    enabled: Boolean(professorId),
  })
}
```

Notes:
- The professor fetch uses `.eq('id', professorId).eq('role', 'professor')` defensively — if a route receives a student/admin uuid, this fetch returns no row instead of misleading "professor data".
- Sort courses by title alphabetically — same deterministic-render principle as departments.
- Returns FULL Profile + FULL Course rows so the screen can display everything (display_name, bio, avatar_url, course title, code, description) without a second query.
  </action>
  <verify>
    <automated>test -f hooks/admin/use-professor-detail.ts && grep -q "queryKey: \['admin', 'professor', professorId\]" hooks/admin/use-professor-detail.ts && grep -q "enabled: Boolean(professorId)" hooks/admin/use-professor-detail.ts && grep -q "export interface AdminProfessorDetail" hooks/admin/use-professor-detail.ts && grep -q "professor: Profile" hooks/admin/use-professor-detail.ts && grep -q "courses: Course\[\]" hooks/admin/use-professor-detail.ts && grep -q "\.eq('professor_id', professorId)" hooks/admin/use-professor-detail.ts && npx tsc --noEmit 2>&1 | grep -E "use-professor-detail\.ts.*error TS" | grep -v "^$" ; test "${PIPESTATUS[8]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `hooks/admin/use-professor-detail.ts`
    - Exports interface `AdminProfessorDetail` with exactly { professor: Profile, courses: Course[] }
    - Exports function `useAdminProfessorDetail(professorId: string | undefined)`
    - queryKey is exactly `['admin', 'professor', professorId]`
    - Uses `enabled: Boolean(professorId)`
    - Professor fetch uses BOTH `.eq('id', professorId)` AND `.eq('role', 'professor')` defensively
    - Course fetch uses `.eq('professor_id', professorId)` and `.order('title', { ascending: true })`
    - Imports `Course` and `Profile` from `@/types/app.types`
    - `npx tsc --noEmit` produces NO errors mentioning use-professor-detail.ts
  </acceptance_criteria>
  <done>Hook compiles, returns single professor + their courses sorted by title, gated by enabled flag.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 5: Create hooks/admin/index.ts (barrel export)</name>
  <files>hooks/admin/index.ts</files>
  <read_first>
    - hooks/admin/use-stats.ts (just written)
    - hooks/admin/use-departments.ts (just written)
    - hooks/admin/use-department-detail.ts (just written)
    - hooks/admin/use-professor-detail.ts (just written)
    - components/ui/index.ts (the existing barrel export pattern — mirror its `export * from './name'` style)
  </read_first>
  <action>
Create `hooks/admin/index.ts` with EXACTLY this content:

```typescript
// Barrel: screens import everything from '@/hooks/admin'
// Mirrors the components/ui/index.ts pattern.

export * from './use-stats'
export * from './use-departments'
export * from './use-department-detail'
export * from './use-professor-detail'
```

Then verify the export surface:
```bash
# Should print 4 hook function names + 4 result-shape interfaces
grep -hE "^export (function|interface) " hooks/admin/use-*.ts
```

Expected output (8 lines):
```
export interface AdminStats {
export function useAdminStats(): UseQueryResult<AdminStats, Error> {
export interface AdminDepartmentSummary {
export function useAdminDepartments(): UseQueryResult<AdminDepartmentSummary[], Error> {
export interface AdminDepartmentDetail {
export function useAdminDepartmentDetail(
export interface AdminProfessorDetail {
export function useAdminProfessorDetail(
```

After writing the barrel, run a final type-check on the entire project:
```bash
npx tsc --noEmit
```
Expected exit: 0. If any errors mention `hooks/admin/`, re-read the offending file and check imports.
  </action>
  <verify>
    <automated>test -f hooks/admin/index.ts && grep -q "export \* from './use-stats'" hooks/admin/index.ts && grep -q "export \* from './use-departments'" hooks/admin/index.ts && grep -q "export \* from './use-department-detail'" hooks/admin/index.ts && grep -q "export \* from './use-professor-detail'" hooks/admin/index.ts && npx tsc --noEmit 2>&1 | grep -E "error TS" ; test "${PIPESTATUS[5]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - File exists at `hooks/admin/index.ts`
    - Re-exports from all 4 hook files via `export * from './use-X'`
    - `npx tsc --noEmit` exits 0 (no errors anywhere in the project)
    - From any TS file, `import { useAdminStats, AdminStats } from '@/hooks/admin'` resolves
  </acceptance_criteria>
  <done>Barrel export written, all 4 hooks accessible from a single import path, full project type-checks.</done>
</task>

</tasks>

<verification>
End-to-end check that this plan is complete:

```bash
# 1. All 5 files exist
test -f hooks/admin/use-stats.ts
test -f hooks/admin/use-departments.ts
test -f hooks/admin/use-department-detail.ts
test -f hooks/admin/use-professor-detail.ts
test -f hooks/admin/index.ts

# 2. Each hook has the right queryKey (grep confirms namespace + name)
grep -q "queryKey: \['admin', 'stats'\]"        hooks/admin/use-stats.ts
grep -q "queryKey: \['admin', 'departments'\]"  hooks/admin/use-departments.ts
grep -q "queryKey: \['admin', 'department', departmentId\]" hooks/admin/use-department-detail.ts
grep -q "queryKey: \['admin', 'professor', professorId\]"   hooks/admin/use-professor-detail.ts

# 3. Each hook exports both function + result interface
grep -q "export function useAdminStats"             hooks/admin/use-stats.ts
grep -q "export function useAdminDepartments"       hooks/admin/use-departments.ts
grep -q "export function useAdminDepartmentDetail"  hooks/admin/use-department-detail.ts
grep -q "export function useAdminProfessorDetail"   hooks/admin/use-professor-detail.ts
grep -q "export interface AdminStats"               hooks/admin/use-stats.ts
grep -q "export interface AdminDepartmentSummary"   hooks/admin/use-departments.ts
grep -q "export interface AdminDepartmentDetail"    hooks/admin/use-department-detail.ts
grep -q "export interface AdminProfessorDetail"     hooks/admin/use-professor-detail.ts

# 4. Full project type-check passes
npx tsc --noEmit  # exit code: 0
```

Optional smoke test (manual — depends on Phase 4 plan 04-01 already applied):
```bash
# In a temporary REPL or scratch script, import + call useAdminStats inside a
# component wrapped in QueryClientProvider — confirm it returns 4 numbers.
# This is implicitly covered by Plan 04-03's dashboard rendering.
```
</verification>

<success_criteria>
- [ ] All 4 hook files written with the exact contract spec'd in `<interfaces>`
- [ ] Barrel `hooks/admin/index.ts` re-exports all 4 hooks + their result types
- [ ] Every hook uses the singleton `supabase` from `@/lib/supabase` (not a new createClient)
- [ ] Every hook uses TanStack Query v5 `useQuery` (NOT useSuspenseQuery, NOT a manual fetcher)
- [ ] queryKeys are namespaced under `['admin', ...]` so Phase 5/6 hooks won't collide
- [ ] Detail hooks gate on `enabled: Boolean(id)` so they tolerate undefined route params
- [ ] No hook calls `supabase.auth.getUser()` inside its queryFn (auth-js deadlock pitfall PITFALLS 2.2)
- [ ] `npx tsc --noEmit` exits 0
- [ ] Plan 04-03 (dashboard) and 04-04 (detail screens) can `import { ... } from '@/hooks/admin'` and consume the 4 hooks without rewriting any data layer
</success_criteria>

<output>
After completion, create `.planning/phases/04-admin-experience/04-02-SUMMARY.md` documenting:
- The 4 hook function signatures + their result interface signatures (paste verbatim from the files)
- The exact queryKeys in use (so Plan 04-03 / 04-04 know what to invalidate if needed)
- Confirmation that `npx tsc --noEmit` exits 0
- Any deviations from the spec or surprises in the supabase-js types
</output>
