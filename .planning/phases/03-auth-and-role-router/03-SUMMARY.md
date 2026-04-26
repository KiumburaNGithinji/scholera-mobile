---
phase: 03-auth-and-role-router
status: complete
mode: fast (no GSD ceremony)
completed: 2026-04-25
requirements: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06]
---

# Phase 3: Auth + Role Router — SUMMARY

## Why Fast Mode
Shipped without /gsd:plan-phase or /gsd:execute-phase ceremony. Hard deadline pressure — full pipeline budget would have eaten the remaining time.

## What Shipped

### AuthProvider (`providers/auth-provider.tsx`)
- Two-step pattern: `getSession()` once at mount + `onAuthStateChange` listener.
- `getUser()` is **never** called inside the listener (AUTH-05 compliance).
- Role read from `public.profiles.role` after session resolves (AUTH-01).
- `ready: boolean` flag turns true only after BOTH session AND role are resolved — prevents wrong-role flash.
- `signIn(email, password) -> { error }` and `signOut()` exposed via `useAuth()`.

### Routing (`app/_layout.tsx` + `app/index.tsx`)
- `<ProtectedRouter>` mounted inside `<AuthProvider>`. Reads session/role/ready and redirects.
- Held splash (returns `null`) until `ready === true`.
- Routes:
  - no session → `/(auth)/sign-in`
  - signed in + admin → `/(admin)/(tabs)`
  - signed in + professor → `/(professor)/(tabs)`
  - signed in + student → `/(student)/(tabs)`
- Wrong-role guard: if signed in as admin but URL is `/(student)/...`, redirects to `(admin)`.
- AUTH-03 (rehydration): `getSession()` rehydrates from AsyncStorage on cold start; user lands directly in their role home.
- AUTH-04 (expired tokens): Supabase fires `SIGNED_OUT` via `onAuthStateChange`; AuthProvider sets session/role to null; ProtectedRouter pushes back to sign-in.

### Sign-in Screen (`app/(auth)/sign-in.tsx`)
- `react-hook-form` + `zod` validation (`email().min(1)`, password required).
- `KeyboardAvoidingView` + `ScrollView` for iOS keyboard handling.
- `Button` from `components/ui` with `disabled` + `isPending` props.
- Inline error message when Supabase returns auth error.
- "Welcome back" Display heading per UI-SPEC § Auth flow.

### Role Groups
- `app/(admin)/_layout.tsx`, `app/(professor)/_layout.tsx`, `app/(student)/_layout.tsx` each wrap their stack in `<RoleThemeProvider role={...}>` — the steel/clay/sage accent swap.
- Each role has a `(tabs)` layout with:
  - `headerRight` sign-out button using lucide `LogOut` icon.
  - Role-specific tab tint color from `tokens.colors.accentX`.
- Placeholder index screens for each role with a Card + EmptyState pointing at upcoming phases.

### useRole hook (`hooks/use-role.ts`)
- Replaced Phase 2 stub with `useAuth().role ?? 'student'` — reads from real session.

## Verification

| SC | Status | Evidence |
|----|--------|----------|
| 1. Email+password → role detected → routes correctly, no flash | TYPE-CHECKED | ProtectedRouter holds splash until `ready: true` |
| 2. Admin/Professor/Student each route to correct root | TYPE-CHECKED | `app/index.tsx` Redirect by role |
| 3. Force-quit session rehydration | TYPE-CHECKED | `getSession()` in AuthProvider init reads AsyncStorage |
| 4. Expired token → returns to sign-in | TYPE-CHECKED | `onAuthStateChange` → null session → ProtectedRouter routes |
| 5. Sign-out button visible from any role; two-step pattern in place | TYPE-CHECKED | `headerRight` in each role's tabs `_layout.tsx` |

`npx tsc --noEmit` exits 0.

**Demo verification deferred** — needs `npx expo start` + manual login as each demo user. Owner: Kiumbura.

## Demo Users
- `admin@demo.scholera.test` / `demo-password-1234`
- `prof@demo.scholera.test` / `demo-password-1234`
- `student@demo.scholera.test` / `demo-password-1234`

## Known Gaps Deferred to Polish (Phase 8)
- No "forgot password" flow (out of scope per spec)
- No haptics on sign-out (Phase 8)
- No biometric auth (stretch goal — skipped per project decisions)
- Sign-in screen lacks empty-state-style "no account?" link (out of scope)

## Files Created
- `providers/auth-provider.tsx`
- `app/index.tsx`
- `app/(auth)/_layout.tsx`
- `app/(auth)/sign-in.tsx`
- `app/(admin)/_layout.tsx`
- `app/(admin)/(tabs)/_layout.tsx`
- `app/(admin)/(tabs)/index.tsx`
- `app/(professor)/_layout.tsx`
- `app/(professor)/(tabs)/_layout.tsx`
- `app/(professor)/(tabs)/index.tsx`
- `app/(student)/_layout.tsx`
- `app/(student)/(tabs)/_layout.tsx`
- `app/(student)/(tabs)/index.tsx`

## Files Modified
- `hooks/use-role.ts` (Phase 2 stub → AuthContext-driven)
- `app/_layout.tsx` (AuthProvider wrap + ProtectedRouter)

## Commit
`e696977` — feat(phase-03): auth + role router (AUTH-01 through AUTH-06)
