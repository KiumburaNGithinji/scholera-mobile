---
phase: 01-scaffold
plan: 03
type: execute
wave: 3
depends_on:
  - 02
files_modified:
  - tailwind.config.js
  - global.css
  - babel.config.js
  - metro.config.js
  - tsconfig.json
  - nativewind-env.d.ts
  - lib/supabase.ts
  - types/database.types.ts
  - types/app.types.ts
  - theme/tokens.ts
  - app/_layout.tsx
  - package.json
requirements: []
autonomous: true

must_haves:
  truths:
    - "NativeWind v4 is wired at all three required points: babel preset with jsxImportSource, metro with withNativeWind, global.css imported in app/_layout.tsx"
    - "`lib/supabase.ts` has `react-native-url-polyfill/auto` as its FIRST import (before any other import)"
    - "`npx tsc --noEmit` exits with 0 errors (TypeScript strict mode + @/ path aliases work)"
    - "Supabase client singleton is type-parameterized on `Database` type (from database.types.ts stub — will be real after Plan 04)"
    - "Session storage is AsyncStorage (NOT SecureStore — per D-07 and PITFALLS exceeds 2048-byte limit)"
    - "`detectSessionInUrl: false` is set in supabase client (RN has no URL bar — would break)"
  artifacts:
    - path: "tailwind.config.js"
      provides: "Tailwind content paths + NativeWind preset"
      contains: "nativewind/preset"
    - path: "global.css"
      provides: "NativeWind v4 required CSS entry point"
      contains: "@tailwind base"
    - path: "babel.config.js"
      provides: "NativeWind babel preset + jsxImportSource"
      contains: "jsxImportSource"
    - path: "metro.config.js"
      provides: "NativeWind metro wiring"
      contains: "withNativeWind"
    - path: "tsconfig.json"
      provides: "Strict TypeScript + @/* path aliases"
      contains: "@/*"
    - path: "lib/supabase.ts"
      provides: "Supabase client singleton with AsyncStorage adapter and URL polyfill first"
      contains: "react-native-url-polyfill/auto"
    - path: "types/database.types.ts"
      provides: "Database type stub (filled by Plan 04 from real schema)"
      contains: "export"
    - path: "types/app.types.ts"
      provides: "Hand-written role + domain types"
      contains: "export type Role"
    - path: "theme/tokens.ts"
      provides: "Design tokens stub (populated by Phase 2)"
      contains: "export"
    - path: "app/_layout.tsx"
      provides: "Root layout with global.css import and SafeAreaProvider"
      contains: "global.css"
  key_links:
    - from: "app/_layout.tsx"
      to: "global.css"
      via: "first import line"
      pattern: "import.*['\"]../global\\.css['\"]|import.*['\"]@/global\\.css['\"]"
    - from: "lib/supabase.ts"
      to: "react-native-url-polyfill/auto"
      via: "FIRST import line (line 1 or 2 after comments)"
      pattern: "react-native-url-polyfill/auto"
    - from: "lib/supabase.ts"
      to: "AsyncStorage"
      via: "auth.storage config option"
      pattern: "storage:\\s*AsyncStorage"
    - from: "babel.config.js"
      to: "NativeWind babel preset"
      via: "jsxImportSource option in babel-preset-expo"
      pattern: "jsxImportSource.*nativewind"
    - from: "metro.config.js"
      to: "withNativeWind"
      via: "module.exports wrap"
      pattern: "withNativeWind\\(config"
---

<objective>
Wire NativeWind v4 (the three required points: babel + metro + global.css import), configure TypeScript with strict mode + `@/*` path aliases, create `lib/supabase.ts` with the url-polyfill-first pattern, scaffold the directory structure, and add a stub `types/database.types.ts` so Plan 04's type generation has a target.

Purpose: After this plan, `npx tsc --noEmit` must pass (0 errors), and Plan 04 can run type generation to overwrite the stub. Every config subtlety that would silently break downstream work (URL polyfill missing, global.css not imported, SecureStore used, newArchEnabled true) is locked down here.
Output: Working NativeWind toolchain, typed Supabase client, path aliases functional, root layout with CSS import.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md

<interfaces>
Verbatim target file contents from RESEARCH.md §"Config File Contents":

`lib/supabase.ts` signature (must match EXACTLY — Phase 3 Auth imports this shape):
```typescript
export const supabase: SupabaseClient<Database>  // from createClient<Database>(...)
```

`types/app.types.ts` signature (hand-written):
```typescript
export type Role = 'admin' | 'professor' | 'student'
export type Profile = Database['public']['Tables']['profiles']['Row']
// ...etc for all 11 tables
export type ProfessorStatus = 'not_started' | 'in_progress' | 'complete'
export type StudentStatus   = 'not_started' | 'in_progress' | 'complete'
export type ModuleItemType  = 'link' | 'note' | 'file'
```

`Database` type comes from `types/database.types.ts` — this plan writes a PLACEHOLDER with an empty-ish Database shape so `tsc` passes. Plan 04 overwrites it with the real generated types.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write NativeWind config (tailwind.config.js + global.css + babel.config.js + metro.config.js + nativewind-env.d.ts)</name>
  <files>
    /Users/Kiumbura/Projects/scholera-mobile/tailwind.config.js,
    /Users/Kiumbura/Projects/scholera-mobile/global.css,
    /Users/Kiumbura/Projects/scholera-mobile/babel.config.js,
    /Users/Kiumbura/Projects/scholera-mobile/metro.config.js,
    /Users/Kiumbura/Projects/scholera-mobile/nativewind-env.d.ts
  </files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Config File Contents" (verbatim lines for all 5 files)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Pitfall P1-B" (global.css import requirement)
    - /Users/Kiumbura/Projects/scholera-mobile/babel.config.js (current state — as scaffolded by create-expo-app; will be overwritten)
    - /Users/Kiumbura/Projects/scholera-mobile/metro.config.js (may or may not exist — create-expo-app sometimes skips it)
  </read_first>
  <action>
    Write these FIVE files with EXACT verbatim contents from RESEARCH.md §"Config File Contents". Do not deviate even by whitespace — NativeWind v4 setup is finicky and any deviation silently breaks styles.

    **File 1 — `/Users/Kiumbura/Projects/scholera-mobile/tailwind.config.js`:**
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
            // role accent — injected at runtime via CSS vars from RoleThemeProvider
            accent: "rgb(var(--color-accent) / <alpha-value>)",
            canvas: "rgb(var(--color-canvas) / <alpha-value>)",
          },
        },
      },
      plugins: [],
    };
    ```

    **File 2 — `/Users/Kiumbura/Projects/scholera-mobile/global.css`:**
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

    **File 3 — `/Users/Kiumbura/Projects/scholera-mobile/babel.config.js` (OVERWRITE whatever create-expo-app wrote):**
    ```javascript
    module.exports = function (api) {
      api.cache(true);
      return {
        presets: [
          ["babel-preset-expo", { jsxImportSource: "nativewind" }],
          "nativewind/babel",
        ],
      };
    };
    ```

    **File 4 — `/Users/Kiumbura/Projects/scholera-mobile/metro.config.js`:**
    ```javascript
    const { getDefaultConfig } = require("expo/metro-config");
    const { withNativeWind } = require("nativewind/metro");

    const config = getDefaultConfig(__dirname);

    module.exports = withNativeWind(config, { input: "./global.css" });
    ```

    **File 5 — `/Users/Kiumbura/Projects/scholera-mobile/nativewind-env.d.ts`:**
    ```typescript
    /// <reference types="nativewind/types" />
    ```

    All five files must be at the repo root (same directory as `package.json`). Do NOT put them in subdirectories.

    Reference: RESEARCH.md §Config File Contents; PITFALLS P1-B (global.css import missing).
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && test -f tailwind.config.js && test -f global.css && test -f babel.config.js && test -f metro.config.js && test -f nativewind-env.d.ts && grep -q "nativewind/preset" tailwind.config.js && grep -q "@tailwind base" global.css && grep -q "jsxImportSource.*nativewind" babel.config.js && grep -q "nativewind/babel" babel.config.js && grep -q "withNativeWind(config" metro.config.js && grep -q "nativewind/types" nativewind-env.d.ts && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - `tailwind.config.js` contains the string `require("nativewind/preset")`
    - `tailwind.config.js` content array includes `./app/**/*.{js,jsx,ts,tsx}`
    - `global.css` contains all three lines: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
    - `babel.config.js` contains the string `jsxImportSource` paired with `nativewind`
    - `babel.config.js` contains the string `"nativewind/babel"` (second preset)
    - `metro.config.js` contains `withNativeWind(config` (wraps the default config)
    - `metro.config.js` contains `input: "./global.css"` (path to entry CSS)
    - `nativewind-env.d.ts` contains `/// <reference types="nativewind/types" />`
    - All five files at repo root (NOT in subdirectories)
  </acceptance_criteria>
  <done>
    Five NativeWind config files written at repo root with exact verbatim contents from RESEARCH.md. Three of the three NativeWind wiring points complete (babel + metro + global.css file exists — the third wiring point, importing global.css in `_layout.tsx`, happens in Task 5).
  </done>
</task>

<task type="auto">
  <name>Task 2: Write tsconfig.json with strict mode + @/ path aliases</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/tsconfig.json</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/tsconfig.json (current state — as generated by create-expo-app)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"`tsconfig.json` (path aliases + strict)" (verbatim target)
  </read_first>
  <action>
    OVERWRITE `/Users/Kiumbura/Projects/scholera-mobile/tsconfig.json` with EXACT contents (from RESEARCH.md):

    ```json
    {
      "extends": "expo/tsconfig.base",
      "compilerOptions": {
        "strict": true,
        "baseUrl": ".",
        "paths": {
          "@/*": ["./*"]
        }
      },
      "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
    }
    ```

    CRITICAL:
    - `"extends": "expo/tsconfig.base"` (NOT `"extends": "@expo/tsconfig"` or any variant) — this is what Expo SDK 54 uses and provides the right React Native compiler options.
    - `"strict": true` — catches role-type mismatches and Supabase query shape errors at compile time (per STACK.md).
    - `"baseUrl": "."` + `"paths": {"@/*": ["./*"]}` — enables `import foo from '@/lib/supabase'` style imports (per D-15/D-16).
    - `"include"` array must have all four entries; omitting `.expo/types/**/*.d.ts` will cause typed routes to not resolve.

    Do NOT add `noUncheckedIndexedAccess` — STACK.md flags it as "nice to have if time allows" and it's not required here.
  </action>
  <verify>
    <automated>node -e "const c=require('/Users/Kiumbura/Projects/scholera-mobile/tsconfig.json'); if(c.extends!=='expo/tsconfig.base')throw new Error('extends wrong'); if(c.compilerOptions.strict!==true)throw new Error('strict must be true'); if(c.compilerOptions.baseUrl!=='.')throw new Error('baseUrl must be .'); if(!c.compilerOptions.paths||!c.compilerOptions.paths['@/*'])throw new Error('@/* path missing'); console.log('OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `tsconfig.json` is valid JSON
    - `extends` equals `"expo/tsconfig.base"`
    - `compilerOptions.strict` equals `true`
    - `compilerOptions.baseUrl` equals `"."`
    - `compilerOptions.paths["@/*"]` equals `["./*"]`
    - `include` array contains `"**/*.ts"` and `"**/*.tsx"` and `"expo-env.d.ts"`
  </acceptance_criteria>
  <done>
    tsconfig.json has strict mode and @/* path aliases. Imports like `import { supabase } from '@/lib/supabase'` will resolve.
  </done>
</task>

<task type="auto">
  <name>Task 3: Create directory structure per ARCHITECTURE.md</name>
  <files>
    /Users/Kiumbura/Projects/scholera-mobile/app/,
    /Users/Kiumbura/Projects/scholera-mobile/components/ui/,
    /Users/Kiumbura/Projects/scholera-mobile/hooks/,
    /Users/Kiumbura/Projects/scholera-mobile/lib/,
    /Users/Kiumbura/Projects/scholera-mobile/queries/,
    /Users/Kiumbura/Projects/scholera-mobile/providers/,
    /Users/Kiumbura/Projects/scholera-mobile/theme/,
    /Users/Kiumbura/Projects/scholera-mobile/types/,
    /Users/Kiumbura/Projects/scholera-mobile/supabase/migrations/
  </files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md §"Repo structure (top-level)" (D-13 layout)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Directory Creation Order" (verbatim mkdir commands)
  </read_first>
  <action>
    Create the ARCHITECTURE.md directory tree. Some already exist from `create-expo-app` (`app/`, `assets/`). The rest must be created. Run:

    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile

    # App route groups (parentheses are literal, not metacharacters — quote in shell)
    mkdir -p "app/(auth)"
    mkdir -p "app/(admin)/(tabs)"
    mkdir -p "app/(professor)/(tabs)"
    mkdir -p "app/(student)/(tabs)"

    # Components
    mkdir -p components/ui
    mkdir -p components/screens
    mkdir -p components/domain

    # Hooks — subdivided by role domain
    mkdir -p hooks/auth
    mkdir -p hooks/admin
    mkdir -p hooks/professor
    mkdir -p hooks/student
    mkdir -p hooks/shared

    # Core
    mkdir -p lib
    mkdir -p queries
    mkdir -p providers
    mkdir -p theme
    mkdir -p types

    # Supabase
    mkdir -p supabase/migrations

    # scripts will be created in Plan 05 for the smoke script
    mkdir -p scripts
    ```

    These directories are intentionally EMPTY at this point (except `app/` which has `_layout.tsx` from create-expo-app). Keep them empty — Phase 2 will populate `components/ui/`, `theme/`, `providers/`. Phase 3 will populate `app/(auth)/`, `hooks/auth/`, etc.

    If some directories already exist (e.g. `components/` from create-expo-app), `mkdir -p` is a no-op — safe.

    Note: Empty directories are not tracked by git by default. That's OK for Phase 1 — Phase 2+ plans will add files that cause the directories to be tracked.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && test -d "app/(auth)" && test -d "app/(admin)/(tabs)" && test -d "app/(professor)/(tabs)" && test -d "app/(student)/(tabs)" && test -d components/ui && test -d hooks/auth && test -d hooks/admin && test -d hooks/professor && test -d hooks/student && test -d lib && test -d queries && test -d providers && test -d theme && test -d types && test -d supabase/migrations && test -d scripts && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - All directories exist: `app/(auth)`, `app/(admin)/(tabs)`, `app/(professor)/(tabs)`, `app/(student)/(tabs)`, `components/ui`, `components/screens`, `components/domain`, `hooks/auth`, `hooks/admin`, `hooks/professor`, `hooks/student`, `hooks/shared`, `lib`, `queries`, `providers`, `theme`, `types`, `supabase/migrations`, `scripts`
    - Verified via `test -d` for each path
  </acceptance_criteria>
  <done>
    Empty directory skeleton per ARCHITECTURE.md layout (D-13). Ready for Plan 03's remaining tasks to populate `lib/`, `types/`, `theme/`, and `app/_layout.tsx`.
  </done>
</task>

<task type="auto">
  <name>Task 4: Write lib/supabase.ts with url-polyfill FIRST + AsyncStorage + detectSessionInUrl false</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/lib/supabase.ts</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"`lib/supabase.ts` (exact singleton — Phase 3 Auth builds on this)" (verbatim target — COPY THIS EXACTLY)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Pitfall P1-A" (why url-polyfill MUST be first)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Pitfall P1-D" (never string-literal the keys)
  </read_first>
  <action>
    Create `/Users/Kiumbura/Projects/scholera-mobile/lib/supabase.ts` with these EXACT contents (verbatim from RESEARCH.md — the order of imports is LOAD-BEARING):

    ```typescript
    // CRITICAL: react-native-url-polyfill/auto MUST be the FIRST import in this file.
    // supabase-js depends on the standard URL API which RN lacks.
    // If this import is missing or not first, sessions silently fail to rehydrate.
    import 'react-native-url-polyfill/auto'

    import AsyncStorage from '@react-native-async-storage/async-storage'
    import { createClient } from '@supabase/supabase-js'
    import { AppState } from 'react-native'
    import type { Database } from '../types/database.types'

    export const supabase = createClient<Database>(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: AsyncStorage,           // NOT SecureStore — exceeds 2048-byte limit
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,       // REQUIRED: must be false in RN (no URL bar)
        },
      }
    )

    // Pause/resume token refresh based on app foreground state
    // Prevents unnecessary auth calls when app is backgrounded
    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh()
      } else {
        supabase.auth.stopAutoRefresh()
      }
    })
    ```

    NON-NEGOTIABLE rules (per PITFALLS P1-A, D-07, D-31):
    1. Line 4 (first non-comment line) MUST be `import 'react-native-url-polyfill/auto'` — NOT line 6 or 10. Comments before it are fine; any IMPORT before it breaks session rehydration silently.
    2. `storage: AsyncStorage` — NEVER `SecureStore` (exceeds 2048-byte limit per D-07, PITFALLS).
    3. `detectSessionInUrl: false` — REQUIRED for React Native (no browser URL bar).
    4. Use `process.env.EXPO_PUBLIC_SUPABASE_URL!` — NEVER a string literal like `'https://htlolqbwhulyihguwdoq.supabase.co'` directly. (Even though we know the URL, string-literaling it makes git history audits harder and sets a bad precedent; the `!` non-null assertion is intentional — env vars are populated by Expo at build time from `.env.local`.)
    5. Import `Database` from `'../types/database.types'` — this file is a stub right now (Task 6 creates it); Plan 04 overwrites with real types.

    Reference: RESEARCH.md §lib/supabase.ts, PITFALLS P1-A + P1-D.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && head -5 lib/supabase.ts | grep -q "react-native-url-polyfill/auto" && grep -q "storage: AsyncStorage" lib/supabase.ts && grep -q "detectSessionInUrl: false" lib/supabase.ts && grep -q "process.env.EXPO_PUBLIC_SUPABASE_URL" lib/supabase.ts && ! grep -q "SecureStore" lib/supabase.ts && ! grep -q "htlolqbwhulyihguwdoq.supabase.co" lib/supabase.ts && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - File `/Users/Kiumbura/Projects/scholera-mobile/lib/supabase.ts` exists
    - `import 'react-native-url-polyfill/auto'` appears within the first 5 non-blank lines (comments OK before it)
    - First import statement (after comments) is `react-native-url-polyfill/auto` — verified via `head -5 lib/supabase.ts | grep -n "^import" | head -1 | grep -q "react-native-url-polyfill/auto"`
    - File contains `storage: AsyncStorage` (exact string)
    - File contains `detectSessionInUrl: false` (exact string)
    - File contains `process.env.EXPO_PUBLIC_SUPABASE_URL` (anon key only via env var)
    - File does NOT contain the word `SecureStore` anywhere
    - File does NOT contain a string literal like `'https://htlolqbwhulyihguwdoq'` (no hardcoded URL; env-var only)
    - File does NOT contain a string starting with `eyJ` (JWT token — would mean anon key was hardcoded)
  </acceptance_criteria>
  <done>
    Supabase client singleton written with url-polyfill first, AsyncStorage storage, detectSessionInUrl false, env-var-driven credentials. Plan 04's type gen will later replace the Database stub import target with real types.
  </done>
</task>

<task type="auto">
  <name>Task 5: Write app/_layout.tsx stub with global.css import + SafeAreaProvider</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/app/_layout.tsx</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/app/_layout.tsx (current state as scaffolded by create-expo-app)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"`app/_layout.tsx` Stub (Phase 1 placeholder — Phase 3 wires real providers)" (verbatim target)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Pitfall P1-B" (why global.css import is load-bearing)
  </read_first>
  <action>
    OVERWRITE `/Users/Kiumbura/Projects/scholera-mobile/app/_layout.tsx` with these EXACT contents:

    ```tsx
    import '../global.css'  // NativeWind v4 requires this import at the entry point

    import { Stack } from 'expo-router'
    import { SafeAreaProvider } from 'react-native-safe-area-context'

    export default function RootLayout() {
      return (
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      )
    }
    ```

    CRITICAL (per PITFALLS P1-B):
    - `import '../global.css'` must be the FIRST import. Without it, NativeWind className styles render nothing (silent failure).
    - Keep this stub MINIMAL. Phase 3 will wrap `<Stack>` in providers (AuthProvider, QueryClientProvider, RoleThemeProvider). Phase 1 ends here.
    - `Stack` not `Tabs` — Phase 1 has no tab screens. Phase 2/3 will change this.
    - `headerShown: false` — role home screens each manage their own headers.

    If the file currently contains create-expo-app's default content (more complex with ThemeProvider, etc.), REPLACE IT ENTIRELY. Do NOT append.

    Reference: RESEARCH.md §app/_layout.tsx, PITFALLS P1-B.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && head -2 app/_layout.tsx | grep -q "global.css" && grep -q "SafeAreaProvider" app/_layout.tsx && grep -q "expo-router" app/_layout.tsx && grep -q "Stack" app/_layout.tsx && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - File `/Users/Kiumbura/Projects/scholera-mobile/app/_layout.tsx` exists
    - First non-blank line of the file is `import '../global.css'` (possibly with a trailing comment)
    - File contains `SafeAreaProvider` (import + usage)
    - File contains `import { Stack } from 'expo-router'`
    - File has exactly one `export default` (the RootLayout function)
    - File does NOT contain `expo-status-bar` or `ThemeProvider` (not Phase 1 concerns — create-expo-app defaults removed)
  </acceptance_criteria>
  <done>
    Root layout has all three NativeWind wiring points cooperating (global.css imported at entry). SafeAreaProvider wraps the Stack. Phase 3 will add providers.
  </done>
</task>

<task type="auto">
  <name>Task 6: Write types/database.types.ts stub and types/app.types.ts with role and domain types</name>
  <files>
    /Users/Kiumbura/Projects/scholera-mobile/types/database.types.ts,
    /Users/Kiumbura/Projects/scholera-mobile/types/app.types.ts,
    /Users/Kiumbura/Projects/scholera-mobile/theme/tokens.ts
  </files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"`types/app.types.ts` (hand-written — required for Phase 3+)" (verbatim target)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md §"Repo structure" for theme/tokens.ts expectations
  </read_first>
  <action>
    **File 1 — `/Users/Kiumbura/Projects/scholera-mobile/types/database.types.ts` (STUB — Plan 04 will overwrite with real generated types):**

    Write a minimal stub that satisfies `lib/supabase.ts`'s `import type { Database } from '../types/database.types'`. The stub must have the right SHAPE so `tsc` compiles, even though it contains empty table definitions. This allows `tsc --noEmit` to pass as part of Plan 03's verification, BEFORE the schema is applied in Plan 04.

    Use this exact content:

    ```typescript
    // STUB — replaced by `supabase gen types` in Plan 04.
    // This shape satisfies the Supabase client generic so tsc passes at Plan 03.
    // All 11 tables from supabase/migrations/00000000000001_initial_schema.sql
    // will have real Row/Insert/Update shapes after Plan 04 runs type generation.

    export type Json =
      | string
      | number
      | boolean
      | null
      | { [key: string]: Json | undefined }
      | Json[]

    export interface Database {
      public: {
        Tables: {
          profiles: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          departments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          programs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          courses: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          enrollments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          announcements: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          modules: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          module_items: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          roadmap_items: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          topics: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
          student_progress: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
        CompositeTypes: Record<string, never>
      }
    }
    ```

    **File 2 — `/Users/Kiumbura/Projects/scholera-mobile/types/app.types.ts` (hand-written, survives type regeneration):**

    ```typescript
    import type { Database } from './database.types'

    export type Role = 'admin' | 'professor' | 'student'

    export type Profile          = Database['public']['Tables']['profiles']['Row']
    export type Department       = Database['public']['Tables']['departments']['Row']
    export type Program          = Database['public']['Tables']['programs']['Row']
    export type Course           = Database['public']['Tables']['courses']['Row']
    export type Enrollment       = Database['public']['Tables']['enrollments']['Row']
    export type Announcement     = Database['public']['Tables']['announcements']['Row']
    export type Module           = Database['public']['Tables']['modules']['Row']
    export type ModuleItem       = Database['public']['Tables']['module_items']['Row']
    export type RoadmapItem      = Database['public']['Tables']['roadmap_items']['Row']
    export type Topic            = Database['public']['Tables']['topics']['Row']
    export type StudentProgress  = Database['public']['Tables']['student_progress']['Row']

    export type ProfessorStatus  = 'not_started' | 'in_progress' | 'complete'
    export type StudentStatus    = 'not_started' | 'in_progress' | 'complete'
    export type ModuleItemType   = 'link' | 'note' | 'file'
    ```

    Until Plan 04 regenerates `database.types.ts`, all `...['Row']` types will resolve to `Record<string, unknown>` — not helpful at the call site, but `tsc` will compile. After Plan 04, they will have real shapes without requiring any code change in `app.types.ts`.

    **File 3 — `/Users/Kiumbura/Projects/scholera-mobile/theme/tokens.ts` (STUB for Phase 2):**

    ```typescript
    // Phase 2 will populate this with full token system
    // (colors for canvas / accents, spacing, typography, radii).
    // Phase 1 only creates the file so imports from other modules resolve.

    export const tokens = {
      // Phase 2 will add: colors, spacing, typography, radii
    } as const
    ```

    Reference: RESEARCH.md §types/app.types.ts.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && test -f types/database.types.ts && test -f types/app.types.ts && test -f theme/tokens.ts && grep -q "export interface Database" types/database.types.ts && grep -q "profiles:" types/database.types.ts && grep -q "courses:" types/database.types.ts && grep -q "export type Role" types/app.types.ts && grep -q "export type ProfessorStatus" types/app.types.ts && grep -q "export const tokens" theme/tokens.ts && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - `types/database.types.ts` exists and exports `interface Database`
    - `types/database.types.ts` mentions all 11 tables: `profiles`, `departments`, `programs`, `courses`, `enrollments`, `announcements`, `modules`, `module_items`, `roadmap_items`, `topics`, `student_progress`
    - `types/app.types.ts` exists and exports `type Role = 'admin' | 'professor' | 'student'`
    - `types/app.types.ts` exports `type ProfessorStatus`, `type StudentStatus`, `type ModuleItemType`
    - `types/app.types.ts` exports domain types for all 11 tables (Profile, Department, ..., StudentProgress)
    - `theme/tokens.ts` exists and exports `tokens` const
  </acceptance_criteria>
  <done>
    Database types stub satisfies `tsc` pass. app.types.ts has role enum + domain type aliases. Plan 04 will overwrite database.types.ts with real generated types — app.types.ts needs no changes.
  </done>
</task>

<task type="auto">
  <name>Task 7: Add gen:types npm script and run npx tsc --noEmit to confirm zero TypeScript errors</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/package.json</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/package.json (inspect current scripts section)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Type Generation Command" (for the exact gen:types script content)
  </read_first>
  <action>
    Step 1 — Add a `gen:types` npm script to `package.json`. Read the current `package.json`, add this line to `scripts`:

    ```json
    "gen:types": "supabase gen types typescript --project-id htlolqbwhulyihguwdoq --schema public > types/database.types.ts"
    ```

    Use `npm pkg set` to avoid manually editing the JSON:
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile && npm pkg set scripts.gen:types="supabase gen types typescript --project-id htlolqbwhulyihguwdoq --schema public > types/database.types.ts"
    ```

    Step 2 — Run the TypeScript type check (this is the Wave 3 gate):
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile && npx tsc --noEmit
    ```

    Expected: zero output on success (exit 0). If errors occur:
    - `Cannot find module 'react-native-url-polyfill/auto'` → Plan 02 didn't install the package; verify via `ls node_modules/react-native-url-polyfill`
    - `Cannot find module '../types/database.types'` → Task 6 didn't create the file; re-run
    - `Type '...' is not assignable to type '...'` → the stub might be too lax OR too strict; compare against RESEARCH.md verbatim
    - `Cannot find name 'process'` → normal in strict Expo env; `expo/tsconfig.base` includes the types. If this error appears, confirm `"extends": "expo/tsconfig.base"` is in `tsconfig.json`.

    If tsc fails, DO NOT proceed to Plan 04. Fix the error first.

    Step 3 — Log the tsc output to a temp file for the SUMMARY:
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile && npx tsc --noEmit 2>&1 | tee /tmp/plan03-tsc.log
    echo "tsc exit: $?"
    ```
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && node -e "const p=require('./package.json'); if(!p.scripts||!p.scripts['gen:types'])throw new Error('gen:types script missing'); if(!p.scripts['gen:types'].includes('htlolqbwhulyihguwdoq'))throw new Error('project id wrong in gen:types'); console.log('script OK')" && npx tsc --noEmit && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` scripts contains `"gen:types"` key
    - Value of `scripts.gen:types` contains the project id `htlolqbwhulyihguwdoq`
    - Value of `scripts.gen:types` contains `--schema public`
    - Value of `scripts.gen:types` writes output to `types/database.types.ts` (via `>` redirect)
    - `npx tsc --noEmit` exits 0 (zero TypeScript errors)
    - Running `npx tsc --noEmit` produces no diagnostic output (no warnings, no errors)
  </acceptance_criteria>
  <done>
    Wave 3 gate passed. TypeScript compiles with zero errors. gen:types script in place for Plan 04. Plan 04 can now safely run schema migration and regenerate types over the stub.
  </done>
</task>

</tasks>

<verification>
At the end of Plan 03, run these checks:

```bash
cd /Users/Kiumbura/Projects/scholera-mobile

# 1. NativeWind wiring — all three points
grep -q "nativewind/preset" tailwind.config.js && echo "✓ tailwind preset"
grep -q "jsxImportSource.*nativewind" babel.config.js && echo "✓ babel jsxImportSource"
grep -q "withNativeWind" metro.config.js && echo "✓ metro withNativeWind"
grep -q "global.css" app/_layout.tsx && echo "✓ global.css imported in _layout"

# 2. url-polyfill first import in supabase client
head -5 lib/supabase.ts | grep -q "react-native-url-polyfill/auto" && echo "✓ url-polyfill first"

# 3. No SecureStore, no hardcoded keys
! grep -q "SecureStore" lib/supabase.ts && echo "✓ AsyncStorage not SecureStore"
! grep -qE "(eyJ|htlolqbwhulyihguwdoq\.supabase\.co)" lib/supabase.ts && echo "✓ no hardcoded credentials"

# 4. TypeScript compiles
npx tsc --noEmit && echo "✓ tsc passes"
```

All 4 sections must print success.
</verification>

<success_criteria>
- [ ] All 5 NativeWind config files at repo root with exact verbatim contents
- [ ] `tsconfig.json` has strict mode + `@/*` path aliases
- [ ] ARCHITECTURE.md directory tree created
- [ ] `lib/supabase.ts` has url-polyfill FIRST + AsyncStorage + detectSessionInUrl false + env-var credentials only
- [ ] `app/_layout.tsx` imports `../global.css` FIRST and wraps in SafeAreaProvider
- [ ] `types/database.types.ts` stub satisfies `tsc` compile
- [ ] `types/app.types.ts` exports Role + 11 domain type aliases
- [ ] `theme/tokens.ts` stub exists for Phase 2 to populate
- [ ] `package.json` has `gen:types` script
- [ ] `npx tsc --noEmit` exits 0 — ZERO TypeScript errors
</success_criteria>

<output>
After completion, create `/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-scaffold-03-SUMMARY.md` documenting:
- Confirmation all 5 NativeWind config files written
- Paste `head -5 lib/supabase.ts` output to prove url-polyfill is first
- Confirmation `npx tsc --noEmit` returned zero errors (paste exit status)
</output>
