# Feature Research

**Domain:** Native mobile LMS companion app — three-role (admin / professor / student)
**Researched:** 2026-04-23
**Confidence:** MEDIUM-HIGH (primary sources: Expo official docs, Supabase official docs, Moti docs, Canvas LMS UX case study, gorhom bottom-sheet; some UX patterns from training knowledge cross-checked against web sources)

---

## Framing Note

This app is a 2-day prototype evaluated on 8 explicit rubric dimensions. Feature decisions must be filtered through that lens. "Table stakes" here means rubric-penalized if absent; "differentiator" means rubric-elevated if present within the time budget. Anti-features are scope traps that cost build time without rubric payoff.

---

## Feature Landscape

### Table Stakes (Rubric-Penalized If Missing)

Features the evaluator will check on the demo walk-through. Absent = explicit rubric deduction.

| Feature | Why Expected | Applies To | Complexity | Rubric Dimension |
|---------|--------------|------------|------------|-----------------|
| Email/password sign-in with Supabase Auth | Spec requirement; gating condition for everything else | All | LOW | Role-Based Routing |
| Role read from profile + route to separate home | Core requirement; "app should feel different depending on who is logged in" | All | LOW | Role-Based Routing |
| Session persistence across restarts (SecureStore hybrid) | Spec requires; evaluator will kill and reopen the app | All | LOW | Role-Based Routing, API Integration |
| Expired session graceful handling (redirect to sign-in, no crash) | Spec explicit; edge case evaluators test | All | LOW | API Integration |
| Sign-out from any role | Spec requirement | All | TRIVIAL | Role-Based Routing |
| Admin: stat cards (students, professors, courses, departments) from live API | Spec feature #2; evaluator will verify counts are real | Admin | LOW | API Integration |
| Admin: departments list with assigned professors | Spec feature #3 | Admin | LOW | API Integration |
| Admin: department detail → professors drill-down | Spec feature #3 | Admin | LOW | Navigation |
| Admin: professor detail → assigned courses | Spec feature #3 | Admin | LOW | Navigation |
| Professor: My Courses list from API | Spec feature #4 | Professor | LOW | API Integration |
| Professor: course management tabbed screen (Announcements + Modules tabs) | Spec feature #5; tab pattern evaluated explicitly | Professor | LOW | UI Quality |
| Professor: create announcement (title + body) | Spec feature #5 | Professor | LOW | API Integration |
| Professor: view existing announcements | Spec feature #5 | Professor | LOW | API Integration |
| Professor: modules list with items in order | Spec feature #6; "hierarchy presented clearly" is a rubric item | Professor | MEDIUM | Module Hierarchy |
| Professor: item type shown clearly (icon + label per type) | Spec explicit; "with the item type shown clearly" | Professor | LOW | Module Hierarchy, UI Quality |
| Professor: create new module (title only) | Spec feature #6 | Professor | LOW | Module Hierarchy |
| Professor: add item to module — link (URL + title) | Spec feature #6 | Professor | LOW | Module Hierarchy |
| Professor: add item to module — note (plain text) | Spec feature #6 | Professor | LOW | Module Hierarchy |
| Professor: add item to module — file upload (PDF/PPT) | Spec feature #6; file upload is specifically called out | Professor | MEDIUM | Module Hierarchy |
| Professor: roadmap with modules + items | Spec feature #7 | Professor | LOW | Roadmap & Topics |
| Professor: AI topics shown per item (read from DB) | Spec explicit: "just fetch and show it clearly" | Professor | LOW | Roadmap & Topics |
| Professor: mark item coverage status (not started / in progress / complete) | Spec feature #7; "how they signal to students what has been covered" | Professor | LOW | Roadmap & Topics |
| Student: My Courses list from API | Spec feature (student #7) | Student | LOW | API Integration |
| Student: course detail tabbed screen (Announcements + Modules tabs, read-only) | Spec feature #8 | Student | LOW | UI Quality |
| Student: announcement tap-to-full-text | Spec: "Tapping one opens the full text" | Student | LOW | Navigation |
| Student: module items with type icons (read-only) | Spec feature #8 | Student | LOW | UI Quality |
| Student: roadmap showing professor coverage status | Spec feature #9; evaluator will verify this is visible | Student | LOW | Roadmap & Topics |
| Student: own progress marking independent of professor status | Spec feature #9; "key distinction to get right" — evaluator will test both states | Student | MEDIUM | Roadmap & Topics |
| Student: topics visible per item | Spec feature #9 | Student | LOW | Roadmap & Topics |
| Profile: view + edit (name, bio, avatar) | Spec feature #10; all roles | All | MEDIUM | API Integration |
| Profile: save to DB | Spec; "Save changes back to the database" | All | LOW | API Integration |
| Deep linking: `scholera://courses/{id}/announcements/{id}` | Spec feature #11; deep link is evaluated | All | MEDIUM | Navigation |
| Empty states everywhere (not blank screens) | Spec explicit: "No announcements yet" pattern | All | LOW | API Integration, UI Quality |
| Loading states (skeletons or spinners — not abrupt flashes) | Spec explicit | All | LOW | Performance, UI Quality |
| Error states (friendly, not crash) | Spec explicit | All | LOW | API Integration |

---

### Differentiators (Elevate Score Within 2-Day Budget)

UX choices that push the rubric score from "functional" to "polished." All are low-to-medium effort relative to payoff.

| Feature | Value Proposition | Applies To | Complexity | Rubric Dimension |
|---------|-------------------|------------|------------|-----------------|
| Role-specific accent colors (clay/steel/sage) swapped via RoleThemeProvider | Makes "feel distinct" requirement obvious without building three separate design systems | All | LOW | UI Quality |
| Skeleton screens instead of spinners on list/detail screens | Canvas mobile research shows abrupt loads feel low-quality; skeletons make the app feel fast and native. Moti Skeleton.Group is low-effort | All | LOW | Performance, UI Quality |
| Bottom sheet for "add item" / "create module" / "create announcement" | Native mobile affordance (iOS/Android standard). Prevents full push-navigation for simple forms; feels polished. @gorhom/bottom-sheet handles gesture + keyboard | Professor | LOW | UI Quality |
| File upload with inline progress indicator | Spec says file upload is required; showing percentage progress is the difference between "works" and "polished." Achievable with XMLHttpRequest onUploadProgress | Professor | LOW | UI Quality, API Integration |
| Dual-status visual layout on student roadmap (professor badge + student toggle side-by-side) | "Key distinction to get right" is spec language; evaluator will test this specific interaction. A well-designed two-column or badge+toggle layout makes it unambiguous | Student | MEDIUM | Roadmap & Topics, UI Quality |
| Topic chips on roadmap items | Spec asks for topics "clearly" displayed; chip pills are scannable, visually distinct, and match the design system tokens already defined | Both | LOW | Roadmap & Topics, UI Quality |
| Warm cream + charcoal typography (Claude-inspired, not Material blue) | Differentiated from default Expo/RN output; evaluator comment "Would users enjoy using it?" | All | LOW | UI Quality |
| Pull-to-refresh on list screens | Standard native expectation; missing it feels like a web app | All | LOW | Performance, UI Quality |
| Haptic feedback on status toggle (roadmap item mark complete) | One-line implementation (`Haptics.impactAsync()`); makes marking progress feel satisfying and native | Professor, Student | TRIVIAL | UI Quality |
| Announcement full-text opens as bottom sheet or modal push (not alert) | Spec says "tapping one opens the full text" — how matters for feel | Student | LOW | Navigation, UI Quality |

---

### Anti-Features (Scope Traps to Avoid)

Features that seem helpful but consume 2-day budget without rubric payoff.

| Anti-Feature | Why Tempting | Why to Avoid | What to Do Instead |
|--------------|-------------|-------------|-------------------|
| Rich text editor for announcements/notes | Feels professional | Not evaluated; spec says "title + body" and "plain text" explicitly. Building a markdown editor takes hours | Plain TextInput with multiline; spec is explicit here |
| Real-time announcement subscription (Supabase Realtime) | Listed as stretch goal | Stretch goal is explicitly "not evaluated." Adds WebSocket complexity and potential race conditions | Pull-to-refresh covers the evaluated use case |
| Biometric auth (Face ID / Touch ID) | Listed as stretch goal | Stretch goal; adds permission flow + fallback logic. Not on the demo checklist | Standard email/password + session persistence satisfies the spec |
| Animated page transitions (shared element, parallax) | High visual impact in screenshots | Time-expensive; brittle on both platforms; not a rubric dimension | Native push/modal transitions from Expo Router are sufficient |
| Student: uploading own files or creating content | Feels symmetric | Spec is explicit: student experience is read-only for modules/announcements | Enforce read-only clearly with disabled/absent UI affordances |
| Admin: create/edit/delete departments or professors | Feels complete | Spec says admin only views departments and professors — no write operations. Building forms here wastes time | Read-only drill-down with real API data |
| Grades or quiz features | Core LMS feature | Not in the 11 required features; no DB schema provided; no rubric mention | Document as "out of scope per spec" in README |
| Dark mode | Accessibility best practice | Requires double-testing all role accents and edges. Warm cream theme is the identity; dark inversion is complex | Single light mode; system font scaling is enough accessibility work |
| Offline caching with background sync | Professional polish | TanStack Query stale-while-revalidate is the right answer; full offline needs React Query + NetInfo + complex conflict resolution | Let TQ handle cache; show error state on network failure |
| Drag-to-reorder modules | Feels useful for professors | react-native-draggable-flatlist adds complexity; spec says "in order" — evaluator only checks that order is preserved from DB | Rely on DB order field; no drag reorder |
| Multiple avatar upload sources (camera + gallery) | Natural UX expectation | Camera permission adds complexity; gallery is sufficient for demo | Gallery-only via `expo-image-picker` with `MediaTypeOptions.Images` |

---

## Feature Dependencies

```
Auth + Session Persistence
    └──required by──> ALL other features (everything is behind login)
        └──required by──> Role Router
                └──required by──> Admin Home (steel accent)
                └──required by──> Professor Home (clay accent)
                └──required by──> Student Home (sage accent)

RoleThemeProvider (context)
    └──required by──> All role-specific screens (accent color)

Design Tokens + Primitives (Card, Button, Chip, ListRow)
    └──required by──> Every screen (shared visual language)
    └──required by──> Empty/Loading/Error components

Professor: My Courses (list)
    └──required by──> Course Management Screen (tabbed)
            └──required by──> Announcements Tab
            │       └──required by──> Create Announcement bottom sheet
            └──required by──> Modules Tab
                    └──required by──> Module list + items
                            └──required by──> Add Item bottom sheet
                                    └──required by──> File upload (PDF/PPT)

Professor: Modules (built)
    └──required by──> Professor Roadmap (roadmap is auto-generated from modules)
    └──required by──> Student Modules (same data, read-only)
    └──required by──> Student Roadmap (same structure)

Roadmap data (professor coverage status field)
    └──required by──> Student Roadmap (shows professor's status as badge/label)
    └──required by──> Professor Roadmap (allows marking coverage)

Student progress data (separate field from coverage)
    └──required by──> Student Roadmap toggle (marks own progress)
    NOTE: these must be separate DB fields or separate rows — not the same field

Topics data (AI-extracted, pre-stored in DB)
    └──required by──> Professor Roadmap item display
    └──required by──> Student Roadmap item display
    NOTE: read-only; no write operations needed from app

Deep linking route resolution
    └──requires──> Auth gate (redirect to sign-in if unauthenticated)
    └──requires──> Course → Announcement navigation stack
    └──requires──> initialRouteName config for back-stack recovery
```

### Dependency Notes

- **Auth must be Phase 1:** Every subsequent screen is gated behind it. SecureStore hybrid (encryption key in SecureStore, session blob in AsyncStorage) is the Supabase-official pattern for Expo.
- **Design tokens must be Phase 2:** Every screen borrows Card, Button, Chip, ListRow, and Skeleton. Building these before feature screens avoids constant refactoring.
- **Module CRUD before Roadmap:** The professor roadmap is generated from modules. If modules are broken, the roadmap has nothing to show.
- **Professor roadmap before Student roadmap:** The student roadmap reads the professor's coverage status. If that field isn't being written, student display is unverifiable.
- **Deep linking depends on Auth + Navigation stack:** The `scholera://` scheme requires Expo Router's `initialRouteName` config so the back button recovers correctly. Must be tested last.

---

## MVP Definition (Per Spec — This IS the MVP)

The spec is the MVP. All 11 features are required. The question is ordering and trade-off within each.

### Must Ship (All 11 Required Features)

- [ ] Auth + role routing — gating condition for everything
- [ ] Admin dashboard (stats + department + professor drill-down)
- [ ] Professor courses + tabbed course management
- [ ] Professor module CRUD + file upload
- [ ] Professor roadmap with coverage toggle + topics
- [ ] Student courses + tabbed course detail (read-only)
- [ ] Student roadmap with dual-status display + own progress toggle
- [ ] Profile edit (all roles, avatar upload)
- [ ] Deep linking to specific announcement
- [ ] Empty / loading / error states on every screen

### Add If Time Permits (After Core Demo Is Recordable)

- [ ] Haptic feedback on status toggles
- [ ] Real-time announcements (Supabase Realtime) — strongest stretch goal per spec
- [ ] Gemini lecture insights — second-strongest if 3+ hours remain

### Defer to Future / Out of Scope

- Rich text editor
- Dark mode
- Biometric auth
- Offline sync
- Drag reorder
- Grades/quiz features

---

## UX Pattern Specifications Per Feature Area

This section is the primary output for roadmap planning. Each area covers the expected native behavior.

### 1. Auth + Role Routing

**Expected native UX:**
- Splash screen holds (SplashScreenController prevents render until `useStorageState` resolves auth) — no flash of sign-in if already authenticated
- If session exists and valid: direct to role home, never show sign-in
- If session expired: silent background check fails → clear stored session → redirect to sign-in with "Your session expired. Please sign in again." message (NOT a crash, NOT a blank screen)
- Sign-in form: email input (keyboard type `email-address`), password input (secureTextEntry), primary Button (role-accent clay default pre-role, switch after), loading spinner on button during auth call
- Invalid credentials: inline error message below form, not an Alert. Input borders go to error red
- Role read: `profiles` table query after `auth.getSession()` succeeds; role value gates the router redirect
- Session persistence: `expo-secure-store` encryption key + `AsyncStorage` encrypted blob (Supabase official Expo pattern — handles >2048 byte sessions)

**Rubric dimensions:** Role-Based Routing (primary), API Integration

**Complexity:** LOW overall; the SecureStore hybrid is 30 lines of boilerplate from official docs

---

### 2. Role-Specific Home Experiences

**Expected native UX:**
- Tab bar is the primary differentiator. Each role gets different tabs, not different data in the same tabs:
  - Admin: [Dashboard] [Departments] [Profile] — steel accent on active tab
  - Professor: [My Courses] [Profile] — clay accent; courses is the workspace
  - Student: [My Courses] [Profile] — sage accent; courses is the learning space
- Layout density differs deliberately:
  - Admin: compact stat cards + dense list rows (data-heavy admin tool feel)
  - Professor: content-creation density — floating action button (+) for create actions, more vertical breathing room
  - Student: learning/progress density — progress indicators, completion states, cleaner visual hierarchy
- `RoleThemeProvider` wraps the post-login navigator and injects `accent` token into all consuming components. One context value swap changes the entire color personality.
- Role badge visible on profile header (admin/professor/student pill chip)

**Rubric dimensions:** Role-Based Routing, UI Quality

**Complexity:** LOW to MEDIUM (token system is low; tab structure requires role-conditional layout file in Expo Router)

---

### 3. Admin Dashboard

**Expected native UX:**
- Stat cards pattern: 2x2 grid of cards above the fold. Each card: large number (heavy weight), label below, icon. Cards: Total Students, Total Professors, Total Courses, Total Departments.
- Cards use the `Card` primitive with steel accent icon tint
- Loading state: skeleton cards (same 2x2 grid, Moti Skeleton.Group) while data fetches
- Empty state (if counts are 0): card shows "0" — this is a valid non-empty data state, not a blank screen
- Error state: "Could not load stats" with retry button — never crash, never silently blank
- Stat counts from live API; must not hardcode. TanStack Query `useQuery` with `enabled: true`

**Rubric dimensions:** API Integration, UI Quality

**Complexity:** LOW

---

### 4. Department / Professor Drill-Down

**Expected native UX:**
- Pattern: FlatList → push → FlatList → push → detail (3 levels max)
- Level 1 (Departments list): `ListRow` component — department name + professor count subtitle + chevron right. `SectionList` is overkill; plain `FlatList` is correct.
- Level 2 (Department detail): department name as header, professor list below as `ListRow`s — name + title/email + chevron
- Level 3 (Professor detail): avatar (placeholder if none), name, email/title, courses list as Cards
- Back button: Expo Router's native stack `<Stack>` component; hardware back (Android) and gesture (iOS) handled automatically
- Loading: skeleton `ListRow`s (3-4 ghost rows) while fetch is in flight
- Empty state: department with no professors → "No professors assigned yet" with a school icon (never blank)

**Rubric dimensions:** Navigation, API Integration

**Complexity:** LOW

---

### 5. Professor Course List + Management

**Expected native UX:**
- Course list: `FlatList` of `Card` components — course name, section code, enrollment count. Tapping pushes to course management screen.
- Course management: `Tab` navigator (Announcements | Modules). This is the inner tab — it lives inside the course management stack screen, not the root tab bar.
- Announcements tab: `FlatList` of announcement rows (title + date). FAB (+) in bottom-right corner to create. Creating: bottom sheet (not push navigation) with title input + body multiline input + "Post" button. On success, dismiss sheet and invalidate query. Validation: both fields required, inline error if empty.
- Announcement create bottom sheet UX: `@gorhom/bottom-sheet` with `BottomSheetTextInput` for keyboard avoidance. Sheet snaps to 50% initially, grows with keyboard.
- Loading: skeleton rows on initial load; `ActivityIndicator` in FAB on submit

**Rubric dimensions:** UI Quality, Module Hierarchy (for modules tab), API Integration

**Complexity:** LOW (announcement tab) + MEDIUM (modules tab, see Feature 6)

---

### 6. Module Hierarchy CRUD

**Expected native UX:**
- Mental model: folders (modules) + files (items). This is the primary navigation metaphor.
- Layout: `SectionList` where each section header is a module (folder) and items are the list rows within it. This is the correct RN component for this shape of data — handles sticky headers natively and renders well at any length.
- Module section header: module title + item count badge + "Add Item" button (+ icon, small, right-aligned in header). The section header row itself is not tappable — it's not a drill-down.
- Item row: left icon (type-specific, see below) + title + type label badge. Read/open behavior is not required by spec (no content viewer needed), but the row should look interactive (light tap highlight).
- Item type icon + label mapping (non-negotiable for rubric):
  - `lecture` → mortarboard icon + "Lecture" chip
  - `video` → play-circle icon + "Video" chip
  - `link` → link-2 icon + "Link" chip
  - `note` → file-text icon + "Note" chip
  - `file` → paperclip icon + "File" chip
  Use `lucide-react-native` icons (consistent, tree-shakeable, works with NativeWind).
- Create module: "New Module" button above the section list (or FAB). Opens bottom sheet with single title input. On save, add section and collapse the sheet.
- Add item sheet (triggered from section header "+" button): bottom sheet with item type selector (segmented control or horizontal chips: Link / Note / File), then type-specific form fields:
  - Link: URL input + title input
  - Note: title input + text area (multiline)
  - File: title input + "Pick file" button (opens `expo-document-picker` filtered to PDF/PPT)
- File upload progress: after picker returns, show inline progress bar (0→100%) in the sheet while `supabase.storage.from('modules').upload()` runs. Disable "Save" button during upload. Show error if upload fails with "Try again" option.
- Empty module: module header shows "No items yet — tap + to add" placeholder row
- SectionList empty (no modules): full-screen empty state — "No modules yet" illustration text + "Create your first module" button

**Rubric dimensions:** Module Hierarchy (primary), UI Quality, API Integration

**Complexity:** MEDIUM (SectionList + bottom sheet + file upload + type system = ~4 hours)

**Critical implementation note:** `SectionList` sections must be memoized. Re-rendering the entire section list on each status change is the most common performance pitfall in this feature.

---

### 7. Course Roadmap (Professor View)

**Expected native UX:**
- Layout recommendation: vertical list (not tree, not card stack). Mobile screens are narrow; a nested tree with indentation runs out of space at depth > 2. A flat list with visual grouping (module header + indented item rows) is the most readable on mobile.
- Structure: same module → item hierarchy as modules tab, but this screen's focus is status and topics, not CRUD.
- Module row: module title only, no actions.
- Item row: title + status badge + topics chips below title (horizontal scroll if > 3 topics)
- Status toggle: tap the status badge to cycle not_started → in_progress → complete. The badge changes color and label. Haptic on state change.
  - not_started: gray chip, "Not Started"
  - in_progress: amber chip, "In Progress"
  - complete: clay/green chip, "Complete" with checkmark icon
- Topics: horizontal scrolling `ScrollView` of topic `Chip` components below the item title. Each chip is non-interactive (display only on professor side).
- Optimistic update: mark the local state immediately, then write to DB. If write fails, revert and show toast. This makes the toggle feel instant.
- Loading: skeleton rows matching item shape

**Rubric dimensions:** Roadmap & Topics (primary), UI Quality, Performance

**Complexity:** MEDIUM (optimistic updates + topics chips + status system = ~3 hours)

---

### 8. Student Course Detail

**Expected native UX:**
- Identical tab structure to professor course management (Announcements | Modules) but all write affordances absent.
- Announcements tab: `FlatList` of announcement rows. No FAB, no create button. Tapping an announcement opens it — use a modal push screen or bottom sheet. The full text renders in a `ScrollView` with title, date, and body. Back button dismisses.
- Modules tab: same `SectionList` as professor view. No "Add Item" button in section headers. No "New Module" button. Item rows show type icons identically. Rows are not tappable to any action (spec says read-only). Consider a subtle lock icon or absence of chevron to signal read-only.
- Empty state: "No announcements yet" / "No modules yet" — identical to professor empty states (shared component)

**Rubric dimensions:** UI Quality, API Integration

**Complexity:** LOW (mostly reusing professor components with write affordances disabled)

---

### 9. Student Roadmap (CRITICAL: Dual-Status Display)

**Expected native UX:**
This is the most design-sensitive feature. The spec calls it out explicitly as "the key distinction to get right."

**The two statuses:**
- Professor coverage status: "Has the professor taught this yet?" — set by professor, read-only to student. Represents curriculum progress.
- Student own progress: "Have I studied this?" — set by student, only visible to student. Represents personal learning.

**Recommended layout per item row:**
```
[Type icon]  Item Title                    [Prof badge]
             Topic chips (scrollable)
             [Student toggle: Not studied / Done]
```

- Professor coverage badge: a small labeled pill in the top-right of the item row. Colors match professor's status system (gray/amber/clay). Labeled "Covered" / "In Progress" / "Not Yet" to distinguish vocabulary from student's own status. NON-interactive for the student.
- Student progress toggle: a distinct, clearly-labeled control at the bottom of each item row. Use a checkbox or a segmented chip that cycles "Not studied → In progress → Done." The label must be first-person: "My progress" or "Mark as studied."
- Visual differentiation: professor badge is top-right, small, chip style. Student toggle is bottom-left, action-oriented (button or checkbox). Size and position prevent conflation.
- Topics chips: horizontally scrollable row between title and student toggle.
- Completed state: when student marks "Done," the row gets a subtle green-tinted background or a checkmark overlay — visible progress feedback.
- Empty student progress DB: if no row exists for a student+item pair, default to "Not studied" — the app creates the row on first toggle.
- Optimistic update: same pattern as professor roadmap — instant local update, async write, revert on failure.

**What to absolutely avoid:**
- Overloading one control for both statuses (e.g., one dropdown that shows both). This is the most common mistake.
- Using the same color for both (e.g., clay for "covered" and clay for "done"). Student status should use sage; professor status uses clay/steel.
- Showing professor status as a toggle (students must not be able to accidentally change it).

**Rubric dimensions:** Roadmap & Topics (primary), UI Quality, API Integration

**Complexity:** MEDIUM-HIGH (dual-status layout + separate data fetch/write paths + optimistic update = ~4 hours)

---

### 10. Profile Edit

**Expected native UX:**
- Shared screen, all roles. Role accent color still applies (profile header accent bar).
- Layout: full-screen push navigation (not a modal; profile edit is a destination, not a transient action).
- Avatar: circular avatar image at top. Tap to change — opens `expo-image-picker` with `MediaTypeOptions.Images`, gallery only. After selection, show preview immediately (optimistic local preview). Upload to Supabase Storage `avatars` bucket in background. Save button uploads avatar then updates profile row.
- Fields: display name (required, single line), bio (optional, multiline). No other fields needed per spec.
- Edit-in-place vs edit screen: edit screen pattern (separate screen with Save CTA) is correct for mobile. Edit-in-place (inline tap-to-edit) is harder to implement and adds ambiguity about unsaved state.
- Save UX: single "Save" button in navigation header right. Loading spinner replaces button during save. On success, pop navigation and show brief success feedback (toast or haptic). On failure, show inline error, stay on screen.
- Unsaved changes guard: if user navigates back with changes, show a system `Alert` ("Discard changes?"). This is a native-feel expectation.
- Avatar storage: `LargeSecureStore` hybrid pattern is for auth tokens; avatar URL is a plain string stored in the profiles table. Upload to storage bucket, get public URL, store URL in profile row.

**Rubric dimensions:** API Integration, UI Quality

**Complexity:** MEDIUM (avatar picker + upload + unsaved changes guard = ~2 hours)

---

### 11. Deep Linking

**Expected native UX and implementation:**
- Scheme: `scholera://courses/{courseId}/announcements/{announcementId}`
- Expo Router handles scheme registration via `app.json` scheme field + metro-config. Deep links are automatically matched to file-based routes.
- Route file: `app/(authenticated)/courses/[courseId]/announcements/[announcementId].tsx`
- Auth gate behavior: if user is not logged in when link opens, `Stack.Protected` redirects to sign-in. After successful sign-in, the router resumes navigation to the linked route (modal pattern preserves intent).
- Back stack recovery: `initialRouteName` configuration in the `(authenticated)` layout ensures that after deep-linking to `announcements/[id]`, the back button shows the course list — not a dead end or blank screen. Without this, back from a deep link exits the app.
- Announcement detail screen: same full-text view as student tap-to-read. Title, date, body in a `ScrollView`. Works for any role that has access to the course.
- Edge cases to handle:
  - Course or announcement not found (404 from API): show "Announcement not found" error screen with "Go to courses" button — not a crash
  - User has wrong role for course: show "You don't have access to this course" — not a crash
  - Link opened while app is in background (cold start vs warm open): both must work; Expo handles this automatically if scheme is registered correctly

**Rubric dimensions:** Navigation (primary), API Integration

**Complexity:** MEDIUM (route setup is low; auth gate + back stack config + edge cases = ~2 hours)

---

## Empty / Loading / Error State Specifications

This table applies to EVERY screen. Evaluator will check these explicitly.

| Screen | Empty State | Loading State | Error State |
|--------|------------|---------------|-------------|
| Sign-in | N/A | Button spinner + disabled form | Inline field error message |
| Admin dashboard | 0 values in stat cards (valid, not "empty" | Skeleton 2x2 grid | "Could not load stats" + retry |
| Departments list | "No departments yet" + icon | 4-5 skeleton ListRows | "Could not load departments" + retry |
| Department detail | "No professors in this department" | 3 skeleton ListRows | "Could not load department" + retry |
| Professor detail | "No courses assigned" | 2 skeleton Cards | "Could not load professor" + retry |
| Professor: My Courses | "You have no courses yet" + icon | 3 skeleton Cards | "Could not load courses" + retry |
| Announcements tab (prof) | "No announcements yet — tap + to post one" | 3 skeleton ListRows | "Could not load announcements" + retry |
| Modules tab (prof) | "No modules yet — tap New Module to start" + CTA button | SectionList with 2 skeleton sections | "Could not load modules" + retry |
| Professor roadmap | "No roadmap items yet. Add modules to see your roadmap." | Skeleton rows | "Could not load roadmap" + retry |
| Student: My Courses | "You are not enrolled in any courses yet" | 3 skeleton Cards | "Could not load courses" + retry |
| Announcements tab (student) | "No announcements yet" | 3 skeleton ListRows | "Could not load announcements" + retry |
| Modules tab (student) | "No content posted yet" | Skeleton SectionList | "Could not load modules" + retry |
| Student roadmap | "No roadmap yet for this course" | Skeleton rows | "Could not load roadmap" + retry |
| Profile | N/A (always has a user) | Skeleton avatar + fields | "Could not load profile" + retry |
| Announcement detail | N/A | Spinner overlay | "Announcement not found" + back button |

**Implementation pattern:** All screens use TanStack Query's `isLoading`, `isError`, `data` state. Create three shared components: `<SkeletonList count={n} />`, `<ErrorState message retry={fn} />`, `<EmptyState icon message action? />`. These are used inline in every list screen.

---

## Feature Prioritization Matrix

| Feature | Rubric Value | Build Cost | Priority |
|---------|-------------|-----------|----------|
| Auth + role routing + session | HIGH | LOW | P1 |
| Design tokens + primitives + RoleThemeProvider | HIGH (enables all UI scores) | LOW-MEDIUM | P1 |
| Empty/Loading/Error components | HIGH (explicit spec requirement) | LOW | P1 |
| Admin dashboard stats | MEDIUM | LOW | P1 |
| Admin department/professor drill-down | MEDIUM | LOW | P1 |
| Professor course list + tabbed management | HIGH | LOW | P1 |
| Professor module CRUD (SectionList + bottom sheet) | HIGH | MEDIUM | P1 |
| Professor roadmap (status + topics) | HIGH | MEDIUM | P1 |
| Student course list + tabbed detail | HIGH | LOW | P1 |
| Student roadmap dual-status | HIGH | MEDIUM-HIGH | P1 |
| Profile edit + avatar upload | MEDIUM | MEDIUM | P1 |
| Deep linking | MEDIUM | MEDIUM | P1 |
| Skeleton loading states | MEDIUM | LOW | P1 |
| Haptic feedback on toggles | LOW | TRIVIAL | P2 |
| Pull-to-refresh on all lists | LOW | LOW | P2 |
| Real-time announcements | LOW | MEDIUM | P3 (stretch) |
| Gemini lecture insights | LOW | HIGH | P3 (stretch) |

---

## Competitor Feature Analysis

| Feature | Canvas Mobile | Google Classroom | Our Approach |
|---------|--------------|-----------------|-------------|
| Role separation | Same app, permission-gated | Teacher vs Student apps | Separate home + tab bars per role; one app |
| Course navigation | Tab-based list | Card grid | FlatList of Cards with role-accent |
| Module hierarchy | Web-style tree on mobile | Assignment list only | SectionList with folder/file metaphor |
| Loading states | Spinners (dated feel) | Skeletons | Moti Skeleton.Group throughout |
| Announcement tap | Push to full screen | Modal overlay | Bottom sheet or push (consistent per role) |
| Progress tracking | Grade-based only | Assignment submission | Dual-status roadmap (professor coverage + student progress) |
| Empty states | Inconsistent | Usually handled | Consistent shared EmptyState component |

---

## Sources

- [Canvas Mobile UX Case Study (Dec 2025)](https://medium.com/@azbayoudh1/canvas-on-the-go-ux-case-study-of-the-canvas-mobile-app-6ae896914a86) — Canvas quick-check mental model, navigation simplification
- [Expo Router Authentication Docs (official)](https://docs.expo.dev/router/advanced/authentication/) — Auth gate pattern, Stack.Protected, deep link + session recovery
- [Supabase + Expo React Native Tutorial (official)](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native) — SecureStore hybrid session pattern, avatar upload flow
- [Moti Skeleton Docs (official)](https://moti.fyi/skeleton) — Skeleton.Group API, integration pattern
- [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet/) — Bottom sheet modal pattern for forms
- [TanStack Query React Native Docs (official)](https://tanstack.com/query/latest/docs/framework/react/react-native) — useQuery loading/error state patterns
- [expo-document-picker Docs (official)](https://docs.expo.dev/versions/latest/sdk/document-picker/) — File picker API
- [expo-image-picker Docs (official)](https://docs.expo.dev/versions/latest/sdk/imagepicker/) — Avatar picker API
- Training knowledge (cross-checked): SectionList folder/file pattern, dual-status roadmap layout, haptics API

---

*Feature research for: Native mobile LMS companion (Scholera) — admin / professor / student roles*
*Researched: 2026-04-23*
