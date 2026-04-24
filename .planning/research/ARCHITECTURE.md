# Architecture Research — Scholera Mobile

**Domain:** Role-aware mobile LMS companion (Expo + React Native)
**Researched:** 2026-04-23
**Confidence:** HIGH (Expo Router docs verified, TanStack Query pattern verified, Supabase type-gen verified)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Expo Router File-Based Routing                        │
│                                                                              │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │  (auth)/    │  │   (admin)/       │  │  (professor)/  │  (student)/  │   │
│  │  sign-in    │  │   tabs + stack   │  │  tabs + stack  │  tabs+stack  │   │
│  └──────┬──────┘  └────────┬─────────┘  └────────────────┴──────────────┘  │
│         │                  │                                                 │
│         └──────────────────┼──── Stack.Protected (auth guard) ──────────────┘
│                            │                                                 │
├────────────────────────────┼─────────────────────────────────────────────────┤
│                    Context Layer                                              │
│  ┌────────────────┐  ┌──────────────────┐  ┌───────────────────────────┐   │
│  │  AuthContext   │  │  RoleThemeCtx    │  │  QueryClient (TanStack)   │   │
│  │  session/role  │  │  accent per role │  │  server state cache       │   │
│  └────────────────┘  └──────────────────┘  └───────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                    Data Layer                                                 │
│  ┌──────────────────────────────────┐  ┌────────────────────────────────┐   │
│  │  lib/supabase.ts (singleton)     │  │  lib/queries/ + mutations/     │   │
│  │  typed with Database types       │  │  pure fns: (client, args)=>q   │   │
│  └──────────────────────────────────┘  └────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  hooks/ (useCoursesForProfessor, useRoadmap, etc.)                   │   │
│  │  TanStack Query wrappers — own the queryKey, call query fns          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                    Component Layer                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  components/ui/  — Button, Card, Chip, ListRow, Skeleton, EmptyState │    │
│  │  (role-accent injected via useRoleTheme(), never via props)          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Directory Structure

This is the concrete file tree for the app. Every path is a real file/folder.

```
scholera-mobile/
├── app/                              # Expo Router root — ONLY routing files here
│   ├── _layout.tsx                   # Root layout: QueryClient + AuthProvider + RoleThemeProvider
│   ├── index.tsx                     # Splash redirect — waits for session, routes to role or auth
│   │
│   ├── (auth)/                       # Public route group — accessible without session
│   │   ├── _layout.tsx               # Stack layout, no session guard
│   │   └── sign-in.tsx               # Email+password login screen
│   │
│   ├── (admin)/                      # Admin role group — guard: role === 'admin'
│   │   ├── _layout.tsx               # Stack.Protected guard + RoleThemeProvider accent=steel
│   │   └── (tabs)/
│   │       ├── _layout.tsx           # Tabs layout: Dashboard | Departments | Profile
│   │       ├── index.tsx             # Admin dashboard (stats)
│   │       ├── departments.tsx       # Departments list
│   │       └── profile.tsx           # Shared profile screen (admin tint)
│   │   └── departments/
│   │       ├── [departmentId].tsx    # Department detail + professors list
│   │       └── professors/
│   │           └── [professorId].tsx # Professor profile + assigned courses
│   │
│   ├── (professor)/                  # Professor role group — guard: role === 'professor'
│   │   ├── _layout.tsx               # Stack.Protected guard + RoleThemeProvider accent=clay
│   │   └── (tabs)/
│   │       ├── _layout.tsx           # Tabs layout: Courses | Profile
│   │       ├── index.tsx             # My Courses list
│   │       └── profile.tsx           # Shared profile screen (prof tint)
│   │   └── courses/
│   │       ├── [courseId]/
│   │       │   ├── _layout.tsx       # Course tabs: Announcements | Modules | Roadmap
│   │       │   ├── announcements.tsx # Announcements tab
│   │       │   ├── modules.tsx       # Modules + items tab
│   │       │   └── roadmap.tsx       # Roadmap + topics tab
│   │       └── [courseId]/modules/
│   │           └── [moduleId]/
│   │               └── add-item.tsx  # Add item modal (link / note / file)
│   │
│   ├── (student)/                    # Student role group — guard: role === 'student'
│   │   ├── _layout.tsx               # Stack.Protected guard + RoleThemeProvider accent=sage
│   │   └── (tabs)/
│   │       ├── _layout.tsx           # Tabs layout: Courses | Profile
│   │       ├── index.tsx             # My Courses list
│   │       └── profile.tsx           # Shared profile screen (student tint)
│   │   └── courses/
│   │       └── [courseId]/
│   │           ├── _layout.tsx       # Course tabs: Announcements | Modules | Roadmap
│   │           ├── announcements.tsx # Read-only announcements list
│   │           ├── modules.tsx       # Read-only modules + items
│   │           └── roadmap.tsx       # Roadmap with professor coverage + student own progress
│   │   └── announcements/
│   │       └── [announcementId].tsx  # Full announcement view (deep link target)
│
├── components/
│   ├── ui/                           # Role-agnostic primitives
│   │   ├── Button.tsx                # primary/secondary/ghost, uses useRoleTheme() for accent
│   │   ├── Card.tsx                  # Surface with radius+shadow tokens
│   │   ├── Chip.tsx                  # Status tags, topic tags, role badges
│   │   ├── ListRow.tsx               # icon + title + subtitle + trailing — universal list item
│   │   ├── EmptyState.tsx            # icon + heading + subtext
│   │   ├── Skeleton.tsx              # animated shimmer block
│   │   └── ErrorView.tsx             # friendly error + retry CTA
│   │
│   ├── screens/                      # Screen-level composition components
│   │   ├── ScreenHeader.tsx          # back arrow + title + optional action
│   │   ├── ScreenContainer.tsx       # scroll-safe padded wrapper
│   │   └── BottomSheet.tsx           # sheet wrapper for create flows
│   │
│   └── domain/                       # Feature-specific components (shared across roles)
│       ├── RoadmapItem.tsx           # Module item row with topics + status chip
│       ├── AnnouncementCard.tsx      # Card for announcement preview
│       ├── ModuleSection.tsx         # Collapsible module header + items list
│       ├── TopicChips.tsx            # Horizontal scroll row of topic chips
│       └── AvatarUpload.tsx          # Avatar picker + upload trigger
│
├── hooks/                            # TanStack Query hooks — public API for screens
│   ├── auth/
│   │   └── useSession.ts             # reads AuthContext, exposes { session, role, signOut }
│   ├── admin/
│   │   ├── useDashboardStats.ts
│   │   ├── useDepartments.ts
│   │   └── useProfessorDetail.ts
│   ├── professor/
│   │   ├── useCoursesForProfessor.ts
│   │   ├── useModulesForCourse.ts
│   │   ├── useCreateModule.ts        # mutation hook
│   │   ├── useAddModuleItem.ts       # mutation hook (includes file upload)
│   │   ├── useUpdateRoadmapStatus.ts # mutation with optimistic update
│   │   └── useCreateAnnouncement.ts  # mutation hook
│   ├── student/
│   │   ├── useEnrolledCourses.ts
│   │   ├── useCourseAnnouncements.ts
│   │   ├── useCourseModules.ts
│   │   ├── useRoadmapForCourse.ts
│   │   └── useUpdateStudentProgress.ts # mutation with optimistic update
│   └── shared/
│       ├── useProfile.ts
│       └── useUpdateProfile.ts       # mutation with avatar upload
│
├── lib/
│   ├── supabase.ts                   # Supabase client singleton (typed)
│   ├── queryKeys.ts                  # Centralized TanStack Query key factory
│   ├── errors.ts                     # Error normalization: SupabaseError → friendly string
│   └── upload.ts                     # File upload helper: documentPicker → storage → publicUrl
│
├── queries/                          # Pure query/mutation functions — no hooks, no React
│   ├── admin.ts                      # getStats, getDepartments, getProfessor
│   ├── courses.ts                    # getCourses, getCourseById, createAnnouncement
│   ├── modules.ts                    # getModules, createModule, addItem
│   ├── roadmap.ts                    # getRoadmap, updateProfessorStatus, updateStudentProgress
│   └── profile.ts                    # getProfile, updateProfile
│
├── theme/
│   ├── tokens.ts                     # Colors, spacing, radii, type scale — source of truth
│   ├── tailwind-preset.js            # Exports tokens into Tailwind config extend
│   └── roles.ts                      # Maps role → accent token name + NativeWind vars()
│
├── providers/
│   ├── AuthProvider.tsx              # Session init, role detection, context value
│   └── RoleThemeProvider.tsx         # Wraps role subtree, injects NativeWind CSS vars
│
├── types/
│   ├── database.types.ts             # Generated: supabase gen types typescript
│   └── app.types.ts                  # App-level types: Role, RoadmapStatus, ModuleItemType
│
└── tailwind.config.js                # Imports theme/tailwind-preset, defines CSS vars
```

**Structure rationale:**

- `app/` contains ONLY Expo Router routing files — no business logic, no hooks, no raw Supabase calls. Screens import from `hooks/` only.
- `queries/` holds pure functions that take a typed Supabase client and return a query builder. They are never imported by screens directly — only by hooks.
- `hooks/` is the public data API for screens. Each hook owns its queryKey and delegates to a query function.
- `providers/` separates the two context trees (auth lifecycle, theme injection) so neither depends on the other.
- `theme/` is the single source of truth. `tokens.ts` is consumed by both `tailwind-preset.js` and `RoleThemeProvider`.

---

## 2. Role-Routing Architecture

### Auth Provider Pattern

`AuthProvider` in `providers/AuthProvider.tsx` runs at the root layout. It:

1. Calls `supabase.auth.getSession()` on mount to restore a persisted session.
2. Subscribes to `supabase.auth.onAuthStateChange()` for sign-in/sign-out/token-refresh events.
3. After a session is confirmed, fetches the user's `profiles` row to read `role`.
4. Exposes `{ session, role, isLoading, signOut }` via React Context.

The root `app/_layout.tsx` wraps the entire tree:

```tsx
// app/_layout.tsx
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Role Detection Sequence

```
App cold start
  → AuthProvider mounts, isLoading = true
  → SplashScreen.preventAutoHideAsync() (keep splash visible)
  → supabase.auth.getSession() resolves
      ↳ No session → isLoading = false, session = null
      ↳ Session found → fetch profiles row → set role → isLoading = false
  → SplashScreen.hideAsync()
  → RootNavigator re-renders with session + role known
```

### Stack.Protected Guard per Role

`app/(admin)/_layout.tsx`, `app/(professor)/_layout.tsx`, and `app/(student)/_layout.tsx` each contain the same guard pattern, specialized for their role:

```tsx
// app/(professor)/_layout.tsx
export default function ProfessorLayout() {
  const { session, role, isLoading } = useSession();

  if (isLoading) return null; // splash is still visible

  return (
    <Stack>
      <Stack.Protected guard={!!session && role === 'professor'}>
        <RoleThemeProvider role="professor">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="courses/[courseId]" />
          {/* ...other professor screens */}
        </RoleThemeProvider>
      </Stack.Protected>
    </Stack>
  );
}
```

The `Stack.Protected guard={false}` condition causes Expo Router to redirect to the root index, which then sends the user to sign-in if no session exists, or to their correct role subtree if session+role don't match this group.

### RoleThemeProvider — Accent Injection

```tsx
// providers/RoleThemeProvider.tsx
import { vars } from 'nativewind';
import { roleAccentVars } from '../theme/roles';

export function RoleThemeProvider({ role, children }) {
  return (
    <View style={roleAccentVars[role]}>
      {children}
    </View>
  );
}

// theme/roles.ts
import { vars } from 'nativewind';

export const roleAccentVars = {
  admin:     vars({ '--color-accent': '100 116 139' }),  // steel slate
  professor: vars({ '--color-accent': '204 120 92'  }),  // clay terracotta
  student:   vars({ '--color-accent': '107 142 107' }),  // muted sage
};
```

Components use `className="bg-accent"` — the CSS variable resolves to the role-injected value. Zero prop drilling. Role-specific accent is guaranteed for anything inside the role subtree.

---

## 3. Data Layer Architecture

### Supabase Client Singleton

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '../types/database.types';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // required for React Native
    },
  },
);
```

Single export. Imported by `providers/AuthProvider.tsx`, all query functions in `queries/`, and `lib/upload.ts`. Never instantiated more than once.

### Query Key Factory

All TanStack Query keys live in one file to prevent collisions:

```typescript
// lib/queryKeys.ts
export const qk = {
  profile:       (userId: string)         => ['profile', userId],
  adminStats:    ()                        => ['admin', 'stats'],
  departments:   ()                        => ['admin', 'departments'],
  professor:     (id: string)              => ['admin', 'professor', id],
  myCourses:     (userId: string)          => ['courses', userId],
  announcements: (courseId: string)        => ['announcements', courseId],
  modules:       (courseId: string)        => ['modules', courseId],
  roadmap:       (courseId: string)        => ['roadmap', courseId],
  topics:        (roadmapItemId: string)   => ['topics', roadmapItemId],
} as const;
```

### Typed Query Hook Pattern

Two-layer separation: pure query function in `queries/`, hook wrapper in `hooks/`.

```typescript
// queries/courses.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

type Client = SupabaseClient<Database>;

export function getCoursesForProfessor(client: Client, professorId: string) {
  return client
    .from('course_sections')
    .select('id, title, course:courses(title, code), enrollments(count)')
    .eq('professor_id', professorId)
    .throwOnError();  // converts Supabase errors to exceptions TanStack catches
}

// hooks/professor/useCoursesForProfessor.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { qk } from '../../lib/queryKeys';
import { getCoursesForProfessor } from '../../queries/courses';
import { useSession } from '../auth/useSession';

export function useCoursesForProfessor() {
  const { session } = useSession();
  const userId = session?.user.id ?? '';

  return useQuery({
    queryKey: qk.myCourses(userId),
    queryFn: async () => {
      const { data } = await getCoursesForProfessor(supabase, userId);
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}
```

### Mutation Hook with Optimistic Update

The roadmap status toggle is the most latency-sensitive mutation — optimistic update required:

```typescript
// hooks/professor/useUpdateRoadmapStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { qk } from '../../lib/queryKeys';

type Status = 'not_started' | 'in_progress' | 'complete';

export function useUpdateRoadmapStatus(courseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: Status }) =>
      supabase
        .from('roadmap_items')
        .update({ professor_status: status })
        .eq('id', itemId)
        .throwOnError(),

    onMutate: async ({ itemId, status }) => {
      await qc.cancelQueries({ queryKey: qk.roadmap(courseId) });
      const snapshot = qc.getQueryData(qk.roadmap(courseId));

      qc.setQueryData(qk.roadmap(courseId), (old: any) =>
        old?.map((item: any) =>
          item.id === itemId ? { ...item, professor_status: status } : item
        )
      );
      return { snapshot };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(qk.roadmap(courseId), ctx.snapshot);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.roadmap(courseId) });
    },
  });
}
```

The same pattern applies to `useUpdateStudentProgress` (same table, different column: `student_status`).

### Error Normalization

All Supabase errors funnel through one function before reaching the UI:

```typescript
// lib/errors.ts
export function normalizeSupabaseError(err: unknown): string {
  if (err instanceof Error) {
    // Supabase throws PostgrestError which extends Error
    const msg = err.message.toLowerCase();
    if (msg.includes('jwt expired'))      return 'Your session expired. Please sign in again.';
    if (msg.includes('not found'))        return 'That record could not be found.';
    if (msg.includes('violates') || msg.includes('constraint'))
                                          return 'That action conflicts with existing data.';
    if (msg.includes('network'))          return 'Check your internet connection and try again.';
    return 'Something went wrong. Please try again.';
  }
  return 'An unexpected error occurred.';
}
```

In hooks, the `error` returned by `useQuery`/`useMutation` is passed through `normalizeSupabaseError` before rendering in `ErrorView`.

### Realtime Subscription Pattern (stretch goal hook)

If real-time announcements are added, subscriptions live in a dedicated hook, not inside a screen component:

```typescript
// hooks/shared/useRealtimeAnnouncements.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { qk } from '../../lib/queryKeys';

export function useRealtimeAnnouncements(courseId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!courseId) return;

    const channel = supabase
      .channel(`announcements:${courseId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements',
          filter: `course_section_id=eq.${courseId}` },
        () => qc.invalidateQueries({ queryKey: qk.announcements(courseId) })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [courseId, qc]);
}
```

The handler only invalidates the query — it does not merge payload manually. TanStack Query refetches cleanly. The `return () => removeChannel(channel)` prevents subscription leaks on unmount.

---

## 4. Component Architecture

### Primitive Component Contracts

All primitives live in `components/ui/`. Their prop shapes are fixed here to prevent drift:

| Component | Required Props | Optional Props | Accent Source |
|-----------|---------------|----------------|---------------|
| `Button` | `onPress`, `label` | `variant: 'primary' \| 'secondary' \| 'ghost'`, `loading`, `disabled` | `useRoleTheme()` — primary uses accent |
| `Card` | `children` | `className`, `onPress` | CSS var `bg/surface` — neutral |
| `Chip` | `label` | `variant: 'status' \| 'topic' \| 'role'`, `status: Status` | Status chips use accent; topic chips neutral |
| `ListRow` | `title` | `icon`, `subtitle`, `trailing`, `onPress` | Neutral — accent only via Chip inside |
| `EmptyState` | `heading` | `subtext`, `icon`, `action` (ButtonProps) | Neutral |
| `Skeleton` | `className` | — | Neutral shimmer |
| `ErrorView` | `message` | `onRetry` | Neutral |

The `useRoleTheme()` hook reads from `RoleThemeContext`:

```typescript
// components/ui/Button.tsx — accent without prop drilling
import { useRoleTheme } from '../../hooks/useRoleTheme';

export function Button({ label, variant = 'primary', onPress, loading, disabled }) {
  const { accentClass } = useRoleTheme(); // e.g. "bg-accent" resolves via CSS var

  return (
    <Pressable
      className={cn(
        'rounded-full px-5 py-3',
        variant === 'primary' && accentClass,
        variant === 'secondary' && 'border border-accent',
        variant === 'ghost' && 'bg-transparent',
        disabled && 'opacity-40',
      )}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator /> : <Text>{label}</Text>}
    </Pressable>
  );
}
```

### Screen Composition Convention

Every screen follows: `ScreenContainer` > optional `ScreenHeader` > content > optional `FAB` or `BottomSheet`.

```tsx
// app/(professor)/courses/[courseId]/modules.tsx — typical professor screen
export default function ModulesScreen() {
  const { courseId } = useLocalSearchParams();
  const { data, isLoading, error } = useModulesForCourse(courseId);
  const { mutate: createModule } = useCreateModule(courseId);

  if (isLoading) return <Skeleton />;
  if (error)     return <ErrorView message={normalizeSupabaseError(error)} onRetry={...} />;
  if (!data?.length) return <EmptyState heading="No modules yet" action={{ label: 'Add Module', onPress: ... }} />;

  return (
    <ScreenContainer>
      <FlashList data={data} renderItem={({ item }) => <ModuleSection module={item} />} />
      <FAB onPress={() => router.push('/professor/courses/[courseId]/add-module')} />
    </ScreenContainer>
  );
}
```

**Forbidden pattern:** Screens never call `supabase` directly. Screens never hold local state for server data. Screens never pass role as a prop — the role is available via context if ever needed.

---

## 5. Navigation Architecture

### Stack + Tab Structure per Role

```
(auth)/                  Stack: sign-in (no tabs)
(admin)/(tabs)/          Tabs: [Dashboard, Departments, Profile]
  departments/[id]       Stack push from Departments tab
  departments/professors/[id]  Stack push (second level)
(professor)/(tabs)/      Tabs: [Courses, Profile]
  courses/[id]/(tabs)/   Nested tabs: [Announcements, Modules, Roadmap]
    modules/[modId]/add-item   Modal (sheet) from Modules tab
(student)/(tabs)/        Tabs: [Courses, Profile]
  courses/[id]/(tabs)/   Nested tabs: [Announcements, Modules, Roadmap]
  announcements/[id]     Stack push OR deep link target
```

### Deep Link Handler

Expo Router handles the URI scheme `scholera://` automatically via `app.json`:

```json
{
  "expo": {
    "scheme": "scholera"
  }
}
```

The deep link `scholera://courses/{courseId}/announcements/{announcementId}` maps to the file path `app/(student)/courses/[courseId]/announcements/[announcementId].tsx` under Expo Router's file-based routing.

**The auth-gate + deep link interaction:**

```
User taps push notification → OS opens scholera://courses/abc/announcements/xyz
  → Expo Router resolves to (student)/courses/abc/announcements/xyz
  → Stack.Protected guard in (student)/_layout.tsx evaluates
      ↳ session + role === 'student' → navigates to announcement screen — DONE
      ↳ no session → redirected to (auth)/sign-in
          → sign-in stores returnTo = '/student/courses/abc/announcements/xyz' (query param)
          → after successful login + role confirmed as student
          → router.replace(returnTo) executes
          → user lands on the deep-linked announcement
```

Concrete implementation in sign-in screen:

```tsx
// app/(auth)/sign-in.tsx
const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

async function handleSignIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { ... }
  // AuthProvider detects session change, sets role
  // Root navigator's Stack.Protected guard opens the role subtree
  // Then navigate to stored returnTo if present
  if (returnTo) router.replace(returnTo);
}
```

### Modal vs Push vs Sheet Conventions

| Navigation type | When | Implementation |
|----------------|------|----------------|
| Tab switch | Moving between top-level sections within a role | `<Tabs>` built-in |
| Stack push | Drilling into a detail (department → professor) | `router.push()` |
| Modal (sheet) | Create flows: add module, add item, create announcement | `router.push({ sheet: true })` or `BottomSheet` component |
| Full modal | Profile edit | `presentation: 'modal'` in screen options |
| Replace | Post-login redirect (deep link returnTo, or role routing) | `router.replace()` |

---

## 6. Build Order / Dependency Graph

Build order is chosen so that each stage unblocks downstream work. Parallelism opens up after Stage 3.

```
Stage 0 — Types + DB scaffold           (30 min)
  supabase gen types → types/database.types.ts
  app.types.ts: Role, Status enums
  lib/queryKeys.ts: full key registry

Stage 1 — App scaffold                  (1 hour)
  Expo Router init, NativeWind config, tailwind.config.js
  theme/tokens.ts + theme/roles.ts
  lib/supabase.ts singleton
  lib/errors.ts

Stage 2 — Design foundations            (2 hours) ← CRITICAL PATH
  components/ui: Button, Card, Chip, ListRow
  components/ui: EmptyState, Skeleton, ErrorView
  components/screens: ScreenContainer, ScreenHeader, BottomSheet
  RoleThemeProvider verified with mock role

Stage 3 — Auth + role router            (2 hours) ← CRITICAL PATH
  providers/AuthProvider.tsx
  app/_layout.tsx (QueryClient + AuthProvider)
  app/(auth)/sign-in.tsx
  app/(admin|professor|student)/_layout.tsx guards
  app/index.tsx (splash redirect)
  End state: sign in as any role → routed to correct subtree

  ↓ ALL THREE ROLE EXPERIENCES CAN NOW BUILD IN PARALLEL ↓

Stage 4a — Admin experience             can start after Stage 3
  queries/admin.ts
  hooks/admin/*
  app/(admin)/(tabs)/ — dashboard, departments, profile
  app/(admin)/departments/[id].tsx + professors/[id].tsx

Stage 4b — Professor experience         can start after Stage 3
  queries/courses.ts + queries/modules.ts + queries/roadmap.ts
  hooks/professor/*
  app/(professor)/(tabs)/ + courses/[courseId]/(tabs)/
  add-item modal + file upload (lib/upload.ts + useAddModuleItem)
  useUpdateRoadmapStatus (optimistic)

Stage 4c — Student experience           can start after Stage 3
  queries/roadmap.ts (already exists by 4b but student columns differ)
  hooks/student/*
  app/(student)/(tabs)/ + courses/[courseId]/(tabs)/
  useUpdateStudentProgress (optimistic)

Stage 5 — Shared + deep linking         after Stage 4a + 4b + 4c
  hooks/shared/useProfile + useUpdateProfile
  components/domain/AvatarUpload
  app/(*/profile.tsx — one screen file per role subtree, same component
  Deep link: app/(student)/announcements/[announcementId].tsx
  sign-in.tsx returnTo param handling

Stage 6 — Polish + submission           final
  All empty/loading/error states verified
  Skeleton on every data screen
  Navigation recovery (back buttons, stale sessions)
  README + screenshots + AI_ASSISTANT_USAGE.md
  Demo video recording
```

**Critical path:** Stage 0 → Stage 1 → Stage 2 → Stage 3 → any Stage 4 → Stage 5 → Stage 6.

The design foundations in Stage 2 must complete before feature screens because every screen uses primitives. Stage 3 must complete before any feature work because every feature screen lives inside a protected route group.

---

## 7. File Upload Data Flow

```
Professor taps "Add File"
  ↓
expo-document-picker.getDocumentAsync({ type: ['application/pdf', ...] })
  ↓
user selects file → returns { assets: [{ uri, name, mimeType, size }] }
  ↓
lib/upload.ts: uploadModuleItem(file)
  ├── 1. fetch(file.uri) → response.blob()           (read from device cache)
  ├── 2. supabase.storage.from('module-items')
  │        .upload(`${courseId}/${moduleId}/${fileName}`, blob,
  │                { contentType: file.mimeType, upsert: false })
  ├── 3. on upload success: supabase.storage
  │        .from('module-items').getPublicUrl(data.path)
  │        → returns publicUrl string
  └── 4. return { publicUrl, path }
  ↓
useAddModuleItem mutation:
  ├── calls uploadModuleItem() → gets publicUrl
  └── inserts into module_items: { module_id, title, type: 'file', url: publicUrl, ... }
  ↓
invalidateQueries(qk.modules(courseId)) → modules list refetches
  ↓
UI: new item appears in module list with file type icon
```

**Progress reporting:** `@supabase/supabase-js` v2 storage upload does not expose a progress callback natively. To report upload progress, use a `XMLHttpRequest` directly with the signed upload URL, or display an indeterminate activity indicator while the promise is pending. For a 2-day timeline, indeterminate spinner is the correct call — the upload state is tracked as `isUploading: boolean` in the mutation hook's `isPending` flag from TanStack Query.

---

## 8. Typesafety Strategy

### Type Generation

```bash
# Run once to bootstrap, re-run if schema changes
npx supabase gen types typescript \
  --project-id "$SUPABASE_PROJECT_REF" \
  --schema public \
  > types/database.types.ts
```

Add to `package.json`:
```json
{
  "scripts": {
    "gen:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > types/database.types.ts"
  }
}
```

### Where Generated Types Live

`types/database.types.ts` — generated file, not hand-edited, committed to git so all code has a baseline even without running the CLI.

`types/app.types.ts` — hand-written app types derived from the database types:

```typescript
// types/app.types.ts
import type { Database } from './database.types';

export type Role = 'admin' | 'professor' | 'student';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type CourseSection = Database['public']['Tables']['course_sections']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type ModuleItem = Database['public']['Tables']['module_items']['Row'];
export type RoadmapItem = Database['public']['Tables']['roadmap_items']['Row'];
export type Topic = Database['public']['Tables']['topics']['Row'];

export type ProfessorStatus = 'not_started' | 'in_progress' | 'complete';
export type StudentStatus = 'not_started' | 'in_progress' | 'complete';
export type ModuleItemType = 'link' | 'note' | 'file';
```

### Typed Client Usage

```typescript
// The Database generic flows from lib/supabase.ts through all queries
import { supabase } from '../lib/supabase';

// TypeScript knows the shape of every .from() call
const { data } = await supabase
  .from('module_items')   // autocompletes table names
  .select('id, title, type, url')  // autocompletes column names
  .eq('module_id', moduleId);
// data is typed as Pick<ModuleItem, 'id' | 'title' | 'type' | 'url'>[] | null
```

### Keeping Types Fresh

Strategy: generate once at project start with the full schema. Since the schema is provided (not being actively migrated during the 2-day window), one generation is sufficient. If a schema change is needed, run `npm run gen:types` and TypeScript errors surface immediately at query call sites — no manual hunts.

---

## Key Data Flows

### Auth Flow

```
Cold start
  → AuthProvider: supabase.auth.getSession()
  → { session: null }  → isLoading=false → index.tsx → Redirect to /(auth)/sign-in
  → { session: valid } → fetch profiles row → role = 'professor'
                       → isLoading=false → RootNavigator
                       → Stack.Protected guard for (professor) → true
                       → (professor)/(tabs)/index (My Courses list)
  ↓
User signs in from sign-in screen
  → supabase.auth.signInWithPassword({ email, password })
  → onAuthStateChange fires with SIGNED_IN event
  → AuthProvider fetches profile, sets role
  → Stack.Protected re-evaluates → opens role subtree
  → if returnTo in params → router.replace(returnTo)
```

### Roadmap Status Toggle Flow

```
Professor taps status chip on roadmap item
  → useUpdateRoadmapStatus({ itemId, status: 'in_progress' })
  → onMutate:
      cancelQueries(qk.roadmap(courseId))
      snapshot = getQueryData(qk.roadmap(courseId))
      setQueryData: update item in cache → UI updates instantly (0ms latency)
  → mutationFn: supabase UPDATE roadmap_items SET professor_status='in_progress'
  → onError: rollback to snapshot
  → onSettled: invalidateQueries(qk.roadmap(courseId)) → background refetch
```

### File Upload Flow

```
Professor taps "Add File" → DocumentPicker
  → file: { uri: 'file:///...', name: 'lecture1.pdf', mimeType: 'application/pdf' }
  → lib/upload.ts:
      blob = await fetch(uri).then(r => r.blob())
      { data } = await supabase.storage.from('module-items').upload(path, blob)
      { data: { publicUrl } } = supabase.storage.from('module-items').getPublicUrl(data.path)
  → useAddModuleItem.mutate({ moduleId, title, type: 'file', url: publicUrl })
      → INSERT into module_items
      → invalidateQueries(qk.modules(courseId))
  → UI: module list refreshes, new file item appears with PDF icon
```

---

## Component Boundaries — What Talks to What

| Layer | Can call | Cannot call |
|-------|----------|-------------|
| `app/` screens | `hooks/*`, `components/*`, `lib/errors.ts`, `router` | `queries/*` directly, `supabase` directly |
| `hooks/*` | `queries/*`, `lib/supabase.ts`, `lib/queryKeys.ts` | `app/` screens, `components/*` |
| `queries/*` | Supabase client (passed as arg), `types/*` | anything in `hooks/`, `app/`, `components/` |
| `components/ui/*` | `hooks/useRoleTheme`, `theme/tokens.ts`, other ui components | `hooks/admin/*`, `hooks/professor/*`, `hooks/student/*`, `queries/*` |
| `components/domain/*` | `components/ui/*`, `hooks/shared/*`, `types/*` | `hooks/admin/*`, `hooks/professor/*`, `hooks/student/*` |
| `providers/*` | `lib/supabase.ts`, `types/*`, `theme/roles.ts` | `hooks/*` (providers are above hooks in the tree) |

The hardest boundary to enforce: **screens must not call supabase directly.** All data access goes through `hooks/` → `queries/` → `lib/supabase.ts`. This is the boundary the "Code Organization" rubric dimension is grading.

---

## Anti-Patterns to Avoid

### 1. Role Logic in Shared Components

**What happens:** `if (role === 'professor') { ... }` inside `RoadmapItem.tsx`
**Why wrong:** Shared component acquires hidden role dependency; breaks when roles change or a third variant is needed.
**Do this instead:** Pass a behavior prop (`canEditStatus: boolean`) derived at the screen level from `useSession().role`. The component stays dumb.

### 2. Direct Supabase Calls in Screens

**What happens:** `const { data } = await supabase.from('courses').select(...)` inside a screen component.
**Why wrong:** No caching, no loading/error state management, no type inference, untestable, violates the evaluated "Code Organization" dimension.
**Do this instead:** Always go through a `hooks/` hook backed by TanStack Query.

### 3. Flat File Structure for Role Screens

**What happens:** All screens dumped into `app/` with naming like `admin-dashboard.tsx`, `professor-courses.tsx`.
**Why wrong:** Expo Router uses the folder structure for URL paths and grouping. Without route groups, auth guards cannot be scoped per role; deep links become arbitrary.
**Do this instead:** Role route groups `(admin)`, `(professor)`, `(student)` with their own `_layout.tsx` guard — as specified above.

### 4. Session Check on Every Screen

**What happens:** Every screen individually checks `if (!session) router.replace('/sign-in')`.
**Why wrong:** Race conditions, flicker, inconsistency, code duplication.
**Do this instead:** Centralize in `Stack.Protected` guard in role group `_layout.tsx`. Screens inside the group never need to check.

### 5. Storing Role in Zustand or Component State

**What happens:** After login, role is stored in a Zustand slice or `useState` alongside the session.
**Why wrong:** On app restart, Zustand is empty; you re-derive the role from the session anyway, creating two sources of truth that can diverge.
**Do this instead:** `AuthProvider` derives role from `profiles` table every time a session is restored. Single source of truth.

---

## Sources

- [Expo Router: Protected Routes](https://docs.expo.dev/router/advanced/protected/) — Stack.Protected pattern (HIGH confidence, official docs)
- [Expo Router: Authentication](https://docs.expo.dev/router/advanced/authentication/) — SessionProvider, storage state, splash handling (HIGH confidence, official docs)
- [Expo Router: Tabs](https://docs.expo.dev/router/advanced/tabs/) — Nested tabs, route groups (HIGH confidence, official docs)
- [Supabase: Generating TypeScript Types](https://supabase.com/docs/guides/api/rest/generating-types) — CLI workflow, Database generic (HIGH confidence, official docs)
- [Supabase: React Native Storage](https://supabase.com/blog/react-native-storage) — file upload blob pattern (HIGH confidence, official blog)
- [Makerkit: Supabase + TanStack Query](https://makerkit.dev/blog/saas/supabase-react-query) — TypedSupabaseClient, query fn separation, optimistic update pattern (MEDIUM confidence, verified against official TanStack and Supabase docs)
- [NativeWind: Themes](https://www.nativewind.dev/docs/guides/themes) — CSS vars(), role-keyed theme objects (HIGH confidence, official NativeWind docs)
- [Aaron Saunders: Expo Router + Supabase + TanStack](https://github.com/aaronksaunders/expo-router-supabase-tanstack) — reference implementation (MEDIUM confidence, community)
- [DEV: Stack.Protected role-based routing](https://dev.to/aaronksaunders/simplifying-auth-and-role-based-routing-with-stackprotected-in-expo-router-592m) — guard composition pattern (MEDIUM confidence, community with official doc alignment)

---

*Architecture research for: Scholera Mobile (role-aware LMS companion)*
*Researched: 2026-04-23*
