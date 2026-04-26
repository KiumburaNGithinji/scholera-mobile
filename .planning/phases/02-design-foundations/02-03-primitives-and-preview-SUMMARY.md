---
phase: 02-design-foundations
plan: 03
subsystem: ui
tags: [primitives, design-system, react-native, nativewind, lucide-react-native, reanimated, accessibility, expo-router, role-theming]

# Dependency graph
requires:
  - phase: 02-design-foundations
    plan: 01
    provides: Tailwind utility classes (bg-canvas, bg-surface, text-fg-primary, text-fg-muted, border-border-subtle, bg-accent, text-accent, border-accent, bg-destructive, bg-success, bg-warning + alpha modifiers like bg-accent/10, border-warning/30); fontFamily.sans (Inter 400) + fontFamily.sans-semibold (Inter 600); theme/tokens.ts hex strings for icon color props
  - phase: 02-design-foundations
    plan: 02
    provides: RoleThemeProvider component (vars()-injected --color-accent CSS var); roleThemes map; QueryProvider mounted at root; useRole hook stub
  - phase: 01-scaffold
    plan: 03
    provides: types/app.types.ts Role union; @/ path alias; lucide-react-native@^1.11.0; react-native-reanimated@~4.1.1 (SDK 54 native); Expo Router file-based routing; SafeAreaProvider
provides:
  - 7 UI primitives at components/ui/{button,card,chip,list-row,empty-state,skeleton,error-view}.tsx — every downstream screen consumes these instead of raw RN <View>/<Text>/<Pressable>
  - components/ui/index.ts barrel re-exports all 7 primitives so consumers `import { Button, Card, ... } from '@/components/ui'`
  - 4-state contract enforced at primitive layer: Pending → Skeleton, Error → ErrorView, Empty → EmptyState, Success → composition
  - Visual smoke test at app/dev/preview.tsx (route scholera://dev/preview) — all 7 primitives × 3 role themes rendered side-by-side; satisfies Phase 2 SC2 + SC3 verification
  - 2-weight typography contract honored across the design system (font-sans + font-sans-semibold only; Chip FLAG resolved)
  - Reanimated shimmer pattern with reduced-motion fallback (useSharedValue opacity loop + AccessibilityInfo subscription)
affects: [03-auth-routing, 04-admin-experience, 05-professor-experience, 06-student-experience, 07-shared-and-deep-linking, 08-polish-audit]

# Tech tracking
tech-stack:
  added: []  # No new deps — lucide-react-native, react-native-reanimated, react-native, nativewind already in package.json from Phase 1 + Plan 01
  patterns:
    - "forwardRef on primitives whose ref-forwarding makes sense (Button, Card) — composition-friendly for Phase 3 form libraries (react-hook-form Controller)"
    - "Discriminated variant maps (Record<ButtonVariant, string>) for Tailwind class lookup — exhaustive types catch missing variants at compile time"
    - "Pressable ref typed as Ref<View> — RN PressableProps does NOT expose 'ref' member; standard pattern for ref-forwarding into Pressable"
    - "isPending vs disabled separation on Button — both block onPress, but isPending swaps content for ActivityIndicator and sets accessibilityState.busy=true"
    - "Reanimated useSharedValue + useAnimatedStyle opacity loop — single shared value drives shimmer; useEffect re-evaluates on reducedMotion change"
    - "AccessibilityInfo.isReduceMotionEnabled + reduceMotionChanged subscription — single hook (useReducedMotion) returns boolean, subscribed for live OS-setting changes"
    - "DimensionValue type for SkeletonProps width/height — RN's official type for number | 'auto' | `${number}%`; Reanimated v4 strict style types require unknown-cast at the View boundary"
    - "Friendly error UX — ErrorView uses NEUTRAL canvas + destructive-tinted icon container only; screen never turns red (per UI-SPEC: errors should feel friendly not alarming)"
    - "Dev-only error detail behind __DEV__ flag — production users never see ENOTFOUND/timeout/etc; developers see it during reproduction"
    - "Composition over branching: EmptyState and ErrorView both compose Button rather than re-implementing CTA logic"
    - "Per-role wrapper preview pattern — same showcase tree rendered N times, each wrapped in a different RoleThemeProvider; visual diff proves runtime CSS-var swap works"

key-files:
  created:
    - "components/ui/button.tsx"
    - "components/ui/card.tsx"
    - "components/ui/chip.tsx"
    - "components/ui/list-row.tsx"
    - "components/ui/empty-state.tsx"
    - "components/ui/skeleton.tsx"
    - "components/ui/error-view.tsx"
    - "components/ui/index.ts"
    - "app/dev/preview.tsx"
  modified: []

key-decisions:
  - "Chip uses font-sans (Inter 400) NOT font-medium (Inter 500) — UI-SPEC FLAG resolution: chip MUST stay within the declared 2-weight typography contract (400 + 600). Verification grep `! grep -q font-medium components/ui/chip.tsx` passes."
  - "Reanimated v4 (not v3) is what's installed (per Phase 1 Plan 03 SUMMARY) — useSharedValue/useAnimatedStyle/withRepeat/withTiming/Easing API is stable across both versions; no version-specific code needed. Only divergence: v4's stricter style types reject string widths, requiring an unknown-cast on the dimension style object."
  - "Pressable ref typed via Ref<View> not PressableProps['ref'] — current RN typings don't expose a 'ref' member on PressableProps. Verified: tsc clean."
  - "Skeleton dimension style cast through unknown — Reanimated v4 style types only accept number | `${number}%` | 'auto'; SkeletonProps exposes RN's DimensionValue at the public API and casts at the Animated.View boundary so callers get the friendly type while runtime accepts strings/percentages fine."
  - "EmptyState and ErrorView compose Button rather than custom CTAs — keeps button styling/a11y/behavior in one place; satisfies UI-SPEC EmptyState action signature `{ label, onPress }`."
  - "Skeleton presets shipped (SkeletonText, SkeletonHeading, SkeletonCard, SkeletonListRow) — downstream screens consume the preset matching their content shape (UI-SPEC line 386-391); raw <Skeleton> only used when none of the presets fit."
  - "ErrorView defaults are LITERAL UI-SPEC copy: 'Something went wrong' / 'Please check your connection and try again.' / 'Try again' — satisfies copywriting contract."
  - "Preview screen renders the showcase 3 times stacked vertically (not 3 columns) — phone-friendly; horizontal columns would require horizontal scroll which obscures the comparison."
  - "Outside-provider Chip label={role} variant='accent' (above each section) intentionally uses default --color-accent (student sage) — comparing it against the inside-provider Chip proves the swap is active."

patterns-established:
  - "Primitive authoring discipline: Single .tsx file per primitive, strict prop types, discriminated variant maps, forwardRef where meaningful, exhaustive a11y props (accessibilityRole + accessibilityState)"
  - "4-state contract for downstream screens: if isPending → <SkeletonX>, if isError → <ErrorView onRetry={refetch}>, if data.length === 0 → <EmptyState>, else success render"
  - "Reduced-motion responsibility lives at the primitive layer (Skeleton) — downstream screens never check AccessibilityInfo themselves"
  - "Visual verification screen for design-system phases: render all primitives × all theme variants on one route, manually scroll to verify"

requirements-completed: [UI-01, UI-02]

# Metrics
duration: 3min
completed: 2026-04-26
---

# Phase 2 Plan 3: Primitives and Preview Summary

**7 UI primitives (Button, Card, Chip, ListRow, EmptyState, Skeleton, ErrorView) ship in components/ui/, barrel-exported, with shimmer + reduced-motion fallback on Skeleton; visual smoke test at scholera://dev/preview renders all 7 in admin/professor/student RoleThemeProvider sections — the steel/clay/sage swap is the runtime proof Phase 2 SC2 + SC3 are satisfied.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-26T03:01:13Z
- **Completed:** 2026-04-26T03:04:53Z
- **Tasks:** 3
- **Files created:** 9 (7 primitive .tsx + components/ui/index.ts barrel + app/dev/preview.tsx)
- **Files modified:** 0

## Accomplishments

- **7 UI primitives** at `components/ui/`: Button (4 variants × 3 sizes + isPending/disabled + lucide icon slots), Card (default/elevated × sm/md/lg padding + optional onPress), Chip (4 variants + 3 status sub-states + selected + optional icon + optional onPress), ListRow (title/subtitle + leftIcon OR leftAvatarUrl + trailing slot + auto-chevron + destructive variant), EmptyState (64×64 icon container + title + optional description + optional CTA composing Button), Skeleton + 4 presets (Skeleton/SkeletonText/SkeletonHeading/SkeletonCard/SkeletonListRow with Reanimated shimmer + reduced-motion fallback), ErrorView (friendly destructive-tinted AlertCircle + UI-SPEC default copy verbatim + optional Try-again Button + dev-only technical detail)
- **Barrel export** at `components/ui/index.ts` re-exports all 7 primitives via `export *` — downstream `import { Button, Card, Chip, ListRow, EmptyState, SkeletonCard, SkeletonListRow, ErrorView } from '@/components/ui'` works
- **Chip FLAG resolved** — uses `font-sans` (Inter 400) NOT `font-medium` (Inter 500); honors the 2-weight contract; verification grep `! grep -q "font-medium" components/ui/chip.tsx` passes
- **Reanimated shimmer wired** — `useSharedValue(0.5)` + `withRepeat(withTiming(1, 1500ms easing-in-out), -1, mirrored)` opacity loop driven by useAnimatedStyle; `AccessibilityInfo.isReduceMotionEnabled()` + `reduceMotionChanged` subscription via custom `useReducedMotion` hook switches to static opacity 0.6 when reduced motion is on
- **Preview screen at `app/dev/preview.tsx`** — reachable as `scholera://dev/preview` via Expo Router file-based routing; renders header + three vertical sections (admin, professor, student); each section wrapped in `<RoleThemeProvider role={role}>` containing the same `<PrimitivesShowcase>` (Button × 7 variations / Card default+elevated / Chip × 7 variants / ListRow × 3 / EmptyState w/ action / SkeletonCard / SkeletonListRow / ErrorView w/ retry+technical); same Tailwind classes resolve to steel/clay/sage per section
- **`tsc --noEmit` clean** after all 3 tasks — 0 type errors anywhere in the project

## Task Commits

Each task was committed atomically:

1. **Task 1: Author 4 structural primitives + barrel** — `6b85792` (feat)
2. **Task 2: Author 3 state primitives + complete barrel** — `9f504be` (feat)
3. **Task 3: Author preview screen** — `9608da3` (feat)

**Plan metadata commit:** to be added by final commit step (covers SUMMARY.md, STATE.md, ROADMAP.md, REQUIREMENTS.md).

## Files Created/Modified

- **`components/ui/button.tsx` (CREATED)** — Button primitive with `forwardRef<View, ButtonProps>`. 4 variants (primary/secondary/ghost/destructive) × 3 sizes (sm/md/lg). `disabled` (opacity-40, no onPress) and `isPending` (ActivityIndicator inline + accessibilityState.busy=true) separated cleanly. Spinner color tracks variant text color. Optional `leftIcon`/`rightIcon` lucide props; optional `fullWidth`. `accessibilityRole="button"` + `accessibilityState={{ disabled, busy: isPending }}` baked in. Min touch target 44px on default size.
- **`components/ui/card.tsx` (CREATED)** — Card primitive with `forwardRef<View, CardProps>`. `default` (bg-surface + rounded-xl + border-border-subtle) and `elevated` (bg-surface + rounded-2xl + shadow-md, no border) variants. `padding` sm/md/lg → p-3/p-4/p-5. When `onPress` provided, renders Pressable with pressed-opacity feedback; otherwise plain View.
- **`components/ui/chip.tsx` (CREATED)** — Chip primitive with `neutral`/`accent`/`topic`/`status` variants. Status sub-states (`not-started`/`in-progress`/`complete`) render correct semantic colors via `bg-warning/10 border-warning/30 text-warning` and `bg-success/10 border-success/30 text-success` alpha-modifier classes from Plan 01. `selected` overrides to `bg-accent border-accent text-white` regardless of variant. Optional lucide `icon` prop at 12px. Optional `onPress` swaps wrapper to Pressable with `accessibilityRole="button"`. **Uses `font-sans` (Inter 400) NOT `font-medium`** — UI-SPEC FLAG resolution.
- **`components/ui/list-row.tsx` (CREATED)** — ListRow primitive with `min-h-[56px]` (comfortable touch target with subtitle). Left slot = `leftAvatarUrl` (32×32 rounded-full) OR `leftIcon` (24×24 lucide) — first wins if both provided. Title (`text-base font-sans`) clamped to 1 line; subtitle (`text-xs font-sans text-fg-muted mt-0.5`) clamped to 2 lines. `trailing` ReactNode slot (chip, button, anything). Chevron auto-shows when `onPress` set (overridable via `showChevron`). `destructive` flips title color to text-destructive and tints leftIcon. Pressable variant feedback = white background flash on press.
- **`components/ui/empty-state.tsx` (CREATED)** — EmptyState primitive. Centered (`flex-1 items-center justify-center px-6 py-12`). 64×64 icon container (`bg-surface rounded-full`) with 24px icon in `text-fg-muted`. Title (`text-xl font-sans-semibold`); optional description (`text-base font-sans text-fg-muted text-center max-w-[280px]`); optional `action: { label, onPress }` rendered as `<Button variant="primary" size="md">`.
- **`components/ui/skeleton.tsx` (CREATED)** — Skeleton primitive + 4 presets. Custom `useReducedMotion` hook subscribes to `AccessibilityInfo.isReduceMotionEnabled()` + `reduceMotionChanged` event for live OS-setting changes. Reanimated opacity loop: `withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true)` (true = mirrored back-and-forth). When reduced motion is on, opacity locked to 0.6 (no animation). Presets: `SkeletonText({ lines })` stacks N 16px-tall blocks (last line at 70% width if multi-line), `SkeletonHeading` (24px tall, 60% wide), `SkeletonCard` (full card with heading + 2 text lines inside), `SkeletonListRow` (matches ListRow geometry — 24×24 circle + 2 stacked lines).
- **`components/ui/error-view.tsx` (CREATED)** — ErrorView primitive. Friendly destructive-tinted AlertCircle (`bg-destructive/10 rounded-full` 64×64 container, AlertCircle 24px in destructive color). Defaults to UI-SPEC copy verbatim: title "Something went wrong", description "Please check your connection and try again.", retry label "Try again". When `onRetry` provided, renders `<Button variant="secondary" size="md">Try again</Button>`. When `__DEV__ && technical`, renders the raw error string in a small muted footer for developer debugging — production users never see it.
- **`components/ui/index.ts` (CREATED)** — Barrel `export *` for all 7 primitives. Consumers import the entire surface via one path: `import { Button, Card, Chip, ListRow, EmptyState, Skeleton, SkeletonText, SkeletonHeading, SkeletonCard, SkeletonListRow, ErrorView } from '@/components/ui'`.
- **`app/dev/preview.tsx` (CREATED)** — Visual smoke test screen. Header section ("Phase 2 Preview" + subtitle). `ROLES = ['admin', 'professor', 'student']` mapped into three vertical sections, each: section header (capitalized role name + outside-provider accent Chip showing default sage) + `<RoleThemeProvider role={role}>` wrapping `<PrimitivesShowcase>`. The showcase renders all Button variants (primary/secondary/ghost/destructive) + state demos (disabled, isPending, with-icon Plus); both Card variants; all 7 Chip variants; 3 ListRow demos inside a Card group (icon, trailing, destructive); EmptyState with action; SkeletonCard + SkeletonListRow × 2 inside a Card; ErrorView with onRetry + technical. Bounded heights on EmptyState/ErrorView (240px) so they fit in the column without absorbing infinite parent height.

## Verbatim Match Confirmation

| Contract | Source | Implementation | Match |
|----------|--------|----------------|-------|
| Chip FLAG (font-sans not font-medium) | PLAN line 28, 408 | `text-xs font-sans ${v.text}` | EXACT |
| Button variants | UI-SPEC line 174 | primary/secondary/ghost/destructive | EXACT |
| Button sizes | UI-SPEC line 175 | sm (36) / md (44) / lg (52) | EXACT |
| Card variants | UI-SPEC line 222 | default/elevated | EXACT |
| Chip variants | UI-SPEC line 248 | neutral/accent/topic/status | EXACT |
| ChipStatus sub-states | UI-SPEC line 249 | not-started/in-progress/complete | EXACT |
| ListRow min-height | UI-SPEC line 305 | min-h-[56px] | EXACT |
| EmptyState icon container | UI-SPEC line 336 | w-16 h-16 rounded-full bg-surface | EXACT |
| EmptyState title size | UI-SPEC line 339 | text-xl font-sans-semibold | EXACT |
| ErrorView defaults | UI-SPEC line 405-407, 419 | "Something went wrong" / "Please check your connection and try again." / "Try again" | EXACT |
| Skeleton shimmer duration | PLAN line 651 | withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }) | EXACT |
| Skeleton reduced-motion fallback | PLAN line 646-648 | opacity.value = 0.6 (no withRepeat) | EXACT |
| Preview ROLES | PLAN line 837 | ['admin', 'professor', 'student'] | EXACT |
| RoleThemeProvider mount pattern | PLAN line 940 | `<RoleThemeProvider role={role}>` per section | EXACT |

## Decisions Made

1. **Chip honors 2-weight typography contract.** The original UI-SPEC line 273 specified `font-medium` (Inter 500) for chip text, but this exceeds the declared 2-weight contract (UI-SPEC line 63: "two weights only — 400 and 600"). The PLAN explicitly resolved this FLAG (line 86) by switching Chip to `font-sans` (Inter 400). The grep check `! grep -q "font-medium" components/ui/chip.tsx` passes, locking in the contract.
2. **Reanimated v4 (installed) is API-compatible with the v3 shared-value pattern in the plan.** Phase 1 SUMMARY confirmed `react-native-reanimated@~4.1.1` is installed (SDK 54 native), not v3 as STACK.md predicted. The plan's note (line 777) was correct — the API used here (useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing) is stable across both versions. The only v4 wrinkle: stricter style types require an unknown-cast on the dimension style object (auto-fixed during Task 2).
3. **Pressable ref typed via Ref<View>** — RN's PressableProps does not expose a 'ref' member. Standard pattern is to type the forwarded ref as `Ref<View>` since Pressable's underlying host is a View. Auto-fixed during Task 1.
4. **Skeleton width/height typed as RN's DimensionValue, cast through unknown at the Animated.View boundary.** Reanimated v4's style types only accept `number | `${number}%` | 'auto'` for dimensions, but RN's runtime accepts arbitrary strings. Public API exposes the friendly DimensionValue type for callers; the cast happens once at the Animated.View prop boundary so the entire surface area stays type-safe.
5. **EmptyState and ErrorView compose Button rather than custom CTAs.** Two benefits: (a) button styling/a11y/behavior stays in one place; (b) downstream maintenance — change Button styling once, every empty/error state inherits. UI-SPEC EmptyState action signature `{ label, onPress }` deliberately matches Button's primary inputs.
6. **Skeleton presets shipped alongside the raw primitive.** Per UI-SPEC line 386-391 ("Lists render `<SkeletonListRow />` × 5; Cards render `<SkeletonCard />`; Detail screens render `<SkeletonHeading />` + `<SkeletonText lines={3} />`"). Presets are the consumer-facing API; raw `<Skeleton>` is the escape hatch.
7. **ErrorView uses NEUTRAL surface with destructive accent only on the icon container.** Per UI-SPEC line 423: "errors should feel friendly (rubric: 'errors should surface to the user in a friendly way'), not alarming." Screen background stays canvas-warm-cream; only the small icon circle is destructive-tinted.
8. **Preview screen renders 3 vertical sections, not 3 columns.** A horizontal 3-column layout would require horizontal scroll (phone-hostile). Vertical stacking lets the user scroll naturally and visually compare role colors as they pass each section.
9. **Outside-provider Chip in each section header** — `<Chip label={role} variant="accent" />` rendered ABOVE each `<RoleThemeProvider>` intentionally uses the default `--color-accent` (student sage from global.css :root). Comparing it against the inside-provider Chip with the same variant proves the runtime CSS-var swap is active. If both chips render the same color, the swap isn't working.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pressable ref typed as Ref<View> instead of PressableProps['ref']**
- **Found during:** Task 1 (Button primitive)
- **Issue:** Plan's verbatim contents typed the forwarded ref as `ref as PressableProps['ref']`, but RN's current type definitions do not expose a `ref` member on PressableProps. `npx tsc --noEmit` failed with `TS2339: Property 'ref' does not exist on type 'PressableProps'`.
- **Fix:** Imported `Ref` type from 'react'; changed ref cast to `ref as Ref<View>` (Pressable's underlying host is a View, so this is the correct ref target).
- **Files modified:** `components/ui/button.tsx`
- **Verification:** `npx tsc --noEmit` exits 0; ref forwarding still works (downstream consumers can pass refs to Button and they reach the underlying Pressable).
- **Committed in:** `6b85792` (Task 1 commit)

**2. [Rule 1 - Bug] Skeleton dimension style cast through unknown for Reanimated v4 strict typing**
- **Found during:** Task 2 (Skeleton primitive)
- **Issue:** Plan typed `SkeletonProps.width/height` as `number | string`, but Reanimated v4's `Animated.View` style types only accept `number | `${number}%` | 'auto'` for width/height. `npx tsc --noEmit` failed with `TS2322: Type 'string' is not assignable to type 'number | `${number}%` | 'auto''`.
- **Fix:** (a) Imported RN's `DimensionValue` type and used it for `SkeletonProps.width/height` (public API now matches RN's official dimension type — `number | 'auto' | `${number}%` | null`); (b) Cast the dimension style object at the Animated.View boundary via `as unknown as { width?: number; height?: number }` — runtime accepts strings/percentages fine, this just satisfies the v4 stricter type checker.
- **Files modified:** `components/ui/skeleton.tsx`
- **Verification:** `npx tsc --noEmit` exits 0; SkeletonText/SkeletonHeading/SkeletonCard/SkeletonListRow presets still pass `'70%'` / `'60%'` / `'40%'` / `'100%'` strings without errors.
- **Committed in:** `9f504be` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — type-system bugs in plan's verbatim contents, neither was a logic/security issue)
**Auto-fixed bugs:** 2
**Rule 4 escalations:** 0
**Authentication gates:** 0
**Impact on plan:** None — both fixes are pure type-correctness adjustments that preserve runtime behavior exactly. The plan's intent (ref-forwarding into Pressable, flexible dimension prop on Skeleton) is honored; only the type annotations needed adjustment for current RN + Reanimated v4 typings.

## Issues Encountered

None beyond the 2 type-correctness deviations documented above (both auto-fixed inline during their respective tasks).

## Cross-check Verification (post-task gate from PLAN.md)

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| `components/ui/button.tsx` exists | yes | yes | PASS |
| `components/ui/card.tsx` exists | yes | yes | PASS |
| `components/ui/chip.tsx` exists | yes | yes | PASS |
| `components/ui/list-row.tsx` exists | yes | yes | PASS |
| `components/ui/empty-state.tsx` exists | yes | yes | PASS |
| `components/ui/skeleton.tsx` exists | yes | yes | PASS |
| `components/ui/error-view.tsx` exists | yes | yes | PASS |
| `components/ui/index.ts` `export *` count | 7 | 7 | PASS |
| `app/dev/preview.tsx` exists | yes | yes | PASS |
| Chip `font-medium` absent | absent | absent | PASS (FLAG resolved) |
| Chip `font-sans` present | present | present | PASS |
| Skeleton `useSharedValue` present | present | present | PASS |
| Skeleton `AccessibilityInfo.isReduceMotionEnabled` present | present | present | PASS |
| ErrorView `Try again` literal present | present | present | PASS |
| ErrorView `__DEV__` guard on technical detail | present | present | PASS |
| Preview `ROLES: Role[] = ['admin', 'professor', 'student']` | present | present | PASS |
| Preview `RoleThemeProvider role={role}` mount | present | present | PASS |
| Preview imports all 7 primitives from `@/components/ui` | present | present | PASS |
| `npx tsc --noEmit` exit code | 0 | 0 | PASS |

All 19 checks pass.

## How to Manually Verify SC2 (Role Swap Visual Proof)

```bash
cd /Users/Kiumbura/Projects/scholera-mobile
npx expo start
# In Expo Go: tap the URL in terminal output, or use deep link scholera://dev/preview
```

**Expected visual:**
1. Top header: "Phase 2 Preview" + "All 7 primitives × 3 role themes" subtitle
2. **Admin section** (label "Admin" + sage outside chip): primary Buttons + selected Chip + EmptyState action button = **steel grey-blue** (`#64748B`)
3. **Professor section** (label "Professor" + sage outside chip): primary Buttons + selected Chip + EmptyState action button = **clay terracotta** (`#CC785C`)
4. **Student section** (label "Student" + sage outside chip): primary Buttons + selected Chip + EmptyState action button = **sage green** (`#86A17C`)
5. Each section's outside-provider accent Chip stays **sage** (the default --color-accent in :root) — confirms the inside-provider chips are color-overridden by RoleThemeProvider, not by some prop bypass

If all three sections render with the SAME color, the swap is broken. If they render with DIFFERENT colors as described, SC2 is satisfied.

## Phase 2 Success Criteria Mapping

- **SC1 (token system):** Plan 01 — DONE
- **SC2 (RoleThemeProvider role swap visually verifiable):** Plan 02 (built provider) + Plan 03 (visual proof) — **DONE** (run `npx expo start` → `/dev/preview` → see 3 different accent colors per section)
- **SC3 (all 7 primitives render):** Plan 03 (this plan) — **DONE** (verified by tsc + preview screen import + render)
- **SC4 (QueryClient defaults):** Plan 02 — DONE
- **SC5 (every list uses EmptyState, every async uses Skeleton):** primitives shipped this plan; downstream phases (4-8) consume them; Phase 8 audit enforces

## User Setup Required

None — no external service configuration. All deps (`lucide-react-native@^1.11.0`, `react-native-reanimated@~4.1.1`, `nativewind@^4.2.3`) already in `package.json` from Phase 1.

## Next Phase Readiness

**Plan 03 is the FINAL plan in Phase 02-design-foundations.** All Phase 2 deliverables are now on disk and downstream-ready.

**Phase 3 (auth-routing) inherits:**
- All 7 primitives ready for sign-in screen composition: `<Button variant="primary" size="lg" onPress={signIn} isPending={mutation.isPending}>Sign in</Button>` works as-is; `<ErrorView onRetry={refetch} />` renders auth errors; `<EmptyState>` not needed pre-auth
- Button's `isPending` prop seamlessly bridges to `mutation.isPending` from TanStack Query (no extra wrapper needed)
- ErrorView's `onRetry` slot directly accepts `refetch` from useQuery results
- `RoleThemeProvider` ready to mount in role group layouts: `app/(admin)/_layout.tsx` wraps the admin tab tree; `app/(professor)/_layout.tsx` and `app/(student)/_layout.tsx` follow the same pattern
- `useRole` stub (Plan 02) gets its body swapped: `return profile.role` from AuthContext — zero consumer-side changes

**Phases 4-8 inherit (4-state contract):**
- Pending state → `<SkeletonListRow />` × 5 for lists, `<SkeletonCard />` for card layouts, `<SkeletonHeading /> + <SkeletonText lines={3} />` for detail screens
- Error state → `<ErrorView onRetry={refetch} technical={error.message} />`
- Empty state → `<EmptyState icon={Inbox} title="No {plural noun} yet" description="..." action={...} />`
- Success state → `<FlatList>` of `<ListRow>` instances OR composition of `<Card>` + `<Chip>` + custom content
- Mutation feedback → `<Button isPending={mutation.isPending}>` (NOT `<ErrorView>` — ErrorView is for whole-screen failures)
- Auto-chevron on `<ListRow onPress={navigate}>` — Phases never need to add chevrons manually
- Friendly tone — never alarm; semantic destructive used only for true destructive actions (sign out confirmation, delete buttons), errors-as-information use ErrorView's neutral surface

**Phase 8 audit checklist (downstream contract enforcement):**
- No screen reaches for raw `<View>` / `<Text>` / `<Pressable>` for design surfaces (composition only)
- Every async screen has the 4-state contract wired
- No spinners on initial fetch (skeletons only); spinners reserved for inline button pending / pull-to-refresh / pagination
- Chip text never uses `font-medium` (FLAG fix stays locked)
- Accent color appears only in the UI-SPEC reserved-for list (anti-rainbow rule)

**No blockers.** Phase 02-design-foundations is complete.

## Self-Check: PASSED

All claimed files exist on disk:
- `components/ui/button.tsx` — FOUND
- `components/ui/card.tsx` — FOUND
- `components/ui/chip.tsx` — FOUND
- `components/ui/list-row.tsx` — FOUND
- `components/ui/empty-state.tsx` — FOUND
- `components/ui/skeleton.tsx` — FOUND
- `components/ui/error-view.tsx` — FOUND
- `components/ui/index.ts` — FOUND
- `app/dev/preview.tsx` — FOUND
- `.planning/phases/02-design-foundations/02-03-primitives-and-preview-SUMMARY.md` — FOUND

All claimed commits exist in git history:
- `6b85792` (Task 1) — FOUND
- `9f504be` (Task 2) — FOUND
- `9608da3` (Task 3) — FOUND

---
*Phase: 02-design-foundations*
*Completed: 2026-04-26*
