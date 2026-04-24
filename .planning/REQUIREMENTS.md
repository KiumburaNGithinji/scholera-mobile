# Requirements: Scholera Mobile

**Defined:** 2026-04-23
**Core Value:** Role-aware, native-feeling mobile experience — login correctly detects admin/professor/student and routes into a distinct role-specific experience.

## v1 Requirements

Requirements derived from the assignment spec (`reference/mobile-developer.md`) — **all 11 required features are table stakes** per the rubric. UI and polish requirements are derived from the "Design Requirements" section of the spec and the research SUMMARY. Every requirement maps to a single roadmap phase; see **Traceability** at the bottom.

### Authentication & Role Routing

- [ ] **AUTH-01**: User can sign in with email and password via Supabase Auth
- [ ] **AUTH-02**: App reads the user's role from their profile (`admin` | `professor` | `student`) after sign-in
- [ ] **AUTH-03**: Each role is routed to a completely separate home experience (distinct tab bar, layout, accent color)
- [ ] **AUTH-04**: Session persists across app restarts (verified by force-quit)
- [ ] **AUTH-05**: Expired sessions are handled gracefully (user redirected to sign-in with no crash)
- [ ] **AUTH-06**: User can sign out from any role (returns to sign-in screen, clears session)

### Admin Experience

- [ ] **ADMIN-01**: Admin sees a dashboard with institution stats (total students, professors, courses, departments) fetched live from Supabase
- [ ] **ADMIN-02**: Admin can view a list of all departments with their assigned professors; tapping a department shows its detail
- [ ] **ADMIN-03**: Admin can drill from department detail into a professor's profile, showing the professor's assigned courses

### Professor Experience

- [ ] **PROF-01**: Professor sees "My Courses" — list of all course sections they teach
- [ ] **PROF-02**: Tapping a course opens a tabbed Course Management screen (Announcements tab + Modules tab)
- [ ] **PROF-03**: Professor can view existing announcements for a course and create new ones (title + body)
- [ ] **PROF-04**: Professor can see all modules in a course (in order) and the items inside each module, with each item's type shown clearly (lecture / video / link / note / file)
- [ ] **PROF-05**: Professor can create a new module (title) and add items to it — supports adding a **link** (URL + title), a **note** (plain text), and a **file upload** (PDF or PPT uploaded to Supabase Storage)
- [ ] **PROF-06**: Professor can view the course roadmap: modules as groups, items underneath each with their AI-extracted topic chips visible, and mark each item's coverage status (not started / in progress / complete)

### Student Experience

- [ ] **STUD-01**: Student sees "My Courses" — list of all courses they are enrolled in
- [ ] **STUD-02**: Tapping a course opens a tabbed Course Detail screen (Announcements tab, read-only + Modules tab, read-only). Each module item shows its type visually (icon + label). Tapping an announcement shows the full text.
- [ ] **STUD-03**: Student can view the course roadmap: same structure the professor built, with AI-extracted topics displayed per item, professor's coverage status visible (read-only), AND student's own progress toggleable independently (not started / in progress / complete)
- [ ] **STUD-04**: Student's personal progress on roadmap items is stored and persists independently of the professor's coverage status

### Shared

- [ ] **SHARED-01**: Any role can view and edit their own profile (display name, bio, avatar). Changes save back to Supabase. Avatar uploads to Supabase Storage.
- [ ] **SHARED-02**: App handles a direct deep link to a specific announcement: `scholera://courses/{courseId}/announcements/{announcementId}`. Opening this link navigates the user directly to that announcement after authentication (or to sign-in first, then through).

### UI Quality & Polish

- [ ] **UI-01**: Design system exists with tokens (colors, spacing, type, radii) and primitives (`Button`, `Card`, `Chip`, `ListRow`, `EmptyState`, `Skeleton`, `ErrorView`). Each role has a distinct accent color (admin = steel, professor = clay, student = sage) injected via `RoleThemeProvider` so the three experiences feel visually distinct.
- [ ] **UI-02**: Every screen handles empty states (e.g. "No announcements yet" instead of blank), loading states (skeletons, not abrupt flashes), and error states (friendly surface, no crash).
- [ ] **UI-03**: App feels native and polished — platform-appropriate conventions (iOS/Android), consistent spacing and typography throughout, no WebView feel.

### Submission Artifacts (non-negotiable)

- [ ] **SUB-01**: New public GitHub repo created (not a fork of Scholera's assessments repo)
- [ ] **SUB-02**: `README.md` with setup instructions (<5 min to run), framework + key library rationale, screenshots across all 3 roles, known limitations
- [ ] **SUB-03**: `AI_ASSISTANT_USAGE.md` hand-written by Kiumbura (NOT AI-generated) — describes how AI tools were used
- [ ] **SUB-04**: Demo video (5–10 min) walking through sign-in as all 3 roles, admin dept/prof view, professor module management + roadmap with topics + coverage status, student course + roadmap with progress marking, and any stretch goals completed
- [ ] **SUB-05**: No Supabase keys or secrets committed to the public repo (`.env*` in `.gitignore`, anon key only in mobile app)

## v2 Requirements

Deferred. Assignment explicitly calls these **stretch goals** — not required, not evaluated, but strengthen the profile if time allows.

### Stretch
- **STR-01**: Push notifications — local notification on new announcement (simulated OK)
- **STR-02**: Biometric auth (Face ID / fingerprint) for returning users
- **STR-03**: Animated, purposeful screen transitions (beyond default fade)
- **STR-04**: Real-time announcements via Supabase Realtime (no pull-to-refresh needed)
- **STR-05**: Lecture insights view — summary + topic extraction from uploaded lecture file via Google Gemini API

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mocked / hardcoded data in final submission | Assignment forbids it — all data must read/write from Supabase live |
| Full rich-text content editor for modules | Spec explicitly says "keep it simple" — CRUD on hierarchy is what's evaluated |
| AI topic extraction pipeline | Spec says topics are pre-extracted in the DB; app just fetches and displays them |
| Web app / cross-platform web build | Mobile-only |
| Matching Scholera's web design exactly | Spec says "use your design judgment" |
| Dark mode | Out of scope for v1 — warm cream canvas is the design DNA |
| Admin write operations (create/edit departments/programs) | Spec describes admin as management-oriented read-only surfaces for this prototype |
| Drag-to-reorder modules or items | Not in spec; complex; insertion order is sufficient |
| Offline sync / conflict resolution | Not in spec; risky for 2-day timeline |
| Student file upload | Spec limits upload to professor |

## Traceability

Each v1 requirement maps to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SUB-01 | Phase 1 (Scaffold) | Pending |
| SUB-05 | Phase 1 (Scaffold) | Pending |
| UI-01 | Phase 2 (Design Foundations) | Pending |
| UI-02 | Phase 2 (Design Foundations) | Pending |
| AUTH-01 | Phase 3 (Auth + Role Router) | Pending |
| AUTH-02 | Phase 3 (Auth + Role Router) | Pending |
| AUTH-03 | Phase 3 (Auth + Role Router) | Pending |
| AUTH-04 | Phase 3 (Auth + Role Router) | Pending |
| AUTH-05 | Phase 3 (Auth + Role Router) | Pending |
| AUTH-06 | Phase 3 (Auth + Role Router) | Pending |
| ADMIN-01 | Phase 4 (Admin Experience) | Pending |
| ADMIN-02 | Phase 4 (Admin Experience) | Pending |
| ADMIN-03 | Phase 4 (Admin Experience) | Pending |
| PROF-01 | Phase 5 (Professor Experience) | Pending |
| PROF-02 | Phase 5 (Professor Experience) | Pending |
| PROF-03 | Phase 5 (Professor Experience) | Pending |
| PROF-04 | Phase 5 (Professor Experience) | Pending |
| PROF-05 | Phase 5 (Professor Experience) | Pending |
| PROF-06 | Phase 5 (Professor Experience) | Pending |
| STUD-01 | Phase 6 (Student Experience) | Pending |
| STUD-02 | Phase 6 (Student Experience) | Pending |
| STUD-03 | Phase 6 (Student Experience) | Pending |
| STUD-04 | Phase 6 (Student Experience) | Pending |
| SHARED-01 | Phase 7 (Shared + Deep Linking) | Pending |
| SHARED-02 | Phase 7 (Shared + Deep Linking) | Pending |
| UI-03 | Phase 8 (Polish + Submit) | Pending |
| SUB-02 | Phase 8 (Polish + Submit) | Pending |
| SUB-03 | Phase 8 (Polish + Submit) | Pending |
| SUB-04 | Phase 8 (Polish + Submit) | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-23*
*Last updated: 2026-04-23 — traceability finalized after roadmap creation (8-phase structure)*
