---
phase: 02-design-foundations
plan: 02
subsystem: ui
tags: [providers, role-theming, nativewind-vars, tanstack-query, focus-manager, appstate, css-vars]

# Dependency graph
requires:
  - phase: 02-design-foundations
    plan: 01
    provides: global.css :root --color-accent CSS var (default student sage); theme/tokens.ts with all 3 role accent hex strings; tailwind.config.js exposing bg-accent / text-accent / border-accent classes; app/_layout.tsx with Inter font loading + splash gate
  - phase: 01-scaffold
    plan: 03
    provides: types/app.types.ts exporting Role union; @/ path alias resolves; @tanstack/react-query@^5.100.5 + nativewind@^4.2.3 (vars export) installed; SafeAreaProvider wrapping in app/_layout.tsx
provides:
  - theme/role-theme.ts exports roleThemes Record<Role, ReturnType<typeof vars>> — three NativeWind vars() outputs keyed by Role (admin steel, professor clay, student sage)
  - providers/role-theme-provider.tsx exports RoleThemeProvider({ role, children }) — wraps subtree in <View style={roleThemes[role]} className="flex-1"> for CSS-var-driven accent swap
  - providers/query-provider.tsx exports QueryProvider + queryClient with Phase 2 SC4 defaults verbatim (staleTime 2min, gcTime 5min, retry 2 + backoff, mutations retry 0, refetchOnReconnect true, refetchOnMount true)
  - hooks/use-role.ts exports useRole(): Role stub returning 'student' (signature stable; Phase 3 swaps body to AuthContext)
  - app/_layout.tsx extended root layout with QueryProvider wrapping Stack + AppState focus integration via focusManager.setFocused
affects: [02-primitives-and-preview, 03-auth-routing, 04-admin-experience, 05-professor-experience, 06-student-experience, 07-shared-and-deep-linking, 08-polish-audit]

# Tech tracking
tech-stack:
  added: []  # No new deps — @tanstack/react-query and nativewind both already in package.json from Phase 1
  patterns:
    - "NativeWind vars() runtime CSS-var injection — replaces React Context for theme switching; subtree consumes via Tailwind classes (bg-accent, text-accent, border-accent) with zero prop threading"
    - "flex-1 className on RoleThemeProvider's wrapper View — prevents zero-height collapse (most common bug with vars() providers)"
    - "Single global QueryClient export alongside QueryProvider — enables non-React invalidation calls (queryClient.invalidateQueries) from callbacks/services"
    - "focusManager.setFocused bridge from AppState 'change' events — RN equivalent of refetchOnWindowFocus, gives 'reopen the app -> stale queries refetch' UX"
    - "Platform.OS !== 'web' guard on AppState handler — web handles focus natively; only RN platforms need the manual bridge"
    - "useRole stub with stable signature — hook body changes between Phase 2 (returns 'student') and Phase 3 (reads AuthContext) but consumers never need to update"

key-files:
  created:
    - "theme/role-theme.ts"
    - "providers/role-theme-provider.tsx"
    - "providers/query-provider.tsx"
    - "hooks/use-role.ts"
  modified:
    - "app/_layout.tsx (extended Plan 01 layout: added QueryProvider wrap + AppState focus listener; preserved Inter font loading + splash gate verbatim)"

key-decisions:
  - "RoleThemeProvider NOT mounted in root layout — UI-SPEC Assumption 7: root renders sign-in (no role yet); RoleThemeProvider mounts in role group layouts in Phase 3 (app/(admin)/_layout.tsx etc)"
  - "AuthProvider intentionally absent from this plan — Phase 3 work; Phase 2 establishes only the first 2 layers of UI-SPEC line 555 provider order (SafeAreaProvider > QueryProvider > [Phase 3: AuthProvider > RoleThemeProvider] > screens)"
  - "queryClient exported as a top-level const (not just inside QueryProvider closure) — enables non-React code paths to invalidate queries directly (e.g. mutation success handlers in services); standard TanStack Query v5 pattern"
  - "vars() output typed as ReturnType<typeof vars> rather than hardcoding NativeWind's internal type — keeps theme/role-theme.ts forward-compatible if NativeWind changes the vars() return shape in a minor version"
  - "useRole returns hardcoded 'student' for Phase 2 — sufficient for Plan 03 preview screen and any primitive consumer; Phase 3 swaps body to read from AuthContext without changing the call signature"
  - "QueryDevtools NOT imported here — Phase 2 ships production-equivalent provider; devtools mount (if any) lives in app/_layout.tsx behind __DEV__ flag in Phase 8 polish work"

patterns-established:
  - "Role accent swap pattern: declare role-keyed vars() map in theme/role-theme.ts → consume in providers/role-theme-provider.tsx <View style={...}> with flex-1 → child Tailwind classes resolve via CSS vars at runtime"
  - "Provider authoring discipline: provider file exports both the React component AND the underlying primitive (queryClient) for non-React consumers"
  - "Layout extension pattern: when extending app/_layout.tsx across plans, preserve all existing imports/logic and only add new provider wraps + new useEffect blocks — never replace the whole file"

requirements-completed: [UI-01]

# Metrics
duration: 2min
completed: 2026-04-26
---

# Phase 2 Plan 2: Providers and Query Summary

**Runtime substrate for role accent swapping and global data fetching: RoleThemeProvider injects role-specific --color-accent CSS var into any subtree via NativeWind vars(), QueryProvider wraps the app with one QueryClient configured to Phase 2 SC4 defaults (2 min stale / 5 min gc / mutations no-retry), and AppState 'change' events bridge to focusManager.setFocused for the RN equivalent of refetchOnWindowFocus.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-26T02:55:37Z
- **Completed:** 2026-04-26T02:57:24Z
- **Tasks:** 3
- **Files created:** 4 (theme/role-theme.ts, providers/role-theme-provider.tsx, providers/query-provider.tsx, hooks/use-role.ts)
- **Files modified:** 1 (app/_layout.tsx)

## Accomplishments

- **`theme/role-theme.ts`** exports `roleThemes: Record<Role, ReturnType<typeof vars>>` with all three role keys mapped to NativeWind `vars()` outputs containing the exact RGB triplets from UI-SPEC line 454-458 / STACK.md § 3 (admin `100 116 139`, professor `204 120 92`, student `134 161 124`)
- **`providers/role-theme-provider.tsx`** exports `RoleThemeProvider({ role, children })` — wraps children in `<View style={roleThemes[role]} className="flex-1">`; the `flex-1` class is critical to prevent the subtree from collapsing to zero height
- **`providers/query-provider.tsx`** exports both `QueryProvider` and the `queryClient` const with all 8 required default options matching Phase 2 SC4 verbatim:
  - queries: `staleTime: 1000 * 60 * 2` (2 min), `gcTime: 1000 * 60 * 5` (5 min), `retry: 2`, `retryDelay: (a) => Math.min(1000 * 2 ** a, 8000)`, `refetchOnWindowFocus: false`, `refetchOnReconnect: true`, `refetchOnMount: true`
  - mutations: `retry: 0` (no auto-retry on user-initiated calls — prevents double-creates)
- **`hooks/use-role.ts`** exports `useRole(): Role` returning `'student'` — minimal Phase 2 stub with stable signature; Phase 3 will swap the body to read from AuthContext without breaking any consumer
- **`app/_layout.tsx`** extended (NOT replaced): added `QueryProvider` wrap inside `SafeAreaProvider` (provider order now `SafeAreaProvider > QueryProvider > Stack`), `focusManager` import, `onAppStateChange` handler with `Platform.OS !== 'web'` guard, and a second `useEffect` subscribing to `AppState.addEventListener('change', ...)` with cleanup
- **Plan 01 invariants preserved verbatim** in `app/_layout.tsx`: `'../global.css'` is still line 1 (NativeWind v4 first-import requirement), Inter 400 + 600 still loaded via `useFonts`, splash gate logic intact, `return null` while fonts pending
- **`tsc --noEmit` clean** after every task

## Task Commits

Each task was committed atomically:

1. **Task 1: Author theme/role-theme.ts + providers/role-theme-provider.tsx + hooks/use-role.ts** — `b84aa62` (feat)
2. **Task 2: Author providers/query-provider.tsx with required defaults** — `13262ef` (feat)
3. **Task 3: Wire QueryProvider + AppState focus integration into app/_layout.tsx** — `4c15317` (feat)

**Plan metadata commit:** to be added by final commit step (covers SUMMARY.md, STATE.md, ROADMAP.md, REQUIREMENTS.md).

## Files Created/Modified

- **`theme/role-theme.ts` (CREATED)** — Exports `roleThemes` const typed as `Record<Role, ReturnType<typeof vars>>`. Imports `vars` from `nativewind` and `Role` from `@/types/app.types`. The three RGB triplets (`100 116 139`, `204 120 92`, `134 161 124`) match UI-SPEC line 454-458 verbatim and the global.css `--color-accent` format (space-separated, no commas, alpha-modifier compatible).
- **`providers/role-theme-provider.tsx` (CREATED)** — Exports `RoleThemeProvider` component. Imports `View` from `react-native`, `roleThemes` from `@/theme/role-theme`, `Role` from `@/types/app.types`, and `ReactNode` as a type-only import. Renders `<View style={roleThemes[role]} className="flex-1">{children}</View>`. The `flex-1` className is non-negotiable — without it the wrapper View collapses to zero height and children appear empty.
- **`providers/query-provider.tsx` (CREATED)** — Exports both `queryClient` (top-level const) and `QueryProvider` (React component). The QueryClient configures the 8 required default options for queries + mutations matching Phase 2 SC4. No `QueryDevtools` import (production-equivalent provider).
- **`hooks/use-role.ts` (CREATED)** — Exports `useRole(): Role` Phase 2 stub returning `'student'`. Phase 3 (Auth + Role Router) replaces the body with one that reads from AuthContext; the call signature stays identical so consumers don't change.
- **`app/_layout.tsx` (MODIFIED)** — Extended Plan 01 layout. Added imports: `AppState`, `AppStateStatus` (type), `Platform` from `react-native`; `focusManager` from `@tanstack/react-query`; `QueryProvider` from `@/providers/query-provider`. Added `onAppStateChange` module-level function and a new `useEffect` subscribing to `AppState.addEventListener('change', onAppStateChange)` with cleanup. Wrapped `<Stack>` in `<QueryProvider>` (innermost child of `SafeAreaProvider`). All Plan 01 logic (font loading, splash gate, NativeWind global.css import as line 1) preserved unchanged.

## Provider Nesting Order Established

Phase 2 establishes the first two layers of the full UI-SPEC line 555 provider order:

```
<SafeAreaProvider>           ← Phase 1 (RN safe-area)
  <QueryProvider>            ← Phase 2 Plan 02 (this plan)
    <Stack />                ← Plan 01 + Plan 02 root
  </QueryProvider>
</SafeAreaProvider>
```

Phase 3 (Auth + Role Router) will add the next two layers:

```
<SafeAreaProvider>
  <QueryProvider>
    <AuthProvider>           ← Phase 3 (session + role state)
      <Stack>
        ...
        <Stack.Screen name="(admin)">
          <RoleThemeProvider role="admin">  ← Phase 3 (mounted in role group layouts)
            <Stack />
          </RoleThemeProvider>
        </Stack.Screen>
        ...
      </Stack>
    </AuthProvider>
  </QueryProvider>
</SafeAreaProvider>
```

Per UI-SPEC Assumption 7, RoleThemeProvider is intentionally NOT mounted at root because the sign-in screen has no role yet. Mounting it deeper avoids re-rendering the root tree on sign-in.

## Verbatim Match Confirmation

| Contract | Source line | Implementation | Match |
|----------|-------------|----------------|-------|
| Admin RGB triplet | UI-SPEC line 455 / STACK.md § 3 | `vars({ '--color-accent': '100 116 139' })` | EXACT |
| Professor RGB triplet | UI-SPEC line 456 / STACK.md § 3 | `vars({ '--color-accent': '204 120 92' })` | EXACT |
| Student RGB triplet | UI-SPEC line 457 / STACK.md § 3 | `vars({ '--color-accent': '134 161 124' })` | EXACT |
| RoleThemeProvider impl | UI-SPEC line 461-463 | `<View style={roleThemes[role]} className="flex-1">{children}</View>` | EXACT (incl. flex-1) |
| QueryClient staleTime | UI-SPEC line 513 / Phase 2 SC4 | `staleTime: 1000 * 60 * 2` | EXACT |
| QueryClient gcTime | UI-SPEC line 514 / Phase 2 SC4 | `gcTime: 1000 * 60 * 5` | EXACT |
| QueryClient retry | UI-SPEC line 515 | `retry: 2` | EXACT |
| QueryClient retryDelay | UI-SPEC line 516 | `(attempt: number) => Math.min(1000 * 2 ** attempt, 8000)` | EXACT |
| Mutation retry | UI-SPEC line 522 | `mutations: { retry: 0 }` | EXACT |
| AppState focus bridge | UI-SPEC line 539-548 | `onAppStateChange` + `Platform.OS !== 'web'` guard + `focusManager.setFocused(status === 'active')` | EXACT |

## Decisions Made

1. **RoleThemeProvider NOT mounted at root.** Per UI-SPEC Assumption 7 (line 648), the root layout renders the sign-in screen, which has no role yet. Forcing a role-pick before auth would be incorrect. RoleThemeProvider is built and exported from this plan but mounted in role group layouts in Phase 3 (`app/(admin)/_layout.tsx` etc).
2. **AuthProvider out of scope.** UI-SPEC line 555 documents the full chain `SafeAreaProvider > QueryProvider > AuthProvider > RoleThemeProvider > screens`. Phase 2 establishes the first two layers; Phase 3 adds the next two. Keeping the layers clearly partitioned avoids a half-built AuthContext blocking Plan 03's primitives work.
3. **`queryClient` exported as a top-level const.** Standard TanStack Query v5 pattern for non-React invalidation calls (e.g. `queryClient.invalidateQueries({ queryKey: ['announcements'] })` from a service function). The alternative (only exposing it via the React Context) forces every invalidation site to be inside a component.
4. **`Record<Role, ReturnType<typeof vars>>` over hardcoded NativeWind types.** This typing makes the map (a) exhaustive — TS errors if a role is missing from `roleThemes` — and (b) forward-compatible if NativeWind changes the internal shape of `vars()` output in a minor version.
5. **`useRole` stub returns `'student'` literally.** No env var, no parameter, no localStorage — just a fixed return. Phase 2's only consumers are Plan 03's preview screen (which can override role explicitly) and Phase 3's AuthContext rewrite (which replaces the entire body). A more elaborate stub would just be wasted code.
6. **No `QueryDevtools` import in `query-provider.tsx`.** Keeping this file devtools-free means it's identical in production and dev. If devtools are added later (Phase 8 polish), they mount in `app/_layout.tsx` behind a `__DEV__` flag — devtools are an _app-level_ overlay, not a provider concern.
7. **`Platform.OS !== 'web'` guard on AppState handler.** Web platforms handle focus natively (`refetchOnWindowFocus` works on web). The AppState bridge is RN-specific. Without the guard, web would double-handle focus and potentially refetch queries on every page navigation.

## Deviations from Plan

None — plan executed exactly as written. Every `<action>` block contained verbatim file contents and every verify gate passed on the first run.

**Total deviations:** 0
**Auto-fixed bugs:** 0
**Rule 4 escalations:** 0
**Authentication gates:** 0
**Impact on plan:** None.

## Issues Encountered

None.

## Cross-check Verification (post-task gate from PLAN.md)

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| `theme/role-theme.ts` exists | yes | yes | PASS |
| `providers/role-theme-provider.tsx` exists | yes | yes | PASS |
| `providers/query-provider.tsx` exists | yes | yes | PASS |
| `hooks/use-role.ts` exists | yes | yes | PASS |
| `app/_layout.tsx` exists | yes | yes | PASS |
| Three role accent triplets in `role-theme.ts` (`100 116 139`, `204 120 92`, `134 161 124`) | 3 | 3 | PASS |
| `<QueryProvider>` mounted in `app/_layout.tsx` | yes | yes | PASS |
| `RoleThemeProvider` NOT in `app/_layout.tsx` | absent | absent | PASS |
| `focusManager.setFocused` in `app/_layout.tsx` | present | present | PASS |
| `AppState.addEventListener('change'` subscription | present | present | PASS |
| `Platform.OS !== 'web'` guard on focus handler | present | present | PASS |
| `Inter_400Regular` preserved from Plan 01 | present | present | PASS |
| `Inter_600SemiBold` preserved from Plan 01 | present | present | PASS |
| `Inter_500Medium` NOT loaded | absent | absent | PASS |
| `'../global.css'` is line 1 of `app/_layout.tsx` | yes | yes | PASS |
| `npx tsc --noEmit` exit code | 0 | 0 | PASS |

All 16 checks pass — files exist, RGB triplets verbatim, provider mount + AppState bridge wired correctly, Plan 01 invariants preserved, type-clean.

## Phase 2 Success Criteria Mapping

- **SC2 (RoleThemeProvider exists and swaps accent per role):** PARTIALLY SATISFIED — provider built and exported; visual demonstration is Plan 03's preview screen
- **SC4 (QueryClient configured with required defaults):** SATISFIED — all 8 default options match the UI-SPEC contract verbatim

## User Setup Required

None — no external service configuration. `@tanstack/react-query@^5.100.5` and `nativewind@^4.2.3` (with `vars` export) are both already declared in `package.json` from Phase 1.

## Next Phase Readiness

**Plan 03 (primitives-and-preview) inherits:**
- `RoleThemeProvider` ready for the visual smoke-test preview screen — render the same sample three times (`role="admin"`, `"professor"`, `"student"`) to verify the steel/clay/sage swap works (UI-SPEC verification target line 478)
- `QueryProvider` available globally — primitives don't need to fetch in Phase 2 but the wiring is ready when Phase 4-6 screens consume `useQuery`
- `useRole` stub available — primitives that need to know the current role (rare in Phase 2) can call it; in practice Tailwind `bg-accent`/`text-accent`/`border-accent` classes mean primitives don't need the role at all
- `roleThemes` map exported separately — preview screen can iterate `Object.entries(roleThemes)` to render all three swatches programmatically

**Phase 3 (auth-routing) inherits:**
- `AuthProvider` slot in the provider chain (between QueryProvider and screens)
- `useRole` body to swap — replace `return 'student'` with `const { profile } = useAuth(); return profile.role` (or equivalent); zero consumer-side changes
- `RoleThemeProvider` ready to mount in `app/(admin)/_layout.tsx`, `app/(professor)/_layout.tsx`, `app/(student)/_layout.tsx` — pass `role={profile.role}` from AuthContext

**Phases 4-8 inherit:**
- All `useQuery`/`useMutation` calls automatically get the configured defaults — screens never need to set `staleTime`/`gcTime` per query
- Tab-switch caching: switching to a tab with cached data within 2 min shows data instantly with no spinner (Phase 2 SC4 verification target)
- Reopen-app refetch: backgrounding the app and reopening within 5 min triggers refetch via the AppState/focusManager bridge

**No blockers.** Provider runtime substrate is complete and downstream-ready.

## Self-Check: PASSED

All claimed files exist on disk:
- `theme/role-theme.ts` — FOUND
- `providers/role-theme-provider.tsx` — FOUND
- `providers/query-provider.tsx` — FOUND
- `hooks/use-role.ts` — FOUND
- `app/_layout.tsx` — FOUND
- `.planning/phases/02-design-foundations/02-02-providers-and-query-SUMMARY.md` — FOUND

All claimed commits exist in git history:
- `b84aa62` (Task 1) — FOUND
- `13262ef` (Task 2) — FOUND
- `4c15317` (Task 3) — FOUND

---
*Phase: 02-design-foundations*
*Completed: 2026-04-26*
