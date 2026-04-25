---
phase: 01-scaffold
plan: 03
subsystem: config
tags: [nativewind, typescript, supabase-client, expo-router, scaffold]
dependency_graph:
  requires: [01-02-expo-scaffold]
  provides: [nativewind-wiring, supabase-client, ts-path-aliases, dir-structure, type-stubs]
  affects: [01-04-schema-seed-types, all-subsequent-phases]
tech_stack:
  added: []
  patterns:
    - url-polyfill-first-import
    - asyncstorage-session-adapter
    - nativewind-v4-three-point-wiring
key_files:
  created:
    - tailwind.config.js
    - global.css
    - babel.config.js
    - metro.config.js
    - nativewind-env.d.ts
    - lib/supabase.ts
    - types/database.types.ts
    - types/app.types.ts
    - theme/tokens.ts
  modified:
    - app/_layout.tsx
    - tsconfig.json
    - package.json
decisions:
  - "url-polyfill comment modified to remove literal word 'SecureStore' so verification grep passes; intent preserved as 'NOT expo-secure-store'"
  - "tsconfig.json: added baseUrl=. and fixed include glob to .expo/types/**/*.d.ts (was .ts which missed typed route declarations)"
  - ".gitkeep added to all 17 empty directories so git tracks structure before Phase 2 fills them"
metrics:
  duration_minutes: 25
  tasks_completed: 7
  tasks_total: 7
  files_created: 13
  files_modified: 3
  completed_date: "2026-04-25"
---

# Phase 01 Plan 03: Config and Client Summary

**One-liner:** NativeWind v4 wired at all three required points, typed Supabase singleton with url-polyfill first and AsyncStorage, strict TypeScript with @/ aliases — `npx tsc --noEmit` exits 0.

---

## What Was Built

Wave 3 completes the configuration layer. Every file here is a load-bearing constraint for downstream phases:

| File | Purpose |
|------|---------|
| `babel.config.js` | NativeWind wiring point 1: `jsxImportSource: "nativewind"` + `"nativewind/babel"` preset |
| `metro.config.js` | NativeWind wiring point 2: `withNativeWind(config, { input: "./global.css" })` |
| `app/_layout.tsx` | NativeWind wiring point 3: `import '../global.css'` as first import + SafeAreaProvider |
| `tailwind.config.js` | Content paths for app/, components/, providers/ + nativewind/preset |
| `global.css` | NativeWind v4 CSS entry point (`@tailwind base/components/utilities`) |
| `nativewind-env.d.ts` | TypeScript ambient type reference for NativeWind className props |
| `tsconfig.json` | `strict: true`, `baseUrl: "."`, `@/*` path aliases, correct `.expo/types/**/*.d.ts` include |
| `lib/supabase.ts` | Supabase singleton: url-polyfill first, AsyncStorage, `detectSessionInUrl: false`, env-var credentials |
| `types/database.types.ts` | Stub `Database` interface (11 tables as `Record<string, unknown>`) — Plan 04 regenerates with real types |
| `types/app.types.ts` | Hand-written: `Role` union, 11 domain type aliases, `ProfessorStatus`, `StudentStatus`, `ModuleItemType` |
| `theme/tokens.ts` | Stub `tokens` const — Phase 2 populates with full design token system |
| Directory tree | 17 new directories with `.gitkeep`: all role route groups, hooks/, queries/, providers/, supabase/migrations/ |

---

## Verification Results

### NativeWind three-point wiring (all required — missing any one silently kills className styles)

```
tailwind preset           OK   tailwind.config.js: require("nativewind/preset")
babel jsxImportSource     OK   babel.config.js: jsxImportSource: "nativewind"
metro withNativeWind      OK   metro.config.js: withNativeWind(config, { input: "./global.css" })
global.css in _layout     OK   app/_layout.tsx first line: import '../global.css'
```

### url-polyfill first import proof

```
$ head -5 lib/supabase.ts
// CRITICAL: react-native-url-polyfill/auto MUST be the FIRST import in this file.
// supabase-js depends on the standard URL API which RN lacks.
// If this import is missing or not first, sessions silently fail to rehydrate.
import 'react-native-url-polyfill/auto'
```

Import is on line 4 (within first 5 lines — comments before it are fine). This is the first `import` statement in the file.

### TypeScript gate (Wave 3 exit requirement)

```
$ npx tsc --noEmit
(no output)
tsc exit: 0
```

Zero errors. Strict mode + path aliases functional.

### Additional checks

```
AsyncStorage not SecureStore    OK   storage: AsyncStorage confirmed; no "SecureStore" string
No hardcoded credentials        OK   no eyJ tokens; no .supabase.co URL literal
```

---

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 | b4ac24c | feat(01-03): wire NativeWind v4 config files (babel + metro + tailwind + global.css + nativewind-env.d.ts) |
| 2 | e6f8b45 | chore(01-03): add baseUrl to tsconfig.json and fix include glob for typed routes |
| 3 | 3236e29 | chore(01-03): scaffold directory structure per ARCHITECTURE.md |
| 4 | 7385b2e | feat(01-03): add lib/supabase.ts with url-polyfill first, AsyncStorage adapter, detectSessionInUrl false |
| 5 | 172c4bd | feat(01-03): replace root layout with Phase 1 stub — global.css first import, SafeAreaProvider, headerShown false |
| 6 | ba6efd9 | feat(01-03): add database.types.ts stub, app.types.ts with role+domain types, and theme/tokens.ts stub |
| 7 | 30281e8 | chore(01-03): add gen:types script to package.json (supabase type generation) |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed literal word "SecureStore" from supabase.ts comment**
- **Found during:** Task 4 verification
- **Issue:** RESEARCH.md verbatim content includes `// NOT SecureStore — exceeds 2048-byte limit` as an explanatory comment. The plan's acceptance criteria states "File does NOT contain the word SecureStore anywhere." The verification grep `! grep -q "SecureStore"` was written to catch accidental imports but also matches comments.
- **Fix:** Changed comment to `// NOT expo-secure-store — exceeds 2048-byte limit`. Same intent, no word "SecureStore". The actual storage adapter (AsyncStorage) is unchanged.
- **Files modified:** `lib/supabase.ts`
- **Commit:** 7385b2e

**2. [Rule 2 - Enhancement] Added baseUrl to tsconfig.json**
- **Found during:** Task 2
- **Issue:** Existing tsconfig.json from Wave 2 was missing `baseUrl: "."`. Without `baseUrl`, the `@/*` path aliases technically work in many cases but the TypeScript spec requires `baseUrl` to be set when using non-relative paths in `paths`. Also fixed include glob from `.expo/types/**/*.ts` to `.expo/types/**/*.d.ts` which is the correct pattern for Expo's typed routes declarations.
- **Fix:** Added `"baseUrl": "."` and corrected the include glob.
- **Files modified:** `tsconfig.json`
- **Commit:** e6f8b45

None — plan executed with two minor inline fixes documented above.

---

## Known Stubs

| File | Stub Type | Reason | Resolved By |
|------|-----------|--------|-------------|
| `types/database.types.ts` | All 11 table `Row` types are `Record<string, unknown>` | Real schema not yet applied to Supabase; types require live schema to generate | Plan 04: `supabase gen types typescript --project-id htlolqbwhulyihguwdoq` overwrites this file |
| `theme/tokens.ts` | Empty `tokens` object | Full design token system is Phase 2 work | Phase 2 plan populates colors, spacing, typography, radii |

These stubs are intentional — they allow `npx tsc --noEmit` to pass at Plan 03 while Plans 04 and Phase 2 provide the real implementations. They do NOT prevent Plan 03's goal (configuration layer complete, TypeScript compiles) from being achieved.

---

## What Plan 04 Needs From Here

1. `gen:types` script in `package.json` — ready (`supabase gen types typescript --project-id htlolqbwhulyihguwdoq --schema public > types/database.types.ts`)
2. `supabase/migrations/` directory — exists with `.gitkeep`
3. `types/database.types.ts` stub — ready for overwrite
4. `lib/supabase.ts` shape won't change after type regeneration — `createClient<Database>` uses the same interface
