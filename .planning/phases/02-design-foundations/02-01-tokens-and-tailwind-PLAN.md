---
phase: 02-design-foundations
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - theme/tokens.ts
  - global.css
  - tailwind.config.js
  - app/_layout.tsx
autonomous: true
requirements: [UI-01]
must_haves:
  truths:
    - "theme/tokens.ts exports a typed const object with every color, spacing, typography, and radius value used in the design system"
    - "global.css :root declares every color CSS variable as an RGB triplet (space-separated, no commas, no rgb() wrapper)"
    - "tailwind.config.js exposes every token as a Tailwind utility class via the rgb(var(--token) / <alpha-value>) pattern"
    - "Inter font family loads only the two weights actually used in the type contract (400 + 600) before the app renders"
    - "Splash screen does not hide until fonts have finished loading (no flash of system font)"
  artifacts:
    - path: "theme/tokens.ts"
      provides: "Type-safe runtime token access for cases where JS needs the value (e.g. lucide icon color prop)"
      contains: "export const tokens"
      min_lines: 60
    - path: "global.css"
      provides: "CSS custom properties (single source of truth for color tokens, consumed by Tailwind)"
      contains: "--color-canvas: 250 249 245"
    - path: "tailwind.config.js"
      provides: "Tailwind utility class to CSS-var bindings (bg-canvas, bg-surface, text-fg-primary, etc.)"
      contains: "fg-primary"
    - path: "app/_layout.tsx"
      provides: "Root layout with Inter font loading + splash gate"
      contains: "useFonts"
  key_links:
    - from: "tailwind.config.js"
      to: "global.css"
      via: "rgb(var(--color-X) / <alpha-value>) references CSS vars defined in :root"
      pattern: "rgb\\(var\\(--color-"
    - from: "app/_layout.tsx"
      to: "@expo-google-fonts/inter"
      via: "useFonts hook with Inter_400Regular and Inter_600SemiBold"
      pattern: "Inter_400Regular"
---

<objective>
Establish the design token foundation: every color, spacing, typography, and radius value declared once and consumable as either a Tailwind class (`bg-canvas`, `text-fg-primary`, `border-border-subtle`) or a typed JS constant (`tokens.colors.canvas`). Wire Inter font loading at the root layout so all downstream screens render in Inter from cold start.

Purpose: Without this layer, the 7 primitives (Plan 03) have nothing to consume and every accent class downstream would be a one-off string. The token layer is what makes the role accent swap possible — primitives reference `bg-accent` and `RoleThemeProvider` (Plan 02) injects the value at runtime via the same CSS var mechanism this plan sets up.

Output: theme/tokens.ts, global.css, tailwind.config.js (extended), app/_layout.tsx (with font loading) — all four files in their final Phase 2 form. After this plan: any component anywhere in the app can use `className="bg-canvas text-fg-primary"` and it will render the warm cream + warm charcoal correctly.
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
@.planning/phases/01-scaffold/01-03-config-and-client-SUMMARY.md
@theme/tokens.ts
@global.css
@tailwind.config.js
@app/_layout.tsx

<interfaces>
<!-- Existing surface from Phase 1 plan 03 — these are the starting points being extended -->

Current global.css (3 lines — needs full :root token block added):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Current tailwind.config.js exposes only 2 tokens (accent, canvas) — needs full surface/fg/border/semantic mapping added.

Current app/_layout.tsx wires global.css + SafeAreaProvider but does NOT load fonts — useFonts needs adding here.

Current theme/tokens.ts is a stub — needs full token export object.

Phase 1 stack already includes: @expo-google-fonts/inter@^0.4.2, expo-font@~14.0.11, expo-splash-screen@~31.0.13 (all in package.json — no new deps needed).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Author global.css :root token block (the source of truth for all color tokens)</name>
  <files>global.css</files>
  <read_first>
    - global.css (current 3-line file — append to it, do NOT overwrite the @tailwind directives)
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (Color section, lines 82-131 — exact RGB triplets)
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (RoleThemeProvider section, lines 480-494 — :root contract)
  </read_first>
  <action>
    Replace the entire contents of `global.css` with the block below. The three `@tailwind` directives MUST come first (NativeWind v4 requirement), followed by the `:root` CSS custom property block. Every color value is an RGB triplet (space-separated, no commas, no `rgb()` wrapper) — this is the format Tailwind's `rgb(var(--token) / <alpha-value>)` pattern requires for the alpha modifier to work.

    Final file contents (write exactly this — copy verbatim):

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Design tokens — single source of truth for all color values.
       Format: RGB triplet (space-separated, no commas, no rgb() wrapper).
       Tailwind utilities reference these via rgb(var(--color-X) / <alpha-value>).
       --color-accent default = student sage; RoleThemeProvider overrides per subtree. */
    :root {
      /* Surface tokens (60/30 — neutral foundation, role-independent) */
      --color-canvas: 250 249 245;            /* #FAF9F5 — primary screen bg */
      --color-surface: 245 242 235;           /* #F5F2EB — cards, sheet surfaces */
      --color-surface-elevated: 255 255 255;  /* #FFFFFF — input fields, topmost modal */

      /* Foreground tokens */
      --color-fg-primary: 42 38 34;           /* #2A2622 — body + headings */
      --color-fg-muted: 122 115 106;          /* #7A736A — captions, meta, placeholder */
      --color-border-subtle: 232 226 213;     /* #E8E2D5 — card borders, dividers */

      /* Role accent (default = student sage; overridden by RoleThemeProvider via vars()) */
      --color-accent: 134 161 124;            /* #86A17C */

      /* Semantic colors (role-independent, used sparingly) */
      --color-destructive: 180 84 71;         /* #B45447 — sign-out confirm, destructive btn */
      --color-success: 94 138 96;             /* #5E8A60 — "complete" status only */
      --color-warning: 196 147 85;            /* #C49355 — "in progress" status (non-prof) */
    }
    ```

    DO NOT add any other selectors, media queries, or vendor prefixes. The file is exactly 3 directives + 1 `:root` block + comments. No dark mode `@media (prefers-color-scheme: dark)` block — dark mode is OUT of scope (PROJECT.md Out of Scope, UI-SPEC Assumption #1).

    DO NOT use commas inside the RGB triplets. Tailwind's `rgb(var(--X) / <alpha-value>)` substitution needs space-separated values to compose the final `rgb()` call correctly. A comma here breaks every alpha modifier (`bg-accent/10`, `border-accent/30`, etc.) downstream — this is the single most-likely-to-be-wrong line in the whole plan.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && grep -c '^@tailwind' global.css | grep -q '^3$' && grep -q '^:root {' global.css && grep -q -- '--color-canvas: 250 249 245;' global.css && grep -q -- '--color-surface: 245 242 235;' global.css && grep -q -- '--color-surface-elevated: 255 255 255;' global.css && grep -q -- '--color-fg-primary: 42 38 34;' global.css && grep -q -- '--color-fg-muted: 122 115 106;' global.css && grep -q -- '--color-border-subtle: 232 226 213;' global.css && grep -q -- '--color-accent: 134 161 124;' global.css && grep -q -- '--color-destructive: 180 84 71;' global.css && grep -q -- '--color-success: 94 138 96;' global.css && grep -q -- '--color-warning: 196 147 85;' global.css && ! grep -E '^\s*--color-[a-z-]+:[^;]*,' global.css && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - File starts with exactly the three `@tailwind base;` / `@tailwind components;` / `@tailwind utilities;` directives, in that order
    - Single `:root { ... }` block exists
    - All 10 color CSS variables present with the EXACT RGB triplets specified above
    - NO comma inside any `--color-*` declaration (grep -E '^\s*--color-[a-z-]+:[^;]*,' MUST return zero matches)
    - File contains no dark mode media query, no other selectors, no @import statements
  </acceptance_criteria>
  <done>global.css contains exactly the @tailwind directives + :root block with all 10 color tokens as space-separated RGB triplets; the verify command exits 0 with output "PASS".</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Extend tailwind.config.js to expose every token as a utility class + theme/tokens.ts typed export</name>
  <files>tailwind.config.js, theme/tokens.ts</files>
  <read_first>
    - tailwind.config.js (current — extends only `accent` and `canvas`)
    - theme/tokens.ts (current stub from Phase 1 plan 03)
    - global.css (just authored in Task 1 — for cross-checking variable names)
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (Spacing section lines 36-58, Typography section lines 62-78, Radius section lines 138-146, Color section lines 82-131)
  </read_first>
  <action>
    **PART A — Replace `tailwind.config.js` with the extended config below.**

    Every CSS var in `global.css` must have a corresponding Tailwind class binding. Use the `rgb(var(--color-X) / <alpha-value>)` pattern for ALL colors so alpha modifiers (`bg-accent/10`, `border-warning/30`) work — this is required by Chip and EmptyState/ErrorView icon containers per UI-SPEC.

    Write `tailwind.config.js` with EXACTLY these contents:

    ```javascript
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./providers/**/*.{js,jsx,ts,tsx}",
      ],
      presets: [require("nativewind/preset")],
      theme: {
        extend: {
          colors: {
            // Surface tokens (60/30 neutral foundation)
            canvas: "rgb(var(--color-canvas) / <alpha-value>)",
            surface: "rgb(var(--color-surface) / <alpha-value>)",
            "surface-elevated": "rgb(var(--color-surface-elevated) / <alpha-value>)",
            // Foreground tokens
            "fg-primary": "rgb(var(--color-fg-primary) / <alpha-value>)",
            "fg-muted": "rgb(var(--color-fg-muted) / <alpha-value>)",
            // Border
            "border-subtle": "rgb(var(--color-border-subtle) / <alpha-value>)",
            // Role accent — runtime-swapped by RoleThemeProvider via vars()
            accent: "rgb(var(--color-accent) / <alpha-value>)",
            // Semantic colors
            destructive: "rgb(var(--color-destructive) / <alpha-value>)",
            success: "rgb(var(--color-success) / <alpha-value>)",
            warning: "rgb(var(--color-warning) / <alpha-value>)",
          },
          fontFamily: {
            // Inter loaded in app/_layout.tsx via @expo-google-fonts/inter
            sans: ["Inter_400Regular"],
            "sans-semibold": ["Inter_600SemiBold"],
          },
          borderRadius: {
            // radius-sm = rounded-md (6px), radius-md = rounded-xl (12px),
            // radius-lg = rounded-2xl (16px), radius-pill = rounded-full
            // (Tailwind defaults already cover these — no overrides needed)
          },
        },
      },
      plugins: [],
    };
    ```

    Note: `borderRadius` is intentionally empty — Tailwind's defaults (`rounded-md` = 6px, `rounded-xl` = 12px, `rounded-2xl` = 16px, `rounded-full` = pill) already match the UI-SPEC Radius table. No override needed; documenting in a comment is sufficient.

    **PART B — Replace `theme/tokens.ts` with the typed token export.**

    The token const is the JS-side source of truth for cases where Tailwind classes are not usable (e.g. passing color to a `lucide-react-native` `<Icon color={...} />` prop). Export both the `tokens` const and a `Tokens` type for consumers.

    Write `theme/tokens.ts` with EXACTLY these contents:

    ```typescript
    /**
     * Design tokens — typed JS-side mirror of global.css :root variables.
     *
     * The CSS vars in global.css are the SOURCE OF TRUTH for colors at render time
     * (Tailwind classes resolve to rgb(var(--color-X)) at runtime). This file exists
     * for the rare cases where JS needs a literal value:
     *   - Passing color to a lucide-react-native <Icon color={tokens.colors.fgMuted} />
     *   - Setting iOS shadowColor in a StyleSheet (shadow-card primitive)
     *   - Reading a value in a non-Tailwind context (Reanimated, animation interpolation)
     *
     * The hex strings here MUST stay in sync with global.css triplets.
     * If you change a value, change BOTH files.
     */

    export const tokens = {
      colors: {
        // Surface (60/30 neutral foundation)
        canvas: "#FAF9F5",
        surface: "#F5F2EB",
        surfaceElevated: "#FFFFFF",
        // Foreground
        fgPrimary: "#2A2622",
        fgMuted: "#7A736A",
        // Border
        borderSubtle: "#E8E2D5",
        // Role accents (RoleThemeProvider injects one of these via CSS var)
        accentAdmin: "#64748B",     // steel
        accentProfessor: "#CC785C", // clay
        accentStudent: "#86A17C",   // sage (default)
        // Semantic
        destructive: "#B45447",
        success: "#5E8A60",
        warning: "#C49355",
      },
      spacing: {
        // Multiples of 4 — match Tailwind default scale (1 unit = 4px)
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        "2xl": 32,
        "3xl": 48,
        "4xl": 64,
        // Touch target minimum — iOS HIG / Material non-negotiable
        touchTarget: 44,
      },
      typography: {
        // 4 sizes × 2 weights = 8 type combinations max (UI-SPEC Typography section)
        sizes: {
          caption: 12,
          body: 16,
          heading: 20,
          display: 30,
        },
        lineHeights: {
          caption: 16,
          body: 24,
          heading: 28,
          display: 36,
        },
        weights: {
          regular: "400",
          semibold: "600",
        },
        fontFamily: {
          regular: "Inter_400Regular",
          semibold: "Inter_600SemiBold",
        },
      },
      radius: {
        sm: 6,
        md: 12,
        lg: 16,
        pill: 9999,
      },
      shadow: {
        // iOS shadow values — Android uses elevation prop
        card: {
          shadowColor: "#2A2622",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        modal: {
          shadowColor: "#2A2622",
          shadowOpacity: 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
      },
    } as const;

    export type Tokens = typeof tokens;
    ```

    Use `as const` so consumers get literal types (e.g. `tokens.colors.canvas` is `"#FAF9F5"` not `string`).
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && grep -q 'rgb(var(--color-canvas)' tailwind.config.js && grep -q 'rgb(var(--color-surface)' tailwind.config.js && grep -q '"surface-elevated"' tailwind.config.js && grep -q '"fg-primary"' tailwind.config.js && grep -q '"fg-muted"' tailwind.config.js && grep -q '"border-subtle"' tailwind.config.js && grep -q 'accent: "rgb(var(--color-accent)' tailwind.config.js && grep -q 'destructive: "rgb(var(--color-destructive)' tailwind.config.js && grep -q 'success: "rgb(var(--color-success)' tailwind.config.js && grep -q 'warning: "rgb(var(--color-warning)' tailwind.config.js && grep -q 'Inter_400Regular' tailwind.config.js && grep -q 'Inter_600SemiBold' tailwind.config.js && grep -q 'export const tokens' theme/tokens.ts && grep -q 'canvas: "#FAF9F5"' theme/tokens.ts && grep -q 'fgPrimary: "#2A2622"' theme/tokens.ts && grep -q 'accentAdmin: "#64748B"' theme/tokens.ts && grep -q 'accentProfessor: "#CC785C"' theme/tokens.ts && grep -q 'accentStudent: "#86A17C"' theme/tokens.ts && grep -q 'export type Tokens' theme/tokens.ts && grep -q 'as const' theme/tokens.ts && npx tsc --noEmit && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - tailwind.config.js exposes ALL 10 color tokens (canvas, surface, surface-elevated, fg-primary, fg-muted, border-subtle, accent, destructive, success, warning) using `rgb(var(--color-X) / <alpha-value>)` pattern
    - tailwind.config.js fontFamily.sans = `["Inter_400Regular"]`; fontFamily["sans-semibold"] = `["Inter_600SemiBold"]`
    - theme/tokens.ts exports `tokens` const with `colors`, `spacing`, `typography`, `radius`, `shadow` sub-objects
    - theme/tokens.ts exports `Tokens` type
    - theme/tokens.ts uses `as const` assertion for literal types
    - All three role accent hex values present: #64748B (admin steel), #CC785C (professor clay), #86A17C (student sage)
    - `npx tsc --noEmit` exits 0 — no TypeScript errors introduced
  </acceptance_criteria>
  <done>tailwind.config.js binds every CSS var to a Tailwind utility class; theme/tokens.ts exports a typed `tokens` const + `Tokens` type covering colors, spacing, typography, radius, shadow; tsc passes with no errors.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Wire Inter font loading + splash gate in app/_layout.tsx</name>
  <files>app/_layout.tsx</files>
  <read_first>
    - app/_layout.tsx (current — has global.css import and SafeAreaProvider only)
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (Typography section lines 62-78 — confirms 2 weights only; Open Question 5 lines 634 — load only 400 + 600)
    - package.json (confirm @expo-google-fonts/inter, expo-font, expo-splash-screen all present)
  </read_first>
  <action>
    Replace the contents of `app/_layout.tsx` with the version below. The changes from the current file:
    1. Add `useFonts` from `@expo-google-fonts/inter` loading ONLY `Inter_400Regular` and `Inter_600SemiBold` (per UI-SPEC Open Question 5: loading 3 weights inflates bundle by ~250KB; only 2 used in the contract)
    2. Add `expo-splash-screen` to keep splash visible until fonts load (prevents flash of system font)
    3. Render `null` while fonts are pending — Stack does not mount until `fontsLoaded === true`
    4. Preserve existing global.css first import + SafeAreaProvider wrapping

    Write `app/_layout.tsx` with EXACTLY these contents:

    ```tsx
    import '../global.css'  // NativeWind v4 requires this import at the entry point

    import { useEffect } from 'react'
    import { Stack } from 'expo-router'
    import { SafeAreaProvider } from 'react-native-safe-area-context'
    import * as SplashScreen from 'expo-splash-screen'
    import {
      useFonts,
      Inter_400Regular,
      Inter_600SemiBold,
    } from '@expo-google-fonts/inter'

    // Hold the splash screen visible until fonts have loaded.
    // Per UI-SPEC: load only 2 Inter weights (400 + 600) — the type contract uses
    // exactly these. Loading additional weights inflates cold-start by ~250KB.
    SplashScreen.preventAutoHideAsync().catch(() => {
      // Splash may already be hidden in dev fast-refresh; safe to ignore.
    })

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

      // Don't mount the app tree until fonts are ready — prevents flash of system font.
      // If font loading errors, mount anyway (fall back to system font rather than block).
      if (!fontsLoaded && !fontsError) {
        return null
      }

      return (
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      )
    }
    ```

    DO NOT load `Inter_500Medium`. The UI-SPEC contract is two weights only; weight 500 is mentioned as an Android system fallback in the spec but RN's font fallback chain handles it without an explicit load (this is documented in UI-SPEC line 63 + Open Question 5).

    DO NOT add any other providers here yet — `RoleThemeProvider`, `QueryProvider`, `AuthProvider` belong in Plan 02 (and `AuthProvider` is Phase 3 work). This task is font + splash only.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && head -1 app/_layout.tsx | grep -q "import '../global.css'" && grep -q "from '@expo-google-fonts/inter'" app/_layout.tsx && grep -q "Inter_400Regular" app/_layout.tsx && grep -q "Inter_600SemiBold" app/_layout.tsx && ! grep -q "Inter_500Medium" app/_layout.tsx && grep -q "SplashScreen.preventAutoHideAsync" app/_layout.tsx && grep -q "SplashScreen.hideAsync" app/_layout.tsx && grep -q "if (!fontsLoaded && !fontsError)" app/_layout.tsx && grep -q "<SafeAreaProvider>" app/_layout.tsx && grep -q "<Stack" app/_layout.tsx && npx tsc --noEmit && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - `import '../global.css'` is line 1 of the file (NativeWind v4 requirement — must be the first import)
    - `useFonts` imported from `@expo-google-fonts/inter`
    - EXACTLY two Inter weights loaded: `Inter_400Regular`, `Inter_600SemiBold`
    - `Inter_500Medium` NOT loaded (UI-SPEC contract: 2 weights only)
    - `SplashScreen.preventAutoHideAsync()` called at module top level
    - `SplashScreen.hideAsync()` called inside a useEffect gated on `fontsLoaded || fontsError`
    - Returns `null` when `!fontsLoaded && !fontsError` (gates Stack mount on fonts)
    - SafeAreaProvider wraps Stack (preserved from prior version)
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>app/_layout.tsx loads Inter 400 + 600, holds splash until ready, returns null while pending, then mounts SafeAreaProvider + Stack; tsc passes; cold start will render in Inter (not system font).</done>
</task>

</tasks>

<verification>
After all 3 tasks complete, run the following gate from the project root:

```bash
cd /Users/Kiumbura/Projects/scholera-mobile

# 1. CSS var declarations all present
grep -c '^  --color-' global.css   # expect: 10

# 2. Tailwind utility bindings all present
grep -c 'rgb(var(--color-' tailwind.config.js   # expect: 10

# 3. Token export shape compiles
npx tsc --noEmit   # exit 0

# 4. Layout uses Inter only (no Inter_500Medium leak)
grep -c 'Inter_' app/_layout.tsx   # expect: 4 (one import line + Inter_400Regular + Inter_600SemiBold appear; allow some variance)
! grep -q 'Inter_500Medium' app/_layout.tsx   # exit 0 (must NOT be present)
```

Token-to-utility cross-check: every `--color-*` in global.css must have a matching `rgb(var(--color-*)` reference in tailwind.config.js. Quick check:

```bash
diff \
  <(grep -oE -- '--color-[a-z-]+' global.css | sort -u) \
  <(grep -oE -- '--color-[a-z-]+' tailwind.config.js | sort -u)
# expect: empty (no diff)
```
</verification>

<success_criteria>
1. `global.css` contains `:root` block with all 10 color CSS vars as space-separated RGB triplets (no commas)
2. `tailwind.config.js` exposes all 10 colors as utility classes via `rgb(var(--color-X) / <alpha-value>)` pattern
3. `theme/tokens.ts` exports typed `tokens` const + `Tokens` type covering colors, spacing, typography, radius, shadow
4. `app/_layout.tsx` loads exactly 2 Inter weights (400 + 600), holds splash screen until fonts ready, mounts SafeAreaProvider + Stack
5. `npx tsc --noEmit` exits 0 — no TypeScript regression
6. Phase 2 success criterion 1 satisfied: theme/tokens.ts exports all categories AND tailwind.config.js references them via NativeWind vars() API (the `rgb(var(--color-X))` pattern IS the NativeWind vars() API on the consumer side; vars() function is used in Plan 02 for the role swap)
</success_criteria>

<output>
After completion, create `.planning/phases/02-design-foundations/02-01-tokens-and-tailwind-SUMMARY.md` documenting:
- The 10 colors, 8 spacing values, 4 type sizes × 2 weights, 4 radii, 2 shadow sets exposed
- Confirmation that `npx tsc --noEmit` passes
- Confirmation that no `Inter_500Medium` was loaded (bundle stays lean)
- Any auto-fixed deviations (likely none — the spec is exhaustive)
- What Plan 02 and Plan 03 inherit from this layer
</output>
