---
phase: 04-admin-experience
plan: 03
type: execute
wave: 4
depends_on: [04-01, 04-02, 04-04]
files_modified:
  - app/(admin)/(tabs)/index.tsx
  - components/admin/stat-card.tsx
autonomous: true
requirements: [ADMIN-01, ADMIN-02]
must_haves:
  truths:
    - "Admin dashboard renders a 2x2 stats grid showing 4 numbers: students, professors, courses, departments"
    - "All four counts match the actual Supabase data (verified by useAdminStats which uses count: 'exact')"
    - "Below the grid, a 'Departments' section lists all departments with name + 'N professors' subtitle"
    - "Tapping a department row routes to /(admin)/departments/[id]"
    - "On initial load, dashboard shows Skeleton (NOT spinner) — uses SkeletonCard for stats + SkeletonListRow for departments list"
    - "On query failure, ErrorView with onRetry={refetch} replaces the failed section"
    - "If departments list is empty, EmptyState replaces the list (NOT a blank space)"
    - "Stats counts use the role-accent color via text-accent class (steel for admin)"
  artifacts:
    - path: "app/(admin)/(tabs)/index.tsx"
      provides: "Real admin dashboard — replaces the placeholder shipped in Phase 3"
      contains: "useAdminStats"
    - path: "components/admin/stat-card.tsx"
      provides: "Reusable 2x2-grid stat card primitive (label + count, uses Card variant=elevated)"
      exports: ["StatCard"]
  key_links:
    - from: "app/(admin)/(tabs)/index.tsx"
      to: "hooks/admin/use-stats.ts (Plan 04-02)"
      via: "import { useAdminStats } from '@/hooks/admin'"
      pattern: "const { data: stats, isPending: statsPending, error: statsError, refetch: refetchStats } = useAdminStats()"
    - from: "app/(admin)/(tabs)/index.tsx"
      to: "hooks/admin/use-departments.ts (Plan 04-02)"
      via: "import { useAdminDepartments } from '@/hooks/admin'"
      pattern: "const { data: departments, isPending: deptPending, error: deptError, refetch: refetchDept } = useAdminDepartments()"
    - from: "ListRow row press handler"
      to: "/(admin)/departments/[id] route (lives in Plan 04-04)"
      via: "router.push() with the department id"
      pattern: "router.push(`/(admin)/departments/${dept.id}` as never)"
    - from: "components/admin/stat-card.tsx"
      to: "components/ui Card primitive"
      via: "Card variant='elevated' — matches Phase 2 4-state contract"
      pattern: "<Card variant='elevated' padding='lg'>"
---

<objective>
Replace the Phase 3 placeholder admin home (`app/(admin)/(tabs)/index.tsx`) with the real dashboard: a 2x2 stats grid showing institution-wide counts followed by a tappable departments list. This is the FIRST screen the admin sees after sign-in.

Two-section layout:
1. **Stats grid (top)** — 4 numbers in a 2-column grid. Renders from `useAdminStats()`. Each stat is a `<Card variant='elevated'>` containing a label ("Students") and a count ("142") in the role-accent color.
2. **Departments section (below)** — header "Departments" + a list of `<ListRow>` rows. Each row shows the department name as title and "N professors" as subtitle, with the right-chevron from the existing primitive. Tapping routes to the detail screen built in Plan 04-04.

This plan also creates the `StatCard` primitive in `components/admin/` so the JSX in the dashboard stays readable. We don't add it to the global `components/ui` barrel — it's admin-specific and not part of the Phase 2 7-primitive contract.

Purpose: Make ADMIN-01 (stats) and ADMIN-02 (departments list with tap-through) visible on screen.
Output: Updated dashboard tab + one new admin-scoped primitive.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md

# Plan 04-01 unblocked profile reads — required for stats accuracy
@.planning/phases/04-admin-experience/04-01-rls-unblock-PLAN.md

# Plan 04-02 built the data hooks this screen consumes
@.planning/phases/04-admin-experience/04-02-query-hooks-PLAN.md

# Phase 3 placeholder we're replacing
@app/(admin)/(tabs)/index.tsx

# Tabs layout so we know the header tint already routes through tokens
@app/(admin)/(tabs)/_layout.tsx

# Admin layout — RoleThemeProvider already wraps this subtree (Phase 3 work)
# So `bg-accent` and `text-accent` resolve to STEEL (#64748B) automatically.
@app/(admin)/_layout.tsx

# Primitives we'll consume — re-read the props
@components/ui/card.tsx
@components/ui/list-row.tsx
@components/ui/empty-state.tsx
@components/ui/skeleton.tsx
@components/ui/error-view.tsx
@components/ui/index.ts

# Token reference (icon colors when calling lucide-react-native)
@theme/tokens.ts

<interfaces>
<!-- Hooks consumed (built in Plan 04-02) -->

import {
  useAdminStats,
  useAdminDepartments,
  type AdminStats,
  type AdminDepartmentSummary,
} from '@/hooks/admin'

const { data, isPending, error, refetch } = useAdminStats()
// data: AdminStats | undefined  =>  { studentCount, professorCount, courseCount, departmentCount }

const { data, isPending, error, refetch } = useAdminDepartments()
// data: AdminDepartmentSummary[] | undefined  =>  Array<{ id, name, description, professorCount }>

<!-- Primitives consumed (Phase 2) — verified prop signatures from source files: -->

<Card variant="elevated" padding="lg">  // bg-surface, rounded-2xl, shadow-md, p-5
  {children}
</Card>

<ListRow
  title="Computer Science"
  subtitle="3 professors"
  onPress={() => router.push(...)}
  // showChevron defaults to Boolean(onPress) — true here
/>

<EmptyState
  icon={Building2}             // any LucideIcon
  title="No departments yet"
  description="Departments will appear here once created in the admin panel."
  // action prop OPTIONAL — admin is read-only so we don't pass one
/>

<Skeleton width="100%" height={80} className="rounded-2xl" />
<SkeletonListRow />            // already styled to match ListRow visually

<ErrorView
  title="Couldn't load stats"
  description="Something went wrong fetching the dashboard data."
  onRetry={refetch}
/>

<!-- Expo Router navigation pattern (matches the `as never` cast used in app/_layout.tsx ProtectedRouter): -->
import { useRouter } from 'expo-router'
const router = useRouter()
router.push(`/(admin)/departments/${id}` as never)

<!-- The destination route (/(admin)/departments/[id]) is created in Plan 04-04. -->
<!-- It's safe to push to a non-existent route; once 04-04 ships, the tap works. -->
<!-- For Phase 4 wave-3, both plans run in the same wave — push WILL work after 04-04 lands. -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create components/admin/stat-card.tsx (StatCard primitive)</name>
  <files>components/admin/stat-card.tsx</files>
  <read_first>
    - components/ui/card.tsx (confirm Card props: { children, variant, padding, onPress, className })
    - theme/tokens.ts (confirm fgMuted hex for icon color: '#7A736A')
    - global.css (confirm `text-accent` resolves to rgb(var(--color-accent)) which RoleThemeProvider sets to steel for admin)
  </read_first>
  <action>
Create the directory and file:
```bash
mkdir -p components/admin
```

Then write `components/admin/stat-card.tsx` with EXACTLY this content:

```tsx
import { Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Card } from '@/components/ui'
import { tokens } from '@/theme/tokens'

/**
 * Single stat tile in the admin dashboard 2x2 grid.
 *
 * Visual: elevated Card containing a small label ("Students"), a large count
 * in the role-accent color ("142"), and an optional left-side icon.
 *
 * Lives under components/admin/ (not components/ui/) because it's not part of
 * the Phase 2 7-primitive contract — it's an admin-specific composition of
 * the Card primitive + Text rendering.
 *
 * The accent color is injected by the surrounding RoleThemeProvider in
 * app/(admin)/_layout.tsx — for admin that's steel (#64748B). On other roles
 * the same component would render in clay or sage.
 */
export interface StatCardProps {
  label: string
  count: number
  icon?: LucideIcon
}

export function StatCard({ label, count, icon: Icon }: StatCardProps) {
  return (
    <Card variant="elevated" padding="lg">
      {Icon ? (
        <View className="mb-2">
          <Icon color={tokens.colors.fgMuted} size={20} />
        </View>
      ) : null}
      <Text className="text-xs font-sans text-fg-muted uppercase tracking-wide">
        {label}
      </Text>
      <Text className="text-3xl font-sans-semibold text-accent mt-1">
        {count}
      </Text>
    </Card>
  )
}
```

Notes:
- `text-accent` is the role-aware Tailwind class (resolves to `rgb(var(--color-accent))` — steel for admin).
- `text-3xl` (30px) matches the `display` size in `tokens.typography.sizes.display`.
- `font-sans-semibold` resolves to Inter_600SemiBold — within the Phase 2 2-weight typography contract.
- `tracking-wide` + `uppercase` on the label gives it a "stat label" feel without violating the type scale (`text-xs` = 12px = caption size).
- We don't use `text-accent` on the label (just on the number) — labels stay neutral, counts get the brand color.
  </action>
  <verify>
    <automated>test -d components/admin && test -f components/admin/stat-card.tsx && grep -q "export function StatCard" components/admin/stat-card.tsx && grep -q "text-accent" components/admin/stat-card.tsx && grep -q "text-3xl" components/admin/stat-card.tsx && grep -q "font-sans-semibold" components/admin/stat-card.tsx && grep -q 'variant="elevated"' components/admin/stat-card.tsx && npx tsc --noEmit 2>&1 | grep -E "stat-card\.tsx.*error TS" | grep -v "^$" ; test "${PIPESTATUS[8]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - Directory `components/admin/` exists
    - File `components/admin/stat-card.tsx` exists
    - Exports `StatCard` function and `StatCardProps` interface
    - Uses `Card` primitive with `variant="elevated"` and `padding="lg"`
    - Renders count with `text-3xl font-sans-semibold text-accent` (role-accent applied)
    - Renders label with `text-xs font-sans text-fg-muted uppercase tracking-wide`
    - Optional icon prop renders via `<Icon color={tokens.colors.fgMuted} size={20} />`
    - `npx tsc --noEmit` produces NO errors mentioning stat-card.tsx
  </acceptance_criteria>
  <done>StatCard renders a label + count + optional icon inside an elevated Card with role-accent number color.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Replace app/(admin)/(tabs)/index.tsx with the real dashboard</name>
  <files>app/(admin)/(tabs)/index.tsx</files>
  <read_first>
    - app/(admin)/(tabs)/index.tsx (the placeholder we're replacing — read it once so you understand what was there before)
    - app/(admin)/(tabs)/_layout.tsx (confirm the screen title "Dashboard" comes from the Tabs.Screen options, so we don't render it again in the screen)
    - components/admin/stat-card.tsx (just written — read its props one more time)
    - components/ui/index.ts (confirm Card / ListRow / EmptyState / ErrorView / SkeletonCard / SkeletonListRow are all re-exported)
    - components/ui/skeleton.tsx (confirm SkeletonCard and SkeletonListRow are exported alongside Skeleton)
    - hooks/admin/index.ts (confirm useAdminStats and useAdminDepartments are re-exported)
  </read_first>
  <action>
Replace the entire contents of `app/(admin)/(tabs)/index.tsx` with EXACTLY this content:

```tsx
import { ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Building2,
  GraduationCap,
  Library,
  Users,
} from 'lucide-react-native'
import {
  EmptyState,
  ErrorView,
  ListRow,
  SkeletonCard,
  SkeletonListRow,
} from '@/components/ui'
import { StatCard } from '@/components/admin/stat-card'
import { useAdminDepartments, useAdminStats } from '@/hooks/admin'

/**
 * Admin Dashboard — the home tab for admin role.
 *
 * Phase 4 deliverable for ADMIN-01 (stats grid) + ADMIN-02 (departments list).
 *
 * Two sections, each driven by its own useQuery hook:
 *   1. Stats grid — 4 numbers in a 2x2 layout (useAdminStats)
 *   2. Departments list — name + professor count, tappable (useAdminDepartments)
 *
 * 4-state contract per Phase 2 (each section renders independently):
 *   - Pending  -> SkeletonCard / SkeletonListRow
 *   - Error    -> ErrorView with onRetry
 *   - Empty    -> EmptyState (departments only — stats can't be "empty")
 *   - Success  -> StatCard / ListRow rendering data
 */
export default function AdminDashboard() {
  const router = useRouter()

  const {
    data: stats,
    isPending: statsPending,
    error: statsError,
    refetch: refetchStats,
  } = useAdminStats()

  const {
    data: departments,
    isPending: deptPending,
    error: deptError,
    refetch: refetchDept,
  } = useAdminDepartments()

  return (
    <ScrollView className="flex-1 bg-canvas">
      {/* ───────────────── Stats grid section ───────────────── */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-sans-semibold text-fg-primary mb-3">
          Institution overview
        </Text>

        {statsError ? (
          <ErrorView
            title="Couldn't load stats"
            description="Something went wrong fetching the dashboard counts."
            onRetry={() => {
              refetchStats()
            }}
            technical={statsError.message}
          />
        ) : statsPending || !stats ? (
          // 2x2 grid of skeleton cards
          <View className="flex-row flex-wrap -mx-1.5">
            <View className="w-1/2 px-1.5 mb-3">
              <SkeletonCard />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <SkeletonCard />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <SkeletonCard />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <SkeletonCard />
            </View>
          </View>
        ) : (
          <View className="flex-row flex-wrap -mx-1.5">
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard label="Students" count={stats.studentCount} icon={GraduationCap} />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard label="Professors" count={stats.professorCount} icon={Users} />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard label="Courses" count={stats.courseCount} icon={Library} />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard label="Departments" count={stats.departmentCount} icon={Building2} />
            </View>
          </View>
        )}
      </View>

      {/* ───────────────── Departments section ───────────────── */}
      <View className="mt-4">
        <Text className="text-xl font-sans-semibold text-fg-primary px-4 mb-2">
          Departments
        </Text>

        {deptError ? (
          <View className="px-4">
            <ErrorView
              title="Couldn't load departments"
              description="Something went wrong fetching the departments list."
              onRetry={() => {
                refetchDept()
              }}
              technical={deptError.message}
            />
          </View>
        ) : deptPending || !departments ? (
          <View>
            <SkeletonListRow />
            <SkeletonListRow />
            <SkeletonListRow />
          </View>
        ) : departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No departments yet"
            description="Departments will appear here once they're added to Supabase."
          />
        ) : (
          <View>
            {departments.map((dept) => (
              <ListRow
                key={dept.id}
                title={dept.name}
                subtitle={
                  dept.professorCount === 1
                    ? '1 professor'
                    : `${dept.professorCount} professors`
                }
                leftIcon={Building2}
                onPress={() => {
                  router.push(`/(admin)/departments/${dept.id}` as never)
                }}
              />
            ))}
          </View>
        )}
      </View>

      {/* Bottom spacer so the last ListRow isn't clipped by the tab bar */}
      <View className="h-12" />
    </ScrollView>
  )
}
```

Key implementation notes:
- The Tabs.Screen options in `(tabs)/_layout.tsx` set `title: 'Dashboard'` — that becomes the header. We do NOT re-render "Dashboard" inside the screen. The first text the user reads inside the scroll area is "Institution overview".
- Two-column grid is achieved with `flex-wrap` + `w-1/2 px-1.5 -mx-1.5` — equivalent to a 12px gutter.
- Each section handles its 4 states independently. Stats failing doesn't take down the departments list and vice versa.
- We pluralize the subtitle: "1 professor" vs "3 professors". UI polish.
- The route `/(admin)/departments/${dept.id}` is created in Plan 04-04 (same wave). The `as never` cast matches the pattern used in `app/_layout.tsx` ProtectedRouter — Expo Router 6's typed routes don't yet know about route patterns we're about to add.
- The bottom `h-12` spacer prevents the last ListRow's bottom border from sitting flush against the tab bar.
- `lucide-react-native` icons used: `Building2` (departments), `GraduationCap` (students), `Library` (courses), `Users` (professors). All ship with the package — no install needed.
  </action>
  <verify>
    <automated>test -f "app/(admin)/(tabs)/index.tsx" && grep -q "useAdminStats" "app/(admin)/(tabs)/index.tsx" && grep -q "useAdminDepartments" "app/(admin)/(tabs)/index.tsx" && grep -q "StatCard" "app/(admin)/(tabs)/index.tsx" && grep -q "label=\"Students\"" "app/(admin)/(tabs)/index.tsx" && grep -q "label=\"Professors\"" "app/(admin)/(tabs)/index.tsx" && grep -q "label=\"Courses\"" "app/(admin)/(tabs)/index.tsx" && grep -q "label=\"Departments\"" "app/(admin)/(tabs)/index.tsx" && grep -q "router.push" "app/(admin)/(tabs)/index.tsx" && grep -q "/(admin)/departments/" "app/(admin)/(tabs)/index.tsx" && grep -q "SkeletonCard" "app/(admin)/(tabs)/index.tsx" && grep -q "SkeletonListRow" "app/(admin)/(tabs)/index.tsx" && grep -q "ErrorView" "app/(admin)/(tabs)/index.tsx" && grep -q "EmptyState" "app/(admin)/(tabs)/index.tsx" && npx tsc --noEmit 2>&1 | grep -E "\(tabs\)/index\.tsx.*error TS" | grep -v "^$" ; test "${PIPESTATUS[15]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - File `app/(admin)/(tabs)/index.tsx` exists and is the dashboard (NOT the Phase 3 placeholder)
    - Imports `useAdminStats` and `useAdminDepartments` from `@/hooks/admin`
    - Imports `StatCard` from `@/components/admin/stat-card`
    - Renders the 4 StatCard tiles with EXACT labels: "Students", "Professors", "Courses", "Departments"
    - Renders 4 SkeletonCards in the pending state (one per stat slot)
    - Renders SkeletonListRows in the departments pending state
    - Renders ErrorView with onRetry for both stats AND departments error paths
    - Renders EmptyState with `Building2` icon when departments.length === 0
    - Each ListRow uses `Building2` left icon and pluralizes the subtitle ("1 professor" vs "3 professors")
    - Tap handler calls `router.push(\`/(admin)/departments/${dept.id}\` as never)`
    - Wraps everything in `<ScrollView className="flex-1 bg-canvas">`
    - `npx tsc --noEmit` produces NO errors mentioning the dashboard file
  </acceptance_criteria>
  <done>Dashboard tab renders 4-stat grid + departments list with full 4-state coverage; tapping a department navigates.</done>
</task>

</tasks>

<verification>
End-to-end check that this plan is complete:

```bash
# 1. Files exist
test -f components/admin/stat-card.tsx
test -f "app/(admin)/(tabs)/index.tsx"

# 2. Dashboard imports the right hooks (Plan 04-02 contract)
grep -q "useAdminStats" "app/(admin)/(tabs)/index.tsx"
grep -q "useAdminDepartments" "app/(admin)/(tabs)/index.tsx"

# 3. All 4 stat labels present
grep -q 'label="Students"'    "app/(admin)/(tabs)/index.tsx"
grep -q 'label="Professors"'  "app/(admin)/(tabs)/index.tsx"
grep -q 'label="Courses"'     "app/(admin)/(tabs)/index.tsx"
grep -q 'label="Departments"' "app/(admin)/(tabs)/index.tsx"

# 4. 4-state coverage in dashboard
grep -q "SkeletonCard"      "app/(admin)/(tabs)/index.tsx"  # Pending (stats)
grep -q "SkeletonListRow"   "app/(admin)/(tabs)/index.tsx"  # Pending (depts)
grep -q "ErrorView"         "app/(admin)/(tabs)/index.tsx"  # Error
grep -q "EmptyState"        "app/(admin)/(tabs)/index.tsx"  # Empty
grep -q "ListRow"           "app/(admin)/(tabs)/index.tsx"  # Success

# 5. Navigation wired
grep -q "router.push" "app/(admin)/(tabs)/index.tsx"
grep -q "departments/" "app/(admin)/(tabs)/index.tsx"

# 6. Project type-checks
npx tsc --noEmit  # exit code: 0
```

Manual smoke verification (after Plan 04-04 ships and you can run the app):
1. `npx expo start` → launch on simulator
2. Sign in as `admin@demo.scholera.test` / `demo-password-1234`
3. Lands on Dashboard tab. The 4 stats appear with steel (#64748B) numbers.
4. Stats counts match `select role, count(*) from profiles group by role` in Supabase Studio for students/professors and `select count(*) from courses` / `from departments`.
5. Departments section lists all departments alphabetically with "N professors" subtitles.
6. Tap a department row → navigates to /(admin)/departments/[id] (built in Plan 04-04).
</verification>

<success_criteria>
- [ ] StatCard primitive exists at components/admin/stat-card.tsx and renders label + count + optional icon
- [ ] Dashboard at app/(admin)/(tabs)/index.tsx replaces the Phase 3 placeholder
- [ ] 2x2 stats grid renders 4 StatCards: Students, Professors, Courses, Departments
- [ ] Stats numbers display in role-accent color (steel for admin)
- [ ] Departments section lists all departments with "N professors" subtitle
- [ ] Each department row is tappable and pushes to /(admin)/departments/[id]
- [ ] All 4 states covered for both sections: Skeleton (pending) / ErrorView (error) / EmptyState (empty for departments only) / data (success)
- [ ] Sections fail independently (stats error doesn't break departments and vice versa)
- [ ] `npx tsc --noEmit` exits 0
- [ ] ADMIN-01 (stats) + ADMIN-02 (departments tap-through) both visible on screen
</success_criteria>

<output>
After completion, create `.planning/phases/04-admin-experience/04-03-SUMMARY.md` documenting:
- Screenshots or text description of the rendered dashboard (since this is the first VISIBLE Phase 4 deliverable)
- Confirmation that the 4 stat counts match the Supabase data (paste actual numbers seen)
- Confirmation that tapping a department row navigates to the right URL
- Any deviations from the spec (e.g. icon swaps, wording tweaks, layout adjustments)
- `npx tsc --noEmit` exit code
</output>
