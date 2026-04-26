---
phase: 04-admin-experience
plan: 04
type: execute
wave: 3
depends_on: [04-01, 04-02]
files_modified:
  - app/(admin)/departments/_layout.tsx
  - app/(admin)/departments/[id].tsx
  - app/(admin)/professors/_layout.tsx
  - app/(admin)/professors/[id].tsx
autonomous: true
requirements: [ADMIN-02, ADMIN-03]
must_haves:
  truths:
    - "Tapping a department row from the dashboard opens /(admin)/departments/[id] with a Stack header showing the department name + a back button"
    - "Department detail lists all professors in that department, each row tappable"
    - "Tapping a professor row from department detail opens /(admin)/professors/[id]"
    - "Professor detail shows the professor's display_name + bio + avatar in a Card, with a 'Courses' section listing all their courses"
    - "Back-stack is logical: dashboard -> department detail -> professor detail; back button returns one step at a time"
    - "Both screens render Skeleton during pending, ErrorView with onRetry on error, EmptyState when professor list / course list is empty"
    - "Both screens use the existing Stack from app/(admin)/_layout.tsx (no new layout work — just nested stack folders for the routes)"
  artifacts:
    - path: "app/(admin)/departments/_layout.tsx"
      provides: "Stack layout for the departments subtree (renders header for [id] screen)"
      contains: "Stack"
    - path: "app/(admin)/departments/[id].tsx"
      provides: "Department detail screen — name in Stack header + professors list"
      contains: "useAdminDepartmentDetail"
    - path: "app/(admin)/professors/_layout.tsx"
      provides: "Stack layout for the professors subtree (renders header for [id] screen)"
      contains: "Stack"
    - path: "app/(admin)/professors/[id].tsx"
      provides: "Professor detail screen — profile Card + courses list"
      contains: "useAdminProfessorDetail"
  key_links:
    - from: "app/(admin)/departments/[id].tsx"
      to: "hooks/admin/use-department-detail.ts (Plan 04-02)"
      via: "import { useAdminDepartmentDetail } from '@/hooks/admin'"
      pattern: "useAdminDepartmentDetail(id) where id = useLocalSearchParams<{ id: string }>().id"
    - from: "app/(admin)/professors/[id].tsx"
      to: "hooks/admin/use-professor-detail.ts (Plan 04-02)"
      via: "import { useAdminProfessorDetail } from '@/hooks/admin'"
      pattern: "useAdminProfessorDetail(id) where id = useLocalSearchParams<{ id: string }>().id"
    - from: "Department detail ListRow press"
      to: "/(admin)/professors/[id]"
      via: "router.push() with the professor id"
      pattern: "router.push(`/(admin)/professors/${prof.id}` as never)"
    - from: "Stack header back button"
      to: "Expo Router default behavior"
      via: "Stack.Screen options pop on back press automatically (no manual handling needed)"
      pattern: "headerBackButtonDisplayMode: 'minimal' (iOS visual polish)"
---

<objective>
Build the two detail screens that complete the admin drill-down flow:

1. **Department detail** (`/(admin)/departments/[id]`) — Stack header shows the department name; body shows all professors assigned to that department as tappable ListRows.
2. **Professor detail** (`/(admin)/professors/[id]`) — Stack header shows the professor's display_name; body shows their profile (display_name, bio, avatar) in a Card, then a "Courses" section listing all courses they teach.

Both screens nest under the existing `app/(admin)/_layout.tsx` Stack (which is already inside the RoleThemeProvider, so steel accent works without extra wiring). Each new route folder needs a tiny `_layout.tsx` that just renders `<Stack />` so Expo Router knows the folder is a stack — that pattern matches Phase 3's role-group layouts.

This plan completes ADMIN-02 (the "tapping a department shows its detail" half) and ADMIN-03 (professor detail with assigned courses).

Purpose: Make the admin → department → professor drill-down navigable end-to-end.
Output: 4 files: 2 stack layouts + 2 dynamic-route detail screens. Back-stack is automatic via Expo Router defaults.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md

# Plan 04-01 unblocked profile reads — required for both screens
@.planning/phases/04-admin-experience/04-01-rls-unblock-PLAN.md

# Plan 04-02 built the data hooks
@.planning/phases/04-admin-experience/04-02-query-hooks-PLAN.md

# Plan 04-03 built the dashboard that pushes to /(admin)/departments/[id]
@.planning/phases/04-admin-experience/04-03-dashboard-and-departments-PLAN.md

# Existing admin layout — confirms Stack root + RoleThemeProvider already wraps subtree
@app/(admin)/_layout.tsx

# Existing admin tabs layout — for header style consistency reference
@app/(admin)/(tabs)/_layout.tsx

# Primitives we'll consume
@components/ui/card.tsx
@components/ui/list-row.tsx
@components/ui/empty-state.tsx
@components/ui/skeleton.tsx
@components/ui/error-view.tsx
@components/ui/index.ts

# Token reference
@theme/tokens.ts

<interfaces>
<!-- Hooks consumed (Plan 04-02 contract) -->

import {
  useAdminDepartmentDetail,
  useAdminProfessorDetail,
  type AdminDepartmentDetail,
  type AdminProfessorDetail,
} from '@/hooks/admin'

const { data, isPending, error, refetch } = useAdminDepartmentDetail(id)
// data: { department: Department, professors: Profile[] } | undefined
// When id is undefined, isPending stays true (enabled: false in the hook)

const { data, isPending, error, refetch } = useAdminProfessorDetail(id)
// data: { professor: Profile, courses: Course[] } | undefined

<!-- Database types (Plan 04-02 re-exports — but we can also import from @/types/app.types directly): -->

interface Profile {
  id: string
  role: 'admin' | 'professor' | 'student'
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  department_id: string | null
  created_at: string
  updated_at: string
}

interface Department {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface Course {
  id: string
  professor_id: string
  program_id: string | null
  title: string
  code: string | null
  description: string | null
  created_at: string
  updated_at: string
}

<!-- Expo Router patterns -->

import { Stack, useLocalSearchParams, useRouter } from 'expo-router'

const { id } = useLocalSearchParams<{ id: string }>()
// id: string | undefined — pass directly to hook (which handles undefined via enabled flag)

// Dynamic Stack header title
<Stack.Screen options={{ title: dept?.name ?? 'Department' }} />

// Navigate to next level
const router = useRouter()
router.push(`/(admin)/professors/${prof.id}` as never)

<!-- Primitive prop reminders (verified from source files): -->

<Card variant="default" padding="md">  // bg-surface, border-border-subtle, rounded-xl, p-4
  {children}
</Card>

<ListRow
  title={prof.display_name ?? 'Unnamed Professor'}
  subtitle={prof.bio ?? undefined}
  leftAvatarUrl={prof.avatar_url ?? undefined}  // Image; falls back to gray circle if undefined
  onPress={() => router.push(...)}
/>

<EmptyState icon={Users} title="No professors yet" description="..." />
<ErrorView title="Couldn't load department" onRetry={refetch} technical={error.message} />

<!-- Skeleton presets (re-read from skeleton.tsx): -->
<SkeletonHeading />     // 24h x 60% wide
<SkeletonText lines={2} />
<SkeletonCard />        // Card-styled skeleton (heading + 2 lines of text)
<SkeletonListRow />     // ListRow-styled skeleton (avatar + title + subtitle)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create app/(admin)/departments/_layout.tsx (Stack layout for department subtree)</name>
  <files>app/(admin)/departments/_layout.tsx</files>
  <read_first>
    - app/(admin)/_layout.tsx (note: it already wraps everything in RoleThemeProvider + Stack with headerShown: false; nested stacks INSIDE this Stack get their own headerShown control)
    - theme/tokens.ts (for header tint colors if we customize)
  </read_first>
  <action>
Create the directory and file:
```bash
mkdir -p "app/(admin)/departments"
```

Then write `app/(admin)/departments/_layout.tsx` with EXACTLY this content:

```tsx
import { Stack } from 'expo-router'
import { tokens } from '@/theme/tokens'

/**
 * Stack layout for /(admin)/departments/* routes.
 *
 * The parent app/(admin)/_layout.tsx renders a Stack with headerShown: false,
 * so the (tabs) group has no header (it manages its own via Tabs.Screen options).
 * For the departments detail screen we WANT a header — it shows the department
 * name + a back button. So we set headerShown: true here.
 *
 * The screen-specific title is set inside [id].tsx via <Stack.Screen options>.
 */
export default function DepartmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerStyle: { backgroundColor: tokens.colors.canvas },
        headerTintColor: tokens.colors.fgPrimary,
        // iOS: don't show the previous screen's title next to the back arrow.
        // The back arrow alone is cleaner.
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  )
}
```

Notes:
- Inter_600SemiBold matches the typography used in the tabs header (consistency).
- `tokens.colors.canvas` = `#FAF9F5` — same warm cream as the screen background, so the header blends in cleanly (no harsh edge).
- `tokens.colors.fgPrimary` = `#2A2622` for the title text + back-arrow chevron.
- We do NOT need a `<Stack.Screen name="[id]" ... />` declaration here — Expo Router auto-generates the screen entry. The screen file sets its own title dynamically.
  </action>
  <verify>
    <automated>test -d "app/(admin)/departments" && test -f "app/(admin)/departments/_layout.tsx" && grep -q "Stack" "app/(admin)/departments/_layout.tsx" && grep -q "headerShown: true" "app/(admin)/departments/_layout.tsx" && grep -q "headerBackButtonDisplayMode: 'minimal'" "app/(admin)/departments/_layout.tsx" && grep -q "tokens.colors.canvas" "app/(admin)/departments/_layout.tsx" && npx tsc --noEmit 2>&1 | grep -E "departments/_layout\.tsx.*error TS" | grep -v "^$" ; test "${PIPESTATUS[7]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - Directory `app/(admin)/departments/` exists
    - File `app/(admin)/departments/_layout.tsx` exists
    - Default-exports a function that returns `<Stack ... />`
    - Sets `headerShown: true`, `headerBackButtonDisplayMode: 'minimal'`, `headerStyle: { backgroundColor: tokens.colors.canvas }`
    - `npx tsc --noEmit` produces NO errors mentioning departments/_layout.tsx
  </acceptance_criteria>
  <done>Departments stack layout is in place, with cream-canvas headers and consistent typography.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create app/(admin)/departments/[id].tsx (department detail screen)</name>
  <files>app/(admin)/departments/[id].tsx</files>
  <read_first>
    - hooks/admin/use-department-detail.ts (Plan 04-02 — confirm hook signature: useAdminDepartmentDetail(id: string | undefined))
    - components/ui/list-row.tsx (note: leftAvatarUrl falls back gracefully when undefined; we pass undefined when avatar_url is null)
    - components/ui/skeleton.tsx (confirm SkeletonListRow is exported)
    - app/(admin)/(tabs)/index.tsx (the dashboard you just built — same 4-state pattern; mirror the structure)
  </read_first>
  <action>
Write `app/(admin)/departments/[id].tsx` with EXACTLY this content:

```tsx
import { ScrollView, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Users } from 'lucide-react-native'
import {
  EmptyState,
  ErrorView,
  ListRow,
  SkeletonHeading,
  SkeletonListRow,
  SkeletonText,
} from '@/components/ui'
import { useAdminDepartmentDetail } from '@/hooks/admin'

/**
 * Admin → Department detail.
 *
 * Route: /(admin)/departments/[id]
 *
 * Shows the department name in the Stack header (set dynamically once the
 * useQuery resolves) and lists all professors assigned to this department
 * as tappable ListRows that drill into /(admin)/professors/[id].
 *
 * 4-state contract:
 *   - Pending  -> Skeleton heading + 3 SkeletonListRows
 *   - Error    -> ErrorView with onRetry
 *   - Empty    -> EmptyState ("No professors in this department")
 *   - Success  -> Department description (if any) + ListRow per professor
 */
export default function DepartmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data, isPending, error, refetch } = useAdminDepartmentDetail(id)

  // Stack header title — dynamic. While loading shows generic "Department".
  // Once data resolves, swaps to the actual department name.
  const headerTitle = data?.department.name ?? 'Department'

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView className="flex-1 bg-canvas">
        {error ? (
          <ErrorView
            title="Couldn't load department"
            description="Something went wrong fetching the department details."
            onRetry={() => {
              refetch()
            }}
            technical={error.message}
          />
        ) : isPending || !data ? (
          // Pending: heading skeleton + a few row skeletons
          <View>
            <View className="px-4 pt-4 pb-2">
              <SkeletonHeading />
              <View className="mt-3">
                <SkeletonText lines={2} />
              </View>
            </View>
            <View className="mt-4">
              <SkeletonListRow />
              <SkeletonListRow />
              <SkeletonListRow />
            </View>
          </View>
        ) : (
          <View>
            {/* Optional description block */}
            {data.department.description ? (
              <View className="px-4 pt-4 pb-2">
                <Text className="text-base font-sans text-fg-muted">
                  {data.department.description}
                </Text>
              </View>
            ) : null}

            {/* Section heading */}
            <View className="px-4 pt-4 pb-2">
              <Text className="text-xl font-sans-semibold text-fg-primary">
                Professors
              </Text>
            </View>

            {/* Professors list OR empty state */}
            {data.professors.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No professors yet"
                description="No professors have been assigned to this department."
              />
            ) : (
              <View>
                {data.professors.map((prof) => (
                  <ListRow
                    key={prof.id}
                    title={prof.display_name ?? 'Unnamed Professor'}
                    subtitle={prof.bio ?? undefined}
                    leftAvatarUrl={prof.avatar_url ?? undefined}
                    onPress={() => {
                      router.push(`/(admin)/professors/${prof.id}` as never)
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View className="h-12" />
      </ScrollView>
    </>
  )
}
```

Notes:
- The `<Stack.Screen options={{ title }}>` pattern is how Expo Router lets a child screen set its own header. We set it ABOVE the ScrollView so it applies regardless of which 4-state branch renders.
- The pending header title is "Department" (a sensible fallback). Once data resolves it swaps to the actual name without any flash because the hook has a fast staleTime.
- `prof.display_name ?? 'Unnamed Professor'` — defensive against null display names.
- `prof.bio ?? undefined` — ListRow's subtitle prop accepts `string | undefined`; passing null would type-error.
- `prof.avatar_url ?? undefined` — same reasoning. ListRow's leftAvatarUrl is optional; if omitted, no left visual is rendered.
- We push to `/(admin)/professors/${prof.id}` — that route is created in Task 3-4 below.
- The bottom `h-12` spacer matches the dashboard's pattern.
  </action>
  <verify>
    <automated>test -f "app/(admin)/departments/[id].tsx" && grep -q "useAdminDepartmentDetail" "app/(admin)/departments/[id].tsx" && grep -q "useLocalSearchParams" "app/(admin)/departments/[id].tsx" && grep -q "Stack.Screen" "app/(admin)/departments/[id].tsx" && grep -q "options={{ title: headerTitle }}" "app/(admin)/departments/[id].tsx" && grep -q "router.push" "app/(admin)/departments/[id].tsx" && grep -q "/(admin)/professors/" "app/(admin)/departments/[id].tsx" && grep -q "ErrorView" "app/(admin)/departments/[id].tsx" && grep -q "EmptyState" "app/(admin)/departments/[id].tsx" && grep -q "SkeletonListRow" "app/(admin)/departments/[id].tsx" && grep -q "leftAvatarUrl" "app/(admin)/departments/[id].tsx" && npx tsc --noEmit 2>&1 | grep -E "departments/\[id\]\.tsx.*error TS" | grep -v "^$" ; test "${PIPESTATUS[12]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - File `app/(admin)/departments/[id].tsx` exists
    - Imports `useAdminDepartmentDetail` from `@/hooks/admin`
    - Reads id via `useLocalSearchParams<{ id: string }>()` and passes to the hook
    - Renders `<Stack.Screen options={{ title: ... }}>` with the department name (or 'Department' fallback)
    - Renders all 4 states: Skeleton (pending), ErrorView (error), EmptyState (no professors), ListRows (success)
    - Each professor ListRow uses `display_name`, optional `bio` subtitle, optional `leftAvatarUrl`
    - Tapping a row routes to `/(admin)/professors/${prof.id}`
    - Wraps content in `<ScrollView className="flex-1 bg-canvas">`
    - `npx tsc --noEmit` produces NO errors mentioning departments/[id].tsx
  </acceptance_criteria>
  <done>Department detail renders department name in header + professors list with full 4-state coverage; tapping a professor navigates.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Create app/(admin)/professors/_layout.tsx (Stack layout for professor subtree)</name>
  <files>app/(admin)/professors/_layout.tsx</files>
  <read_first>
    - app/(admin)/departments/_layout.tsx (just written — mirror this pattern exactly; the only differences are filename and folder)
    - theme/tokens.ts (header colors)
  </read_first>
  <action>
Create the directory and file:
```bash
mkdir -p "app/(admin)/professors"
```

Then write `app/(admin)/professors/_layout.tsx` with EXACTLY this content:

```tsx
import { Stack } from 'expo-router'
import { tokens } from '@/theme/tokens'

/**
 * Stack layout for /(admin)/professors/* routes.
 *
 * Mirrors app/(admin)/departments/_layout.tsx — same header treatment so the
 * cream canvas + Inter SemiBold title + hidden back-button-text styling is
 * consistent across the admin drill-down.
 *
 * Header title is set dynamically inside [id].tsx via <Stack.Screen options>.
 */
export default function ProfessorsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerStyle: { backgroundColor: tokens.colors.canvas },
        headerTintColor: tokens.colors.fgPrimary,
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  )
}
```

This is a near-clone of departments/_layout.tsx — that's intentional. Symmetry between the two stacks keeps the navigation experience consistent.
  </action>
  <verify>
    <automated>test -d "app/(admin)/professors" && test -f "app/(admin)/professors/_layout.tsx" && grep -q "Stack" "app/(admin)/professors/_layout.tsx" && grep -q "headerShown: true" "app/(admin)/professors/_layout.tsx" && grep -q "headerBackButtonDisplayMode: 'minimal'" "app/(admin)/professors/_layout.tsx" && grep -q "tokens.colors.canvas" "app/(admin)/professors/_layout.tsx" && npx tsc --noEmit 2>&1 | grep -E "professors/_layout\.tsx.*error TS" | grep -v "^$" ; test "${PIPESTATUS[7]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - Directory `app/(admin)/professors/` exists
    - File `app/(admin)/professors/_layout.tsx` exists
    - Default-exports a function returning `<Stack ... />`
    - Same header styling as departments/_layout.tsx (canvas bg, fgPrimary tint, no back title)
    - `npx tsc --noEmit` produces NO errors mentioning professors/_layout.tsx
  </acceptance_criteria>
  <done>Professors stack layout is in place, mirrors the departments layout for visual consistency.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Create app/(admin)/professors/[id].tsx (professor detail screen)</name>
  <files>app/(admin)/professors/[id].tsx</files>
  <read_first>
    - hooks/admin/use-professor-detail.ts (Plan 04-02 — confirm signature: useAdminProfessorDetail(id: string | undefined))
    - app/(admin)/departments/[id].tsx (just written — same 4-state pattern; mirror the structure)
    - components/ui/card.tsx (for the profile Card layout)
    - components/ui/list-row.tsx (for the courses ListRow)
  </read_first>
  <action>
Write `app/(admin)/professors/[id].tsx` with EXACTLY this content:

```tsx
import { Image, ScrollView, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { BookOpen, GraduationCap } from 'lucide-react-native'
import {
  Card,
  EmptyState,
  ErrorView,
  ListRow,
  SkeletonCard,
  SkeletonListRow,
} from '@/components/ui'
import { useAdminProfessorDetail } from '@/hooks/admin'

/**
 * Admin → Department → Professor detail.
 *
 * Route: /(admin)/professors/[id]
 *
 * Shows the professor's profile (display_name, bio, avatar) in a Card and
 * a "Courses" section listing all courses they teach.
 *
 * Stack header title is the professor's display_name (dynamic, set after
 * the query resolves). Back button returns to the department detail screen.
 *
 * 4-state contract:
 *   - Pending  -> SkeletonCard for the profile + 2 SkeletonListRows for courses
 *   - Error    -> ErrorView with onRetry
 *   - Empty    -> Profile renders normally; courses section shows EmptyState if courses[] is empty
 *   - Success  -> Profile Card + ListRow per course
 *
 * Note: this screen does NOT navigate further. ADMIN-03 stops here — admin
 * sees the courses, but tapping a course is not in scope for v1.
 */
export default function ProfessorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isPending, error, refetch } = useAdminProfessorDetail(id)

  const headerTitle = data?.professor.display_name ?? 'Professor'

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView className="flex-1 bg-canvas">
        {error ? (
          <ErrorView
            title="Couldn't load professor"
            description="Something went wrong fetching the professor details."
            onRetry={() => {
              refetch()
            }}
            technical={error.message}
          />
        ) : isPending || !data ? (
          <View>
            {/* Profile skeleton */}
            <View className="px-4 pt-4">
              <SkeletonCard />
            </View>
            {/* Courses skeleton */}
            <View className="mt-4">
              <SkeletonListRow />
              <SkeletonListRow />
            </View>
          </View>
        ) : (
          <View>
            {/* ─── Profile Card ─────────────────────── */}
            <View className="px-4 pt-4">
              <Card variant="elevated" padding="lg">
                <View className="flex-row items-center">
                  {data.professor.avatar_url ? (
                    <Image
                      source={{ uri: data.professor.avatar_url }}
                      className="w-16 h-16 rounded-full bg-border-subtle"
                      accessibilityLabel="Avatar"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-border-subtle items-center justify-center">
                      <GraduationCap color="#7A736A" size={28} />
                    </View>
                  )}
                  <View className="flex-1 ml-4">
                    <Text className="text-lg font-sans-semibold text-fg-primary">
                      {data.professor.display_name ?? 'Unnamed Professor'}
                    </Text>
                    <Text className="text-sm font-sans text-fg-muted mt-0.5">
                      Professor
                    </Text>
                  </View>
                </View>

                {data.professor.bio ? (
                  <Text className="text-base font-sans text-fg-primary mt-4 leading-6">
                    {data.professor.bio}
                  </Text>
                ) : null}
              </Card>
            </View>

            {/* ─── Courses section ─────────────────── */}
            <View className="px-4 pt-6 pb-2">
              <Text className="text-xl font-sans-semibold text-fg-primary">
                Courses
              </Text>
            </View>

            {data.courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses yet"
                description="This professor isn't teaching any courses right now."
              />
            ) : (
              <View>
                {data.courses.map((course) => (
                  <ListRow
                    key={course.id}
                    title={course.title}
                    subtitle={course.code ?? course.description ?? undefined}
                    leftIcon={BookOpen}
                    showChevron={false}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View className="h-12" />
      </ScrollView>
    </>
  )
}
```

Notes:
- `showChevron={false}` on course rows because there's no further navigation. The chevron defaults to true when `onPress` is set; we want neither.
- Avatar fallback: when `avatar_url` is null, render a gray circle with the GraduationCap icon centered — same dimensions (w-16 h-16) so layout doesn't shift.
- "Professor" label under the name is hardcoded — there's only one role on this screen, so it's always "Professor".
- Course subtitle: prefer `code` (short, clear) and fall back to `description` (longer prose). If both null, no subtitle.
- The `BookOpen` icon represents both the section header context AND the course rows — visual coherence.
- We do NOT pass `onPress` to course ListRow → no chevron, no tap → admin can SEE courses but not drill in. This matches ADMIN-03 ("the professor's profile showing their assigned courses") — viewing is the requirement, not interacting.
  </action>
  <verify>
    <automated>test -f "app/(admin)/professors/[id].tsx" && grep -q "useAdminProfessorDetail" "app/(admin)/professors/[id].tsx" && grep -q "useLocalSearchParams" "app/(admin)/professors/[id].tsx" && grep -q "Stack.Screen" "app/(admin)/professors/[id].tsx" && grep -q "options={{ title: headerTitle }}" "app/(admin)/professors/[id].tsx" && grep -q "ErrorView" "app/(admin)/professors/[id].tsx" && grep -q "EmptyState" "app/(admin)/professors/[id].tsx" && grep -q "SkeletonCard" "app/(admin)/professors/[id].tsx" && grep -q "SkeletonListRow" "app/(admin)/professors/[id].tsx" && grep -q "data.professor.bio" "app/(admin)/professors/[id].tsx" && grep -q "showChevron={false}" "app/(admin)/professors/[id].tsx" && grep -q "data.courses.map" "app/(admin)/professors/[id].tsx" && npx tsc --noEmit 2>&1 | grep -E "professors/\[id\]\.tsx.*error TS" | grep -v "^$" ; test "${PIPESTATUS[13]:-1}" = "1"</automated>
  </verify>
  <acceptance_criteria>
    - File `app/(admin)/professors/[id].tsx` exists
    - Imports `useAdminProfessorDetail` from `@/hooks/admin`
    - Reads id via `useLocalSearchParams<{ id: string }>()` and passes to the hook
    - Renders `<Stack.Screen options={{ title: ... }}>` with display_name (or 'Professor' fallback)
    - Renders profile Card containing avatar (or fallback icon), display_name, "Professor" label, optional bio
    - Renders "Courses" section heading
    - Renders course ListRows with `BookOpen` icon, title, optional subtitle (code or description), and `showChevron={false}`
    - Renders all 4 states: SkeletonCard + SkeletonListRow (pending), ErrorView (error), EmptyState (no courses), Card + ListRows (success)
    - Wraps content in `<ScrollView className="flex-1 bg-canvas">`
    - `npx tsc --noEmit` produces NO errors mentioning professors/[id].tsx
  </acceptance_criteria>
  <done>Professor detail renders the profile + courses; back-stack returns to the department detail screen; admin can see all 4 success criteria 4 connections.</done>
</task>

</tasks>

<verification>
End-to-end check that this plan is complete:

```bash
# 1. Files exist
test -d "app/(admin)/departments"
test -f "app/(admin)/departments/_layout.tsx"
test -f "app/(admin)/departments/[id].tsx"
test -d "app/(admin)/professors"
test -f "app/(admin)/professors/_layout.tsx"
test -f "app/(admin)/professors/[id].tsx"

# 2. Each detail screen consumes the right hook
grep -q "useAdminDepartmentDetail" "app/(admin)/departments/[id].tsx"
grep -q "useAdminProfessorDetail"  "app/(admin)/professors/[id].tsx"

# 3. Each detail screen sets a dynamic Stack header
grep -q "Stack.Screen" "app/(admin)/departments/[id].tsx"
grep -q "Stack.Screen" "app/(admin)/professors/[id].tsx"

# 4. Department detail navigates to professor detail
grep -q "router.push" "app/(admin)/departments/[id].tsx"
grep -q "/(admin)/professors/" "app/(admin)/departments/[id].tsx"

# 5. Professor detail has no further navigation (admin-only viewing)
grep -q "showChevron={false}" "app/(admin)/professors/[id].tsx"

# 6. 4-state coverage on both screens
for f in "app/(admin)/departments/[id].tsx" "app/(admin)/professors/[id].tsx"; do
  grep -q "Skeleton" "$f"
  grep -q "ErrorView" "$f"
  grep -q "EmptyState" "$f"
done

# 7. Project type-checks
npx tsc --noEmit  # exit code: 0
```

Manual smoke verification (after Plan 04-03 dashboard is also done):
1. `npx expo start` → launch on simulator
2. Sign in as `admin@demo.scholera.test` / `demo-password-1234`
3. From dashboard, tap a department row → opens department detail with the department name in the header + back button
4. Department detail shows all professors as ListRows (with avatars when available) → tap one
5. Professor detail opens, header shows the professor's name, profile Card displays correctly, courses list below
6. Tap back button → returns to department detail. Tap back again → returns to dashboard. Back-stack is logical.
</verification>

<success_criteria>
- [ ] departments/_layout.tsx exists and renders Stack with custom header style
- [ ] departments/[id].tsx renders department name in Stack header and lists professors
- [ ] professors/_layout.tsx exists and renders Stack with matching header style
- [ ] professors/[id].tsx renders professor profile Card + courses list
- [ ] Each detail screen handles all 4 states (Pending/Error/Empty/Success)
- [ ] Department detail's professor rows tap → /(admin)/professors/[id]
- [ ] Professor detail's course rows do NOT navigate (showChevron=false, no onPress) — admin viewing only per ADMIN-03
- [ ] Back-stack works automatically via Expo Router defaults: dashboard ← department detail ← professor detail
- [ ] Both screens use the existing primitives (Card, ListRow, EmptyState, ErrorView, Skeleton variants)
- [ ] `npx tsc --noEmit` exits 0
- [ ] ADMIN-02 (department list with detail) + ADMIN-03 (professor detail with courses) both visible on screen end-to-end
</success_criteria>

<output>
After completion, create `.planning/phases/04-admin-experience/04-04-SUMMARY.md` documenting:
- Confirmation that the back-stack works (admin → dashboard → dept detail → prof detail → back → back → dashboard)
- Confirmation that the screens render correctly with seeded data — paste the actual department + professor names you saw
- Any deviations from the spec
- `npx tsc --noEmit` exit code
- Phase 4 should now be complete; suggest running `/gsd:transition` next to mark Phase 4 done in ROADMAP.md
</output>
