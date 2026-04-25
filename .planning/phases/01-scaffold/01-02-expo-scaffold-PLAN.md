---
phase: 01-scaffold
plan: 02
type: execute
wave: 2
depends_on:
  - 01
files_modified:
  - package.json
  - package-lock.json
  - app.json
  - tsconfig.json
  - index.ts
  - app/
  - .gitignore
  - assets/
requirements: []
autonomous: true

must_haves:
  truths:
    - "`npx expo start` can launch the bundler without errors (command exits 0 during startup)"
    - "All pinned dependencies from STACK.md are installed at correct versions (Expo SDK 54, NativeWind 4.2.3, supabase-js 2.103.3, etc.)"
    - "`app.json` has `expo.scheme: scholera` and `newArchEnabled: false`"
    - "The demo tab screens from create-expo-app default template are removed"
    - "`.gitignore` still excludes `.env*` (Plan 01's rules preserved after scaffold merge)"
  artifacts:
    - path: "package.json"
      provides: "Locked dependency manifest"
      contains: "\"expo\""
    - path: "app.json"
      provides: "Expo project config with scheme and new arch disabled"
      contains: "\"scheme\": \"scholera\""
    - path: "tsconfig.json"
      provides: "TypeScript config (will be overwritten by Plan 03 with strict + path aliases)"
      contains: "\"extends\": \"expo/tsconfig.base\""
  key_links:
    - from: "package.json"
      to: "Expo SDK 54"
      via: "expo dependency version"
      pattern: "\"expo\":\\s*\"~?5[04]"
    - from: "app.json"
      to: "deep link scheme"
      via: "expo.scheme field"
      pattern: "\"scheme\":\\s*\"scholera\""
    - from: ".gitignore"
      to: ".env rules from Plan 01"
      via: "preserved after merge with create-expo-app's .gitignore"
      pattern: "\\.env\\.local"
---

<objective>
Scaffold the Expo SDK 54 project in place and install every pinned dependency from STACK.md. Remove the create-expo-app demo content. Verify the final `.gitignore` still excludes `.env*` after scaffold.

Purpose: This plan produces the `node_modules/` tree, the `package.json` lock, the initial `app.json`/`tsconfig.json`/`babel.config.js` (which Plan 03 will overwrite with NativeWind-aware versions), and the stub `app/_layout.tsx` file. No config file customization happens here — that is Plan 03's job. Keep this plan focused on "the project runs" not "the project is configured for our use case."
Output: A working `package.json` with all pinned deps, a bare `app/` directory containing only `_layout.tsx`, and `app.json` with `scheme: "scholera"` and `newArchEnabled: false`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-CONTEXT.md
@/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md

<interfaces>
Locked versions from CONTEXT.md and RESEARCH.md §"Standard Stack":

Expo-managed (via `npx expo install`):
- @react-native-async-storage/async-storage (latest resolved for SDK 54)
- react-native-url-polyfill ^2.0.0
- react-native-reanimated ~3.x
- react-native-safe-area-context 5.7.0
- react-native-svg (SDK 54 resolved)
- expo-font
- @expo-google-fonts/inter

Pinned npm (exact versions):
- @supabase/supabase-js@^2.103.3
- nativewind@^4.2.3
- tailwindcss@^3.4.17
- @tanstack/react-query@^5.99.2
- react-hook-form@^7.73.1
- @hookform/resolvers@^3
- zod@^3  (NOT zod/v4 — see PITFALLS)
- lucide-react-native@^1.8.0
- base64-arraybuffer@^1.0.2

Dev:
- prettier-plugin-tailwindcss
- @tanstack/query-devtools

Do NOT install: expo-document-picker, expo-file-system, expo-image-picker, expo-linear-gradient (deferred to later phases).
Do NOT run: `npm install expo@latest` (upgrades to SDK 55 — breaks NativeWind v4).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold Expo SDK 54 project in place using create-expo-app</name>
  <files>
    /Users/Kiumbura/Projects/scholera-mobile/package.json,
    /Users/Kiumbura/Projects/scholera-mobile/app.json,
    /Users/Kiumbura/Projects/scholera-mobile/tsconfig.json,
    /Users/Kiumbura/Projects/scholera-mobile/babel.config.js,
    /Users/Kiumbura/Projects/scholera-mobile/index.ts,
    /Users/Kiumbura/Projects/scholera-mobile/app/,
    /Users/Kiumbura/Projects/scholera-mobile/assets/,
    /Users/Kiumbura/Projects/scholera-mobile/.gitignore
  </files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Installation Commands" (verbatim commands)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"`create-expo-app --template default` — What to Delete"
    - /Users/Kiumbura/Projects/scholera-mobile/.gitignore (Plan 01 wrote this — must not be overwritten)
    - /Users/Kiumbura/Projects/scholera-mobile/ (directory listing to see what exists before scaffold)
  </read_first>
  <action>
    **Key constraint: `/Users/Kiumbura/Projects/scholera-mobile/` already contains `.git/`, `.planning/`, `CLAUDE.md`, `reference/`, `.gitignore`, `.env.example`, `.env.local`. `create-expo-app` does NOT install into a non-empty directory. Use the temp-dir-then-merge strategy.**

    Step 1 — Scaffold into a temp sibling directory:
    ```bash
    cd /Users/Kiumbura/Projects
    rm -rf /tmp/scholera-scaffold 2>/dev/null
    npx create-expo-app@latest /tmp/scholera-scaffold --template default
    ```
    This creates `/tmp/scholera-scaffold/` with Expo SDK 54 + TypeScript + Expo Router v4 pre-wired. `create-expo-app` v3.5.3 defaults to SDK 54 during SDK 55 transition period (per RESEARCH.md §Summary).

    Step 2 — Move scaffold files into the real repo, SKIPPING `.git`, `.gitignore` (we preserve Plan 01's), and any file that already exists from Plan 01:
    ```bash
    # List what's in the scaffold
    ls -la /tmp/scholera-scaffold

    # Move everything EXCEPT .git and .gitignore
    cd /tmp/scholera-scaffold
    for item in $(ls -A); do
      if [ "$item" != ".git" ] && [ "$item" != ".gitignore" ]; then
        # Skip if it already exists in the destination (protects .env.example, .env.local, CLAUDE.md, .planning, reference)
        if [ ! -e "/Users/Kiumbura/Projects/scholera-mobile/$item" ]; then
          mv "$item" "/Users/Kiumbura/Projects/scholera-mobile/"
        else
          echo "SKIPPED existing: $item"
        fi
      fi
    done
    ```

    Step 3 — Merge `create-expo-app`'s `.gitignore` into the existing one (Plan 01's rules are authoritative for `.env*`; create-expo-app adds Metro/build rules). Read the scaffold's .gitignore, append any lines not already present in the repo's .gitignore:
    ```bash
    # Append scaffold's lines that aren't already in the repo .gitignore
    while IFS= read -r line; do
      if [ -n "$line" ] && ! grep -Fxq "$line" /Users/Kiumbura/Projects/scholera-mobile/.gitignore 2>/dev/null; then
        echo "$line" >> /Users/Kiumbura/Projects/scholera-mobile/.gitignore
      fi
    done < /tmp/scholera-scaffold/.gitignore
    ```

    Step 4 — Verify `.env.local` rule survived the merge:
    ```bash
    grep -q "^\.env\.local$" /Users/Kiumbura/Projects/scholera-mobile/.gitignore || { echo "FATAL: .env.local rule lost"; exit 1; }
    ```
    If this check fails, re-add: `echo ".env.local" >> /Users/Kiumbura/Projects/scholera-mobile/.gitignore`

    Step 5 — Clean up the temp scaffold:
    ```bash
    rm -rf /tmp/scholera-scaffold
    ```

    Step 6 — Remove the demo tab screens from the default template (per RESEARCH.md §"What to Delete"):
    ```bash
    rm -rf "/Users/Kiumbura/Projects/scholera-mobile/app/(tabs)"
    rm -f "/Users/Kiumbura/Projects/scholera-mobile/app/+not-found.tsx"
    # KEEP: /Users/Kiumbura/Projects/scholera-mobile/app/_layout.tsx — it's a reasonable base for Plan 03
    ```

    If `app/(tabs)` does not exist (template may vary), that's fine — proceed. If `app/_layout.tsx` is missing, also fine — Plan 03 creates it from scratch.

    DO NOT run `npm install expo@latest` — this would upgrade to SDK 55 (breaks NativeWind v4 per PITFALLS P1-C).
  </action>
  <verify>
    <automated>test -f /Users/Kiumbura/Projects/scholera-mobile/package.json && test -f /Users/Kiumbura/Projects/scholera-mobile/app.json && test -d /Users/Kiumbura/Projects/scholera-mobile/app && grep -q "\"expo\"" /Users/Kiumbura/Projects/scholera-mobile/package.json && grep -q "^\.env\.local$" /Users/Kiumbura/Projects/scholera-mobile/.gitignore && test -f /Users/Kiumbura/Projects/scholera-mobile/.env.example && test -f /Users/Kiumbura/Projects/scholera-mobile/CLAUDE.md && ! test -d "/Users/Kiumbura/Projects/scholera-mobile/app/(tabs)" && echo "OK"</automated>
  </verify>
  <acceptance_criteria>
    - `/Users/Kiumbura/Projects/scholera-mobile/package.json` exists and contains `"expo"` as a dependency key
    - `/Users/Kiumbura/Projects/scholera-mobile/app.json` exists (will be rewritten in Task 3)
    - `/Users/Kiumbura/Projects/scholera-mobile/app/` directory exists
    - `/Users/Kiumbura/Projects/scholera-mobile/app/(tabs)/` directory does NOT exist (demo content removed)
    - `/Users/Kiumbura/Projects/scholera-mobile/.gitignore` still contains `.env.local` on a line by itself (merge preserved Plan 01 rules)
    - `/Users/Kiumbura/Projects/scholera-mobile/.env.example` still exists (protected from overwrite)
    - `/Users/Kiumbura/Projects/scholera-mobile/CLAUDE.md` still exists (protected from overwrite)
    - `/Users/Kiumbura/Projects/scholera-mobile/.planning/` directory still intact
    - `/tmp/scholera-scaffold/` no longer exists (cleaned up)
  </acceptance_criteria>
  <done>
    Expo SDK 54 scaffold merged into the existing repo without overwriting planning artifacts or `.env*` files. Demo tab screens removed. Ready for pinned dependency install.
  </done>
</task>

<task type="auto">
  <name>Task 2: Install pinned dependencies via npx expo install and npm install</name>
  <files>
    /Users/Kiumbura/Projects/scholera-mobile/package.json,
    /Users/Kiumbura/Projects/scholera-mobile/package-lock.json,
    /Users/Kiumbura/Projects/scholera-mobile/node_modules/
  </files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Installation Commands" (verbatim commands — use these exactly)
    - /Users/Kiumbura/Projects/scholera-mobile/package.json (after Task 1 — inspect what create-expo-app already installed)
  </read_first>
  <action>
    Run these commands in order from `/Users/Kiumbura/Projects/scholera-mobile/`. Use `cd /Users/Kiumbura/Projects/scholera-mobile` at the start of each bash tool call (working dir resets between calls).

    Step 1 — Install Expo-managed packages (uses Expo's compatibility matrix to pin correct versions for SDK 54):
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile && npx expo install \
      @react-native-async-storage/async-storage \
      react-native-url-polyfill \
      react-native-reanimated \
      react-native-safe-area-context \
      react-native-svg \
      expo-font \
      @expo-google-fonts/inter
    ```

    Step 2 — Install npm-pinned packages (exact versions from STACK.md):
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile && npm install \
      @supabase/supabase-js@^2.103.3 \
      nativewind@^4.2.3 \
      tailwindcss@^3.4.17 \
      @tanstack/react-query@^5.99.2 \
      react-hook-form@^7.73.1 \
      "@hookform/resolvers@^3" \
      zod@^3 \
      lucide-react-native@^1.8.0 \
      base64-arraybuffer@^1.0.2
    ```

    Step 3 — Install dev dependencies:
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile && npm install -D \
      prettier-plugin-tailwindcss \
      @tanstack/query-devtools
    ```

    **IMPORTANT:** Do NOT run any of these (they will break the project):
    - `npm install expo@latest` — upgrades to SDK 55 (NativeWind v4 incompat)
    - `npm install zod@4` or `npm install zod/v4` — RN runtime crash per STACK.md
    - `npm install nativewind@5` — pre-release, not production-ready
    - `npm install react-native-reanimated@4` — NativeWind v4 requires v3

    If `npm install` throws peer dep warnings about React / React Native versions, they are USUALLY safe to ignore during SDK 54 transition — verify by reading the warning carefully. If it's actually a hard error (EPEERINVALID with exit code ≠ 0), check which package is fighting and adjust the version ranges back to what STACK.md specifies (do NOT add `--legacy-peer-deps` flags unless every other option is exhausted).

    Step 4 — Verify packages landed in node_modules AND package.json has the expected keys:
    ```bash
    cd /Users/Kiumbura/Projects/scholera-mobile
    ls node_modules/@supabase/supabase-js > /dev/null
    ls node_modules/nativewind > /dev/null
    ls node_modules/@tanstack/react-query > /dev/null
    ls node_modules/zod > /dev/null
    echo "Packages installed OK"
    ```

    Reference: STACK.md locked versions; PITFALLS.md 4 critical items.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && node -e "const p=require('./package.json'); const d={...p.dependencies, ...p.devDependencies}; const need=['@supabase/supabase-js','nativewind','tailwindcss','@tanstack/react-query','react-hook-form','@hookform/resolvers','zod','lucide-react-native','base64-arraybuffer','react-native-url-polyfill','@react-native-async-storage/async-storage','react-native-reanimated','react-native-safe-area-context','react-native-svg','expo-font','@expo-google-fonts/inter','prettier-plugin-tailwindcss','@tanstack/query-devtools']; const missing=need.filter(n=>!d[n]); if(missing.length){console.error('MISSING:',missing);process.exit(1)} else {console.log('OK')}"</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` dependencies includes every one of: `@supabase/supabase-js`, `nativewind`, `tailwindcss`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react-native`, `base64-arraybuffer`, `react-native-url-polyfill`, `@react-native-async-storage/async-storage`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-svg`, `expo-font`, `@expo-google-fonts/inter`
    - `package.json` devDependencies includes `prettier-plugin-tailwindcss` and `@tanstack/query-devtools`
    - `package.json` dependencies for `zod` is `^3.x.x` (NOT `^4.*` — checked via `node -e "console.log(require('./package.json').dependencies.zod)"` starts with `^3`)
    - `package.json` dependencies for `nativewind` starts with `^4.` (NOT `^5.*`)
    - `package.json` dependencies for `expo` starts with `~54.` or `^54.` (NOT 55)
    - `node_modules/@supabase/supabase-js/`, `node_modules/nativewind/`, `node_modules/@tanstack/react-query/`, `node_modules/zod/` all exist
    - `npm ls --depth=0 2>&1 | grep -E "(ERESOLVE|peer dep missing)"` returns no BLOCKING errors (warnings are OK)
  </acceptance_criteria>
  <done>
    All pinned dependencies installed. `package.json` lists every required library at the correct major version. `node_modules` has every package. No critical peer dep errors.
  </done>
</task>

<task type="auto">
  <name>Task 3: Customize app.json with scheme, bundleIdentifier, and newArchEnabled: false</name>
  <files>/Users/Kiumbura/Projects/scholera-mobile/app.json</files>
  <read_first>
    - /Users/Kiumbura/Projects/scholera-mobile/app.json (as generated by create-expo-app — see current state)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"`app.json` (Expo config — planner fills `{YOUR_SLUG}` if needed)" (verbatim target contents)
    - /Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-RESEARCH.md §"Pitfall P1-C: `newArchEnabled: true` in `app.json`" (why this matters)
  </read_first>
  <action>
    Overwrite `/Users/Kiumbura/Projects/scholera-mobile/app.json` with these EXACT contents (verbatim from RESEARCH.md §"`app.json`"; do not deviate):

    ```json
    {
      "expo": {
        "name": "Scholera",
        "slug": "scholera-mobile",
        "scheme": "scholera",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/images/icon.png",
        "userInterfaceStyle": "light",
        "newArchEnabled": false,
        "ios": {
          "supportsTablet": false,
          "bundleIdentifier": "ai.vectorverseevolve.scholera"
        },
        "android": {
          "adaptiveIcon": {
            "foregroundImage": "./assets/images/adaptive-icon.png",
            "backgroundColor": "#ffffff"
          },
          "package": "ai.vectorverseevolve.scholera"
        },
        "web": {
          "bundler": "metro",
          "output": "static",
          "favicon": "./assets/images/favicon.png"
        },
        "plugins": ["expo-router", "expo-font"],
        "experiments": {
          "typedRoutes": true
        }
      }
    }
    ```

    CRITICAL fields (per PITFALLS P1-C and D-19):
    - `"newArchEnabled": false` — NativeWind v4 does NOT support RN New Architecture. Without this, animations silently fail.
    - `"scheme": "scholera"` — Required for Phase 7 deep linking (`scholera://courses/...`). Registering the scheme now prevents Phase 7 blocker.
    - `"bundleIdentifier": "ai.vectorverseevolve.scholera"` — Matches user's email domain per CONTEXT.md Claude discretion.

    If the icon / adaptive-icon / favicon paths point to files that don't exist (create-expo-app usually provides them at `./assets/images/`), verify with `ls -la /Users/Kiumbura/Projects/scholera-mobile/assets/images/` — if files are missing, that's a Phase 2 concern, not Phase 1. The paths just need to be declared; runtime will complain only if assets are truly referenced (which they aren't yet because we have no screens).

    Reference: RESEARCH.md §app.json, D-19, PITFALLS P1-C.
  </action>
  <verify>
    <automated>node -e "const c=require('/Users/Kiumbura/Projects/scholera-mobile/app.json'); if(c.expo.scheme!=='scholera')throw new Error('scheme wrong: '+c.expo.scheme); if(c.expo.newArchEnabled!==false)throw new Error('newArchEnabled must be false'); if(c.expo.name!=='Scholera')throw new Error('name wrong'); if(!c.expo.plugins||!c.expo.plugins.includes('expo-router'))throw new Error('expo-router plugin missing'); console.log('OK')"</automated>
  </verify>
  <acceptance_criteria>
    - `app.json` is valid JSON (parses via `node -e "require('./app.json')"`)
    - `expo.scheme` equals `"scholera"` (exact string match)
    - `expo.newArchEnabled` equals `false` (boolean, NOT the string "false")
    - `expo.name` equals `"Scholera"`
    - `expo.slug` equals `"scholera-mobile"`
    - `expo.plugins` array contains `"expo-router"`
    - `expo.plugins` array contains `"expo-font"`
    - `expo.experiments.typedRoutes` equals `true`
    - `expo.ios.bundleIdentifier` equals `"ai.vectorverseevolve.scholera"`
    - `expo.android.package` equals `"ai.vectorverseevolve.scholera"`
  </acceptance_criteria>
  <done>
    `app.json` has scheme, bundle identifier, newArchEnabled disabled, and plugins registered. Ready for NativeWind wiring in Plan 03.
  </done>
</task>

</tasks>

<verification>
At the end of Plan 02, run these to confirm scaffold is healthy:

```bash
cd /Users/Kiumbura/Projects/scholera-mobile

# package.json has expo and all pinned libs
node -e "const p=require('./package.json'); console.log('expo:', p.dependencies.expo); console.log('nativewind:', p.dependencies.nativewind); console.log('supabase-js:', p.dependencies['@supabase/supabase-js']); console.log('zod:', p.dependencies.zod)"

# app.json has scheme + newArchEnabled false
node -e "const c=require('./app.json'); console.log('scheme:', c.expo.scheme); console.log('newArchEnabled:', c.expo.newArchEnabled); console.log('plugins:', c.expo.plugins)"

# .env rules preserved
grep -c "^\.env" .gitignore

# No tab demo content
ls app/
```

Expected: expo ~54.x, nativewind ^4.2.3, supabase-js ^2.103.3, zod ^3.x, scheme "scholera", newArchEnabled false, plugins array has expo-router + expo-font, gitignore has ≥3 .env lines, app/ contains only _layout.tsx (possibly +not-found.tsx removed).
</verification>

<success_criteria>
- [ ] Expo SDK 54 project scaffolded in place without destroying .planning/, .env.local, .env.example, CLAUDE.md, reference/
- [ ] All pinned dependencies installed at correct versions
- [ ] `app.json` has `scheme: scholera`, `newArchEnabled: false`, plugins registered
- [ ] `.gitignore` still excludes `.env*` (Plan 01 rules preserved)
- [ ] Demo tab screens removed from `app/`
</success_criteria>

<output>
After completion, create `/Users/Kiumbura/Projects/scholera-mobile/.planning/phases/01-scaffold/01-scaffold-02-SUMMARY.md` documenting:
- Exact versions installed (run `npm ls --depth=0 | head -40`)
- Any peer dep warnings encountered and how resolved
- Confirmation that `.env.local` rule survived the .gitignore merge
</output>
