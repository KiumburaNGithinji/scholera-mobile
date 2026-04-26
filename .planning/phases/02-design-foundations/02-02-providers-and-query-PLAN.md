---
phase: 02-design-foundations
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - theme/role-theme.ts
  - providers/role-theme-provider.tsx
  - providers/query-provider.tsx
  - hooks/use-role.ts
  - app/_layout.tsx
autonomous: true
requirements: [UI-01]
must_haves:
  truths:
    - "RoleThemeProvider accepts a role prop ('admin' | 'professor' | 'student') and injects the matching --color-accent CSS var into its subtree via NativeWind's vars() API"
    - "Children of RoleThemeProvider that use bg-accent / text-accent / border-accent render in the role-correct color (steel for admin, clay for professor, sage for student) with no per-component prop threading"
    - "QueryProvider wraps the app with a single global QueryClient configured for staleTime: 2 min and gcTime: 5 min"
    - "Mutations have retry: 0 (user-initiated calls never auto-retry — prevents double-creates)"
    - "AppState change listener integrates with TanStack Query's focusManager so queries refetch when the app returns from background"
  artifacts:
    - path: "theme/role-theme.ts"
      provides: "roleThemes object — three vars() outputs keyed by Role"
      contains: "vars({"
      exports: ["roleThemes"]
    - path: "providers/role-theme-provider.tsx"
      provides: "RoleThemeProvider component — wraps any subtree with role-specific accent"
      exports: ["RoleThemeProvider"]
    - path: "providers/query-provider.tsx"
      provides: "QueryProvider + queryClient export with required defaults"
      exports: ["QueryProvider", "queryClient"]
      contains: "staleTime: 1000 * 60 * 2"
    - path: "hooks/use-role.ts"
      provides: "useRole hook — minimal context-free stub returning current role (Phase 3 wires AuthProvider)"
      exports: ["useRole"]
    - path: "app/_layout.tsx"
      provides: "Root layout extended with QueryProvider + AppState focus integration"
      contains: "QueryProvider"
  key_links:
    - from: "providers/role-theme-provider.tsx"
      to: "theme/role-theme.ts"
      via: "import { roleThemes } — looks up vars() output by role prop"
      pattern: "roleThemes\\["
    - from: "providers/query-provider.tsx"
      to: "@tanstack/react-query"
      via: "QueryClient + QueryClientProvider"
      pattern: "QueryClient"
    - from: "app/_layout.tsx"
      to: "providers/query-provider.tsx"
      via: "imports QueryProvider and wraps Stack"
      pattern: "<QueryProvider>"
    - from: "app/_layout.tsx"
      to: "@tanstack/react-query focusManager"
      via: "AppState listener calls focusManager.setFocused"
      pattern: "focusManager.setFocused"
---

<objective>
Build the runtime substrate that makes role accent swapping and TanStack Query work everywhere. Three pieces:

1. **RoleThemeProvider** — wraps any subtree and swaps `--color-accent` to steel/clay/sage based on role prop. Components consume `bg-accent`/`text-accent`/`border-accent` (the Tailwind classes Plan 01 wired) with zero awareness of which role is active.
2. **QueryProvider** — single global `QueryClient` with the exact defaults Phase 2 success criterion 4 requires (staleTime 2 min, gcTime 5 min, retry 2 with backoff, mutations retry 0).
3. **App focus integration** — RN equivalent of web's `refetchOnWindowFocus`: when the app returns from background, queries refetch.

Purpose: Without RoleThemeProvider, every role-themed component would need a `role` prop threaded down. Without QueryProvider, every primitive that consumes loading/error/empty data would need its own `useEffect` boilerplate — Plan 03's primitives and all Phases 4-8 screens depend on `isPending` / `isError` / `data` flags being trivially available.

Output: theme/role-theme.ts, providers/role-theme-provider.tsx, providers/query-provider.tsx, hooks/use-role.ts (stub), app/_layout.tsx (extended with QueryProvider + AppState integration). The RoleThemeProvider is NOT mounted at root in this plan — UI-SPEC line 476 specifies it mounts in role group layouts (Phase 3 work). Plan 03 demonstrates it via a preview screen.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-design-foundations/02-UI-SPEC.md
@.planning/research/STACK.md
@.planning/phases/01-scaffold/01-03-config-and-client-SUMMARY.md
@app/_layout.tsx
@types/app.types.ts

<interfaces>
<!-- Existing types/app.types.ts from Phase 1 already exports the Role union (per Plan 03 SUMMARY) -->

From types/app.types.ts (Phase 1):
```typescript
export type Role = 'admin' | 'professor' | 'student'
```

This is the type RoleThemeProvider's `role` prop uses — re-export it from theme/role-theme.ts for proximity, OR import from `@/types/app.types`. (Use the @/ alias — Phase 1 plan 03 confirmed baseUrl + paths work.)

Stack already includes: @tanstack/react-query@^5.100.5, @tanstack/query-devtools@^5.100.5, nativewind@^4.2.3 (which exports `vars`).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Author theme/role-theme.ts + providers/role-theme-provider.tsx + hooks/use-role.ts</name>
  <files>theme/role-theme.ts, providers/role-theme-provider.tsx, hooks/use-role.ts</files>
  <read_first>
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (RoleThemeProvider section lines 433-498 — full implementation contract)
    - .planning/research/STACK.md (Critical Implementation Patterns § 3 lines 152-181 — vars() pattern, exact RGB triplets)
    - types/app.types.ts (confirm Role union exists from Phase 1)
    - theme/tokens.ts (confirm tokens const exists — for type-checking compatibility)
  </read_first>
  <action>
    **PART A — Write `theme/role-theme.ts`** (the role-to-vars lookup table).

    NativeWind v4 exports a `vars()` helper that produces a style object setting CSS custom properties at runtime. The `--color-accent` swap is the ENTIRE role theming mechanism — every other token stays static (defined in global.css :root from Plan 01).

    Write `theme/role-theme.ts` with EXACTLY these contents:

    ```typescript
    import { vars } from 'nativewind'
    import type { Role } from '@/types/app.types'

    /**
     * Per-role CSS variable overrides.
     *
     * The single token that swaps per role is --color-accent. Every other token
     * (canvas, surface, fg-primary, border-subtle, semantic) stays role-independent
     * and is defined in global.css :root.
     *
     * RGB triplets (space-separated, no commas) match global.css format so Tailwind's
     * rgb(var(--color-accent) / <alpha-value>) pattern works with alpha modifiers.
     *
     * Hex equivalents (for cross-reference with theme/tokens.ts):
     *   admin     #64748B (steel)
     *   professor #CC785C (clay)
     *   student   #86A17C (sage) — same as global.css default
     */
    export const roleThemes: Record<Role, ReturnType<typeof vars>> = {
      admin:     vars({ '--color-accent': '100 116 139' }),
      professor: vars({ '--color-accent': '204 120 92' }),
      student:   vars({ '--color-accent': '134 161 124' }),
    }
    ```

    The `Record<Role, ReturnType<typeof vars>>` type ensures: (a) all three roles are required (TS will error if one is missing), (b) the value type is whatever `vars()` returns (we don't hardcode that — it's NativeWind's internal type).

    **PART B — Write `providers/role-theme-provider.tsx`** (the consumer-facing wrapper).

    Write `providers/role-theme-provider.tsx` with EXACTLY these contents:

    ```tsx
    import type { ReactNode } from 'react'
    import { View } from 'react-native'
    import { roleThemes } from '@/theme/role-theme'
    import type { Role } from '@/types/app.types'

    interface RoleThemeProviderProps {
      role: Role
      children: ReactNode
    }

    /**
     * Injects the role-specific accent CSS variable into the subtree.
     *
     * Children that use Tailwind classes like `bg-accent`, `text-accent`, or
     * `border-accent` will render in the role's color (steel/clay/sage).
     *
     * Mounted in role group layouts (app/(admin)/_layout.tsx etc) — Phase 3 work.
     * NOT mounted at root because the sign-in screen has no role yet.
     */
    export function RoleThemeProvider({ role, children }: RoleThemeProviderProps) {
      return (
        <View style={roleThemes[role]} className="flex-1">
          {children}
        </View>
      )
    }
    ```

    The `flex-1` className is critical — without it, the View collapses to zero height and children appear empty (this is the most common bug with `vars()` providers). The style prop is the vars() output object — RN/NativeWind merges it into the View's style chain and CSS-var resolution kicks in for all descendants.

    **PART C — Write `hooks/use-role.ts`** (a lightweight stub returning the current role).

    Phase 3 will add an AuthProvider that owns the real role state. For Phase 2's preview screen and primitives testing, a parameter-driven stub is enough:

    Write `hooks/use-role.ts` with EXACTLY these contents:

    ```typescript
    import type { Role } from '@/types/app.types'

    /**
     * Stub for Phase 2 — returns a default role.
     *
     * Phase 3 (Auth + Role Router) replaces this implementation with one that reads
     * from AuthContext (the real session-derived role from the profiles table).
     *
     * The hook's signature does NOT change between Phase 2 and Phase 3 — consumers
     * stay the same. Only the body becomes context-driven.
     */
    export function useRole(): Role {
      // Phase 2 default — overridden in Phase 3 by AuthContext.
      return 'student'
    }
    ```

    A stub hook with a stable signature is the standard pattern for cross-phase contracts. Phase 3's executor will replace the body without touching any consumer.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && grep -q "import { vars } from 'nativewind'" theme/role-theme.ts && grep -q "from '@/types/app.types'" theme/role-theme.ts && grep -q "admin:" theme/role-theme.ts && grep -q "professor:" theme/role-theme.ts && grep -q "student:" theme/role-theme.ts && grep -q "'100 116 139'" theme/role-theme.ts && grep -q "'204 120 92'" theme/role-theme.ts && grep -q "'134 161 124'" theme/role-theme.ts && grep -q "export const roleThemes" theme/role-theme.ts && grep -q "export function RoleThemeProvider" providers/role-theme-provider.tsx && grep -q "style={roleThemes\[role\]}" providers/role-theme-provider.tsx && grep -q 'className="flex-1"' providers/role-theme-provider.tsx && grep -q "import { View } from 'react-native'" providers/role-theme-provider.tsx && grep -q "export function useRole" hooks/use-role.ts && grep -q "import type { Role }" hooks/use-role.ts && npx tsc --noEmit && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - theme/role-theme.ts exports `roleThemes` typed as `Record<Role, ReturnType<typeof vars>>`
    - All three role keys present: admin, professor, student
    - Exact RGB triplets present: '100 116 139' (admin), '204 120 92' (professor), '134 161 124' (student) — copy verbatim from STACK.md / UI-SPEC
    - providers/role-theme-provider.tsx exports `RoleThemeProvider`
    - The View wrapper has `style={roleThemes[role]}` AND `className="flex-1"` (flex-1 is critical — missing it collapses the subtree)
    - hooks/use-role.ts exports `useRole` returning a `Role`
    - All imports use the `@/` alias (confirmed working in Phase 1 plan 03)
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>RoleThemeProvider can be wrapped around any subtree; the vars() output for the matching role is applied to the View's style; descendants using Tailwind accent classes render in steel/clay/sage; useRole stub returns 'student' for Phase 2 (Phase 3 swaps the body); tsc passes.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Author providers/query-provider.tsx with required defaults</name>
  <files>providers/query-provider.tsx</files>
  <read_first>
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (QueryClient Configuration section lines 502-555 — exact defaults required by Phase 2 success criterion 4)
    - .planning/research/STACK.md (Supporting Libraries — TanStack Query v5.99.2 confirmed; Critical Implementation Patterns § 5 — useQuery pattern)
    - .planning/ROADMAP.md (Phase 2 Success Criteria — verify staleTime + gcTime values)
  </read_first>
  <action>
    Write `providers/query-provider.tsx` with EXACTLY these contents:

    ```tsx
    import type { ReactNode } from 'react'
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

    /**
     * Single global QueryClient for the entire app.
     *
     * Defaults are chosen to match Phase 2 success criterion 4:
     *   - staleTime: 2 min — tab switch within window shows cached data instantly (no spinner)
     *   - gcTime: 5 min — cache survives 5 min after last consumer unmounts
     *   - retry: 2 + exponential backoff — recovers from transient network blips
     *   - retryDelay: capped at 8s — no multi-minute hangs
     *   - refetchOnWindowFocus: false — RN: window focus is meaningless; AppState handles this
     *     in app/_layout.tsx via focusManager
     *   - refetchOnReconnect: true — when network comes back, refetch (mobile-critical)
     *   - refetchOnMount: true — refetch on remount when data is stale
     *   - mutations.retry: 0 — user-initiated; never auto-retry (prevents double-creates)
     *
     * Mounted at root layout, OUTSIDE RoleThemeProvider — one client per app, regardless
     * of role. Provider order: SafeAreaProvider > QueryProvider > [AuthProvider Phase 3] >
     * [RoleThemeProvider in role group layouts].
     */
    export const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 2,         // 2 min — REQUIRED by Phase 2 SC4
          gcTime: 1000 * 60 * 5,            // 5 min — REQUIRED by Phase 2 SC4
          retry: 2,                          // 2 retries on transient failure
          retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
          refetchOnWindowFocus: false,      // RN: see app/_layout.tsx AppState integration
          refetchOnReconnect: true,
          refetchOnMount: true,
        },
        mutations: {
          retry: 0,                          // user-initiated; do NOT auto-retry
        },
      },
    })

    interface QueryProviderProps {
      children: ReactNode
    }

    export function QueryProvider({ children }: QueryProviderProps) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }
    ```

    The `queryClient` is exported alongside `QueryProvider` so non-React code (e.g. mutation invalidation from a callback) can call `queryClient.invalidateQueries(...)` directly. This is the standard TanStack Query v5 pattern.

    DO NOT add any QueryDevtools import here — devtools mount happens in app/_layout.tsx if at all (Phase 8 polish work). Keeping this file devtools-free ensures it's identical in production and dev.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && grep -q "from '@tanstack/react-query'" providers/query-provider.tsx && grep -q "QueryClient" providers/query-provider.tsx && grep -q "QueryClientProvider" providers/query-provider.tsx && grep -q "export const queryClient" providers/query-provider.tsx && grep -q "export function QueryProvider" providers/query-provider.tsx && grep -q "staleTime: 1000 \* 60 \* 2" providers/query-provider.tsx && grep -q "gcTime: 1000 \* 60 \* 5" providers/query-provider.tsx && grep -q "retry: 2" providers/query-provider.tsx && grep -q "retryDelay:" providers/query-provider.tsx && grep -q "refetchOnWindowFocus: false" providers/query-provider.tsx && grep -q "refetchOnReconnect: true" providers/query-provider.tsx && grep -q "refetchOnMount: true" providers/query-provider.tsx && grep -q "mutations:" providers/query-provider.tsx && grep -A1 "mutations:" providers/query-provider.tsx | grep -q "retry: 0" && npx tsc --noEmit && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - File imports `QueryClient`, `QueryClientProvider` from `@tanstack/react-query`
    - Exports `queryClient` const (for non-React invalidation calls)
    - Exports `QueryProvider` component
    - `staleTime: 1000 * 60 * 2` (exact — 2 min — required by Phase 2 SC4)
    - `gcTime: 1000 * 60 * 5` (exact — 5 min — required by Phase 2 SC4)
    - `retry: 2` for queries
    - `retryDelay` is a function with `Math.min(1000 * 2 ** attempt, 8000)` capping at 8s
    - `refetchOnWindowFocus: false` (RN-correct)
    - `refetchOnReconnect: true` (mobile-critical)
    - `mutations.retry: 0` (no auto-retry on user-initiated calls)
    - NO QueryDevtools import (devtools live in app/_layout.tsx if at all)
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>providers/query-provider.tsx exports `QueryProvider` and `queryClient` with all 8 required default options matching Phase 2 SC4 verbatim; tsc passes.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Wire QueryProvider + AppState focus integration into app/_layout.tsx</name>
  <files>app/_layout.tsx</files>
  <read_first>
    - app/_layout.tsx (current — Plan 01 added Inter font loading + splash gate; this task adds QueryProvider on top)
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (QueryClient Configuration → "App focus integration" subsection lines 532-555 — the AppState pattern)
    - providers/query-provider.tsx (just authored — confirm export names)
  </read_first>
  <action>
    **CRITICAL:** This task ASSUMES Plan 01 Task 3 has already extended `app/_layout.tsx` with Inter font loading + splash gate. If running in parallel and Plan 01 Task 3 has not landed, the executor MUST wait — both tasks modify the same file. (Wave-based scheduling handles this correctly: Plan 01 and Plan 02 are both wave 1, but Task 3 in each touches `app/_layout.tsx`. Execute Plan 01 first, then this task; OR merge them in sequence within a single execute pass.)

    Replace `app/_layout.tsx` with the version below. Changes from the Plan 01 Task 3 output:
    1. Wrap `<Stack>` in `<QueryProvider>` (innermost — between SafeAreaProvider and Stack)
    2. Add `AppState` listener in a useEffect that calls `focusManager.setFocused(...)` — this is RN's equivalent of `refetchOnWindowFocus`

    Provider nesting order (outer → inner): `SafeAreaProvider > QueryProvider > Stack`. RoleThemeProvider is NOT mounted here (it goes in role group layouts in Phase 3); AuthProvider is NOT here either (Phase 3 work). The order documented in UI-SPEC line 555 is `SafeAreaProvider > QueryProvider > AuthProvider > RoleThemeProvider > screens` — Phase 2 establishes the first two layers; Phase 3 adds the next two.

    Write `app/_layout.tsx` with EXACTLY these contents:

    ```tsx
    import '../global.css'  // NativeWind v4 requires this import at the entry point

    import { useEffect } from 'react'
    import { AppState, type AppStateStatus, Platform } from 'react-native'
    import { Stack } from 'expo-router'
    import { SafeAreaProvider } from 'react-native-safe-area-context'
    import * as SplashScreen from 'expo-splash-screen'
    import {
      useFonts,
      Inter_400Regular,
      Inter_600SemiBold,
    } from '@expo-google-fonts/inter'
    import { focusManager } from '@tanstack/react-query'
    import { QueryProvider } from '@/providers/query-provider'

    // Hold the splash screen visible until fonts have loaded.
    // Per UI-SPEC: load only 2 Inter weights (400 + 600) — type contract uses exactly these.
    SplashScreen.preventAutoHideAsync().catch(() => {
      // Splash may already be hidden in dev fast-refresh; safe to ignore.
    })

    /**
     * RN equivalent of TanStack Query's web-only refetchOnWindowFocus.
     * When the app returns from background ('active'), focus is set to true and
     * stale queries refetch. This is the "user reopens the app" UX from STACK.md.
     */
    function onAppStateChange(status: AppStateStatus) {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active')
      }
    }

    export default function RootLayout() {
      const [fontsLoaded, fontsError] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
      })

      useEffect(() => {
        if (fontsLoaded || fontsError) {
          SplashScreen.hideAsync().catch(() => {
            // Already hidden; noop.
          })
        }
      }, [fontsLoaded, fontsError])

      // Subscribe to AppState changes for TanStack Query focus management.
      useEffect(() => {
        const sub = AppState.addEventListener('change', onAppStateChange)
        return () => sub.remove()
      }, [])

      // Don't mount the app tree until fonts are ready — prevents flash of system font.
      if (!fontsLoaded && !fontsError) {
        return null
      }

      return (
        <SafeAreaProvider>
          <QueryProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </QueryProvider>
        </SafeAreaProvider>
      )
    }
    ```

    Note the import order is critical: `../global.css` MUST be the first import (NativeWind v4 wiring point 3 — Phase 1 plan 03 SUMMARY confirms). Do not reorder.

    DO NOT mount `RoleThemeProvider` here. Per UI-SPEC Assumption #7 (line 648), root renders the sign-in screen which has no role yet. Mounting RoleThemeProvider at root would force-pick a role before auth — wrong. RoleThemeProvider lives in role group layouts (Phase 3 builds these).

    DO NOT mount any AuthProvider here either — that's Phase 3. This task adds QueryProvider only.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && head -1 app/_layout.tsx | grep -q "import '../global.css'" && grep -q "from '@tanstack/react-query'" app/_layout.tsx && grep -q "focusManager" app/_layout.tsx && grep -q "from '@/providers/query-provider'" app/_layout.tsx && grep -q "<QueryProvider>" app/_layout.tsx && grep -q "</QueryProvider>" app/_layout.tsx && grep -q "AppState" app/_layout.tsx && grep -q "Platform.OS !== 'web'" app/_layout.tsx && grep -q "focusManager.setFocused(status === 'active')" app/_layout.tsx && grep -q "AppState.addEventListener('change'" app/_layout.tsx && grep -q "Inter_400Regular" app/_layout.tsx && grep -q "Inter_600SemiBold" app/_layout.tsx && ! grep -q "Inter_500Medium" app/_layout.tsx && ! grep -q "RoleThemeProvider" app/_layout.tsx && ! grep -q "AuthProvider" app/_layout.tsx && npx tsc --noEmit && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - `import '../global.css'` is line 1 (NativeWind v4 first-import requirement preserved)
    - `focusManager` imported from `@tanstack/react-query`
    - `QueryProvider` imported from `@/providers/query-provider`
    - `<QueryProvider>` wraps `<Stack>` (innermost child of SafeAreaProvider)
    - `AppState.addEventListener('change', onAppStateChange)` subscribed in useEffect with cleanup
    - `onAppStateChange` calls `focusManager.setFocused(status === 'active')` only when `Platform.OS !== 'web'`
    - Inter font loading (Plan 01) preserved — both weights present, splash gate intact
    - `RoleThemeProvider` NOT in this file (UI-SPEC: mounts in role groups, Phase 3)
    - `AuthProvider` NOT in this file (Phase 3 work)
    - `Inter_500Medium` NOT loaded (UI-SPEC contract: 2 weights only)
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>app/_layout.tsx wraps Stack in QueryProvider inside SafeAreaProvider; AppState listener bridges native app focus to TanStack Query's focusManager; Inter font loading + splash gate from Plan 01 still intact; tsc passes.</done>
</task>

</tasks>

<verification>
After all 3 tasks complete:

```bash
cd /Users/Kiumbura/Projects/scholera-mobile

# 1. All provider files exist
ls theme/role-theme.ts providers/role-theme-provider.tsx providers/query-provider.tsx hooks/use-role.ts app/_layout.tsx

# 2. tsc clean
npx tsc --noEmit

# 3. Three role accent triplets present in role-theme.ts (matching UI-SPEC + STACK.md verbatim)
grep -E "'(100 116 139|204 120 92|134 161 124)'" theme/role-theme.ts | wc -l   # expect: 3

# 4. QueryProvider mounted in root layout, RoleThemeProvider NOT
grep -q "<QueryProvider>" app/_layout.tsx && ! grep -q "RoleThemeProvider" app/_layout.tsx && echo "OK"

# 5. AppState focus integration wired
grep -q "focusManager.setFocused" app/_layout.tsx && echo "OK"
```

**Coordination note for executor:** Plan 01 and Plan 02 both modify `app/_layout.tsx`. Plan 01 Task 3 establishes the font-loading + splash gate version; Plan 02 Task 3 extends THAT version with QueryProvider + AppState. If executing in parallel waves, run Plan 01 first or merge the layout changes in a single pass — the Plan 02 Task 3 action text is written assuming Plan 01 Task 3 has landed.
</verification>

<success_criteria>
1. `theme/role-theme.ts` exports `roleThemes: Record<Role, ReturnType<typeof vars>>` with admin/professor/student → vars() outputs (steel/clay/sage RGB triplets)
2. `providers/role-theme-provider.tsx` exports `RoleThemeProvider({ role, children })` — wraps subtree in `<View style={roleThemes[role]} className="flex-1">`
3. `providers/query-provider.tsx` exports `QueryProvider` + `queryClient` with staleTime 2 min, gcTime 5 min, retry 2, mutations retry 0
4. `hooks/use-role.ts` exports stub `useRole(): Role` returning 'student' (Phase 3 swaps body)
5. `app/_layout.tsx` mounts `<SafeAreaProvider><QueryProvider><Stack/></QueryProvider></SafeAreaProvider>` with AppState focus integration
6. `npx tsc --noEmit` exits 0
7. Phase 2 success criterion 2 partially satisfied (provider exists; Plan 03 demonstrates the swap visually)
8. Phase 2 success criterion 4 satisfied (QueryClient configured with required defaults)
</success_criteria>

<output>
After completion, create `.planning/phases/02-design-foundations/02-02-providers-and-query-SUMMARY.md` documenting:
- The four files created (theme/role-theme.ts, providers/role-theme-provider.tsx, providers/query-provider.tsx, hooks/use-role.ts) and the modification to app/_layout.tsx
- Confirmation that the three role RGB triplets match UI-SPEC verbatim
- Confirmation that QueryClient defaults match Phase 2 SC4 verbatim
- The provider nesting order established (SafeAreaProvider > QueryProvider > Stack) and what Phase 3 will add (AuthProvider, RoleThemeProvider in role groups)
- Any auto-fixed deviations
- What Plan 03 inherits (RoleThemeProvider for the preview screen, QueryProvider available globally if any primitive uses queries — none should in Phase 2 but the wiring is ready)
</output>
