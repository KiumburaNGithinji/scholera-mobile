---
phase: 02-design-foundations
plan: 01
subsystem: ui
tags: [nativewind, tailwind, design-tokens, css-vars, inter-font, expo-google-fonts, expo-splash-screen]

# Dependency graph
requires:
  - phase: 01-scaffold
    provides: NativeWind v4 three-point wiring (babel jsxImportSource, metro withNativeWind, global.css import); @expo-google-fonts/inter, expo-font, expo-splash-screen already in package.json; theme/tokens.ts stub; minimal tailwind.config.js with accent + canvas only
provides:
  - global.css :root block with 10 color CSS vars as space-separated RGB triplets (single source of truth for color)
  - tailwind.config.js exposing all 10 color tokens as utility classes via rgb(var(--color-X) / <alpha-value>) pattern (alpha-modifier safe)
  - tailwind.config.js fontFamily bindings for Inter regular + semibold
  - theme/tokens.ts typed const export with colors (incl. 3 role accents), spacing, typography, radius, shadow
  - Tokens type for downstream consumers
  - app/_layout.tsx loads exactly 2 Inter weights (400 + 600) and gates app render on font readiness via splash screen
affects: [02-providers-and-query, 02-primitives-and-preview, 03-auth-routing, 04-admin-experience, 05-professor-experience, 06-student-experience, 07-shared-and-deep-linking, 08-polish-audit]

# Tech tracking
tech-stack:
  added: []  # No new deps — all libs (@expo-google-fonts/inter, expo-font, expo-splash-screen) already in package.json from Phase 1
  patterns:
    - "CSS variable as RGB triplet (space-separated, no commas) — required for Tailwind alpha-modifier composition"
    - "rgb(var(--color-X) / <alpha-value>) Tailwind binding — alpha-safe consumption of CSS vars"
    - "Splash-screen-gated font loading — return null until useFonts resolves to prevent flash of system font"
    - "Hex-string mirror in theme/tokens.ts — type-safe JS access for non-Tailwind contexts (lucide icon color, iOS shadowColor, Reanimated)"
    - "as const assertion on token export — literal type inference (e.g. tokens.colors.canvas is '#FAF9F5' not string)"

key-files:
  created:
    - "theme/tokens.ts (replaced stub)"
  modified:
    - "global.css (added :root token block — was 3 @tailwind directives only)"
    - "tailwind.config.js (extended from 2 colors to 10 + fontFamily bindings)"
    - "app/_layout.tsx (added useFonts + SplashScreen gate)"

key-decisions:
  - "Loaded ONLY Inter_400Regular + Inter_600SemiBold — saves ~250KB cold-start vs loading 500/Medium (per UI-SPEC Open Question 5; Android falls back to system without explicit load)"
  - "borderRadius left empty in tailwind.config.js — Tailwind defaults rounded-md/xl/2xl/full already match radius-sm/md/lg/pill in UI-SPEC"
  - "theme/tokens.ts exports hex strings (not RGB triplets) for JS-side use — better for direct interop with iOS shadowColor and lucide-react-native color prop"
  - "All 3 role accent hex values shipped in tokens.ts (admin steel #64748B, professor clay #CC785C, student sage #86A17C) for Plan 02 RoleThemeProvider to consume via vars()"
  - "global.css :root --color-accent default = student sage (134 161 124) — matches UI-SPEC contract for default before RoleThemeProvider mounts"

patterns-established:
  - "Token authoring: declare in global.css :root → bind in tailwind.config.js → mirror in theme/tokens.ts (3-step process for any new color token)"
  - "Font loading discipline: every weight loaded must justify its bundle cost — type contract maxes at 2 weights"

requirements-completed: [UI-01]

# Metrics
duration: 2min
completed: 2026-04-26
---

# Phase 2 Plan 1: Tokens and Tailwind Summary

**Design token foundation: 10 colors + 8 spacing + 4 type sizes × 2 weights + 4 radii + 2 shadows declared once in global.css :root and theme/tokens.ts, exposed as Tailwind utilities via rgb(var(--color-X) / <alpha-value>); Inter 400 + 600 loaded at root layout with splash-screen-gated rendering.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-26T02:50:55Z
- **Completed:** 2026-04-26T02:52:45Z
- **Tasks:** 3
- **Files modified:** 4 (global.css, tailwind.config.js, theme/tokens.ts, app/_layout.tsx)

## Accomplishments

- **10 color CSS variables** declared in `global.css` as space-separated RGB triplets (canvas, surface, surface-elevated, fg-primary, fg-muted, border-subtle, accent, destructive, success, warning) — single source of truth, alpha-modifier compatible
- **10 Tailwind utility class bindings** in `tailwind.config.js` via `rgb(var(--color-X) / <alpha-value>)` — every CSS var has a 1:1 Tailwind class (verified via diff: `--color-*` set in global.css matches set in tailwind.config.js exactly)
- **Typed token export** (`theme/tokens.ts`) covering 12 colors (incl. 3 role accents: admin steel, professor clay, student sage), 9 spacing values (xs through 4xl + touchTarget 44pt), 4 typography sizes × 2 weights × 4 line-heights × 2 fontFamilies, 4 radius values (6/12/16/9999), 2 shadow specs (card + modal) with iOS + Android elevation
- **Inter font loading** wired in `app/_layout.tsx`: only 400 + 600 weights loaded (saves ~250KB vs adding 500/Medium), splash screen held until `fontsLoaded || fontsError`, layout returns `null` while pending — no flash of system font on cold start
- **`as const` assertion** on tokens export for literal type inference downstream (`tokens.colors.canvas` is `"#FAF9F5"`, not `string`)
- **`tsc --noEmit` passes** with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Author global.css :root token block** — `3f35eb4` (feat)
2. **Task 2: Extend tailwind.config.js + write theme/tokens.ts** — `5c55739` (feat)
3. **Task 3: Wire Inter font loading + splash gate in app/_layout.tsx** — `eb9202e` (feat)

**Plan metadata commit:** to be added by final commit step (covers SUMMARY.md, STATE.md, ROADMAP.md).

## Files Created/Modified

- `theme/tokens.ts` — Replaced Phase 1 stub with full typed token export (`tokens` const + `Tokens` type) covering colors / spacing / typography / radius / shadow
- `global.css` — Added `:root` block declaring 10 color CSS vars as space-separated RGB triplets (was 3 `@tailwind` directives only)
- `tailwind.config.js` — Extended `theme.extend.colors` from 2 entries (accent, canvas) to 10 (added surface, surface-elevated, fg-primary, fg-muted, border-subtle, destructive, success, warning); added `fontFamily.sans` and `fontFamily.sans-semibold` Inter bindings
- `app/_layout.tsx` — Added `useFonts` from `@expo-google-fonts/inter` (Inter_400Regular + Inter_600SemiBold only), `SplashScreen.preventAutoHideAsync()` at module top level, `SplashScreen.hideAsync()` in `useEffect` gated on font load resolution, `return null` when `!fontsLoaded && !fontsError` to prevent system-font flash; preserved `global.css` import as line 1 (NativeWind v4 requirement) and SafeAreaProvider wrapping

## Token Inventory (what downstream plans consume)

### Colors (10 CSS vars, 12 hex strings)
- **Surface:** canvas (#FAF9F5), surface (#F5F2EB), surface-elevated (#FFFFFF)
- **Foreground:** fg-primary (#2A2622), fg-muted (#7A736A), border-subtle (#E8E2D5)
- **Role accent (CSS var, swappable):** accent (default = student sage #86A17C)
- **Role accent (JS-side hex, all 3):** accentAdmin (#64748B steel), accentProfessor (#CC785C clay), accentStudent (#86A17C sage)
- **Semantic:** destructive (#B45447), success (#5E8A60), warning (#C49355)

### Spacing (9 values, all multiples of 4)
xs (4) · sm (8) · md (12) · lg (16) · xl (20) · 2xl (32) · 3xl (48) · 4xl (64) · touchTarget (44)

### Typography (4 sizes × 2 weights = 8 type combinations)
Sizes: caption (12) · body (16) · heading (20) · display (30)
Line heights: 16 · 24 · 28 · 36
Weights: regular (400) · semibold (600) — only 2 weights loaded (skipped 500/Medium per UI-SPEC Open Question 5)
FontFamily: Inter_400Regular · Inter_600SemiBold

### Radius (4 values)
sm (6) · md (12) · lg (16) · pill (9999)
Maps to Tailwind defaults: rounded-md · rounded-xl · rounded-2xl · rounded-full

### Shadow (2 specs, iOS + Android)
- **card:** shadowColor #2A2622, opacity 0.04, radius 8, offset {0, 2}, elevation 2
- **modal:** shadowColor #2A2622, opacity 0.12, radius 20, offset {0, 8}, elevation 8

## Decisions Made

1. **Loaded only 2 Inter weights (400 + 600).** UI-SPEC Open Question 5 documents that loading 3 weights inflates cold-start by ~250KB. Type contract uses exactly 2 weights; Android body rendering falls back to system without explicit `Inter_500Medium` load. (Note: UI-SPEC Typography section line 63 references 3 weights as the loading target but Open Question 5 explicitly recommends loading only 2 — this plan follows Open Question 5.)
2. **borderRadius config left empty.** Tailwind's defaults (`rounded-md` 6px, `rounded-xl` 12px, `rounded-2xl` 16px, `rounded-full`) already match UI-SPEC radius table (sm/md/lg/pill) exactly — overriding would be redundant. Documented as a comment in the config so future devs don't add overrides.
3. **theme/tokens.ts ships hex strings (not RGB triplets).** RGB triplets are only needed for Tailwind's `rgb(var(--X) / <alpha-value>)` consumption pattern (CSS-side). For JS-side consumption (`<Icon color={...} />`, iOS `shadowColor`, Reanimated interpolation) hex strings are the conventional input format and avoid every consumer having to wrap in `rgb()`.
4. **All 3 role accent hex values pre-staged in `tokens.ts`.** Plan 02 will build `RoleThemeProvider` and consume these via NativeWind's `vars()` API. Shipping them now (rather than in Plan 02) keeps the tokens layer self-contained as the project's color truth.
5. **`--color-accent` default in `:root` = student sage.** Per UI-SPEC contract — needed so the default render (before any `RoleThemeProvider` mounts, e.g. on the sign-in screen) has a sensible accent rather than an unset CSS var.

## Deviations from Plan

None — plan executed exactly as written. Every `<action>` block contained verbatim file contents pulled from UI-SPEC, and every verify gate passed on the first run.

**Total deviations:** 0
**Impact on plan:** None.

## Issues Encountered

None.

## Cross-check Verification (post-task gate from PLAN.md)

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| `--color-*` declarations in global.css | 10 | 10 | PASS |
| `rgb(var(--color-` references in tailwind.config.js | 10 | 10 | PASS |
| `npx tsc --noEmit` exit code | 0 | 0 | PASS |
| `Inter_500Medium` in app/_layout.tsx | absent | absent | PASS |
| `Inter_` references in app/_layout.tsx | ~4 (import + 2 weights × 2 uses) | 4 | PASS |
| `--color-*` set diff (global.css vs tailwind.config.js) | empty | empty | PASS |

All 6 checks pass — every CSS var has a Tailwind utility binding, every Tailwind binding maps to a declared CSS var, no untyped errors, font bundle stays lean.

## User Setup Required

None — no external service configuration required by this plan. Inter font is bundled via `@expo-google-fonts/inter` (already declared in package.json from Phase 1).

## Next Phase Readiness

**Plan 02 (providers-and-query) inherits:**
- `theme/tokens.ts` exports `tokens.colors.accentAdmin`, `accentProfessor`, `accentStudent` for `roleThemes` map in `theme/role-theme.ts` (UI-SPEC line 454-458)
- `--color-accent` is the only CSS var `RoleThemeProvider` overrides; all other tokens are role-independent and stable
- `global.css :root` already declares the default `--color-accent: 134 161 124` — `RoleThemeProvider` overrides via `vars()` from NativeWind
- App tree now mounts only after Inter is ready, so any provider-wrapped tree below `_layout.tsx` will render in Inter from first paint

**Plan 03 (primitives-and-preview) inherits:**
- All 7 primitives (`Button`, `Card`, `Chip`, `ListRow`, `EmptyState`, `Skeleton`, `ErrorView`) consume `bg-canvas`, `bg-surface`, `text-fg-primary`, `text-fg-muted`, `border-border-subtle`, `bg-accent`, `text-accent`, `border-accent`, `bg-destructive`, `text-destructive`, `bg-success`, `text-success`, `bg-warning`, `text-warning` — all wired and ready
- Alpha-modifier patterns work: `bg-accent/10`, `border-accent/30`, `bg-warning/10`, `bg-success/10`, `bg-destructive/10` (used by `Chip` accent variant + status variants and `ErrorView` icon container per UI-SPEC)
- `tokens.shadow.card` and `tokens.shadow.modal` ready for `Card` primitive `variant="elevated"` and any modal/sheet
- `tokens.colors.fgMuted` ready for lucide icon `color={...}` props (e.g. `<ChevronRight color={tokens.colors.fgMuted} />` in `ListRow`)

**No blockers.** Tokens layer is complete and downstream-ready.

## Self-Check: PASSED

All claimed files exist on disk:
- `global.css` — FOUND
- `tailwind.config.js` — FOUND
- `theme/tokens.ts` — FOUND
- `app/_layout.tsx` — FOUND
- `.planning/phases/02-design-foundations/02-01-tokens-and-tailwind-SUMMARY.md` — FOUND

All claimed commits exist in git history:
- `3f35eb4` (Task 1) — FOUND
- `5c55739` (Task 2) — FOUND
- `eb9202e` (Task 3) — FOUND

---
*Phase: 02-design-foundations*
*Completed: 2026-04-26*
