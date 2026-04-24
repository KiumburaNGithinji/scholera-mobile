<!-- GSD:project-start source:PROJECT.md -->
## Project

**Scholera Mobile**

A native mobile companion app for **Scholera**, an AI-native Learning Management System (LMS) currently web-only. The app serves three distinct roles — **admin**, **professor**, and **student** — each with a completely separate home experience after login. It authenticates via Supabase, detects the user's role from their profile, and routes them into the appropriate role-specific experience. This is a take-home prototype for a Mobile Developer Intern position at Scholera.

**Core Value:** **Role-aware, native-feeling mobile experience.** Login must correctly detect the role and route into an experience that feels distinct and purposeful for that role — not the same screens with different data.

### Constraints

- **Tech stack (preferred):** Expo (React Native) + TypeScript — stated preference in spec, fastest path to polish
- **Styling:** NativeWind (Tailwind for RN) — simple tokens, easy role-accent theming
- **Navigation:** Expo Router — file-based, native deep linking
- **Data:** `@supabase/supabase-js` + TanStack Query — server cache + loading/error states built in
- **State:** Minimal — TanStack Query for server state, React Context for auth/role/theme, Zustand only if needed
- **Timeline:** 2 days — submission due **2026-04-25**; today is 2026-04-23
- **Team:** Solo (Kiumbura)
- **Budget:** $0 (free Supabase tier, free Expo, free GitHub)
- **Submission:** Brand-new public GitHub repo (not forked from Scholera assessments repo)
- **Compatibility:** Demo on simulator OR physical device — either acceptable per spec
- **No hardcoded data:** Final submission must read/write live from Supabase
- **Human-authored AI_ASSISTANT_USAGE.md:** Hand-written, NOT AI-generated
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Expo SDK | **54** (default via `create-expo-app@latest`) | Framework shell, managed workflow | SDK 54 is the `create-expo-app` default in April 2026 and the last SDK where NativeWind v4 has stable, verified compatibility. SDK 55 ships RN 0.83 + mandatory New Architecture, but NativeWind v5 is still pre-release/unstable there. On a 2-day timeline, SDK 54 = zero compatibility gambling. |
| React Native | **0.81** (bundled with SDK 54) | Native runtime | Bundled — do not specify separately |
| TypeScript | **5.x** (strict) | Language | Spec-preferred. Strict mode catches role-type mismatches and Supabase query shape errors at compile time, not runtime. Essential for the role-routing logic. |
| Expo Router | **~4.0** (bundled with SDK 54) | File-based navigation + deep linking | File-system routes automatically map to `scholera://` deep links with zero manual `Linking.addEventListener` boilerplate. `app/courses/[courseId]/announcements/[announcementId].tsx` becomes `scholera://courses/{id}/announcements/{id}` for free. |
| NativeWind | **4.2.3** | Tailwind CSS utility classes in RN | Kiumbura already knows Tailwind (FamilyFinance). Token-based approach maps directly to design system: `className="bg-[var(--color-canvas)]"`. v4.2.0+ includes Reanimated v4 compatibility patch, so it works cleanly on SDK 54. Keep on v4 — v5 is not production-ready. |
| @supabase/supabase-js | **2.103.3** | Auth, Postgres REST, Storage | Latest stable. Provides auth (email/password), typed queries, and Storage SDK in one package. The single integration point for all backend needs. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-native-async-storage/async-storage | latest via `npx expo install` | Supabase session persistence | Required for auth token survival across app restarts. Official Supabase RN quickstart uses this. AsyncStorage wins over SecureStore here: Supabase sessions exceed SecureStore's 2048-byte hard limit. |
| react-native-url-polyfill | ^2.0.0 | URL/URLSearchParams polyfill | Required — RN JS runtime lacks standard URL API that supabase-js depends on. Must import `/auto` at the top of `lib/supabase.ts` before anything else. |
| @tanstack/react-query | **5.99.2** | Server state: caching, loading/error/pending states, refetch on focus | Every API call (courses, announcements, modules, roadmap) benefits from cache + `isPending` / `isError` flags. This is what makes skeletons and empty states effortless. The rubric grades "loading states" and "error handling" — TanStack Query makes both nearly automatic. |
| react-native-reanimated | **~3.x** (via `npx expo install`) | Animation engine for NativeWind + skeleton loaders | NativeWind v4 peer depends on Reanimated v3, not v4. `npx expo install react-native-reanimated` on SDK 54 with NativeWind 4.2.3 resolves to v3. Do not manually upgrade to Reanimated v4 — NativeWind v4 breaks. |
| react-native-safe-area-context | **5.7.0** (via `npx expo install`) | Safe area insets for notch/home-bar | Required peer dep for NativeWind and Expo Router. Wrap root in `<SafeAreaProvider>`. |
| react-hook-form | **7.73.1** | Form state management | Login form, create announcement, add module item. Prevents unnecessary re-renders vs controlled inputs. `Controller` wrapper for RN `TextInput`. |
| @hookform/resolvers | **^3.x** | Zod adapter for react-hook-form | Bridges `zodResolver` into `useForm`. |
| zod | **3.x** (import from `'zod'`, not `'zod/v4'`) | Schema validation | Zod v4 has a documented React Native incompatibility (`navigator.userAgent` undefined in RN runtime, GitHub issue #4690, opened June 2025, unresolved as of April 2026). Use Zod v3 — the `zod` package root still exports v3. |
| lucide-react-native | **1.8.0** | SVG icon set | 1,500+ clean SVG icons. Better than `@expo/vector-icons` for this project because: (1) SVG-based so icons respect NativeWind color classes correctly, (2) tree-shakable — only ship icons used, (3) stroke-width customization for the editorial aesthetic. Requires `react-native-svg` as peer dep. |
| react-native-svg | latest via `npx expo install` | SVG renderer (peer dep for lucide) | Required by lucide-react-native. Already in Expo managed workflow. |
| expo-document-picker | **55.0.13** (via `npx expo install`) | Pick PDF/PPT files from device storage | Module item file upload. Returns a file URI + metadata. Use `copyToCacheDirectory: true` so expo-file-system can read it immediately. Latest version = 55.x but installs correctly on SDK 54. |
| expo-file-system | via `npx expo install` | Read picked file as ArrayBuffer for upload | Required for `fetch(uri).then(r => r.arrayBuffer())` — the correct Supabase Storage upload path in RN (Blob/FormData don't work reliably in RN). |
| expo-image-picker | via `npx expo install` | Pick avatar image from camera roll | Profile screen avatar upload. Returns base64 or URI. Use URI + `arrayBuffer()` approach for consistency with document uploads. |
| @expo-google-fonts/inter | via `npx expo install` | Inter typeface | Clean, warm sans that matches the Claude-inspired design DNA. Use `useFonts` in root `_layout.tsx` before rendering. |
| expo-font | via `npx expo install` | Font loading infrastructure | Peer dep for `@expo-google-fonts/inter`. |
| base64-arraybuffer | ^1.0.2 | Base64 → ArrayBuffer conversion | Needed if image picker returns base64 string (when `base64: true`). Decode before passing to Supabase Storage `.upload()`. Prefer the `fetch(uri).arrayBuffer()` path when URI is available — it avoids this dependency. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| Expo Go | Development iteration on physical device | Works for most features. Does NOT support custom URI schemes — deep linking test requires a development build. |
| Development Build (`npx expo run:ios` / `npx expo run:android`) | Full native dev build for deep linking | Required for testing `scholera://` scheme. One-time compile; thereafter Expo's fast refresh works normally. |
| `npx uri-scheme open "scholera://courses/1/announcements/2" --ios` | Deep link testing | Tests custom scheme against simulator/device without needing a separate client. |
| TypeScript strict mode | Type safety | `"strict": true` in tsconfig. Enable `noUncheckedIndexedAccess` if time allows — catches array access bugs on roadmap nodes. |
| ESLint + `eslint-config-expo` | Linting | Comes with `create-expo-app`. Don't configure separately — follow the default. |
## Installation
# Create project (SDK 54 default as of April 2026)
# Core Expo packages (managed versions via Expo's resolver)
# npm packages (version-specific)
# Dev dependencies
## Critical Implementation Patterns
### 1. Supabase Client Initialization (React Native)
### 2. Deep Linking — How It Works With Expo Router
### 3. Role-Aware Theming with NativeWind
### 4. File Upload to Supabase Storage (PDF/PPT)
### 5. TanStack Query Integration for Role Data
## Alternatives Considered
| Recommended | Alternative | Why Alternative Was Rejected |
|-------------|-------------|------------------------------|
| Expo SDK 54 | Expo SDK 55 | SDK 55 mandates New Architecture with no fallback; NativeWind v5 (required for SDK 55) is pre-release and not production-stable as of April 2026. Risk too high for 2-day deadline. |
| Expo SDK 54 | Bare React Native | Bare RN requires manual deep linking config, manual build setup, no `npx expo install` managed versions. 40%+ more setup time for this scope. Spec says "Expo preferred." |
| Expo SDK 54 | Flutter | Different language (Dart), no Supabase JS SDK, would abandon existing TypeScript skills. |
| NativeWind 4.2.3 | Tamagui | Tamagui has a larger API surface and steeper initial setup. NativeWind is ~15 min to configure vs Tamagui's ~45 min. With a 2-day deadline and Tailwind already known, NativeWind is faster end-to-end. |
| NativeWind 4.2.3 | StyleSheet API | Raw StyleSheet has no design token abstraction — role-accent theming would require manual prop threading through every component. NativeWind's `vars()` approach handles this cleanly. |
| lucide-react-native | @expo/vector-icons | `@expo/vector-icons` is font-based. Font icons don't respond to CSS variable colors the same way SVG does. Lucide is SVG-native and tree-shakable. |
| lucide-react-native | react-native-heroicons | Heroicons v3 has fewer icons; Lucide has 1,500+. No functional difference — Lucide has more breadth for LMS icons (books, file types, departments). |
| Zod v3 | Zod v4 | Zod v4 throws on `navigator.userAgent` (undefined in RN runtime). GitHub issue #4690 opened June 2025, unresolved April 2026. Use v3 from `'zod'` package root. |
| AsyncStorage | SecureStore | SecureStore has a 2048-byte hard limit per key. Supabase session tokens exceed this. Documented failure mode. AsyncStorage is the Supabase-recommended storage for React Native. |
| TanStack Query v5 | SWR | TanStack Query v5 has better React Native support (offline, focus management), more granular `isPending`/`isFetching`/`isError` states, and mutation support needed for create-announcement and module CRUD. |
| TanStack Query v5 | Redux Toolkit Query | RTK Query is overkill for this scope. No Redux devtools needed. TanStack Query alone handles all server state needs cleanly. |
| React Context | Zustand | Zustand is justified when app-level state is complex and has many independent subscribers. For this app: `AuthContext` (user + role) and `RoleThemeContext` are the only global state needs — 2 contexts is not complex enough to warrant Zustand. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| NativeWind v5 | Pre-release, not production-stable as of April 2026. Active migration issues with SDK 54/55. Maintainers explicitly say: not for production yet. | NativeWind v4.2.3 |
| Expo SDK 55 (for greenfield today) | NativeWind v5 required; NativeWind v5 is unstable; New Architecture mandatory with no fallback. On a 2-day deadline, this is a coinflip. | Expo SDK 54 |
| Zod v4 (from `'zod/v4'` subpath) | `navigator.userAgent` crash in RN runtime. GitHub issue open June 2025, not resolved. | `import { z } from 'zod'` — resolves to v3 |
| Redux / Redux Toolkit | Full state machine for a 2-day prototype with only auth + role as global state is 4x the boilerplate for 0 benefit. | React Context + TanStack Query |
| React Navigation (standalone) | Expo Router wraps React Navigation and adds file-based routing and automatic deep linking. Manual React Navigation setup loses automatic deep link mapping — you'd write `linking.config` by hand. | Expo Router |
| Reanimated v4 (with NativeWind) | NativeWind v4 explicitly requires Reanimated v3. Mixing versions breaks NativeWind's animation engine. | Let `npx expo install react-native-reanimated` resolve the correct version (~3.x on SDK 54 with NativeWind). |
| `Blob` / `FormData` for Supabase Storage uploads | Results in 0-byte uploads in React Native. Documented in Supabase official docs: "For React Native, using either Blob, File or FormData does not work as intended." | `fetch(uri).arrayBuffer()` → pass ArrayBuffer to `.upload()` |
| WebViews for PDF display | Defeats "native and polished" rubric requirement. A `WebView` showing a PDF feels like a website. | Link out to system PDF viewer via `Linking.openURL(publicUrl)` — opens native PDF reader. |
| Hardcoded mock data | Spec disqualifies it explicitly. Evaluators will log in with their own credentials. | Live Supabase reads for all data |
## Version Compatibility Matrix
| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| expo | ~54.x | react-native ~0.81 | `create-expo-app@latest` default in April 2026 |
| expo-router | ~4.0 | expo ~54.x | Bundled — do not install separately |
| nativewind | 4.2.3 | tailwindcss ^3.4.17, reanimated ~3.x | v4.2.0+ adds Reanimated v4 compat patch; v4 still targets TW v3 |
| react-native-reanimated | ~3.x (SDK 54 resolves) | nativewind 4.2.3, expo ~54.x | Do NOT upgrade to v4 while on NativeWind v4 |
| @supabase/supabase-js | 2.103.3 | All React Native / Expo versions | Stable v2 series; no breaking changes expected |
| @tanstack/react-query | 5.99.2 | React 18+, React Native, Expo | `isPending` not `isLoading` (v5 breaking rename) |
| zod | 3.x (import from `'zod'`) | react-hook-form 7.x, @hookform/resolvers | Do NOT use `'zod/v4'` subpath — RN runtime crash |
| lucide-react-native | 1.8.0 | react-native-svg (any Expo-compatible version) | Requires react-native-svg peer dep |
| expo-document-picker | ~55.x | expo ~54.x | Minor version mismatch is fine with Expo managed |
## Open Questions / Phase-Specific Research Flags
- **Supabase RLS policies** — The app writes to `announcements`, `modules`, `module_items`, `roadmap_progress`. Confirm the provided Supabase project has RLS policies that allow authenticated role-specific writes. If not, need to create them or use service role key (bad practice — avoid).
- **Deep link cold-start with unauthenticated user** — When `scholera://courses/1/announcements/2` opens and the user is not logged in, the login screen shows first. After login, the app needs to navigate to the original deep link destination. Expo Router's auth guard + `useLocalSearchParams` or `expo-linking`'s `getInitialURL()` handles this, but it needs explicit testing.
- **Gemini stretch goal** — If reached: `@google/generative-ai` npm package, PDF text extraction from the uploaded file. Requires Edge Function or client-side Gemini call. Do not block core implementation on this.
## Sources
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) — React Native 0.81 bundled, Reanimated v4 note HIGH confidence
- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55) — React Native 0.83, mandatory New Architecture HIGH confidence
- [Expo Router Introduction](https://docs.expo.dev/router/introduction/) — File-based routing, automatic deep linking HIGH confidence
- [Expo Linking Docs](https://docs.expo.dev/linking/into-your-app/) — `scheme` in app.json, Expo Router handles routing automatically HIGH confidence
- [Supabase Expo React Native Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) — AsyncStorage + `detectSessionInUrl: false` HIGH confidence
- [Supabase Storage Upload JS Reference](https://supabase.com/docs/reference/javascript/storage-from-upload) — ArrayBuffer upload pattern HIGH confidence
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) — v2.103.3 latest HIGH confidence
- [NativeWind Installation](https://www.nativewind.dev/docs/getting-started/installation) — tailwindcss ^3.4.17 peer dep HIGH confidence
- [NativeWind Dynamic Themes](https://www.nativewind.dev/docs/guides/themes) — `vars()` CSS variable approach HIGH confidence
- [nativewind npm](https://www.npmjs.com/package/nativewind) — v4.2.3 latest HIGH confidence
- [NativeWind v5 pre-release status](https://github.com/nativewind/nativewind/discussions/1604) — Not production-ready HIGH confidence
- [NativeWind + SDK 54 Reanimated v4 compat patch](https://github.com/expo/expo/discussions/39130) — v4.2.0+ required for SDK 54 MEDIUM confidence
- [@tanstack/react-query npm](https://www.npmjs.com/package/@tanstack/react-query) — v5.99.2 latest HIGH confidence
- [TanStack Query React Native docs](https://tanstack.com/query/latest/docs/framework/react/react-native) — focus management pattern HIGH confidence
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) — v7.73.1 latest HIGH confidence
- [Zod v4 React Native issue #4690](https://github.com/colinhacks/zod/issues/4690) — `navigator.userAgent` crash, open June 2025 HIGH confidence
- [Zod versioning docs](https://zod.dev/v4/versioning) — v4 at `'zod/v4'` subpath, v3 still at root HIGH confidence
- [lucide-react-native npm](https://www.npmjs.com/package/lucide-react-native) — v1.8.0 latest HIGH confidence
- [expo-document-picker npm](https://www.npmjs.com/package/expo-document-picker) — v55.0.13 latest HIGH confidence
- [React Native Zod + RHF DEV.to guide](https://dev.to/birolaydin/expo-react-hook-form-typescript-zod-4oac) — Controller pattern for RN MEDIUM confidence
- [Supabase RN storage ArrayBuffer pattern](https://github.com/orgs/supabase/discussions/1268) — Blob/FormData broken, ArrayBuffer correct MEDIUM confidence (community + official docs agree)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
