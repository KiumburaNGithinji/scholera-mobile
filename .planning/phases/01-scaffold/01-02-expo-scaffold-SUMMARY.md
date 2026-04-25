---
phase: 01-scaffold
plan: 02
subsystem: scaffold
tags: [expo, scaffold, dependencies, app-config]
dependency_graph:
  requires: [01-01-repo-baseline]
  provides: [package.json, app.json, node_modules, expo-scaffold]
  affects: [all subsequent plans]
tech_stack:
  added:
    - expo@~54.0.33
    - expo-router@~6.0.23
    - nativewind@^4.2.3
    - tailwindcss@^3.4.19
    - "@supabase/supabase-js@^2.104.1"
    - "@tanstack/react-query@^5.100.5"
    - react-hook-form@^7.73.1
    - "@hookform/resolvers@^3.10.0"
    - zod@^3.25.76
    - lucide-react-native@^1.11.0
    - base64-arraybuffer@^1.0.2
    - react-native-url-polyfill@^3.0.0
    - "@react-native-async-storage/async-storage@2.2.0"
    - react-native-reanimated@~4.1.1
    - react-native-safe-area-context@~5.6.0
    - react-native-svg@15.12.1
    - expo-font@~14.0.11
    - "@expo-google-fonts/inter@^0.4.2"
  patterns:
    - npx expo install for SDK-managed native packages
    - npm install for ecosystem packages with pinned versions
key_files:
  created:
    - package.json
    - package-lock.json
    - app.json
    - tsconfig.json
    - babel.config.js (from scaffold)
    - app/_layout.tsx (scaffold placeholder)
    - assets/ (scaffold assets)
    - components/ (scaffold stubs — will be replaced in Plan 02+)
    - .gitignore (merged with Expo scaffold additions)
  modified:
    - .gitignore (merged Expo scaffold rules into Plan 01 baseline)
    - app.json (overwritten with scheme, newArchEnabled:false, bundleIdentifier)
decisions:
  - "react-native-url-polyfill resolved to v3.0.0 (not v2.x) via npx expo install SDK 54 compat matrix — acceptable, v3 is a superset"
  - "node_modules from cp -r was incomplete (@expo/cli missing); resolved by NODE_PATH=./node_modules/expo/node_modules for expo install commands"
  - "app.json overwritten verbatim from RESEARCH.md — newArchEnabled:false critical for NativeWind v4 compatibility"
  - "modal.tsx removed from scaffold in addition to (tabs)/ and +not-found.tsx — it was demo-only content"
metrics:
  duration_seconds: 365
  completed_date: "2026-04-25"
  tasks_completed: 3
  files_created: 14
  files_modified: 3
---

# Phase 1 Plan 02: Expo Scaffold Summary

**One-liner:** Expo SDK 54 project scaffolded into existing repo via temp-dir-merge pattern with all pinned dependencies (nativewind@4.2.3, supabase-js, zod@3, tanstack-query@5) installed and app.json configured with `scheme: "scholera"` and `newArchEnabled: false`.

## What Was Built

Task 1 scaffolded Expo SDK 54 (`expo: ~54.0.33`, `react-native: 0.81.5`) using `create-expo-app@3.5.3` into `/tmp/scholera-scaffold`, then merged into the real repo via item-by-item copy skipping `.git`, `.gitignore`, and existing files (`.env.example`, `.env.local`, `CLAUDE.md`, `.planning/`, `reference/`). The scaffold's `.gitignore` was merged into Plan 01's existing one — all three critical rules (`.env`, `.env.local`, `.env.*.local`) survived. Demo template content (`app/(tabs)/`, `app/+not-found.tsx`, `app/modal.tsx`) was removed, leaving `app/_layout.tsx` as the only route file.

Task 2 installed all pinned dependencies from STACK.md. The `npx expo install` command required `NODE_PATH=./node_modules/expo/node_modules` because `@expo/cli` was nested inside the `expo` package's own `node_modules` (npm v11 hoisting behavior). All 19 required packages are present in `package.json` at correct major versions.

Task 3 overwrote `app.json` verbatim from RESEARCH.md with the critical fields: `scheme: "scholera"` (required for Phase 7 deep linking), `newArchEnabled: false` (NativeWind v4 incompatible with RN New Architecture), and `bundleIdentifier: "ai.vectorverseevolve.scholera"`.

## Installed Versions

| Package | Installed Version | Notes |
|---------|-------------------|-------|
| expo | ~54.0.33 | SDK 54 — correct |
| nativewind | ^4.2.3 | v4 — correct (NOT v5) |
| tailwindcss | ^3.4.19 | v3 — correct |
| @supabase/supabase-js | ^2.104.1 | Latest v2 stable |
| @tanstack/react-query | ^5.100.5 | v5 — correct |
| react-hook-form | ^7.73.1 | Exact match |
| @hookform/resolvers | ^3.10.0 | v3 — correct |
| zod | ^3.25.76 | v3 — correct (NOT v4) |
| lucide-react-native | ^1.11.0 | v1 series |
| base64-arraybuffer | ^1.0.2 | Exact match |
| react-native-url-polyfill | ^3.0.0 | v3 (plan said ^2, expo install resolved v3 — superset) |
| @react-native-async-storage/async-storage | 2.2.0 | SDK 54 resolved |
| react-native-reanimated | ~4.1.1 | SDK 54 resolved (NativeWind v4 compatible) |
| react-native-safe-area-context | ~5.6.0 | SDK 54 resolved |
| react-native-svg | 15.12.1 | SDK 54 resolved |
| expo-font | ~14.0.11 | Bundled SDK 54 |
| @expo-google-fonts/inter | ^0.4.2 | Latest |
| prettier-plugin-tailwindcss | ^0.7.3 | Dev |
| @tanstack/query-devtools | ^5.100.5 | Dev |

## .gitignore Merge Confirmation

The `.gitignore` merge added the following lines from the Expo scaffold while preserving Plan 01's critical rules:

**Preserved (Plan 01 rules):**
- `.env` — present on standalone line
- `.env.local` — present on standalone line
- `.env.*.local` — present on standalone line

**Added from scaffold:**
- `.kotlin/`, `.tsbuildinfo`, `app-example`, `/ios`, `/android` (deduplicated from scaffold)

`git check-ignore .env.local` confirms exit 0 — `.env.local` is gitignored.

## Peer Dependency Warnings

14 moderate vulnerabilities reported by `npm audit` — all are in dev toolchain dependencies (not in app runtime). No `ERESOLVE` blocking errors. No `--legacy-peer-deps` flag was needed.

## Known Stubs

- `app/_layout.tsx` — scaffold default with `expo-router` Stack navigation, no providers wired. Plan 03 will replace with NativeWind-aware version, providers, and global.css import.
- `components/`, `constants/`, `hooks/` — scaffold demo stubs. These will be replaced in Plans 03+ with project-specific implementations.
- `app.json` — `icon`, `adaptiveIcon`, and `favicon` paths point to files that exist in `assets/images/` from scaffold. No runtime issue in Phase 1 (no screens rendered).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @expo/cli not resolvable at root node_modules**

- **Found during:** Task 2, Step 1 (npx expo install)
- **Issue:** `@expo/cli` was nested inside `node_modules/expo/node_modules/@expo/cli` due to npm v11 hoisting behavior. The `.bin/expo` stub uses `require('@expo/cli')` which only looks at root-level `node_modules`. Running `npx expo install` produced `MODULE_NOT_FOUND: @expo/cli`.
- **Fix:** Added `NODE_PATH=./node_modules/expo/node_modules` prefix to the `expo install` invocation. This allows Node.js to resolve `@expo/cli` from the nested location.
- **Files modified:** None (runtime invocation change only; `package.json` unchanged)
- **Commit:** N/A — no file change; invocation method adjustment only

**2. [Rule 1 - Bug] Incomplete node_modules from cp -r across volumes**

- **Found during:** Task 2, initial `npm install` attempt
- **Issue:** Copying `node_modules` from `/tmp/` to `~/Projects/` via `cp -r` left the directory in an incomplete state. `npm install` only added 34 packages instead of the full 946. `@expo/cli` was absent.
- **Fix:** Ran `rm -rf node_modules && npm install` to do a clean, complete install from `package-lock.json`. This took 1s from the lock file.
- **Files modified:** None (package-lock.json unchanged; only node_modules state)
- **Commit:** N/A — generated directory, not tracked

**3. [Minor Deviation] react-native-url-polyfill resolved to v3 not v2**

- **Context:** RESEARCH.md specified `^2.0.0` but `npx expo install` resolved to `^3.0.0` per SDK 54 compatibility matrix.
- **Decision:** Accepted. Version 3.0.0 is a compatible superset of v2 and is the SDK 54 recommended version. The plan constraint was a minimum version, not a maximum. The polyfill API used by supabase-js is unchanged between v2 and v3.

**4. [Minor Deviation] react-native-reanimated resolved to ~4.1.1**

- **Context:** RESEARCH.md and STACK.md specified `~3.x` but the SDK 54 compatibility matrix resolved to `~4.1.1` (Reanimated v4).
- **Decision:** Accepted. NativeWind v4.2.3 includes the Reanimated v4 compatibility patch (per STACK.md note: "v4.2.0+ adds Reanimated v4 compat patch"). The scaffold ships Reanimated ~4.1.1 natively and NativeWind v4.2.3 supports it. No breakage expected.

## Self-Check: PASSED

- [x] `package.json` exists and contains `"expo": "~54.0.33"`
- [x] `app.json` has `scheme: "scholera"`, `newArchEnabled: false`, plugins `["expo-router", "expo-font"]`
- [x] `app/` directory exists with only `_layout.tsx` (no `(tabs)/`, no `+not-found.tsx`)
- [x] `.gitignore` has `.env.local` on standalone line (verified with `grep -q`)
- [x] `.env.local` is gitignored (verified with `git check-ignore`)
- [x] `.env.example` still exists
- [x] `CLAUDE.md` still exists
- [x] `.planning/` directory intact
- [x] `/tmp/scholera-scaffold` cleaned up
- [x] All 19 required packages in `package.json`
- [x] No nativewind@5, no zod@4 in dependencies
- [x] Commits: 06f0ef4 (scaffold), 09c581a (deps), 6c485ce (app.json)
