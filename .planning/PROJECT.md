# Scholera Mobile

## What This Is

A native mobile companion app for **Scholera**, an AI-native Learning Management System (LMS) currently web-only. The app serves three distinct roles — **admin**, **professor**, and **student** — each with a completely separate home experience after login. It authenticates via Supabase, detects the user's role from their profile, and routes them into the appropriate role-specific experience. This is a take-home prototype for a Mobile Developer Intern position at Scholera.

## Core Value

**Role-aware, native-feeling mobile experience.** Login must correctly detect the role and route into an experience that feels distinct and purposeful for that role — not the same screens with different data.

## Requirements

### Validated

(None yet — greenfield prototype. All requirements are hypotheses until the demo lands.)

### Active

<!-- Grouped by role. REQ-IDs assigned in REQUIREMENTS.md during definition step. -->

**Authentication & role routing (all roles):**
- [ ] Email + password sign-in via Supabase Auth
- [ ] Read user role from profile (`admin` | `professor` | `student`) after login
- [ ] Route each role to a completely separate home experience
- [ ] Session persists across app restarts
- [ ] Expired sessions handled gracefully
- [ ] Sign-out from any role

**Admin:**
- [ ] Admin dashboard with institution stats (students, professors, courses, departments)
- [ ] Departments list with assigned professors
- [ ] Department detail → professors in department
- [ ] Professor detail → assigned courses

**Professor:**
- [ ] "My Courses" list of taught sections
- [ ] Course management screen (tabbed: Announcements, Modules)
- [ ] Announcements: view + create (title + body)
- [ ] Modules: see modules + items, create module, add item (link / note / file upload — PDF or PPT)
- [ ] Course roadmap (professor view): modules + items, AI-extracted topics per item, mark item status (not started / in progress / complete)

**Student:**
- [ ] "My Courses" list of enrolled courses
- [ ] Course detail screen (tabbed: Announcements read-only, Modules read-only with item type icons)
- [ ] Course roadmap (student view): same structure, AI-extracted topics shown per item, professor's coverage status visible, student marks their OWN progress independently

**Shared:**
- [ ] Profile: view + edit own (display name, bio, avatar) → saved to DB
- [ ] Deep linking to specific announcement: `scholera://courses/{courseId}/announcements/{announcementId}` opens that announcement after login

**Design foundations (quality):**
- [ ] Design system with Claude-inspired tokens (warm cream bg, role-specific accents: clay/steel/sage)
- [ ] Reusable primitives: Card, Button, Chip, ListRow, empty/loading/error states
- [ ] Native-feeling polish throughout (spacing, typography, transitions, skeletons)

### Out of Scope

- **Mocked / hardcoded data** — Assignment forbids; all data reads/writes from Supabase in real time
- **Full rich-text content editor for modules** — Spec explicitly says keep it simple, CRUD on hierarchy is what's being evaluated
- **AI topic extraction pipeline** — Spec says topics are pre-extracted in DB; app just fetches and displays
- **Web app / cross-platform web build** — Mobile-only
- **Matching Scholera's web design exactly** — Spec says "use your design judgment"
- **Stretch goals unless core ships** — Realtime announcements, biometric auth, push notifications, Gemini lecture insights are bonuses only

## Context

- **Assignment source:** `reference/mobile-developer.md` (full spec) — **READ THIS FIRST** when planning any phase.
- **Design direction:** `reference/design-direction.md` — Claude-inspired visual language, role-specific accents, UI-SPEC generation hooked into UI-heavy phases.
- **Backend:** Provided as Supabase REST — auth, profiles with role field, courses/sections, announcements, modules, roadmap with per-node status, AI-extracted topics linked to roadmap nodes, departments/programs.
- **Evaluation dimensions:** Role-based routing, UI quality, API integration, code organization, module hierarchy, roadmap & topics, navigation (incl. deep linking), performance.
- **Submission artifacts:** New public GitHub repo + `README.md` (setup, framework + why, screenshots) + `AI_ASSISTANT_USAGE.md` (hand-written by Kiumbura, NOT AI-generated) + 5–10 min demo video covering all 3 roles.

## Constraints

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

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Expo over bare React Native or Flutter | Preferred in spec; fastest build + deep link + dev tooling | — Pending |
| Claude-inspired design DNA | Differentiates from Material/iOS-blue default; UI Quality is explicit scored dim | — Pending |
| Role-specific accent colors (admin/prof/student) | "App should look and feel different depending on who is logged in" is a rubric item; single-token swap achieves distinctness without fragmenting design system | — Pending |
| Include dedicated Design Foundations phase | Tokens + 4 primitives pay for themselves across all downstream screens | — Pending |
| Auto mode with Verifier disabled | Tight 2-day timeline; we'll verify via demo walkthrough | — Pending |
| NativeWind over Tamagui | Simpler tokens, less config, Kiumbura already knows Tailwind (FamilyFinance uses Vite+Tailwind) | — Pending |
| Skip all stretch goals in core pass | Focus on the 11 required features + polish; revisit stretch only if time remains | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 after initialization*
