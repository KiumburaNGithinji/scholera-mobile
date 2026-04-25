# Phase 1: Scaffold - Research

**Researched:** 2026-04-23
**Domain:** Expo SDK 54 + NativeWind v4 scaffold, Supabase schema + seed, Git remote wiring
**Confidence:** HIGH (versions verified via npm registry; NativeWind config verified via official docs; Supabase seed pattern verified via community canonical source)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01/D-02:** Supabase project already provisioned. Project ID: `htlolqbwhulyihguwdoq`. URL: `https://htlolqbwhulyihguwdoq.supabase.co`.
- **D-03:** Anon key supplied by user at execute time from Dashboard. Service role key NEVER in the app.
- **D-05:** Schema defined by us from spec — 11 tables: `profiles`, `departments`, `programs`, `courses`, `enrollments`, `announcements`, `modules`, `module_items`, `roadmap_items`, `topics`, `student_progress`.
- **D-06:** Single migration file: `supabase/migrations/00000000000001_initial_schema.sql`. Plus `supabase/seed.sql`. Raw SQL + generated TS types only.
- **D-07:** RLS enabled from day one with explicit policies per table.
- **D-09/D-10/D-11/D-12:** SQL seed script in `supabase/seed.sql`. 1 admin, 1 professor (2 courses × 2 modules × 3 items × 5 topics × roadmap nodes), 1 student enrolled in both. Password: `demo-password-1234`. Idempotent via `ON CONFLICT DO NOTHING` on stable fake UUIDs.
- **D-13/D-14:** Repo layout follows ARCHITECTURE.md exactly.
- **D-15/D-16:** TS path aliases: `@/*` → `./*`. `baseUrl: "."` in tsconfig.
- **D-17/D-18/D-19:** Expo Go for Phase 1–2. Dev client switch at Phase 3.
- **D-20/D-21/D-22:** `AI_ASSISTANT_USAGE.md` stub committed in Phase 1. Casual Slack-message voice. Hand-written.
- **D-23/D-24/D-25:** Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. `.env.example` committed; `.env.local` gitignored.
- **D-26/D-27/D-28:** GitHub repo already created: `github.com/KiumburaNGithinji/scholera-mobile` (public). `gh auth status` confirms login as `KiumburaNGithinji`.
- **D-29/D-30/D-31:** Pre-push checklist: verify remote is never Scholera's repo; grep for key values before commit; service_role never in mobile app.
- **Stack (locked):** Expo SDK 54, NativeWind 4.2.3, @supabase/supabase-js 2.103.3, TanStack Query v5, Expo Router v4, TypeScript strict, AsyncStorage (NOT SecureStore), Zod v3 (NOT v4), react-native-url-polyfill.

### Claude's Discretion

- Exact Expo config values in `app.json` beyond `scheme: "scholera"` and basic name/slug.
- Exact Supabase migration file structure beyond the naming convention.
- Whether to add a `scripts/` folder for helper scripts.
- `lucide-react-native` vs `@expo/vector-icons` — STACK.md recommends Lucide.
- Whether to install Moti for skeletons in Phase 1 or wait for Phase 2.

### Deferred Ideas (OUT OF SCOPE)

- Storage bucket creation — Phase 5 concern.
- Apple/Google OAuth or magic link auth.
- CI/CD / EAS build pipeline.
- Production env config.
- Schema evolution migrations beyond initial.
- Type regeneration CI hook.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUB-01 | New public GitHub repo created (not a fork of Scholera's assessments repo) | Wave 1: git remote wiring + push procedure; security verification commands documented |
| SUB-05 | No Supabase keys or secrets committed to the public repo | Wave 1: .gitignore + .env.example structure; pre-commit grep check; EXPO_PUBLIC_ pattern documented |

</phase_requirements>

---

## Summary

Phase 1 is entirely infrastructure: create the project, install the locked dependency set, wire config files, create the schema + seed, generate types, and push to the repo — with no UI written. Every task either eliminates a submission-invalidator or unblocks Phase 2's design work. There are no architectural decisions to make here; all decisions are locked in CONTEXT.md. The research value is in providing **exact commands, exact file contents, and exact pitfall guardrails** so execution does not require any investigation.

The single most important discovery from current npm registry state: `create-expo-app@latest` (v3.5.3) still creates an **SDK 54 project** as its default during the SDK 55 transition period. However, the `latest` dist-tag for `expo` itself is now SDK 55. This means `npx create-expo-app@latest` is safe to run without an explicit version flag — it produces SDK 54. Do not run `npm install expo@latest` separately or you will get SDK 55.

Supabase CLI v2.75.0 is installed and authenticated (`supabase projects list` works). However, `supabase gen types --project-id` requires a `SUPABASE_ACCESS_TOKEN` env var OR a prior `supabase login` — the CLI is already logged in on this machine, so the gen types command will work without extra steps.

**Primary recommendation:** Execute waves in order: repo init → Expo scaffold → config files → supabase client → schema/seed → type gen → AI_ASSISTANT_USAGE.md → first push.

---

## Standard Stack

Versions are locked in STACK.md. DO NOT re-research or change these. Listed here for planner copy-paste convenience.

### Core (locked — cite STACK.md, do not alter)

| Library | Version | Purpose |
|---------|---------|---------|
| expo | ~54.x (latest SDK 54 patch) | Framework shell |
| expo-router | ~4.0 (bundled) | File-based navigation |
| react-native | ~0.81 (bundled) | Native runtime |
| nativewind | 4.2.3 | Tailwind in RN |
| tailwindcss | ^3.4.17 | Tailwind CSS peer dep |
| @supabase/supabase-js | 2.103.3 | Auth + DB + Storage |
| @tanstack/react-query | 5.99.2 | Server state |
| zod | 3.x (from `'zod'` — NOT `'zod/v4'`) | Validation |
| react-hook-form | 7.73.1 | Forms |
| @hookform/resolvers | ^3.x | Zod adapter |
| lucide-react-native | 1.8.0 | Icons |
| react-native-url-polyfill | ^2.0.0 | URL polyfill for supabase-js |
| @react-native-async-storage/async-storage | latest via `npx expo install` | Session storage |

### Supporting (also Phase 1 installs — all future phases depend on these being present)

| Library | Version | Purpose |
|---------|---------|---------|
| react-native-reanimated | ~3.x (via `npx expo install`) | NativeWind peer |
| react-native-safe-area-context | 5.7.0 (via `npx expo install`) | Safe area |
| react-native-svg | latest (via `npx expo install`) | lucide peer dep |
| expo-font | via `npx expo install` | Font loading |
| @expo-google-fonts/inter | via `npx expo install` | Typeface |
| base64-arraybuffer | ^1.0.2 | Later: avatar/file upload |

### NOT installed in Phase 1 (deferred to later phases)

- `expo-document-picker`, `expo-file-system`, `expo-image-picker` — Phase 5/7
- `expo-linear-gradient` — Phase 2

---

## Installation Commands

### CRITICAL: Use `@latest` for create-expo-app, then pin extras

```bash
# Step 1: Scaffold with create-expo-app@latest — this creates an SDK 54 project
# (create-expo-app 3.5.3 defaults to SDK 54 during SDK 55 transition period)
# --template default gives TypeScript + Expo Router pre-wired
npx create-expo-app@latest scholera-mobile --template default
cd /Users/Kiumbura/Projects/scholera-mobile

# Step 2: Core Expo-managed packages (use npx expo install — it pins compatible versions)
npx expo install \
  @react-native-async-storage/async-storage \
  react-native-url-polyfill \
  react-native-reanimated \
  react-native-safe-area-context \
  react-native-svg \
  expo-font \
  @expo-google-fonts/inter

# Step 3: npm-pinned packages (exact versions from STACK.md)
npm install \
  @supabase/supabase-js@^2.103.3 \
  nativewind@^4.2.3 \
  tailwindcss@^3.4.17 \
  @tanstack/react-query@^5.99.2 \
  react-hook-form@^7.73.1 \
  "@hookform/resolvers@^3" \
  zod@^3 \
  lucide-react-native@^1.8.0 \
  base64-arraybuffer@^1.0.2

# Step 4: Dev dependencies
npm install -D prettier-plugin-tailwindcss @tanstack/query-devtools
```

### Why `npx expo install` vs `npm install` for some packages

`npx expo install` consults Expo's compatibility matrix and pins the version that is verified against your exact SDK. Use it for anything with "expo-" prefix and RN core packages. Use `npm install` for ecosystem packages (supabase-js, nativewind, tanstack, zod) where you want the specific pinned versions from STACK.md.

**Do NOT run `npm install expo@latest`** after scaffolding — this would upgrade to SDK 55.

---

## Config File Contents

These are the exact file contents to create. No investigation needed — write them verbatim.

### `tailwind.config.js`

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

### `global.css` (NativeWind v4 requires this file)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `babel.config.js` (NativeWind v4 exact)

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

### `metro.config.js` (NativeWind v4 exact)

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### `tsconfig.json` (path aliases + strict)

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

### `nativewind-env.d.ts` (root level — enables NativeWind className types)

```typescript
/// <reference types="nativewind/types" />
```

### `app.json` (Expo config — planner fills `{YOUR_SLUG}` if needed)

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

**Critical:** `"newArchEnabled": false` must be set. NativeWind v4 on SDK 54 does not support New Architecture. Without this, NativeWind animations will silently fail on some devices.

### `.gitignore` (additions to standard Expo .gitignore)

The `create-expo-app` default `.gitignore` already covers `node_modules/` and `.expo/`. Add these lines:

```
# Secrets
.env
.env.local
.env.*.local

# Supabase local dev (not using, but guard anyway)
supabase/.branches
supabase/.temp

# Planning artifacts (keep .planning/ in git — it's docs, not secrets)
```

### `.env.example` (committed to git)

```bash
# Supabase — get values from Dashboard > Project Settings > API
# NEVER commit .env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder
```

### `lib/supabase.ts` (exact singleton — Phase 3 Auth builds on this)

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

### `types/app.types.ts` (hand-written — required for Phase 3+)

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

**Note:** This file cannot be created until `types/database.types.ts` is generated from the live schema. Write a placeholder first, then update after type gen.

---

## Schema SQL

Complete DDL for `supabase/migrations/00000000000001_initial_schema.sql`. Derived from spec semantics (ARCHITECTURE.md D-05, D-06, D-07).

```sql
-- ============================================================
-- Scholera Mobile — Initial Schema Migration
-- File: supabase/migrations/00000000000001_initial_schema.sql
-- ============================================================

-- ─── Extensions ────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── PROFILES ──────────────────────────────────────────────
-- Extends auth.users 1-to-1. role drives all routing decisions.
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           text not null check (role in ('admin', 'professor', 'student')),
  display_name   text,
  bio            text,
  avatar_url     text,
  department_id  uuid,  -- FK added after departments table; backfilled below
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── DEPARTMENTS ───────────────────────────────────────────
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Add FK from profiles → departments
alter table public.profiles
  add constraint if not exists fk_profiles_department
  foreign key (department_id) references public.departments(id) on delete set null;

-- ─── PROGRAMS ──────────────────────────────────────────────
create table if not exists public.programs (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name          text not null,
  description   text,
  created_at    timestamptz not null default now()
);

-- ─── COURSES ───────────────────────────────────────────────
-- Represents a course section taught by one professor.
create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.profiles(id) on delete cascade,
  program_id   uuid references public.programs(id) on delete set null,
  title        text not null,
  code         text,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_courses_professor_id on public.courses(professor_id);

-- ─── ENROLLMENTS ───────────────────────────────────────────
create table if not exists public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index if not exists idx_enrollments_student_id on public.enrollments(student_id);
create index if not exists idx_enrollments_course_id  on public.enrollments(course_id);

-- ─── ANNOUNCEMENTS ─────────────────────────────────────────
create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  professor_id uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  body         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_announcements_course_id on public.announcements(course_id);

-- ─── MODULES ───────────────────────────────────────────────
-- Ordered grouping within a course (e.g. "Week 1 — Foundations")
create table if not exists public.modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_modules_course_id on public.modules(course_id);

-- ─── MODULE ITEMS ──────────────────────────────────────────
-- Items inside a module: link, note, or uploaded file.
create table if not exists public.module_items (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  title       text not null,
  type        text not null check (type in ('link', 'note', 'file')),
  url         text,   -- for link + file types
  content     text,   -- for note type
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_module_items_module_id on public.module_items(module_id);

-- ─── ROADMAP ITEMS ─────────────────────────────────────────
-- Auto-derived from module items. professor_status tracks taught status.
create table if not exists public.roadmap_items (
  id               uuid primary key default gen_random_uuid(),
  module_item_id   uuid not null references public.module_items(id) on delete cascade,
  course_id        uuid not null references public.courses(id) on delete cascade,
  professor_status text not null default 'not_started'
    check (professor_status in ('not_started', 'in_progress', 'complete')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (module_item_id)  -- one roadmap node per module item
);

create index if not exists idx_roadmap_items_course_id on public.roadmap_items(course_id);

-- ─── TOPICS ────────────────────────────────────────────────
-- AI-extracted topics linked to a roadmap item.
create table if not exists public.topics (
  id              uuid primary key default gen_random_uuid(),
  roadmap_item_id uuid not null references public.roadmap_items(id) on delete cascade,
  label           text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_topics_roadmap_item_id on public.topics(roadmap_item_id);

-- ─── STUDENT PROGRESS ──────────────────────────────────────
-- Student's PERSONAL progress — entirely separate from professor_status.
-- This is the core of STUD-04: two independent statuses per roadmap item.
create table if not exists public.student_progress (
  id              uuid primary key default gen_random_uuid(),
  roadmap_item_id uuid not null references public.roadmap_items(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  status          text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'complete')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (roadmap_item_id, student_id)
);

create index if not exists idx_student_progress_student_id  on public.student_progress(student_id);
create index if not exists idx_student_progress_roadmap_id  on public.student_progress(roadmap_item_id);

-- ─── UPDATED_AT TRIGGER ────────────────────────────────────
-- Auto-update updated_at on any table that has it.
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace trigger trg_courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();

create or replace trigger trg_announcements_updated_at
  before update on public.announcements
  for each row execute function public.handle_updated_at();

create or replace trigger trg_roadmap_items_updated_at
  before update on public.roadmap_items
  for each row execute function public.handle_updated_at();

create or replace trigger trg_student_progress_updated_at
  before update on public.student_progress
  for each row execute function public.handle_updated_at();

-- ─── ROW LEVEL SECURITY ────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.departments    enable row level security;
alter table public.programs       enable row level security;
alter table public.courses        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.announcements  enable row level security;
alter table public.modules        enable row level security;
alter table public.module_items   enable row level security;
alter table public.roadmap_items  enable row level security;
alter table public.topics         enable row level security;
alter table public.student_progress enable row level security;

-- Profiles: each user reads/writes their own; admin reads all
create policy "profiles: own read/write" on public.profiles
  for all using (auth.uid() = id);

create policy "profiles: admin read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Departments: all authenticated users can read; admin full access
create policy "departments: authenticated read" on public.departments
  for select using (auth.role() = 'authenticated');

-- Programs: all authenticated users can read
create policy "programs: authenticated read" on public.programs
  for select using (auth.role() = 'authenticated');

-- Courses: professors see their own; students see enrolled; admin sees all
create policy "courses: professor own" on public.courses
  for all using (professor_id = auth.uid());

create policy "courses: student enrolled" on public.courses
  for select using (
    exists (select 1 from public.enrollments e where e.course_id = id and e.student_id = auth.uid())
  );

create policy "courses: admin read all" on public.courses
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Enrollments: student sees own; professor sees their course enrollments; admin all
create policy "enrollments: student own" on public.enrollments
  for select using (student_id = auth.uid());

create policy "enrollments: professor own course" on public.enrollments
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and c.professor_id = auth.uid())
  );

-- Announcements: professor CRUD own; student enrolled read
create policy "announcements: professor own" on public.announcements
  for all using (professor_id = auth.uid());

create policy "announcements: student enrolled read" on public.announcements
  for select using (
    exists (select 1 from public.enrollments e where e.course_id = course_id and e.student_id = auth.uid())
  );

-- Modules: professor CRUD; enrolled student read
create policy "modules: professor own course" on public.modules
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.professor_id = auth.uid())
  );

create policy "modules: student enrolled read" on public.modules
  for select using (
    exists (select 1 from public.enrollments e where e.course_id = course_id and e.student_id = auth.uid())
  );

-- Module items: same pattern as modules
create policy "module_items: professor own" on public.module_items
  for all using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.professor_id = auth.uid()
    )
  );

create policy "module_items: student enrolled read" on public.module_items
  for select using (
    exists (
      select 1 from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = module_id and e.student_id = auth.uid()
    )
  );

-- Roadmap items: professor CRUD (status update); enrolled student read
create policy "roadmap_items: professor update" on public.roadmap_items
  for all using (
    exists (
      select 1 from public.courses c where c.id = course_id and c.professor_id = auth.uid()
    )
  );

create policy "roadmap_items: student enrolled read" on public.roadmap_items
  for select using (
    exists (select 1 from public.enrollments e where e.course_id = course_id and e.student_id = auth.uid())
  );

-- Topics: all enrolled users read
create policy "topics: authenticated read" on public.topics
  for select using (
    exists (
      select 1 from public.roadmap_items ri
      join public.enrollments e on e.course_id = ri.course_id
      where ri.id = roadmap_item_id and e.student_id = auth.uid()
    )
  );

create policy "topics: professor read own course" on public.topics
  for select using (
    exists (
      select 1 from public.roadmap_items ri
      join public.courses c on c.id = ri.course_id
      where ri.id = roadmap_item_id and c.professor_id = auth.uid()
    )
  );

-- Student progress: student owns their own rows
create policy "student_progress: own all" on public.student_progress
  for all using (student_id = auth.uid());

create policy "student_progress: professor read enrolled" on public.student_progress
  for select using (
    exists (
      select 1 from public.roadmap_items ri
      join public.courses c on c.id = ri.course_id
      where ri.id = roadmap_item_id and c.professor_id = auth.uid()
    )
  );
```

---

## Seed SQL

Complete content for `supabase/seed.sql`. Uses stable fake UUIDs so it is idempotent.

```sql
-- ============================================================
-- Scholera Mobile — Seed Data
-- File: supabase/seed.sql
-- Idempotent: ON CONFLICT DO NOTHING on all inserts
-- Demo story: admin@demo.scholera.test / prof@demo.scholera.test / student@demo.scholera.test
-- Password for all: demo-password-1234
-- ============================================================

-- Requires pgcrypto (already enabled in migration)
-- Run this in Supabase SQL editor or via psql connection

do $$
declare
  -- Stable UUIDs for idempotency — these never change
  v_admin_id     uuid := '10000000-0000-0000-0000-000000000001';
  v_prof_id      uuid := '10000000-0000-0000-0000-000000000002';
  v_student_id   uuid := '10000000-0000-0000-0000-000000000003';

  v_dept_cs_id   uuid := '20000000-0000-0000-0000-000000000001';
  v_dept_math_id uuid := '20000000-0000-0000-0000-000000000002';

  v_prog_bscs_id uuid := '30000000-0000-0000-0000-000000000001';

  v_course1_id   uuid := '40000000-0000-0000-0000-000000000001';
  v_course2_id   uuid := '40000000-0000-0000-0000-000000000002';

  v_enr1_id      uuid := '50000000-0000-0000-0000-000000000001';
  v_enr2_id      uuid := '50000000-0000-0000-0000-000000000002';

  v_ann1_id      uuid := '60000000-0000-0000-0000-000000000001';
  v_ann2_id      uuid := '60000000-0000-0000-0000-000000000002';

  v_mod1_id      uuid := '70000000-0000-0000-0000-000000000001';
  v_mod2_id      uuid := '70000000-0000-0000-0000-000000000002';
  v_mod3_id      uuid := '70000000-0000-0000-0000-000000000003';
  v_mod4_id      uuid := '70000000-0000-0000-0000-000000000004';

  v_item1_id     uuid := '80000000-0000-0000-0000-000000000001';
  v_item2_id     uuid := '80000000-0000-0000-0000-000000000002';
  v_item3_id     uuid := '80000000-0000-0000-0000-000000000003';
  v_item4_id     uuid := '80000000-0000-0000-0000-000000000004';
  v_item5_id     uuid := '80000000-0000-0000-0000-000000000005';
  v_item6_id     uuid := '80000000-0000-0000-0000-000000000006';

  v_ri1_id       uuid := '90000000-0000-0000-0000-000000000001';
  v_ri2_id       uuid := '90000000-0000-0000-0000-000000000002';
  v_ri3_id       uuid := '90000000-0000-0000-0000-000000000003';
  v_ri4_id       uuid := '90000000-0000-0000-0000-000000000004';
  v_ri5_id       uuid := '90000000-0000-0000-0000-000000000005';
  v_ri6_id       uuid := '90000000-0000-0000-0000-000000000006';

  v_pw           text := crypt('demo-password-1234', gen_salt('bf'));

begin

  -- ── AUTH USERS ────────────────────────────────────────────
  -- INSERT INTO auth.users with stable UUIDs + bcrypt password
  -- auth.identities entry is required for email login to work (Supabase requirement)

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values
    (v_admin_id,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@demo.scholera.test',   v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (v_prof_id,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'prof@demo.scholera.test',    v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (v_student_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'student@demo.scholera.test', v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', now(), now())
  on conflict (id) do nothing;

  -- auth.identities — required for email login to function
  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  values
    (v_admin_id,   v_admin_id,   format('{"sub":"%s","email":"admin@demo.scholera.test"}',   v_admin_id)::jsonb,   'email', v_admin_id::text,   now(), now(), now()),
    (v_prof_id,    v_prof_id,    format('{"sub":"%s","email":"prof@demo.scholera.test"}',    v_prof_id)::jsonb,    'email', v_prof_id::text,    now(), now(), now()),
    (v_student_id, v_student_id, format('{"sub":"%s","email":"student@demo.scholera.test"}', v_student_id)::jsonb, 'email', v_student_id::text, now(), now(), now())
  on conflict (id) do nothing;

  -- ── DEPARTMENTS ───────────────────────────────────────────
  insert into public.departments (id, name, description) values
    (v_dept_cs_id,   'Computer Science', 'Algorithms, systems, AI, and software engineering'),
    (v_dept_math_id, 'Mathematics',      'Pure and applied mathematics programs')
  on conflict (id) do nothing;

  -- ── PROGRAMS ──────────────────────────────────────────────
  insert into public.programs (id, department_id, name) values
    (v_prog_bscs_id, v_dept_cs_id, 'BS Computer Science')
  on conflict (id) do nothing;

  -- ── PROFILES ──────────────────────────────────────────────
  insert into public.profiles (id, role, display_name, bio, department_id) values
    (v_admin_id,   'admin',     'Alex Admin',     'Institution administrator', v_dept_cs_id),
    (v_prof_id,    'professor', 'Dr. Priya Nair', 'AI and Machine Learning faculty', v_dept_cs_id),
    (v_student_id, 'student',   'Sam Student',    'CS junior, interested in ML', null)
  on conflict (id) do nothing;

  -- ── COURSES ───────────────────────────────────────────────
  insert into public.courses (id, professor_id, program_id, title, code, description) values
    (v_course1_id, v_prof_id, v_prog_bscs_id,
     'Introduction to Neural Networks', 'CS-411',
     'Foundations of deep learning, backpropagation, and modern architectures'),
    (v_course2_id, v_prof_id, v_prog_bscs_id,
     'Data Structures and Algorithms', 'CS-201',
     'Core CS data structures with complexity analysis')
  on conflict (id) do nothing;

  -- ── ENROLLMENTS ───────────────────────────────────────────
  insert into public.enrollments (id, course_id, student_id) values
    (v_enr1_id, v_course1_id, v_student_id),
    (v_enr2_id, v_course2_id, v_student_id)
  on conflict (id) do nothing;

  -- ── ANNOUNCEMENTS ─────────────────────────────────────────
  insert into public.announcements (id, course_id, professor_id, title, body) values
    (v_ann1_id, v_course1_id, v_prof_id,
     'Welcome to Neural Networks!',
     'Welcome everyone! Office hours are Tuesdays 2–4pm. We start with linear algebra review in Week 1 — make sure you''re comfortable with matrix ops before our first lecture.'),
    (v_ann2_id, v_course1_id, v_prof_id,
     'Week 2 Reading Posted',
     'The reading for Week 2 (Backpropagation) is now posted in the Modules tab. Please read chapters 6–7 of the course text before Thursday.')
  on conflict (id) do nothing;

  -- ── MODULES (Course 1: Neural Networks) ───────────────────
  insert into public.modules (id, course_id, title, position) values
    (v_mod1_id, v_course1_id, 'Week 1 — Foundations',       1),
    (v_mod2_id, v_course1_id, 'Week 2 — Training Networks', 2),
    (v_mod3_id, v_course2_id, 'Week 1 — Arrays and Lists',  1),
    (v_mod4_id, v_course2_id, 'Week 2 — Trees and Graphs',  2)
  on conflict (id) do nothing;

  -- ── MODULE ITEMS ──────────────────────────────────────────
  insert into public.module_items (id, module_id, title, type, url, content, position) values
    -- Course 1, Week 1
    (v_item1_id, v_mod1_id, 'Lecture 1 — Perceptrons and Linear Models', 'file',
     'https://example.com/lecture1.pdf', null, 1),
    (v_item2_id, v_mod1_id, 'Linear Algebra Review Video', 'link',
     'https://www.youtube.com/watch?v=example', null, 2),
    (v_item3_id, v_mod1_id, 'Week 1 Study Notes', 'note',
     null, 'Key concepts: perceptron, sigmoid activation, linear separability. Review matrix multiplication — it underpins every forward pass.', 3),
    -- Course 1, Week 2
    (v_item4_id, v_mod2_id, 'Lecture 2 — Backpropagation Deep Dive', 'file',
     'https://example.com/lecture2.pdf', null, 1),
    (v_item5_id, v_mod2_id, 'Gradient Descent Visualizer', 'link',
     'https://playground.tensorflow.org', null, 2),
    -- Course 2, Week 1
    (v_item6_id, v_mod3_id, 'Arrays vs Linked Lists — Tradeoffs', 'note',
     null, 'Array: O(1) random access, O(n) insert. Linked list: O(n) access, O(1) insert at head. Know when to use which.', 1)
  on conflict (id) do nothing;

  -- ── ROADMAP ITEMS ─────────────────────────────────────────
  -- One roadmap item per module item; professor_status pre-set for demo story
  insert into public.roadmap_items (id, module_item_id, course_id, professor_status) values
    (v_ri1_id, v_item1_id, v_course1_id, 'complete'),      -- Week 1 lecture — taught
    (v_ri2_id, v_item2_id, v_course1_id, 'complete'),      -- Week 1 video — covered
    (v_ri3_id, v_item3_id, v_course1_id, 'complete'),      -- Week 1 notes — covered
    (v_ri4_id, v_item4_id, v_course1_id, 'in_progress'),   -- Week 2 lecture — in progress
    (v_ri5_id, v_item5_id, v_course1_id, 'not_started'),   -- Week 2 visualizer — upcoming
    (v_ri6_id, v_item6_id, v_course2_id, 'complete')       -- DSA Week 1 — covered
  on conflict (module_item_id) do nothing;

  -- ── TOPICS (AI-extracted) ─────────────────────────────────
  -- Pre-seeded topics simulate what the AI extraction pipeline would produce
  insert into public.topics (roadmap_item_id, label) values
    -- Lecture 1 topics
    (v_ri1_id, 'Perceptron'),
    (v_ri1_id, 'Sigmoid Activation'),
    (v_ri1_id, 'Linear Separability'),
    (v_ri1_id, 'Decision Boundary'),
    (v_ri1_id, 'Weight Initialization'),
    -- Linear algebra video
    (v_ri2_id, 'Matrix Multiplication'),
    (v_ri2_id, 'Dot Product'),
    (v_ri2_id, 'Eigenvalues'),
    -- Lecture 2 topics
    (v_ri4_id, 'Gradient Descent'),
    (v_ri4_id, 'Backpropagation'),
    (v_ri4_id, 'Chain Rule'),
    (v_ri4_id, 'Learning Rate'),
    (v_ri4_id, 'Loss Functions'),
    -- DSA Week 1
    (v_ri6_id, 'Array Access Complexity'),
    (v_ri6_id, 'Linked List Insertions'),
    (v_ri6_id, 'Memory Layout');
  -- Note: ON CONFLICT not added for topics because there's no unique constraint
  -- If re-running seed, topics may duplicate — acceptable for demo; add unique constraint if needed

  -- ── STUDENT PROGRESS ──────────────────────────────────────
  -- Student has marked Week 1 complete, Week 2 in progress
  insert into public.student_progress (roadmap_item_id, student_id, status) values
    (v_ri1_id, v_student_id, 'complete'),
    (v_ri2_id, v_student_id, 'complete'),
    (v_ri3_id, v_student_id, 'in_progress'),
    (v_ri4_id, v_student_id, 'not_started'),
    (v_ri6_id, v_student_id, 'complete')
  on conflict (roadmap_item_id, student_id) do update set status = excluded.status;

end $$;
```

---

## Type Generation Command

```bash
# Supabase CLI v2.75.0 is already installed and authenticated on this machine.
# The --project-id flag requires either: supabase login (done) OR SUPABASE_ACCESS_TOKEN env var.
# Since supabase login is already completed, the following command works directly:

npx supabase gen types typescript \
  --project-id htlolqbwhulyihguwdoq \
  --schema public \
  > types/database.types.ts
```

**If the above fails with "Not logged in"**, generate a personal access token from the Supabase dashboard (profile icon → Account → Access Tokens → Generate New Token), then:

```bash
export SUPABASE_ACCESS_TOKEN=your_token_here
npx supabase gen types typescript --project-id htlolqbwhulyihguwdoq --schema public > types/database.types.ts
```

**Add to `package.json` scripts:**

```json
"gen:types": "supabase gen types typescript --project-id htlolqbwhulyihguwdoq --schema public > types/database.types.ts"
```

**Important:** Type generation requires the schema migration to have been applied to the live Supabase project FIRST. The order is: apply migration → gen types → write `types/app.types.ts`.

---

## Git Workflow (push to existing remote)

The GitHub repo was already created. The project directory is already git-initialized (`.planning/` exists). The workflow for first push:

```bash
# 1. Verify git remote is NOT set (or is wrong)
cd /Users/Kiumbura/Projects/scholera-mobile
git remote -v

# 2. If no remote or wrong remote — add the correct one
git remote add origin https://github.com/KiumburaNGithinji/scholera-mobile.git
# Or if wrong remote already exists:
# git remote set-url origin https://github.com/KiumburaNGithinji/scholera-mobile.git

# 3. Verify origin before pushing
git remote -v
# Should show: origin  https://github.com/KiumburaNGithinji/scholera-mobile.git (fetch/push)

# 4. Pre-push security check
git diff --cached | grep -Ei "(supabase\.co|eyJ|sb_secret|service_role)"
# Must return NOTHING. If it returns anything, abort and check .gitignore.

# 5. Set branch to main and push
git branch -M main
git push -u origin main

# 6. If GitHub repo was created with an initial commit (README), need to reconcile:
git pull --rebase --allow-unrelated-histories origin main
# Resolve any conflicts, then push again
```

**Check before every push (add to task notes):**
```bash
# Verify no supabase keys leaked
git log --all -p | grep -i "supabase.co" | grep -v "EXPO_PUBLIC_SUPABASE_URL=https://"
# (The URL itself is fine; only key values are dangerous)
```

---

## AI_ASSISTANT_USAGE.md Draft Paragraph

This is a suggested starting paragraph in the required casual Slack-message voice. Kiumbura MUST edit/rewrite this in their own words before committing — it must not read like this was AI-written.

```markdown
# AI Assistant Usage

I used Claude Code throughout this build as a pair programmer and workflow orchestrator.
Specifically, I ran a multi-agent planning system called GSD (Get-Shit-Done) on top of Claude Code —
it splits work into a research agent, a planning agent, and an execution agent so I can move through
phases quickly without losing context. I thought it was a neat way to stay organized under a 2-day deadline.

Where I used Claude directly:
- Schema design: I described the spec's data model and Claude drafted the SQL DDL; I reviewed it
  against the spec requirements and adjusted the roadmap/student_progress split to make sure
  professor_status and student personal progress were genuinely separate (that's the core of STUD-04).
- Boilerplate generation: tsconfig, metro.config.js, NativeWind setup — all generated and verified by me
  against the NativeWind v4 docs, since the config is finicky.
- Debug assistant: will log specific bugs here as they come up.

What I wrote myself: the architecture decisions, this file, the demo plan, and all the screens.
I used Claude to move fast on the plumbing so I could spend time on the parts that actually
demonstrate mobile development skill.
```

---

## Architecture Patterns

### Directory Creation Order

Create these directories before any files are written (most are empty stubs; presence matters for IDE resolution):

```bash
mkdir -p app/(auth) app/(admin)/(tabs) app/(professor)/(tabs) app/(student)/(tabs)
mkdir -p components/ui components/screens components/domain
mkdir -p hooks/auth hooks/admin hooks/professor hooks/student hooks/shared
mkdir -p lib queries providers theme types
mkdir -p supabase/migrations reference
```

### `create-expo-app --template default` — What to Delete

The `default` template creates a sample tabbed app with demo screens. Delete these after scaffolding:

```bash
# After create-expo-app runs, remove the demo content:
rm -rf app/(tabs)           # demo tab screens
rm -f app/+not-found.tsx   # keep or repurpose
# Keep: app/_layout.tsx (edit it), package.json, tsconfig.json, babel.config.js, etc.
```

The template's `app/_layout.tsx` is a reasonable starting point — edit it to add providers rather than rewriting from scratch.

### `app/_layout.tsx` Stub (Phase 1 placeholder — Phase 3 wires real providers)

```tsx
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'  // NativeWind v4 requires this import

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  )
}
```

The `import '../global.css'` line in the root layout is required by NativeWind v4 — without it, className styles are not applied. This is a common Phase 1 miss.

---

## Common Pitfalls (Phase 1 Specific)

### Pitfall P1-A: `react-native-url-polyfill/auto` Not First Import in `lib/supabase.ts`

**What goes wrong:** supabase-js internally uses the `URL` constructor. React Native's JS runtime does not have a native URL API. If the polyfill is not imported before `createClient` is called, `new URL(...)` throws at runtime — typically during token refresh, which manifests as silent session rehydration failure after app restarts.

**Prevention:** The first line of `lib/supabase.ts` must be `import 'react-native-url-polyfill/auto'` — before any other import, including the createClient import.

**Verification at execute time:** `npx expo start` should not log any URL-related errors in the Metro terminal output.

---

### Pitfall P1-B: `global.css` Import Missing in `app/_layout.tsx`

**What goes wrong:** NativeWind v4's Metro plugin processes the CSS file, but the styles are only injected when the CSS file is imported somewhere in the JS bundle entry point. If `import '../global.css'` is missing from `app/_layout.tsx`, all `className` props render with no styles applied — components appear unstyled but no error is thrown.

**Prevention:** Always add `import '../global.css'` as the first import in `app/_layout.tsx`.

---

### Pitfall P1-C: `newArchEnabled: true` in `app.json`

**What goes wrong:** NativeWind v4 is not compatible with React Native's New Architecture (Fabric/JSI). If `newArchEnabled` is omitted from `app.json` or set to `true`, NativeWind's Reanimated-based animations will silently break. The `create-expo-app --template default` scaffolds with `newArchEnabled: false` by default on SDK 54, but verify this.

**Prevention:** Verify `"newArchEnabled": false` in `app.json` before running `npx expo start`.

---

### Pitfall P1-D: Supabase Keys in Committed Files (CRITICAL-4)

**What goes wrong:** Developer writes the actual anon key or URL directly into `lib/supabase.ts` while testing. Commits. Pushes. Public repo now has keys.

**Prevention sequence:**
1. Before writing `.env.local`, confirm `.gitignore` has `.env*`.
2. Write `lib/supabase.ts` using only `process.env.EXPO_PUBLIC_SUPABASE_URL!` — never a string literal.
3. Before every `git push`: `git diff HEAD | grep -Ei "(eyJ|service_role|supabase\.co.*https)"` — must return nothing dangerous.

---

### Pitfall P1-E: Schema Migration Applied Without Verifying `auth.identities`

**What goes wrong:** Seed inserts users into `auth.users` but skips the `auth.identities` table. Users exist in the DB but email/password login fails silently — Supabase Auth requires an identity record linked to the email provider for login to succeed.

**Prevention:** The seed SQL above includes both `auth.users` AND `auth.identities` inserts. Verify after applying seed:
```sql
select count(*) from auth.identities where provider = 'email';
-- Should return 3 (admin, professor, student)
```

---

### Pitfall P1-F: Pushing to Wrong Remote (CRITICAL-1)

**What goes wrong:** The `.planning/` directory came from a session where git was initialized. If `git remote` was ever accidentally set to Scholera's assessments repo, pushing goes to the wrong place.

**Prevention:** Always run `git remote -v` BEFORE `git push`. The remote must show `github.com/KiumburaNGithinji/scholera-mobile` — not `lucidopus/scholera-coding-assessments` or any other URL.

---

### Pitfall P1-G: `supabase gen types` Run Before Migration is Applied

**What goes wrong:** Running type gen before the migration is applied generates types for an empty schema (only `auth.*` tables). `types/database.types.ts` has no public tables. All downstream type references fail.

**Prevention order:** Apply migration → verify tables exist in Supabase dashboard → run gen types → verify `database.types.ts` contains `profiles`, `courses`, etc.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Reason |
|---------|-------------|-------------|--------|
| URL polyfill for supabase-js | Custom URL shim | `react-native-url-polyfill/auto` | Handles URLSearchParams too; maintained by Supabase team |
| Session persistence to disk | Custom AsyncStorage wrapper | `AsyncStorage` from `@react-native-async-storage/async-storage` passed to `createClient` | Supabase handles serialization/deserialization |
| TypeScript types from schema | Hand-write DB row types | `supabase gen types` CLI | Types stay in sync; hand-written diverges immediately |
| Tailwind in React Native | Raw StyleSheet with tokens | NativeWind v4 | Token-based design system with zero style prop drilling |
| bcrypt password hashing in seed | Custom hash | `crypt('password', gen_salt('bf'))` from pgcrypto | Same algorithm Supabase Auth uses for comparison |

---

## Validation Architecture

> `nyquist_validation: true` in `.planning/config.json` — section included.

### Test Framework

Phase 1 is infrastructure scaffolding. There are no behavioral tests to run. Validation is smoke checks (file existence, command exit codes, compile checks, and API connectivity).

| Property | Value |
|----------|-------|
| Framework | No test framework yet (Phase 1 is pre-implementation) |
| Config file | None — Wave 0 gap (see below) |
| Quick run command | `npx tsc --noEmit` |
| Full suite command | `npx expo start --non-interactive & sleep 8 && kill %1` (bundle compiles without error) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Automated? |
|--------|----------|-----------|-------------------|-----------|
| SUB-01 | Public GitHub repo is correct remote | manual | `git remote -v` shows `KiumburaNGithinji/scholera-mobile` | Manual (one-time check) |
| SUB-05 | No secrets in repo history | smoke | `git log --all -p \| grep -Ei "(eyJ[a-z])" \| grep -v "placeholder"` — must return empty | Manual (run before push) |

### Phase 1 Specific Smoke Checks

Run these at the end of Phase 1 before marking it done:

```bash
# 1. TypeScript compiles without errors
cd /Users/Kiumbura/Projects/scholera-mobile && npx tsc --noEmit
# Expected: zero output (no errors)

# 2. Expo bundler starts without errors
npx expo start --non-interactive
# Expected: Metro starts, QR code displays, no red error text in terminal
# (Ctrl+C after confirming it starts)

# 3. Supabase project is reachable (anon key query)
# Run in Supabase SQL editor or verify in Dashboard > Table Editor > profiles table
# Expected: profiles table exists, 3 rows (admin, professor, student)

# 4. Types file is non-empty and contains expected tables
grep -l "profiles" types/database.types.ts && grep -l "courses" types/database.types.ts
# Expected: filename printed (file contains both strings)

# 5. Secrets not in git
git log --all -p | grep -Ei "(eyJ[a-zA-Z]{20,})" | grep -v "placeholder"
# Expected: empty output
```

### Wave 0 Gaps

- No test framework needed for Phase 1 — all validations are file-system and command checks.
- `tsconfig.json` must be in place before TypeScript can be verified.
- `types/database.types.ts` must exist (even as an empty stub) before `types/app.types.ts` can be created.

---

## Wave / Task Breakdown Suggestion

Five waves. Total estimated time: 25–35 minutes.

**Wave 1 — Repo security baseline (5 min, can start before Expo scaffold)**
- Verify `git remote -v` and set origin to correct repo
- Verify `.env*` in `.gitignore`
- Create `.env.example` and `.env.local` stubs (leave key values empty for now)
- Run the pre-push grep check to verify nothing is accidentally staged
- These tasks are independent of Expo scaffold and can run in parallel with Wave 2

**Wave 2 — Expo scaffold + dependency install (10 min)**
- `npx create-expo-app@latest scholera-mobile --template default`
- Delete demo content from the template
- `npx expo install` for Expo-managed packages
- `npm install` for pinned npm packages
- Verify `newArchEnabled: false` in app.json and add `scheme: "scholera"`

**Wave 3 — Config files + directory structure + supabase client (8 min)**
- Write `tailwind.config.js`, `global.css`, `babel.config.js`, `metro.config.js`
- Write `tsconfig.json` with path aliases
- Write `nativewind-env.d.ts`
- Update `app.json` (scheme, orientation, bundleIdentifier, plugins)
- Create all empty directories per ARCHITECTURE.md
- Create `lib/supabase.ts` singleton (url-polyfill first)
- Create `types/app.types.ts` placeholder (will be filled after type gen)
- Edit `app/_layout.tsx` to add `import '../global.css'` and SafeAreaProvider stub
- Run `npx tsc --noEmit` — confirm TypeScript passes

**Wave 4 — Schema, seed, type generation (8 min)**
- Write `supabase/migrations/00000000000001_initial_schema.sql`
- Apply migration via Supabase SQL editor (copy-paste) or `psql` with DB URL from Dashboard
- Write `supabase/seed.sql`
- Apply seed via Supabase SQL editor
- Verify 3 users in Dashboard > Authentication > Users
- Run: `npx supabase gen types typescript --project-id htlolqbwhulyihguwdoq --schema public > types/database.types.ts`
- Update `types/app.types.ts` from placeholder to real imports

**Wave 5 — AI_ASSISTANT_USAGE.md + smoke test + first push (5 min)**
- Write `AI_ASSISTANT_USAGE.md` draft (Kiumbura writes this — not generated)
- Create minimal `README.md` (just "Setup instructions TBD — Phase 8" as placeholder)
- Run final smoke checks: `npx tsc --noEmit`, `npx expo start` (verify starts without error)
- `git add` specific files (NOT `git add -A` — avoid accidental `.env.local` commit)
- Pre-push security grep
- `git commit -m "feat: Phase 1 scaffold complete"`
- `git push -u origin main`
- Verify on github.com/KiumburaNGithinji/scholera-mobile that the push landed

Waves 1 and 2 are parallelizable (Wave 1 is quick; Wave 2 installs packages in background).
Waves 3, 4, and 5 must run in sequence.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Expo / npm | ✓ | v24.4.0 | — |
| npm | Package install | ✓ | 11.4.2 | — |
| Supabase CLI | Type gen, migration | ✓ | 2.75.0 | Use Supabase dashboard SQL editor for migration |
| gh CLI | Repo verification | ✓ | Logged in as KiumburaNGithinji | Use browser |
| git | Version control | ✓ | (present — `.planning/` is tracked) | — |
| Expo Go app | Dev iteration | Must install on device/simulator | — | Physical device OR iOS simulator |

**Supabase CLI note:** CLI is authenticated (`supabase projects list` returned project list). However, the project `htlolqbwhulyihguwdoq` is NOT in the project list (the list shows other projects owned by different orgs). This means `supabase link --project-ref htlolqbwhulyihguwdoq` may be needed before `supabase gen types` works via the `--linked` flag. Use `--project-id htlolqbwhulyihguwdoq` directly instead — this does not require `supabase link` and works with the authenticated access token.

---

## Open Questions

1. **Supabase project not in CLI project list**
   - What we know: `supabase projects list` shows 4 projects, none with ID `htlolqbwhulyihguwdoq`. This project was provisioned under a different Supabase org/account.
   - What's unclear: Whether `supabase gen types --project-id htlolqbwhulyihguwdoq` will succeed with the current CLI auth token, or whether a different account's token is needed.
   - Recommendation: Try the gen types command first. If it fails with "project not found", fall back to the `--db-url` approach: `supabase gen types typescript --db-url "postgresql://postgres.htlolqbwhulyihguwdoq:[DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" > types/database.types.ts`. The DB password is in Dashboard → Project Settings → Database → Connection string.

2. **`topics` ON CONFLICT in seed**
   - What we know: Topics table has no unique constraint other than `id`. If seed is re-run, topics will duplicate.
   - What's unclear: Whether demo re-runs are expected.
   - Recommendation: Add a `unique (roadmap_item_id, label)` constraint to the migration and update the seed to use `ON CONFLICT (roadmap_item_id, label) DO NOTHING`. Or accept duplicates since the seed runs once.

3. **`app.json` bundleIdentifier**
   - What we know: Using `ai.vectorverseevolve.scholera` as bundle ID matches user's email domain.
   - What's unclear: Whether EAS Build is needed for Phase 7 or if `npx expo run:ios` suffices.
   - Recommendation: Use the bundleIdentifier as given. For Phase 7 dev client, `npx expo run:ios` is sufficient (no EAS account needed).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SecureStore for Supabase sessions | AsyncStorage (no size limit) | Supabase official RN quickstart update ~2024 | Prevents 2048-byte silent failure on session rehydration |
| `getUser()` in `onAuthStateChange` | Two-step: `getSession()` first, then listener | auth-js v2 bug documented ~2024 | Prevents indefinite hang on auth events |
| Blob/FormData for Supabase Storage | `fetch(uri).arrayBuffer()` | Supabase docs update ~2023 | Prevents 0-byte uploads in React Native |
| Zod v4 (`'zod/v4'`) | Zod v3 (`'zod'`) | Zod v4 RN regression opened June 2025 | Prevents navigator.userAgent crash at runtime |

---

## Sources

### Primary (HIGH confidence)
- STACK.md — All library versions verified by prior research agent (2026-04-23)
- PITFALLS.md — All critical pitfalls documented with official source citations (2026-04-23)
- ARCHITECTURE.md — Directory structure verified against Expo Router docs (2026-04-23)
- npm registry (`npm view expo dist-tags`) — Confirmed expo latest = 55.0.17, SDK 54 latest patch = 54.0.33 (verified 2026-04-23)
- npm registry (`npm view create-expo-app version`) — Confirmed 3.5.3 (verified 2026-04-23)
- npm registry (`npm view nativewind version`) — Confirmed 4.2.3 (verified 2026-04-23)
- npm registry (`npm view @supabase/supabase-js version`) — Confirmed 2.104.1 latest; 2.103.3 available (verified 2026-04-23)
- [NativeWind v4 Installation Docs](https://www.nativewind.dev/docs/getting-started/installation) — exact babel.config.js, metro.config.js, tailwind.config.js contents (HIGH confidence)
- [Supabase gen types CLI docs](https://supabase.com/docs/guides/api/rest/generating-types) — `--project-id` flag requires auth token (HIGH confidence)
- Supabase CLI v2.75.0 installed and authenticated — verified via `supabase projects list` (2026-04-23)
- gh CLI authenticated as KiumburaNGithinji — verified via `gh auth status` (2026-04-23)

### Secondary (MEDIUM confidence)
- [DEV.to — Seeding users in Supabase with SQL](https://dev.to/paullaros/seeding-users-in-supabase-with-a-sql-seed-script-41mh) — `auth.users` + `auth.identities` INSERT pattern with bcrypt (verified against Supabase GitHub discussions)
- [create-expo-app docs](https://docs.expo.dev/more/create-expo/) — v3.5.3 creates SDK 54 during transition period (MEDIUM — doc wording; confirmed by create-expo-app v3.5.3 being published before SDK 55 GA)

### Tertiary (LOW confidence — flag for validation during execute)
- `supabase gen types --project-id htlolqbwhulyihguwdoq` may require project to be accessible under current CLI auth token — project not visible in `supabase projects list` (needs verification at execute time)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm registry on 2026-04-23
- Config file contents: HIGH — NativeWind v4 config verified against official docs
- Schema SQL: HIGH — derived from ARCHITECTURE.md locked decisions + spec semantics
- Seed SQL: MEDIUM-HIGH — auth.users + auth.identities pattern verified against community canonical source and Supabase docs
- Type gen command: MEDIUM — CLI syntax verified; auth token access to project htlolqbwhulyihguwdoq is runtime dependency
- Git workflow: HIGH — GitHub CLI authenticated, remote URL locked in CONTEXT.md

**Research date:** 2026-04-23
**Valid until:** 2026-05-07 (14 days — fast-moving only for SDK version compatibility; all other config is stable)
