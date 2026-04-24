# Phase 1: Scaffold - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 01-scaffold
**Mode:** `--auto` (Claude selected recommended defaults; no interactive AskUserQuestion turns)
**Areas discussed:** Supabase provisioning, Schema definition, Seed data, Repo structure, TS path aliases, Expo Go vs dev client, AI_ASSISTANT_USAGE.md strategy, Env var naming, GitHub repo setup

---

## Supabase Provisioning

| Option | Description | Selected |
|--------|-------------|----------|
| Scholera-provided creds | Use credentials from assessments repo / email | |
| Create our own Supabase project | Free tier, us-east region | |
| Hybrid check-first-else-own | Look for Scholera creds first (10 min cap), else own project | ✓ |

**User's choice:** Hybrid (auto-recommended).
**Notes:** Gmail PDF had no creds; assessments repo expected to lack them per Scholera's read-only pattern. 10-min check on Phase 1 exec, else provision our own.

---

## Schema Definition

| Option | Description | Selected |
|--------|-------------|----------|
| Adopt Scholera's schema via `gen types` | Only works if we have their DB | |
| Define our own from spec | Full control, risk of drift from real Scholera DB | |
| Minimal from spec + adjust as needed | Pragmatic, fastest | ✓ |

**User's choice:** Minimal-from-spec (auto-recommended).
**Notes:** 11 tables derived from "How the Platform Works" table. Separate `student_progress` table is critical for the dual-status roadmap (STUD-04).

---

## Seed Data Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| SQL seed script in repo | `supabase/seed.sql` checked in, idempotent | ✓ |
| Supabase CLI migrations only | More setup overhead | |
| Manual dashboard entry | Not reproducible | |

**User's choice:** SQL seed script (auto-recommended).
**Notes:** Demo-story-complete seed — real course with real modules and items so the demo video has content to walk through. `ON CONFLICT DO NOTHING` for idempotency.

---

## Repo Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Expo default (flat) | `app/` + minimal top-level | |
| `src/`-rooted | Everything under `src/` | |
| ARCHITECTURE.md layout | `app/`, `components/`, `hooks/`, `queries/`, `lib/`, `providers/`, `theme/`, `types/`, `supabase/` | ✓ |

**User's choice:** ARCHITECTURE.md layout (auto-recommended).
**Notes:** Matches two-layer data pattern + role-group routing already decided in research.

---

## TypeScript Path Aliases

| Option | Description | Selected |
|--------|-------------|----------|
| `@/` aliases in tsconfig | Clean, Metro-supported | ✓ |
| Relative imports everywhere | No alias overhead | |

**User's choice:** `@/` aliases (auto-recommended).
**Notes:** Zero runtime cost; improves refactor safety.

---

## Expo Go vs Dev Client

| Option | Description | Selected |
|--------|-------------|----------|
| Expo Go for all phases | Easier but deep linking will break | |
| Dev client from day 1 | Robust but adds EAS build overhead early | |
| Expo Go Phase 1–2, switch before Phase 3 | Fast start, dev client when needed | ✓ |

**User's choice:** Phased transition (auto-recommended).
**Notes:** Slight divergence from STACK.md "dev client from day one" — picked pragmatic compromise. Custom scheme deep linking (Phase 7) requires dev client, so transition happens at Phase 3 boundary.

---

## AI_ASSISTANT_USAGE.md Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Write at the end | Risk of "AI voice" creeping in | |
| Stub now + append throughout | Casual running log, authentic voice | ✓ |
| Write after each phase in own voice | Similar to above, heavier ceremony | |

**User's choice:** Stub + append (auto-recommended).
**Notes:** Hand-written paragraph in Phase 1 kicks off the file; bullets added end-of-phase throughout. Voice: casual, Slack-message, first-person.

---

## Environment Variable Naming

| Option | Description | Selected |
|--------|-------------|----------|
| `EXPO_PUBLIC_*` prefix | Required by Expo runtime | ✓ |
| Plain names | Won't be accessible from JS | |

**User's choice:** EXPO_PUBLIC_ prefix (auto-recommended).
**Notes:** Forced by Expo; no real choice. Anon key only; service_role stays out of mobile.

---

## GitHub Repo

| Option | Description | Selected |
|--------|-------------|----------|
| `scholera-mobile` public under Kiumbura | Matches domain, public for submission | ✓ |
| Alternate name | No strong reason | |
| Private | Spec says public | |

**User's choice:** `scholera-mobile` public (auto-recommended).
**Notes:** Final push to origin verified via `git remote -v` before first push — submission-invalidator gate.

---

## Claude's Discretion

- Exact Expo `app.json` config beyond `scheme: "scholera"` and basic name/slug fields.
- Exact migration file naming beyond the `00000000000001_initial_schema.sql` pattern.
- Whether to add a `scripts/` folder.
- Icon library final choice (`lucide-react-native` vs `@expo/vector-icons`) — planner may confirm at implementation.
- Moti / skeleton library install timing (Phase 1 or Phase 2).

## Deferred Ideas

- Storage bucket creation + INSERT policy — needed for file uploads (Phase 5) and avatars (Phase 7). Include in Phase 1 setup if provisioning our own Supabase.
- OAuth / magic link — out of scope (spec is email/password only).
- CI/CD / EAS pipeline — manual builds only for take-home.
- Production env config — dev only.
- Type regeneration CI hook — nice-to-have; skip.
