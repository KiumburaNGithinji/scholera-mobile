# Pitfalls Research

**Domain:** React Native / Expo + Supabase role-based mobile LMS (Scholera Mobile)
**Researched:** 2026-04-23
**Confidence:** HIGH for Expo/Supabase pitfalls (official docs + confirmed issues); MEDIUM for UX/time-management (experience + community patterns)

---

## CRITICAL PITFALLS — Do Not Start Phase 1 Without Handling These

The following four pitfalls are submission-invalidators or 2-day timeline killers. They are the only pitfalls that can make the entire submission fail regardless of how good the rest of the app is.

---

### CRITICAL-1: Pushing to the Scholera Assessments Repo

**Severity:** CRITICAL — submission-invalidator

**What goes wrong:**
You push your work to the provided `Scholera/assessments` (or similar) repo instead of a brand-new public repo of your own. The spec warns this twice. The evaluator sees a fork or a push to their infrastructure rather than your own codebase.

**Why it happens:**
The spec provides a repo for reading the assignment. A developer clones it, builds in it, and pushes without re-reading the submission section.

**How to avoid:**
Before writing one line of code: `git init scholera-mobile`, push to a new public repo at `github.com/Kiumbura/scholera-mobile`. Set a reminder in your task list. Never run `git remote` pointing at Scholera's repo.

**Warning signs:**
`git remote -v` shows anything other than your own GitHub account. Check this before the first `git push`.

**Phase to address:** Phase 0 — App scaffold / project setup (first action before any code).

---

### CRITICAL-2: AI_ASSISTANT_USAGE.md Generated with AI

**Severity:** CRITICAL — submission-invalidator

**What goes wrong:**
The file exists, looks polished, but was written by Claude. The spec says explicitly: "Write it yourself — do not generate it with AI. Just tell us how you used it." If an evaluator suspects AI generation, this is disqualifying.

**Why it happens:**
Developer is exhausted at submission time, asks Claude to "write the AI usage doc", done in 30 seconds. The result is generic and pattern-matches AI writing style.

**How to avoid:**
Write it FIRST in plain language as you start the project. Two or three honest paragraphs: what tasks you handed off to Claude, what you reviewed/modified, what you wrote yourself. Write it like a Slack message to your manager — casual, specific, first-person. Do this at the END of day 1 while it's fresh, not at submission deadline.

**Warning signs:**
The doc contains phrases like "I leveraged AI assistance to..." or "Throughout the development process...". That is AI voice, not your voice.

**Phase to address:** Phase 0 — Begin a draft immediately; update it throughout; finalize before video recording.

---

### CRITICAL-3: Missing Demo Video or Video Does Not Cover All 3 Roles

**Severity:** CRITICAL — submission-invalidator

**What goes wrong:**
Video is missing, under 5 minutes, or shows only student + professor but skips admin. The spec explicitly lists every required scene: sign-in as all 3 roles, admin department/professor drill-down, professor module management + roadmap, student roadmap with own progress marks.

**Why it happens:**
Developer records the video right before submitting and realizes features are half-broken. They shorten the walk-through to hide bugs, skip admin to save time, or the recording crashes mid-session.

**How to avoid:**
Record a full dry-run demo on Day 2 afternoon BEFORE final polish. Treat the dry run as a QA pass — any screen you can't demo means a feature is missing. Seed test data for ALL 3 roles before recording. Use simulator screen recording (Cmd+R in Simulator) or QuickTime. Record at 720p minimum. Re-record if it exceeds 10 minutes.

**Warning signs:**
It's submission day and you haven't seeded test users for all 3 roles. You haven't exercised the app top-to-bottom in one continuous session.

**Phase to address:** End of every phase (smoke test after each), dedicated demo-prep session on Day 2 at ~4pm.

---

### CRITICAL-4: Supabase Keys Committed to Public Repo

**Severity:** CRITICAL — submission-invalidator (security + professionalism)

**What goes wrong:**
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are hardcoded in `lib/supabase.ts` and committed to the public repo. The anon key is public-facing by design (that is fine), but the `service_role` key is not and would give full DB access.

**Why it happens:**
Developer copies the Supabase quickstart example verbatim, which hardcodes the keys inline. Or they commit an `.env` file by accident.

**How to avoid:**
Use `.env.local` for local values. Add `.env*` to `.gitignore` on day 1 before first commit. Use `EXPO_PUBLIC_` prefix (required by Expo for client-accessible env vars) and read via `process.env.EXPO_PUBLIC_SUPABASE_URL`. Put a `.env.example` with placeholder values in the repo. Do NOT ever use the `service_role` key in the mobile app — only anon key.

**Warning signs:**
Running `git log --all -p | grep "supabase.co"` returns actual key values.

**Phase to address:** Phase 0 / scaffold, before first commit.

---

## Category 1: Expo / React Native Traps

### Pitfall 1.1: expo-secure-store Silently Fails for Supabase Sessions (Token Too Large)

**Severity:** HIGH — blocks rubric requirement "session persists across app restarts"

**What goes wrong:**
`expo-secure-store` has a hard 2048-byte limit per value. Supabase session tokens (access token + refresh token + metadata) routinely exceed this. The store throws a size error that is easy to miss in dev — the session silently fails to persist, and the user is logged out on every app restart.

**Why it happens:**
Every Supabase quickstart example for "secure storage" shows SecureStore. Developers copy it without knowing the 2048-byte limit. In Expo Go the error may be swallowed; it only surfaces reliably in a dev build.

**How to avoid:**
Use `expo-sqlite`'s localStorage polyfill instead — this is Supabase's current recommended approach for Expo React Native (2025). Setup:
```bash
npx expo install @supabase/supabase-js react-native-url-polyfill expo-sqlite
```
```ts
import 'react-native-url-polyfill/auto'
import 'expo-sqlite/localStorage/install'
// Then in createClient: storage: localStorage
```
If you want encryption, store only a small AES key in SecureStore, put the encrypted session in AsyncStorage (hybrid approach). Do NOT pass the raw Supabase session object directly to SecureStore.

**Warning signs:**
`ExpoSecureStore.setValueWithKeyAsync: Value is larger than 2048 bytes` in the console. Session state is undefined after app restart despite successful login.

**Phase to address:** Phase 1 — Auth scaffold. Lock this in before building any screen.

---

### Pitfall 1.2: Redirect Loop When Auth Redirect Logic Lives in Root `_layout.tsx`

**Severity:** HIGH — unrecoverable infinite loop

**What goes wrong:**
You put `if (!session) router.replace('/(auth)/login')` in the root `_layout.tsx`. Expo Router's root layout runs before the navigator is mounted. The redirect fires, the app tries to navigate, the root layout fires again, infinite loop. Error: `Attempted to navigate before mounting the Root Layout component`.

**Why it happens:**
It seems logical to put auth guard at the root. The error message is cryptic and doesn't point at the root layout as the cause.

**How to avoid:**
Root `_layout.tsx` renders only providers and a `<Slot />` — no navigation logic, no redirects. Place auth guards one level down in a nested group layout: `app/(app)/_layout.tsx`. Use `Stack.Protected` with a guard:
```tsx
<Stack.Protected guard={!!session}>
  <Stack.Screen name="(tabs)" />
</Stack.Protected>
```
Auth group `(auth)/` sits outside `(app)/` so the guard never wraps it.

**Warning signs:**
Metro bundler loop, white screen with stack overflow, or the "navigate before mounting" error in the console.

**Phase to address:** Phase 1 — Auth scaffold. Nail the file structure before any screen exists.

---

### Pitfall 1.3: Flash of Wrong Role Content on App Launch

**Severity:** MEDIUM — visible UX flaw, rubric ding for "loading states should be smooth"

**What goes wrong:**
The auth context initializes async (reading from localStorage, hydrating the Supabase session). During that 100–300ms window the app renders the unauthenticated route, then snaps to the correct role home. Users see a flash of the login screen even when already logged in, or the wrong role's home briefly.

**Why it happens:**
The session rehydration is async. The initial state is `{ session: null, loading: true }` but the `null` check fires the redirect before `loading` resolves.

**How to avoid:**
Hold the splash screen until auth hydration completes. Use `SplashScreen.preventAutoHideAsync()` and only call `SplashScreen.hideAsync()` after the auth context has resolved:
```tsx
const [authLoaded, setAuthLoaded] = useState(false)
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session)
    setAuthLoaded(true)
  })
}, [])
if (!authLoaded) return null // splash screen stays visible
```
Never conditionally redirect based on `session === null` alone — always gate on `!loading`.

**Warning signs:**
You can visually see the login screen flash for < 1 second on launch when already authenticated. No `loading` guard in auth context.

**Phase to address:** Phase 1 — Auth scaffold.

---

### Pitfall 1.4: Custom Deep Link Scheme Works in Expo Go but Breaks in Build

**Severity:** HIGH — "Navigation > deep linking" is a scored rubric dimension

**What goes wrong:**
`scholera://courses/{id}/announcements/{id}` works when tested via Expo Go dev server but doesn't work in a development build or when the app is in a killed/closed state on iOS. The evaluator cannot trigger the deep link in the demo.

**Why it happens:**
Expo Go does not register custom URL schemes — it uses `exp://`. Custom schemes (`scholera://`) only work after a native build that registers the scheme in the iOS `Info.plist` / Android `AndroidManifest.xml`. Also, a separate bug exists in SDK 53 where deep links to killed iOS apps go to homepage instead of the intended route.

**How to avoid:**
1. Set the scheme in `app.json` under `expo.scheme: "scholera"` before any native build
2. Test deep linking ONLY in a dev build or production build, never Expo Go
3. Test the killed-app case specifically: send the link via Notes app on simulator
4. Implement a `+native-intent.ts` file to handle initial URL parsing on cold start
5. Deep link trigger command for testing: `xcrun simctl openurl booted "scholera://courses/abc/announcements/xyz"`

**Warning signs:**
Deep link test on the simulator goes to home screen instead of the announcement. No `scheme` in `app.json`. Using Expo Go for deep link testing.

**Phase to address:** Phase 1 (scheme config), Phase 6 — Shared + deep linking (full implementation).

---

### Pitfall 1.5: Android Back Button and Safe Area Inconsistencies

**Severity:** MEDIUM — polish dimension, Android specifically

**What goes wrong:**
On Android, the hardware/gesture back button dismisses stack screens but can break tab navigation unexpectedly. Safe area insets differ from iOS — status bar height, gesture nav bar padding, and `KeyboardAvoidingView` behavior all diverge. `behavior="padding"` on `KeyboardAvoidingView` works on iOS, breaks on Android; `behavior="height"` does the opposite.

**Why it happens:**
Developing primarily on iOS simulator without checking Android parallels. NativeWind `pb-safe` classes depend on `react-native-safe-area-context` being set up correctly in the root layout.

**How to avoid:**
Wrap root layout in `<SafeAreaProvider>` once. Use `useSafeAreaInsets()` rather than hardcoded padding values. For forms, use `react-native-keyboard-controller` instead of the built-in `KeyboardAvoidingView` — it has consistent cross-platform behavior. Test on Android simulator at least once before submitting.

**Warning signs:**
Form inputs covered by soft keyboard on Android. Bottom tab bar overlaps gesture nav on Android. Status bar text invisible on certain screens.

**Phase to address:** Phase 2 — Design foundations; verify per-platform in each subsequent phase.

---

## Category 2: Supabase Mobile Pitfalls

### Pitfall 2.1: RLS with No Policies = Silent Empty Results

**Severity:** HIGH — data doesn't load, evaluator sees blank screens

**What goes wrong:**
You enable RLS on a table (or it's already enabled on the provided Supabase instance). No SELECT policy exists for `authenticated` users. Every `supabase.from('courses').select('*')` returns `[]` silently — no error, just empty data. The evaluator sees a "no courses" empty state even though data exists in the DB.

**Why it happens:**
Supabase's RLS default is deny-all when enabled with no policies. The JS client does not throw an error for empty SELECT results — it returns `{ data: [], error: null }`. This is indistinguishable from legitimately empty tables.

**How to avoid:**
For each table the app reads, verify: (1) RLS is enabled with a policy, OR (2) RLS is disabled for quick prototyping. Add a quick manual check: `select count(*) from courses` in the Supabase SQL editor while authenticated as a test user. Required minimum policies:
```sql
-- Authenticated users can read courses they're enrolled in
create policy "students read own enrollments"
on enrollments for select
using (auth.uid() = student_id);
```
If the Supabase project is pre-configured for the assignment, test all tables by running a query in the app immediately after login and logging the result count.

**Warning signs:**
`data: []` from a query that should return rows. No `error` but also no data. Supabase Studio shows data in the table. Disabling RLS makes data appear.

**Phase to address:** Phase 1 — Auth scaffold (first Supabase connection test). Verify every table as you integrate it.

---

### Pitfall 2.2: `getSession()` vs `onAuthStateChange` — Wrong Tool for Initial Load

**Severity:** MEDIUM — auth initialization race, causes flicker or stale session

**What goes wrong:**
Using `supabase.auth.getSession()` alone for initial auth state reads from local storage and does NOT verify the token against the Supabase server. If the session is expired or invalid, the app thinks the user is logged in. Conversely, calling `getUser()` on every render makes unnecessary network requests.

**Why it happens:**
`getSession()` is the first example in most tutorials. The distinction between local read (getSession) vs server-verified read (getUser) is not obvious from the API name.

**How to avoid:**
Use a two-step pattern:
```ts
// On mount: read local session immediately (fast)
const { data: { session } } = await supabase.auth.getSession()
setSession(session)
setLoading(false)

// Then listen for all changes including token refresh
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  setSession(session)
})
return () => subscription.unsubscribe()
```
Do NOT call `supabase.auth.getUser()` in `onAuthStateChange` — this is a documented deadlock in `auth-js` that causes subsequent Supabase calls to hang indefinitely.

**Warning signs:**
App shows logged-in state for a user whose session expired. Network tab shows `getUser` called inside `onAuthStateChange` handler. App freezes after auth event.

**Phase to address:** Phase 1 — Auth scaffold.

---

### Pitfall 2.3: Storage Bucket Permissions — Public Bucket Does Not Mean Writeable

**Severity:** MEDIUM — professor file upload silently fails

**What goes wrong:**
The storage bucket for PDFs/PPTs is set to "public" in the Supabase dashboard. Developer assumes "public" means anyone can upload. File upload returns a 403. Alternatively, the bucket has no SELECT policy so the uploaded file can be listed but not downloaded.

**Why it happens:**
"Public bucket" in Supabase only means: GET requests (downloads) bypass auth. All INSERT (upload), DELETE, and UPDATE operations still require RLS policies on `storage.objects`. The distinction is not obvious from the dashboard toggle label.

**How to avoid:**
For the module file upload feature, create explicit storage policies:
```sql
-- Allow authenticated professors to upload
create policy "professors can upload"
on storage.objects for insert
with check (auth.role() = 'authenticated' AND bucket_id = 'module-files');

-- Allow authenticated users to read
create policy "authenticated can read"
on storage.objects for select
using (auth.role() = 'authenticated' AND bucket_id = 'module-files');
```
Use `supabase.storage.from('module-files').upload(path, file)` for upload, then use a signed URL (not public URL) for protected content that should only be visible to enrolled students:
```ts
const { data } = await supabase.storage.from('module-files').createSignedUrl(path, 3600)
```

**Warning signs:**
Upload returns `{ error: { message: "new row violates row-level security policy" } }` or 403 status. File appears in the bucket in Studio but download returns 403.

**Phase to address:** Phase 4 — Module management (professor file upload feature).

---

### Pitfall 2.4: TypeScript Types Drift After Schema Exploration

**Severity:** LOW — TypeScript errors slow iteration

**What goes wrong:**
You generate types with `npx supabase gen types` at project start. As you explore the provided schema and discover actual column names differ from your assumptions, your type file becomes stale. TS errors appear that have nothing to do with logic bugs — they're just type drift.

**How to avoid:**
Run type generation once at the start of every coding session, or at minimum after discovering any schema discrepancy:
```bash
npx supabase gen types typescript --project-id "$PROJECT_ID" > src/types/database.types.ts
```
Add this as an npm script: `"db:types": "npx supabase gen types typescript --project-id $PROJECT_ID > src/types/database.types.ts"`.
Do NOT manually edit the generated file. If the types seem wrong, regenerate — don't patch.

**Warning signs:**
`Property 'X' does not exist on type 'Tables<"courses">'` for a column that clearly exists in the DB.

**Phase to address:** Phase 1 — Scaffold. Re-run at start of each phase.

---

## Category 3: Role-Based Routing Traps

### Pitfall 3.1: Role Routing Logic Scattered Across Multiple Files

**Severity:** HIGH — inconsistency causes wrong-role renders, hard to debug

**What goes wrong:**
Auth redirect logic in `(auth)/login.tsx` AND role-switch logic in `(app)/_layout.tsx` AND additional guards in each role's tab layout. When a bug appears, it's unclear which file is responsible. Changes in one place don't propagate to others.

**Why it happens:**
Each screen developer adds a "just in case" guard. Over time, three sources of truth emerge for the same routing decision.

**How to avoid:**
Single routing authority: one context (`AuthContext`) owns `{ session, role, loading }`. One layout file `(app)/_layout.tsx` reads from that context and does ALL role-based branching — using `Stack.Protected` guards or a single `useEffect` redirect. Individual screen layouts never redirect based on role. Individual screens never call `router.replace` based on role.

```
app/
  _layout.tsx          ← providers only, no logic
  (auth)/
    login.tsx          ← no redirect logic (Stack.Protected handles it)
  (app)/
    _layout.tsx        ← ONLY place that reads role and routes
    (admin)/
    (professor)/
    (student)/
```

**Warning signs:**
More than one file contains `router.replace` calls based on `role`. Searching `grep -r "router.replace" src/` returns 3+ results with role conditions.

**Phase to address:** Phase 1 — Auth scaffold. Establish routing authority before building any role screen.

---

### Pitfall 3.2: Deep Link Arrives While Unauthenticated — Destination Lost

**Severity:** MEDIUM — deep link evaluator test fails if this is broken

**What goes wrong:**
Evaluator opens `scholera://courses/abc/announcements/xyz` while the app is not running. App cold-starts, redirects to login, user logs in, lands on the role home screen — the announcement deep link destination is gone.

**Why it happens:**
The auth redirect `router.replace('/(auth)/login')` discards the initial URL. No code captures it before the redirect fires.

**How to avoid:**
Capture the initial URL before redirecting. Store it in a ref or a small Zustand store (NOT in session storage):
```ts
// In root layout, before auth check fires:
const [pendingUrl, setPendingUrl] = useState<string | null>(null)
useEffect(() => {
  Linking.getInitialURL().then(url => {
    if (url?.includes('scholera://')) setPendingUrl(url)
  })
}, [])

// After successful login, in onAuthStateChange:
if (event === 'SIGNED_IN' && pendingUrl) {
  router.push(parseDeepLink(pendingUrl))
  setPendingUrl(null)
}
```
Alternatively, use the modal auth pattern (sign-in renders over the background route so the route is preserved).

**Warning signs:**
After logging in from a deep link cold start, the app lands on role home instead of the announcement.

**Phase to address:** Phase 6 — Shared features / deep linking.

---

## Category 4: Roadmap UX Traps

### Pitfall 4.1: Conflating Professor Coverage Status with Student Personal Progress

**Severity:** HIGH — explicit rubric item: "the key distinction to get right"

**What goes wrong:**
The roadmap item node updates the same status field for both professor and student. When a professor marks an item "complete", the student's progress also shows "complete". Or the UI shows only one status circle when it should show two distinct indicators.

**Why it happens:**
The data model has two separate fields (e.g. `professor_status` on the `roadmap_items` table and `student_progress` on a separate `student_progress` table). A developer queries only one and renders it for both roles, or conflates the two into one UI element.

**How to avoid:**
Treat these as entirely separate data concerns from day one:
- Professor view: shows and mutates `roadmap_items.coverage_status` (their own)
- Student view: reads `roadmap_items.coverage_status` as **read-only** display (what professor taught), AND reads/mutates `student_progress.status` (their own personal progress)
- The student roadmap item should display two visual indicators: one for "professor taught" (lock icon or professor badge), one for "I studied this" (student-controlled toggle)

Double-check the schema to confirm which table/column stores each. Query them separately. Render them separately.

**Warning signs:**
Student can change the professor's coverage status. Professor marking complete makes the student's progress appear complete. The student roadmap shows only one status indicator per item.

**Phase to address:** Phase 5 — Course roadmap (both professor and student).

---

### Pitfall 4.2: Optimistic Update Lies to User on Failure

**Severity:** MEDIUM — rubric: "errors should surface in a friendly way"

**What goes wrong:**
Student taps "Mark complete" on a roadmap item. The UI instantly shows a checkmark (optimistic). The mutation fails (network error, RLS rejection). The checkmark stays. User believes they saved progress; they did not. On next app open, the item is back to incomplete.

**Why it happens:**
`useMutation` with an optimistic update requires `onError` rollback and `onSettled` invalidation. These are often omitted in quick implementations.

**How to avoid:**
Use TanStack Query's full optimistic update pattern — always implement all three callbacks:
```ts
const mutation = useMutation({
  mutationFn: updateProgress,
  onMutate: async (newStatus) => {
    await queryClient.cancelQueries({ queryKey: ['roadmap', courseId] })
    const previous = queryClient.getQueryData(['roadmap', courseId])
    queryClient.setQueryData(['roadmap', courseId], (old) => optimisticallyUpdate(old, newStatus))
    return { previous }
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['roadmap', courseId], context.previous) // ROLLBACK
    toast.error('Failed to save progress')
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['roadmap', courseId] }) // RESYNC
  }
})
```

**Warning signs:**
`useMutation` without `onError`. No rollback in the error path. User taps a complete button twice because the first tap gave no feedback.

**Phase to address:** Phase 5 — Course roadmap.

---

### Pitfall 4.3: Topic Chip Overflow on Long Names

**Severity:** LOW — visual polish

**What goes wrong:**
AI-extracted topic names like "Stochastic Gradient Descent with Momentum" overflow the chip boundary, break layout, or clip with ellipsis making them unreadable. On narrow phones (SE), a row of 3 chips wraps in unpredictable ways.

**How to avoid:**
Use `numberOfLines={1}` and `ellipsizeMode="tail"` on chip text. Set a max chip width. Use `flexWrap: 'wrap'` on the chip container with gap tokens so wrapping is intentional. Cap display to first 5 chips with a "+N more" overflow indicator.

**Warning signs:**
Topic chips that run off-screen on a 375px wide view. Text breaking mid-word.

**Phase to address:** Phase 5 — Roadmap UI.

---

## Category 5: Module CRUD Traps

### Pitfall 5.1: Re-fetching Entire Course on Every Module Item Add

**Severity:** MEDIUM — sluggish UX, unnecessary round trips

**What goes wrong:**
After professor adds a module item, you call `queryClient.invalidateQueries(['courses', courseId])` which re-fetches the entire course including all modules and all items. With 10+ modules each having 5+ items, this is a large payload for a single item addition.

**How to avoid:**
Maintain a separate query key per module: `['modules', courseId]` and `['items', moduleId]`. Invalidate only the specific module's items query after an add:
```ts
queryClient.invalidateQueries({ queryKey: ['items', moduleId] })
```
Or use TanStack Query's cache update to inject the new item directly:
```ts
queryClient.setQueryData(['items', moduleId], (old) => [...old, newItem])
```

**Warning signs:**
Network tab shows full course re-fetch after a single item add. Response payload is >10KB for a small module add.

**Phase to address:** Phase 4 — Module management.

---

### Pitfall 5.2: File Picker Permission Denied — No Graceful Fallback

**Severity:** MEDIUM — professor upload flow breaks without feedback

**What goes wrong:**
`expo-document-picker` prompts for file system access. On first launch, if the user taps "Don't Allow", the picker returns `null` or throws. The upload button does nothing. No explanation shown.

**How to avoid:**
Always wrap document picker in a try/catch. Check for `cancelled` result. If denied, show an alert directing to Settings:
```ts
try {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/vnd.ms-powerpoint'] })
  if (result.canceled) return // user backed out — no error needed
  await uploadFile(result.assets[0])
} catch (e) {
  Alert.alert('File access denied', 'Go to Settings > Scholera > Files to enable access.')
}
```

**Warning signs:**
No try/catch around `DocumentPicker.getDocumentAsync`. Upload button silently does nothing when permission is denied.

**Phase to address:** Phase 4 — Module management.

---

### Pitfall 5.3: Large PDF Memory Pressure on Mobile

**Severity:** LOW — rarely crashes but causes jank

**What goes wrong:**
Professor uploads a 50MB slide deck. The entire file is loaded into memory on the JS side before being passed to the Supabase storage upload. On older iOS devices or Android with limited RAM, this causes the app to jank or crash.

**How to avoid:**
Use Supabase Storage's multipart upload for files > 5MB. The `supabase-js` v2 storage client handles this automatically when you pass a `File`/`Blob` object. Enforce a file size limit in the UI (show an error if > 20MB before attempting upload). Show an upload progress indicator so the user doesn't think the app is frozen.

**Warning signs:**
App freezes for 3–5 seconds after selecting a large file. No progress indicator during upload. Memory warnings in Xcode console.

**Phase to address:** Phase 4 — Module management.

---

## Category 6: Polish Traps

### Pitfall 6.1: Missing Empty States = Blank White Screen

**Severity:** HIGH — explicit rubric requirement: "empty states should be handled"

**What goes wrong:**
A newly created course has no modules. The modules list renders `null`. A new admin deployment has no announcements. Screen is blank white with no explanation. Evaluator sees a broken app.

**How to avoid:**
Build the `EmptyState` component in the Design Foundations phase and use it on EVERY list screen:
```tsx
{items.length === 0 && (
  <EmptyState
    icon="folder-open"
    title="No modules yet"
    subtitle="Add your first module to get started"
    action={canCreate ? { label: 'Add Module', onPress: handleAdd } : undefined}
  />
)}
```
States needed: no courses, no modules, no items, no announcements, no departments, no professors in department. Build these at Phase 2; wire them as you build each screen.

**Warning signs:**
Any list component renders `{items.map(...)}` without a guard on `items.length === 0`. White screen visible on freshly seeded accounts with no content.

**Phase to address:** Phase 2 — Design foundations (build the component). Enforce per screen in each subsequent phase.

---

### Pitfall 6.2: No Action Feedback → User Double-Taps → Duplicate Creates

**Severity:** MEDIUM — data integrity issue, especially for module creation

**What goes wrong:**
Professor taps "Add Module". No loading state. No success feedback. They tap again. Two modules with the same title appear in the list. This is especially bad for announcements and module items.

**How to avoid:**
- Disable the submit button for the duration of the mutation: `disabled={isLoading}`
- Show a brief success toast/snackbar after mutation resolves
- For creation forms, dismiss the form/modal on success so the button is unreachable
- Use TanStack Query's `isPending` state: `<Button disabled={mutation.isPending} />`

**Warning signs:**
Create form stays open after successful submission. Submit button not disabled during mutation. Duplicate records appearing in the DB.

**Phase to address:** Phase 2 — Design foundations (Button component with loading state). Enforce in every form.

---

### Pitfall 6.3: Loading Spinner on Every Nav Transition

**Severity:** MEDIUM — rubric: "loading states should be smooth, not abrupt flashes"

**What goes wrong:**
Every screen shows a full-page spinner on mount because the query hasn't resolved. Navigating between tabs shows a spinner each time even though data was just loaded 2 seconds ago. Feels janky.

**How to avoid:**
Use TanStack Query's `staleTime` and `gcTime` settings to keep data in cache across navigation:
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // 2 minutes
      gcTime: 1000 * 60 * 5,     // 5 minutes
    }
  }
})
```
Show skeleton screens (not spinners) on initial load. Use `isFetching` (background refresh) vs `isLoading` (no data yet) to decide what to show.

**Warning signs:**
Full-page spinner appears on every tab switch. No `staleTime` configured. Using `isLoading` to show spinners even when cache has data.

**Phase to address:** Phase 2 — Design foundations (configure QueryClient). Enforce in Phase 3 onward.

---

### Pitfall 6.4: Form Fields Without Validation Errors

**Severity:** MEDIUM — polish, UX quality

**What goes wrong:**
Professor submits "Add Announcement" with empty title. Supabase rejects with a not-null constraint error. The mutation's `onError` shows a generic toast: "Something went wrong." User doesn't know what to fix.

**How to avoid:**
Validate client-side before mutation fires. For forms, use inline error text below each field:
```tsx
{errors.title && <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>}
```
Map Supabase error codes to human messages in a utility. At minimum, validate required fields before submitting.

**Warning signs:**
Submit button fires with empty required fields. Error state shows a generic message. No red border or inline error on the violating field.

**Phase to address:** Each form-containing phase (professor announcements, module creation, item creation, profile edit).

---

## Category 7: Time Management Traps (2-Day Deadline)

### Pitfall 7.1: Over-Investing in Auth Polish Before Role Screens Exist

**Severity:** HIGH — sinks Day 1, Day 2 starts with 0 role screens built

**What goes wrong:**
You spend 6 hours perfecting the login screen — animations, error messages, forgot-password flow, biometric auth stretch goal. At end of Day 1, you have a beautiful login screen and 0 role experiences. This is the single most common "great engineer, missed the rubric" failure pattern for take-homes.

**How to avoid:**
Time-box auth to 3 hours max. Functional auth with session persistence is the goal — not beautiful auth. Move to Admin dashboard skeleton immediately after login routes work. The rubric cares about role routing, not the login screen's aesthetics. Auth polish is the LAST thing you polish, not the first.

**Warning signs:**
It's 6pm on Day 1 and you're still working on the login screen. Profile screen is started before all 3 role homes are skeletonned. Any stretch goal started before all 11 required features are present.

**Phase to address:** Day 1 planning — enforce time-boxing at phase boundaries.

---

### Pitfall 7.2: Perfectionism on One Screen While Others Remain Skeletons

**Severity:** HIGH — incomplete role = submission fails role separation rubric

**What goes wrong:**
Professor module management is pixel-perfect but the student roadmap is a placeholder list. The demo can't show student progress tracking. The evaluator sees one polished role and two incomplete ones.

**How to avoid:**
Work in horizontal slices, not vertical. Get all 3 role homes to a "navigable, real-data" state before any single role gets deep feature work. Specifically:
- End of Day 1: Admin dashboard working + Professor courses list + Student courses list
- Day 2 morning: All role feature screens wired (may be rough)
- Day 2 afternoon: Polish pass on ALL screens, not deep on one

**Warning signs:**
End of Day 1: Admin + Professor screens complete, Student screens haven't been started. Design tokens being refined while screens are missing.

**Phase to address:** Day 1 / 2 planning — enforce horizontal progress rule.

---

### Pitfall 7.3: Skipping Test Data Seeding

**Severity:** HIGH — cannot demo without it, demo is required

**What goes wrong:**
The demo requires signing in as admin, professor, and student and showing their respective experiences with real data. Without pre-seeded data — departments, courses with modules and items, roadmap nodes with extracted topics, enrollments, announcements — the demo shows empty states everywhere.

**How to avoid:**
Treat seeding as a Phase 0 task. Before building any screen, seed:
- 1 admin user (`admin@scholera.test` / `Admin123!`)
- 1 professor user + 2 courses with 3 modules each with 2–3 items per module
- 1 student user enrolled in both professor's courses
- Announcements on each course
- Roadmap nodes with topics (even if dummy topics) for each module item
- Professor coverage status on some items, blank on others (to show the range)

Do this as a SQL seed script so it can be re-run if you accidentally corrupt data.

**Warning signs:**
It's Day 2 and you've never tested a complete login-to-feature flow with all 3 accounts. Any role's home screen shows an empty state in demo.

**Phase to address:** Phase 0 / scaffold — seed script before any screen.

---

### Pitfall 7.4: Recording Demo Before End-to-End Smoke Test

**Severity:** HIGH — demo video shows bugs, evaluators notice

**What goes wrong:**
You record the demo in the final 30 minutes. A bug surfaces mid-recording that wasn't caught because you only tested individual features in isolation. You either ship the buggy video or scramble to re-record.

**How to avoid:**
At 4pm Day 2, run a full end-to-end walkthrough of the EXACT demo script before recording:
1. Log in as admin → navigate to a department → tap a professor → see their courses
2. Log out → log in as professor → navigate a course → create a module → add an item → view roadmap → mark an item
3. Log out → log in as student → view a course → view roadmap → mark own progress → tap an announcement
4. Trigger deep link from Notes app → verify it navigates to the right announcement after login

Fix anything that breaks. Then record.

**Warning signs:**
No written demo script. The first time you run the full flow is during recording. Any screen has never been tested with real data.

**Phase to address:** End of Day 2 — add a formal smoke test slot before recording.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode role in AsyncStorage without DB verification | Fast auth | Wrong role persists after role change; security hole | Never |
| Skip empty states on first pass | Faster screen build | Rubric ding; blank screens in demo | Never — use EmptyState component from Phase 2 |
| Query entire course instead of granular queries | Simpler code | Slow re-renders, unnecessary network | Acceptable in Phase 3 admin (read-only); unacceptable in Phase 4 professor CRUD |
| Keep all role routing in login.tsx | Seems logical | Routing inconsistency, redirect loops | Never |
| Use `any` type on Supabase query results | Avoids TS errors | Hides data model bugs until demo | Never — generate types in Phase 0 |
| Skip `onError` rollback on optimistic updates | Less code | UI lies to user after network failure | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth init | `detectSessionInUrl: true` in React Native | Set `detectSessionInUrl: false` — this is web-only |
| Supabase Auth init | No `autoRefreshToken` | Always set `autoRefreshToken: true, persistSession: true` |
| Supabase Storage upload | Using `service_role` key in mobile app | Use `anon` key only; configure RLS policies for access |
| expo-document-picker | No `type` filter on picker | Filter to `['application/pdf', 'application/vnd.ms-powerpoint']` explicitly |
| Expo Router deep link | Testing in Expo Go | Must use `npx expo run:ios` dev build for custom scheme |
| TanStack Query | No `staleTime` config | Set default `staleTime: 2 * 60 * 1000` to avoid spinner on every nav |
| NativeWind | Not calling `withNativeWind` in metro config | Colors don't apply without the Metro transform configured |
| Supabase JS v2 | Calling `supabase.auth.getUser()` inside `onAuthStateChange` | This causes an indefinite hang — documented auth-js bug |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-fetching full course on every CRUD op | 1–3 second lag after add/edit | Granular query keys per module | From first module add |
| `FlatList` without `keyExtractor` | Duplicate-key warnings, incorrect re-renders | Always provide `keyExtractor={(item) => item.id}` | On any list > 10 items |
| Unsubscribed `onAuthStateChange` listener | Memory leak, ghost auth state updates after unmount | Always call `subscription.unsubscribe()` in cleanup | On every screen with auth listener |
| Loading full roadmap without memoization | Slow roadmap screen re-renders on status toggle | `useMemo` on topic grouping; `React.memo` on roadmap items | With > 20 roadmap nodes |
| Large PDF fully buffered in JS before upload | App freeze/jank during file selection | Supabase storage multipart (auto for large files); add size limit UI | Files > 10MB |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `service_role` key in mobile app | Full DB read/write for any user | Use only `anon` key in mobile; never expose service_role |
| No RLS on student progress table | Students modify each other's progress | RLS: `using (auth.uid() = student_id)` |
| No RLS on announcements INSERT | Any authenticated user creates announcements | RLS: `using (auth.uid() = professor_id)` on insert |
| `.env` file committed to public repo | Supabase keys public | `.gitignore` .env* on Day 0; use `.env.example` |
| Role read from JWT only, not DB | Stale role if profile updated | Read role from `profiles` table post-login, not from JWT claims |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Spinner on every tab switch | Feels slow and broken | `staleTime` caching; skeleton on first load only |
| No success feedback on save | User taps again, duplicates | Toast + form dismiss after successful mutation |
| Generic "something went wrong" | User can't fix the problem | Map Supabase error codes to actionable messages |
| Empty list with no CTA for professor | Professor doesn't know how to start | EmptyState with "Add your first module" action button |
| Single status indicator on roadmap | Professor/student confusion | Two distinct indicators: "taught" (professor) + "studied" (student) |
| Full modal for small forms | Heavy-handed for simple inputs | Use bottom sheet or inline expansion for quick creates |

---

## "Looks Done But Isn't" Checklist

- [ ] **Session persistence:** Verify by force-quitting the app (not just backgrounding) and reopening — user should still be logged in
- [ ] **Role routing:** Log in as all 3 roles in sequence (logout between each) — each should land in the correct experience
- [ ] **Deep link:** Test from Notes app on simulator with app killed: `scholera://courses/abc/announcements/xyz`
- [ ] **RLS verification:** Query each table from the mobile app immediately after login — confirm non-empty results
- [ ] **Professor/student roadmap distinction:** Confirm professor status toggle does NOT affect student progress field and vice versa
- [ ] **Empty states:** Delete all modules from a course, open the screen — should show EmptyState, not blank white
- [ ] **Error states:** Turn on Airplane mode, try to load courses — should show error state, not crash
- [ ] **File upload:** Upload a real PDF — confirm it persists and is retrievable after app restart
- [ ] **Android back button:** Confirm tab navigation doesn't break on Android back
- [ ] **AI_ASSISTANT_USAGE.md:** Read it aloud — does it sound like YOU wrote it, not Claude?

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover within the 2-day window:

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SecureStore session size failure | LOW (30 min) | Swap to `expo-sqlite/localStorage` polyfill; no app logic changes needed |
| Redirect loop in root layout | MEDIUM (1 hr) | Move auth guard to `(app)/_layout.tsx`; restructure group folders |
| RLS silent empty data | LOW (20 min) | Add SELECT policy in Supabase dashboard; no code changes |
| Wrong repo pushed to Scholera | HIGH (if early) / CRITICAL (if late) | New repo, force push history to new remote, email evaluator |
| Demo video missing a role | HIGH (1-2 hrs) | Re-seed data, re-record affected portion, re-edit |
| Storage bucket 403 | LOW (30 min) | Add INSERT + SELECT policies on `storage.objects` |
| Auth-session deadlock (getUser in listener) | MEDIUM (45 min) | Remove `getUser()` from `onAuthStateChange`; use two-step pattern |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Wrong repo / pushing to Scholera | Phase 0 — scaffold | `git remote -v` shows your own repo |
| AI_ASSISTANT_USAGE.md auto-generated | Phase 0 — scaffold | Draft written by hand at Day 1 end |
| Supabase keys in public repo | Phase 0 — scaffold | `git log -p \| grep supabase.co` returns nothing |
| SecureStore 2048-byte limit | Phase 1 — auth | Force quit + reopen; user stays logged in |
| Redirect loop in root layout | Phase 1 — auth | No "navigate before mounting" errors |
| Auth state race / content flash | Phase 1 — auth | Splash screen hides only after session loaded |
| RLS silent failure | Phase 1 (first query test) + every subsequent data phase | Each table query returns expected data |
| getSession vs onAuthStateChange | Phase 1 — auth | Auth listener + initial session load pattern in place |
| Custom scheme broken in Expo Go | Phase 1 (config) + Phase 6 (test) | `xcrun simctl openurl` triggers correct navigation |
| Storage bucket permissions | Phase 4 — module management | File upload succeeds; URL returns 200 |
| TypeScript type drift | Phase 0 (initial gen) + re-run each phase | No manual edits to generated types file |
| Role routing scattered | Phase 1 — auth | Single routing authority in `(app)/_layout.tsx` |
| Deep link destination lost | Phase 6 — deep linking | Post-login from deep link cold start lands on correct announcement |
| Professor/student status conflation | Phase 5 — roadmap | Two separate DB fields, two distinct UI indicators |
| Optimistic update no rollback | Phase 5 — roadmap | Network failure test shows rollback + error toast |
| Topic chip overflow | Phase 5 — roadmap | Test on 375px wide view with long topic names |
| Missing empty states | Phase 2 (component) + each screen | Every list screen verified with 0 items |
| Double-tap duplicate creates | Phase 2 (Button) + each form | Button disabled during mutation |
| Loading spinner every nav | Phase 2 (QueryClient config) | Tab switch with cached data shows no spinner |
| Demo missing roles | Day 2 demo prep | Dry-run walkthrough before recording |
| Seeding missing | Phase 0 — scaffold | All 3 role accounts have navigable data before Phase 2 |

---

## Sources

- Expo Router authentication docs: https://docs.expo.dev/router/advanced/authentication/
- Expo Router protected routes (Stack.Protected): https://dev.to/aaronksaunders/simplifying-auth-and-role-based-routing-with-stackprotected-in-expo-router-592m
- Supabase Expo React Native quickstart (localStorage adapter): https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- expo-secure-store 2048 limit discussion: https://github.com/orgs/supabase/discussions/14306
- Supabase auth-js deadlock (getUser in onAuthStateChange): https://github.com/supabase/auth-js/issues/762
- Supabase onAuthStateChange intermittent failure: https://github.com/supabase/supabase/issues/41968
- Supabase RLS silent empty data: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Expo deep linking custom scheme (Expo Go limitation): https://docs.expo.dev/linking/into-your-app/
- Expo deep link iOS killed-state bug (SDK 53): https://github.com/expo/expo/issues/37028
- TanStack Query optimistic updates with rollback: https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates
- KeyboardAvoidingView cross-platform inconsistency: https://github.com/facebook/react-native/issues/52596
- Expo Router redirect loop in root layout: https://medium.com/@Enzo61/problem-faced-to-setup-auth-through-expo-router-in-react-native-index-cant-find-infinite-loop-a168bab0577e
- Supabase type generation: https://supabase.com/docs/guides/api/rest/generating-types

---
*Pitfalls research for: React Native / Expo + Supabase role-based mobile LMS (Scholera Mobile)*
*Researched: 2026-04-23*
