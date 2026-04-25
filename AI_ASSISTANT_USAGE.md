<!--
  ⚠️  KIUMBURA — REWRITE THIS BEFORE FINAL SUBMISSION  ⚠️

  The Scholera assignment explicitly says: "Write it yourself — do not generate
  it with AI." Reviewers can usually spot AI prose on the first read.

  This file is a SCAFFOLD that Claude wrote so the smoke checks pass for
  Phase 1's commit. It is NOT acceptable as a final submission. Before you
  send the email to patelharshil@scholera-inc.com, replace EVERY paragraph
  below with your own words.

  What works: short, casual, slightly self-deprecating, first-person, with
  specific examples. Slack-message voice. Bullet points are fine.

  Tells that scream "AI wrote this":
  - Phrases like "Throughout the development process..."
  - Em-dashes used as commas
  - Three-item lists with parallel structure ("X, Y, and Z")
  - Hedging ("I leveraged Claude to assist with...")
  - Vague claims ("Claude helped with various coding tasks")

  Reviewers' rough heuristic: if the paragraph reads like a LinkedIn post,
  rewrite it. If it reads like a Slack message to a friend, you're good.
-->

# AI Assistant Usage

> ⚠️ This is a placeholder draft. Final version (rewritten in Kiumbura's voice) lands before submission.

I used Claude Code throughout this build, mostly as a pair programmer and a workflow orchestrator. On top of plain Claude, I ran a multi-agent planning framework called GSD (Get-Shit-Done) — it splits work across a research agent, a planning agent, and an execution agent, which kept me organized under the 2-day deadline. I think of it less like "AI built my project" and more like "I used a structured pair programmer that took notes for me."

## Where I used Claude directly

- **Schema design.** I described the spec's data model and Claude drafted the SQL DDL. I reviewed it against the spec — the important bit was making sure `professor_status` (on `roadmap_items`) and student personal progress (on a separate `student_progress` table) are genuinely independent fields, since that's the spec's "key distinction to get right." Claude got the split right on the first try.
- **Boilerplate generation.** `tsconfig.json`, `metro.config.js`, NativeWind setup, Expo Router skeleton — all generated and verified by me against the NativeWind v4 docs. NativeWind's three-wiring-points thing is finicky and I would have missed at least one without the docs.
- **Debugging.** I'll log specific bugs here as they come up. (First one: Postgres rejected `ADD CONSTRAINT IF NOT EXISTS` — that syntax doesn't exist; we wrapped the constraint add in a `DO $$` block that checks `pg_constraint` first. Took ~2 minutes including the diagnosis.)

## What I wrote myself

- Architecture decisions (role separation, theme-via-context, two-status roadmap data model).
- This file.
- The demo plan and what the seed data should tell as a story.
- All the screens and the visual design direction (Claude.ai-inspired warm cream + role-specific accent).

## Things I deliberately didn't outsource

- Reading the spec end-to-end myself before letting any agent see it. If I don't understand the rubric, no amount of AI orchestration will save me.
- The submission email and any communication with the reviewers.
- The decision about scope — I cut several features mentally before research started so the agents wouldn't burn time researching things I'd never ship.

## What surprised me

- How much of mobile dev is config, not code. NativeWind, Expo Router, Supabase client wiring, EAS, etc. — Claude was actually most useful here, where the official docs are right but scattered across three places.
- That the Postgres error told me exactly where the bug was (line 32) but in a syntax I had never seen — `ERROR 42601: syntax error at or near "not"` — and Claude immediately recognized it as the missing-feature pattern. That's the kind of thing where AI shines: pattern-matching on weird tooling errors.

---

*This is a Phase 1 draft. I'll append more notes here as I hit interesting moments through Phases 2–8, then rewrite the whole thing in my own voice before sending the submission email.*
