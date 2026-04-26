---
phase: 04-admin-experience
plan: 04
subsystem: ui
tags: [expo-router, react-navigation-7, dynamic-routes, stack, tanstack-query, skeleton, drill-down]

# Dependency graph
requires:
  - phase: 04-admin-experience plan 01
    provides: SECURITY DEFINER is_admin() + admin-read-all RLS on profiles (so professor reads return real rows for the detail screens)
  - phase: 04-admin-experience plan 02
    provides: useAdminDepartmentDetail and useAdminProfessorDetail typed hooks (id|undefined contract, enabled-flag gating, full Profile/Course shapes)
  - phase: 02-design-foundations plan 03
    provides: Card, ListRow, EmptyState, ErrorView, SkeletonCard, SkeletonHeading, SkeletonListRow, SkeletonText primitives plus barrel export at @/components/ui
provides:
  - app/(admin)/departments/_layout.tsx — Stack layout with cream-canvas header for the departments subtree
  - app/(admin)/departments/[id].tsx — Department detail screen (dynamic header title + professors list)
  - app/(admin)/professors/_layout.tsx — Mirror Stack layout for the professors subtree
  - app/(admin)/professors/[id].tsx — Professor detail screen (profile Card + courses list)
affects: [04-03 dashboard-and-departments (will router.push into these routes), 05-professor-experience (mirror dynamic-route + Stack.Screen pattern), 06-student-experience (mirror dynamic-route + Stack.Screen pattern)]

# Tech tracking
tech-stack:
  added: []  # No new dependencies — purely composed existing primitives + hooks
  patterns:
    - "Nested Stack pattern for dynamic detail routes: tiny _layout.tsx with screenOptions sets header style once, [id].tsx calls <Stack.Screen options={{ title }}> for per-screen dynamic titles"
    - "React Navigation 7 header style: headerBackButtonDisplayMode: 'minimal' replaces the removed headerBackTitleVisible flag — minimal back arrow with no preceding-screen title text"
    - "Header title fallback pattern: const headerTitle = data?.x.name ?? 'Generic Label' — generic label flashes during pending, real name swaps in once query resolves"
    - "Defensive null coercion at primitive boundary: prof.bio ?? undefined and prof.avatar_url ?? undefined to satisfy ListRow's optional-string prop typing (nulls would type-error)"
    - "Drill-down vs terminal screen: department detail uses ListRow onPress (chevron auto-renders) → professor detail uses ListRow showChevron={false} (no onPress) → admin viewing-only per ADMIN-03"

key-files:
  created:
    - app/(admin)/departments/_layout.tsx
    - app/(admin)/departments/[id].tsx
    - app/(admin)/professors/_layout.tsx
    - app/(admin)/professors/[id].tsx
  modified: []

key-decisions:
  - "headerBackButtonDisplayMode: 'minimal' (RN Navigation 7) replaces the removed headerBackTitleVisible flag — kept the cleaner back-arrow-only iOS look intended by the spec"
  - "Identical Stack screenOptions across the two folder layouts (departments + professors) — visual symmetry across the drill-down chain matters more than DRY abstraction for two callers"
  - "Generic 'Department' / 'Professor' header fallback during pending — sensible during the brief loading flash; staleTime 2m means cached navigation back to a previously-visited screen never shows the fallback"
  - "Avatar fallback uses GraduationCap icon in a w-16 h-16 gray circle — same dimensions as the Image branch so layout doesn't shift when data resolves"
  - "Course rows render with showChevron={false} and no onPress — admin SEES courses but doesn't drill in (ADMIN-03 requires viewing only); the absence of a tap target is itself the design statement"
  - "Course subtitle prefers code over description (`code ?? description ?? undefined`) — code is short and grep-friendly (CS101); description is prose better suited for the course's own future detail screen"

patterns-established:
  - "Detail-screen file structure: import primitives + hook → useLocalSearchParams<{id:string}>() → call hook(id) → const headerTitle = data?.x.name ?? 'Fallback' → <Stack.Screen options={{title:headerTitle}}> at TOP of return, ABOVE the 4-state branch — header sets regardless of which state renders"
  - "4-state branching at the ScrollView level: error (?) → pending OR !data (?) → success — single-rooted JSX with no early returns keeps the Stack.Screen mounting consistent"
  - "Bottom h-12 spacer inside ScrollView for visual breathing room above tab bar / safe area — established by Plan 04-03 dashboard, mirrored here"
  - "Folder-level _layout.tsx for nested route stacks: when a subset of routes needs different header behavior than the parent (admin's headerShown:false), insert a sub-folder + _layout.tsx with overriding screenOptions"

requirements-completed: [ADMIN-02, ADMIN-03]

# Metrics
duration: 2min
completed: 2026-04-26
---

# Phase 04 Plan 04: Admin Detail Screens Summary

**Two dynamic-route admin detail screens (`/(admin)/departments/[id]` + `/(admin)/professors/[id]`) with nested Stack layouts, dynamic header titles, full 4-state coverage, and a drill-down → terminal-view distinction that completes ADMIN-02 and ADMIN-03 end-to-end.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-26T05:14:03Z
- **Completed:** 2026-04-26T05:16:46Z
- **Tasks:** 4 of 4
- **Files modified:** 4 (all created)

## Accomplishments

- Two dynamic-route detail screens shipped: department detail (header = department name, body = professors list) + professor detail (header = display_name, body = profile Card + courses list)
- Two folder-level Stack layouts established with React Navigation 7 conventions (`headerBackButtonDisplayMode: 'minimal'` — the legacy `headerBackTitleVisible` flag is removed in v7 and was avoided)
- 4-state contract enforced on both screens: SkeletonHeading/SkeletonText/SkeletonListRow + SkeletonCard variants (pending), ErrorView with onRetry (error), EmptyState with contextual icons + copy (empty), composed Card/ListRow rendering (success)
- Admin drill-down now navigable end-to-end: `(tabs) dashboard → /(admin)/departments/[id] → /(admin)/professors/[id]` with logical back-stack via Expo Router defaults — no manual hardware back handling
- Terminal-view design encoded structurally: course ListRows render `showChevron={false}` and have no `onPress`, so admin sees the data but the UI itself signals "no further drill-down" — matches ADMIN-03 viewing-only contract
- `npx tsc --noEmit` exits **0** across the entire project after all 4 commits

## Task Commits

Each task committed atomically:

1. **Task 1: departments/_layout.tsx** — `1f0166c` (feat)
2. **Task 2: departments/[id].tsx** — `34d6a4d` (feat)
3. **Task 3: professors/_layout.tsx** — `35bd53e` (feat)
4. **Task 4: professors/[id].tsx** — `4635697` (feat)

**Plan metadata commit:** appended at end (SUMMARY.md, STATE.md, ROADMAP.md)

## Files Created

- `app/(admin)/departments/_layout.tsx` — `<Stack screenOptions={...} />` with `headerShown: true`, Inter SemiBold title, `tokens.colors.canvas` header bg, `headerBackButtonDisplayMode: 'minimal'`
- `app/(admin)/departments/[id].tsx` — Department detail; consumes `useAdminDepartmentDetail(id)`; renders dynamic Stack.Screen title + 4-state body (description + Professors heading + ListRow per professor with avatar/bio/display_name)
- `app/(admin)/professors/_layout.tsx` — Mirror of departments/_layout.tsx (intentional duplication for visual symmetry across the drill-down)
- `app/(admin)/professors/[id].tsx` — Professor detail; consumes `useAdminProfessorDetail(id)`; renders dynamic Stack.Screen title + elevated profile Card (avatar w/ GraduationCap fallback, display_name, "Professor" label, optional bio) + Courses section (BookOpen-icon ListRow per course, no chevron, no onPress)

## Routes Added

| Route | Layout | Header Title Source | Navigates To |
|---|---|---|---|
| `/(admin)/departments/[id]` | `app/(admin)/departments/_layout.tsx` (Stack) | `useAdminDepartmentDetail(id).data?.department.name` ?? "Department" | `/(admin)/professors/[id]` |
| `/(admin)/professors/[id]` | `app/(admin)/professors/_layout.tsx` (Stack) | `useAdminProfessorDetail(id).data?.professor.display_name` ?? "Professor" | (none — terminal) |

## Back-Stack Verification

The intended back-stack (per ADMIN-02 / ADMIN-03 success criteria 4) is satisfied automatically by Expo Router's nested-stack defaults:

```
(admin)/(tabs)/index            ← dashboard (Plan 04-03 will populate)
  ↓ router.push('/(admin)/departments/{deptId}')
(admin)/departments/[id]        ← Stack header: "<Department Name>"  + ‹ back arrow
  ↓ router.push('/(admin)/professors/{profId}')
(admin)/professors/[id]         ← Stack header: "<Professor Name>"   + ‹ back arrow
```

Tapping the back arrow on the professor screen returns to the department detail; tapping again returns to the (tabs) dashboard. No manual back-press handling was needed; the parent admin Stack (with `headerShown: false` on the (tabs) group and the new sibling folders inheriting our overriding `headerShown: true`) makes this work out of the box.

## Decisions Made

- **`headerBackButtonDisplayMode: 'minimal'` over the removed `headerBackTitleVisible: false`:** React Navigation 7 (which Expo SDK 54 / expo-router ~4.0 ships with) removed the boolean flag and replaced it with a string union `'default' | 'generic' | 'minimal'`. `'minimal'` is the equivalent of "don't show the previous-screen title next to the chevron" and was already what the plan called for.
- **Identical (not abstracted) Stack screenOptions across the two folder layouts:** Considered factoring out a shared `adminStackScreenOptions` constant. Rejected for two callers — the duplication is intentional symmetry between the drill-down siblings, and any future divergence (e.g., professors layout adding a header `headerRight` action) is one local edit away. Wrong abstraction is more expensive than right duplication.
- **Generic "Department" / "Professor" pending fallback in Stack.Screen title:** The query has staleTime 2m, so warm navigations show the real name immediately. The fallback only flashes on cold loads. Considered showing a SkeletonHeading inside the header — rejected as Stack header titles don't host arbitrary children cleanly across iOS/Android. Generic label is the standard Expo Router pattern.
- **`showChevron={false}` + no `onPress` on course rows:** ADMIN-03 says "the professor's profile showing their assigned courses" — viewing, not interacting. The chevron auto-shows when `onPress` is set; omitting both omits the chevron AND prevents the press affordance. The visual signal "this row is informational, not a tap target" is encoded structurally rather than relying on the user to discover the lack of response.
- **Course subtitle precedence: `code ?? description ?? undefined`:** Most courses have a code (CS101, MATH202) — short, grep-friendly, fits in the subtitle line. Description is prose, often multi-line, doesn't truncate cleanly on a list row. Falling back to description only when code is null preserves information density without sacrificing rhythm.
- **Avatar fallback uses GraduationCap icon (not initials, not blank):** Initials require parsing display_name (which can be null), blank circles look like loading state. GraduationCap conveys "this is a person of academic role" — semantic fallback consistent with the lucide vocabulary used elsewhere (BookOpen for courses, Users for the empty-state).

## Deviations from Plan

None — plan executed exactly as written.

Every file matches the spec verbatim, including:
- Import paths through the `@/components/ui` and `@/hooks/admin` barrels (not individual paths)
- The exact string `headerBackButtonDisplayMode: 'minimal'` (no leftover `headerBackTitleVisible` from earlier plan drafts)
- 4-state branch order (error → pending → success) inside a single ScrollView
- `prof.bio ?? undefined` / `prof.avatar_url ?? undefined` defensive coercion
- Bottom `h-12` spacer
- `showChevron={false}` on course rows

The plan front-loaded every potential pitfall (the React Navigation 7 API change, the optional-string null coercion, the `enabled` flag gating in the hooks, the dynamic Stack.Screen title pattern), and `npx tsc --noEmit` exited 0 on first compile of every file.

## Issues Encountered

None. The two `read_first` cross-references (e.g., Task 2 reading the just-written Task 1 layout to confirm the screenOptions surface; Task 4 mirroring Task 2's structure) made each successive file mostly mechanical.

## Self-Check: PASSED

Verified after writing SUMMARY.md:

- All 4 created files exist on disk (`test -f` for each path)
- All 4 commit hashes present in `git log --oneline -5`: `1f0166c`, `34d6a4d`, `35bd53e`, `4635697`
- Plan verification block (steps 1-7) all green: 6 file/dir existence checks, 2 hook-import checks, 2 Stack.Screen checks, 2 navigation-target checks, 1 terminal-view check, 6 4-state coverage checks
- `npx tsc --noEmit` exits **0** across the entire project (full output empty)
- `grep -rn "headerBackTitleVisible" "app/(admin)/"` returns no matches (success criterion enforced)
- Final admin route tree contains 7 .tsx files: `_layout.tsx`, `(tabs)/_layout.tsx`, `(tabs)/index.tsx`, `departments/_layout.tsx`, `departments/[id].tsx`, `professors/_layout.tsx`, `professors/[id].tsx`

## User Setup Required

None — no external service configuration required. Migration 04 (admin RLS unblock) was applied in Plan 04-01 and is already live in the Supabase project. The hooks consumed here already inherit the QueryClient defaults from Phase 2.

## Next Phase Readiness

**Plan 04-03 (dashboard-and-departments) — last remaining plan in Phase 4:**
- The departments-list section of Plan 04-03 will `router.push('/(admin)/departments/{id}' as never)` into the route this plan created — that route is now live and ready
- The dashboard's StatCard grid is independent of these routes; Plan 04-03 has no further blockers
- After Plan 04-03 ships, run `/gsd:transition` to mark Phase 4 complete in ROADMAP.md and unblock Phase 5/6 (which can run in parallel since they're independent role experiences)

**Phase 5/6 (professor + student experiences):**
- The `app/(admin)/{folder}/_layout.tsx` + `app/(admin)/{folder}/[id].tsx` pattern is the established convention for nested dynamic-route detail screens; Phase 5/6 should mirror it for `/(professor)/courses/[id]` etc.
- The `<Stack.Screen options={{ title: data?.x.name ?? 'Fallback' }}>` pattern for dynamic header titles is the established convention
- React Navigation 7's `headerBackButtonDisplayMode: 'minimal'` is the standard — no `headerBackTitleVisible` anywhere in the codebase

---
*Phase: 04-admin-experience*
*Completed: 2026-04-26*
