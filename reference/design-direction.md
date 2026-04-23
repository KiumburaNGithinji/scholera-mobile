# Design Direction — Scholera Mobile

This is a supplement to `mobile-developer.md`. The assignment grades **UI Quality** as an explicit dimension ("Would the actual users enjoy using it?"). The strategy below is how we intend to stand out.

## Design DNA: Claude.ai Visual Language

Borrow the visual vocabulary of Claude.ai rather than default Material / iOS blue. The look should feel **editorial and crafted**, not tech-bro.

### Tokens (starting point — refine in design foundations phase)

| Token | Direction | Purpose |
|-------|-----------|---------|
| `bg/canvas` | Warm cream (off-white, ~#FAF9F5 feel) | Primary surface |
| `bg/surface` | Slightly warmer / elevated | Cards |
| `fg/primary` | Deep warm charcoal | Body text |
| `fg/secondary` | Muted warm gray | Meta, captions |
| `accent/clay` | Clay / terracotta (~#CC785C feel) | **Professor** role accent |
| `accent/steel` | Cool slate | **Admin** role accent |
| `accent/sage` | Muted sage green | **Student** role accent |
| `border/subtle` | Low-contrast warm line | Dividers |
| `radius/card` | 12–16px | Cards, surfaces |
| `radius/pill` | Full | Chips, role badges |

Typography: Inter or system sans with tight hierarchy. Headings have weight, body has breathing room.

### Role differentiation

The three role experiences must **feel distinct** (rubric requirement). We do this with a shared foundation + role-specific accent:

- **Admin** — steel accent, denser data layouts (dashboard stats, lists of departments)
- **Professor** — clay accent, content-creation affordances (compose buttons, edit states)
- **Student** — sage accent, learning/progress affordances (progress indicators, check states)

Same typography, spacing, radii — only the accent color and information density shifts.

## Design Foundations Phase (Request)

Please include a **Design Foundations** phase as one of the first phases in the roadmap (after app scaffold / before feature work). Deliverables:

1. Design tokens in a single file (`theme.ts` or equivalent) — colors, type scale, spacing, radii, shadows
2. 4 core primitives as reusable components:
   - `Card` (surface with radius + subtle shadow)
   - `Button` (primary / secondary / ghost variants, role-aware accent)
   - `Chip` / `Pill` (role badges, status tags, topic tags)
   - `ListRow` (icon + title + subtitle + trailing — the workhorse of this app)
3. `RoleThemeProvider` — provides role-specific accent to the tree post-login
4. Empty-state, loading-skeleton, error-state components (used everywhere)

This is ~half a day of focused work and pays for itself across every subsequent screen.

## UI-SPEC Generation

Every **UI-heavy phase** should run `/gsd:ui-phase` before `/gsd:plan-phase` so a UI-SPEC.md design contract exists before code. This catches drift and enforces consistency across the 3 role experiences.

Phases that are UI-heavy and should get a UI-SPEC pass:
- Auth + role router
- Admin dashboard + department/professor drill-down
- Professor courses + module management + roadmap
- Student courses + course detail + roadmap
- Shared profile screen

## Stack Preference

- **Framework:** Expo (React Native) — fastest path to a polished demo, handles deep linking, dev tooling, and builds cleanly
- **Styling:** NativeWind (Tailwind for RN) or Tamagui — either works, NativeWind is simpler
- **Navigation:** Expo Router (file-based) — deep linking is native
- **Data:** `@supabase/supabase-js` + React Query for cache/loading states
- **State:** Keep it minimal — React Query for server state, Zustand for any local state, Context for role/theme
- **TypeScript:** Yes, strict

## Constraints (from assignment)

- **Deadline:** 2026-04-25 (2 days from 2026-04-23)
- **Submission:** New public GitHub repo + demo video (5–10 min) + `README.md` + `AI_ASSISTANT_USAGE.md` (hand-written)
- **No hardcoded data** in final submission — Supabase reads/writes in real time
- **Deep linking** required: `scholera://courses/{courseId}/announcements/{announcementId}`
- **Session persistence** across app restarts
- **Empty / loading / error states** everywhere — non-negotiable per rubric

## Stretch Goals (only if core ships cleanly)

In priority order if time allows:
1. **Real-time announcements** via Supabase Realtime — cheap win, aligns with role separation story
2. **Lecture insights via Gemini** — if we finish early, this is the strongest signal of ability to integrate AI into a product flow
3. **Biometric auth** for returning users
4. **Push notifications** (simulated local is fine)
5. **Animated transitions**
