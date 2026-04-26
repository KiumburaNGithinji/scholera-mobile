# Demo Video

**Link:** https://youtu.be/mLJHmqE88wM

Hosted on YouTube. Covers the working sign-in + role routing for all three roles
(admin / professor / student), tab tint changing per role, and a brief code tour
of the architectural decisions (AuthProvider two-step pattern, splash-gated
ProtectedRouter, single-CSS-var role theme swap).

## What the video covers

1. Sign in as admin → home + steel-accented tab bar → sign out
2. Sign in as professor → home + clay accent → sign out
3. Sign in as student → home + sage accent → sign out
4. Code tour: `providers/auth-provider.tsx`, `app/_layout.tsx` ProtectedRouter, `theme/role-theme.ts`
5. Honest closing: what would ship next (Phases 4–7) and why a clean foundation beats a half-broken full demo
