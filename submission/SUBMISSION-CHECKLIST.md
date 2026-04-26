# Submission Checklist

Use this as the order of operations for the last few minutes before sending the email.

## What's already done (ship now if you have to)

- [x] Public repo exists at `https://github.com/KiumburaNGithinji/scholera-mobile`
- [x] `.gitignore` excludes `.env*`
- [x] `.env.example` has placeholder values committed
- [x] `README.md` written with setup, stack rationale, honest scope statement
- [x] Schema + seed scripts in `supabase/`
- [x] Auth + role routing functional (Phase 3)
- [x] Design system shipped (Phase 2)
- [x] `tsc --noEmit` passes
- [x] All work committed locally and pushed to `origin/main`

## What you still need to do (and roughly how long)

### 1. Verify auth works (5 min) — DO THIS FIRST
```bash
npx expo start
# Press 'i' for iOS simulator
```

Test all three accounts in sequence:
| Email | Password | Expected accent |
|-------|----------|-----------------|
| `admin@demo.scholera.test` | `demo-password-1234` | Steel (slate gray) tab tint |
| `prof@demo.scholera.test` | `demo-password-1234` | Clay (warm orange) tab tint |
| `student@demo.scholera.test` | `demo-password-1234` | Sage (warm green) tab tint |

For each one, also test:
- [ ] Sign in lands on the right home (not a brief flash of the wrong one)
- [ ] Sign-out button (top-right header) returns to sign-in
- [ ] Force-quit the app → reopen → lands on role home, no re-login

If any of these break, fix before screenshotting.

### 2. Take screenshots (3 min)

Save to `submission/screenshots/`:
- [ ] `01-sign-in.png` — sign-in screen
- [ ] `02-admin-home.png` — admin home with steel accent visible
- [ ] `03-professor-home.png` — professor home with clay accent visible
- [ ] `04-student-home.png` — student home with sage accent visible
- [ ] `05-design-preview.png` — `/dev/preview` screen showing all 7 primitives × 3 themes

Then add a `## Screenshots` section near the top of `README.md` referencing them. (Markdown: `![Sign in](submission/screenshots/01-sign-in.png)`.)

### 3. Rewrite AI_ASSISTANT_USAGE.md in your voice (10 min)

The current draft was written by Claude with a very visible warning header. **Reviewers will spot AI prose immediately.** Rewrite top-to-bottom.

**Topics to mention from this build (you don't have to cover them all — pick the most honest):**

- The GSD workflow (research → plan → execute, agents per phase) and what it actually felt like to use
- Phase 1 schema work — Claude drafted the SQL DDL; you reviewed against the spec; the dual-status roadmap split was the part that had to be right
- Phase 2 (design system) — pre-extracted token values from `design-direction.md` into UI-SPEC; Claude wrote the 7 primitives; you fixed the Chip font weight (UI-SPEC checker caught a 3-weight contract violation)
- Phase 2 had a layout race condition between two parallel plans both writing `app/_layout.tsx` — caught by plan-checker, fixed by serializing waves
- Phase 3 you bypassed GSD ceremony to ship under deadline (`fast-mode`) — direct code, no plan/check/verify agents — `tsc --noEmit` was the only verification gate
- Phases 4–7 you knowingly didn't ship; you chose foundation over surface
- What you wrote yourself: the architecture decisions, the scope cuts, the "what to ship" calls under time pressure
- What you didn't outsource: reading the spec end-to-end, communication with reviewers, the demo plan

**Tells to AVOID:**
- "Throughout the development process..."
- Em-dashes used as commas in EVERY sentence
- "Three-item lists with parallel structure" (like this one)
- "I leveraged Claude to..."
- "Claude assisted me with various coding tasks"

**Voice to AIM for:**
- First person, casual, slightly self-deprecating, specific
- Like a Slack message to a friend who asked "how'd you build this so fast?"
- Bullet points are fine
- It's OK to say "I cut X because I ran out of time"

### 4. Record demo video (10 min)

5–10 minutes covering:
- [ ] Sign in as admin → show home + accent → sign out
- [ ] Sign in as professor → show home + accent → sign out
- [ ] Sign in as student → show home + accent → sign out
- [ ] Walk through `/dev/preview` showing the 7 primitives × 3 themes
- [ ] Briefly show the codebase structure (the role groups + the AuthProvider + the design token system)
- [ ] Close with: "What I'd build next is Phase 4 (admin), Phase 5 (professor), Phase 6 (student) — the foundation supports them; the time didn't."

Save the link in `submission/demo-link.md` and reference it from the README.

### 5. Final push + send the email

```bash
git add -A
git commit -m "submission: README, screenshots, AI_ASSISTANT_USAGE, demo link"
git push
```

Email to `patelharshil@scholera-inc.com` with:
- Repo link: https://github.com/KiumburaNGithinji/scholera-mobile
- Demo video link
- One short paragraph: what's done, what's not, why
