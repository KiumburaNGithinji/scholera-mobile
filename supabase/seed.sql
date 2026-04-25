-- ============================================================
-- Scholera Mobile — Seed Data
-- File: supabase/seed.sql
-- Idempotent: ON CONFLICT DO NOTHING on most inserts; UPSERT on student_progress
-- Demo story: admin@demo.scholera.test / prof@demo.scholera.test / student@demo.scholera.test
-- Password for all: demo-password-1234
-- ============================================================

-- Requires pgcrypto (already enabled in migration)
-- Run this in Supabase SQL editor or via psql connection

do $$
declare
  -- Stable UUIDs for idempotency — these never change
  v_admin_id     uuid := '10000000-0000-0000-0000-000000000001';
  v_prof_id      uuid := '10000000-0000-0000-0000-000000000002';
  v_student_id   uuid := '10000000-0000-0000-0000-000000000003';

  v_dept_cs_id   uuid := '20000000-0000-0000-0000-000000000001';
  v_dept_math_id uuid := '20000000-0000-0000-0000-000000000002';

  v_prog_bscs_id uuid := '30000000-0000-0000-0000-000000000001';

  v_course1_id   uuid := '40000000-0000-0000-0000-000000000001';
  v_course2_id   uuid := '40000000-0000-0000-0000-000000000002';

  v_enr1_id      uuid := '50000000-0000-0000-0000-000000000001';
  v_enr2_id      uuid := '50000000-0000-0000-0000-000000000002';

  v_ann1_id      uuid := '60000000-0000-0000-0000-000000000001';
  v_ann2_id      uuid := '60000000-0000-0000-0000-000000000002';

  v_mod1_id      uuid := '70000000-0000-0000-0000-000000000001';
  v_mod2_id      uuid := '70000000-0000-0000-0000-000000000002';
  v_mod3_id      uuid := '70000000-0000-0000-0000-000000000003';
  v_mod4_id      uuid := '70000000-0000-0000-0000-000000000004';

  v_item1_id     uuid := '80000000-0000-0000-0000-000000000001';
  v_item2_id     uuid := '80000000-0000-0000-0000-000000000002';
  v_item3_id     uuid := '80000000-0000-0000-0000-000000000003';
  v_item4_id     uuid := '80000000-0000-0000-0000-000000000004';
  v_item5_id     uuid := '80000000-0000-0000-0000-000000000005';
  v_item6_id     uuid := '80000000-0000-0000-0000-000000000006';

  v_ri1_id       uuid := '90000000-0000-0000-0000-000000000001';
  v_ri2_id       uuid := '90000000-0000-0000-0000-000000000002';
  v_ri3_id       uuid := '90000000-0000-0000-0000-000000000003';
  v_ri4_id       uuid := '90000000-0000-0000-0000-000000000004';
  v_ri5_id       uuid := '90000000-0000-0000-0000-000000000005';
  v_ri6_id       uuid := '90000000-0000-0000-0000-000000000006';

  v_pw           text := crypt('demo-password-1234', gen_salt('bf'));

begin

  -- ── AUTH USERS ────────────────────────────────────────────
  -- INSERT INTO auth.users with stable UUIDs + bcrypt password
  -- auth.identities entry is required for email login to work (Supabase requirement)

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values
    (v_admin_id,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@demo.scholera.test',   v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (v_prof_id,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'prof@demo.scholera.test',    v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (v_student_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'student@demo.scholera.test', v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{}', now(), now())
  on conflict (id) do nothing;

  -- auth.identities — required for email login to function
  -- Note: provider_id is the unique identifier within (provider, provider_id) pair
  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  values
    (v_admin_id,   v_admin_id,   format('{"sub":"%s","email":"admin@demo.scholera.test"}',   v_admin_id)::jsonb,   'email', v_admin_id::text,   now(), now(), now()),
    (v_prof_id,    v_prof_id,    format('{"sub":"%s","email":"prof@demo.scholera.test"}',    v_prof_id)::jsonb,    'email', v_prof_id::text,    now(), now(), now()),
    (v_student_id, v_student_id, format('{"sub":"%s","email":"student@demo.scholera.test"}', v_student_id)::jsonb, 'email', v_student_id::text, now(), now(), now())
  on conflict (provider, provider_id) do nothing;

  -- ── DEPARTMENTS ───────────────────────────────────────────
  insert into public.departments (id, name, description) values
    (v_dept_cs_id,   'Computer Science', 'Algorithms, systems, AI, and software engineering'),
    (v_dept_math_id, 'Mathematics',      'Pure and applied mathematics programs')
  on conflict (id) do nothing;

  -- ── PROGRAMS ──────────────────────────────────────────────
  insert into public.programs (id, department_id, name) values
    (v_prog_bscs_id, v_dept_cs_id, 'BS Computer Science')
  on conflict (id) do nothing;

  -- ── PROFILES ──────────────────────────────────────────────
  insert into public.profiles (id, role, display_name, bio, department_id) values
    (v_admin_id,   'admin',     'Alex Admin',     'Institution administrator', v_dept_cs_id),
    (v_prof_id,    'professor', 'Dr. Priya Nair', 'AI and Machine Learning faculty', v_dept_cs_id),
    (v_student_id, 'student',   'Sam Student',    'CS junior, interested in ML', null)
  on conflict (id) do nothing;

  -- ── COURSES ───────────────────────────────────────────────
  insert into public.courses (id, professor_id, program_id, title, code, description) values
    (v_course1_id, v_prof_id, v_prog_bscs_id,
     'Introduction to Neural Networks', 'CS-411',
     'Foundations of deep learning, backpropagation, and modern architectures'),
    (v_course2_id, v_prof_id, v_prog_bscs_id,
     'Data Structures and Algorithms', 'CS-201',
     'Core CS data structures with complexity analysis')
  on conflict (id) do nothing;

  -- ── ENROLLMENTS ───────────────────────────────────────────
  insert into public.enrollments (id, course_id, student_id) values
    (v_enr1_id, v_course1_id, v_student_id),
    (v_enr2_id, v_course2_id, v_student_id)
  on conflict (id) do nothing;

  -- ── ANNOUNCEMENTS ─────────────────────────────────────────
  insert into public.announcements (id, course_id, professor_id, title, body) values
    (v_ann1_id, v_course1_id, v_prof_id,
     'Welcome to Neural Networks!',
     'Welcome everyone! Office hours are Tuesdays 2–4pm. We start with linear algebra review in Week 1 — make sure you''re comfortable with matrix ops before our first lecture.'),
    (v_ann2_id, v_course1_id, v_prof_id,
     'Week 2 Reading Posted',
     'The reading for Week 2 (Backpropagation) is now posted in the Modules tab. Please read chapters 6–7 of the course text before Thursday.')
  on conflict (id) do nothing;

  -- ── MODULES (Course 1: Neural Networks) ───────────────────
  insert into public.modules (id, course_id, title, position) values
    (v_mod1_id, v_course1_id, 'Week 1 — Foundations',       1),
    (v_mod2_id, v_course1_id, 'Week 2 — Training Networks', 2),
    (v_mod3_id, v_course2_id, 'Week 1 — Arrays and Lists',  1),
    (v_mod4_id, v_course2_id, 'Week 2 — Trees and Graphs',  2)
  on conflict (id) do nothing;

  -- ── MODULE ITEMS ──────────────────────────────────────────
  insert into public.module_items (id, module_id, title, type, url, content, position) values
    -- Course 1, Week 1
    (v_item1_id, v_mod1_id, 'Lecture 1 — Perceptrons and Linear Models', 'file',
     'https://example.com/lecture1.pdf', null, 1),
    (v_item2_id, v_mod1_id, 'Linear Algebra Review Video', 'link',
     'https://www.youtube.com/watch?v=example', null, 2),
    (v_item3_id, v_mod1_id, 'Week 1 Study Notes', 'note',
     null, 'Key concepts: perceptron, sigmoid activation, linear separability. Review matrix multiplication — it underpins every forward pass.', 3),
    -- Course 1, Week 2
    (v_item4_id, v_mod2_id, 'Lecture 2 — Backpropagation Deep Dive', 'file',
     'https://example.com/lecture2.pdf', null, 1),
    (v_item5_id, v_mod2_id, 'Gradient Descent Visualizer', 'link',
     'https://playground.tensorflow.org', null, 2),
    -- Course 2, Week 1
    (v_item6_id, v_mod3_id, 'Arrays vs Linked Lists — Tradeoffs', 'note',
     null, 'Array: O(1) random access, O(n) insert. Linked list: O(n) access, O(1) insert at head. Know when to use which.', 1)
  on conflict (id) do nothing;

  -- ── ROADMAP ITEMS ─────────────────────────────────────────
  -- One roadmap item per module item; professor_status pre-set for demo story
  insert into public.roadmap_items (id, module_item_id, course_id, professor_status) values
    (v_ri1_id, v_item1_id, v_course1_id, 'complete'),      -- Week 1 lecture — taught
    (v_ri2_id, v_item2_id, v_course1_id, 'complete'),      -- Week 1 video — covered
    (v_ri3_id, v_item3_id, v_course1_id, 'complete'),      -- Week 1 notes — covered
    (v_ri4_id, v_item4_id, v_course1_id, 'in_progress'),   -- Week 2 lecture — in progress
    (v_ri5_id, v_item5_id, v_course1_id, 'not_started'),   -- Week 2 visualizer — upcoming
    (v_ri6_id, v_item6_id, v_course2_id, 'complete')       -- DSA Week 1 — covered
  on conflict (module_item_id) do nothing;

  -- ── TOPICS (AI-extracted) ─────────────────────────────────
  -- Pre-seeded topics simulate what the AI extraction pipeline would produce.
  -- No unique constraint on (roadmap_item_id, label), so guard against re-runs by
  -- only inserting if no topics exist for these roadmap items yet.
  if not exists (select 1 from public.topics where roadmap_item_id = v_ri1_id) then
    insert into public.topics (roadmap_item_id, label) values
      -- Lecture 1 topics
      (v_ri1_id, 'Perceptron'),
      (v_ri1_id, 'Sigmoid Activation'),
      (v_ri1_id, 'Linear Separability'),
      (v_ri1_id, 'Decision Boundary'),
      (v_ri1_id, 'Weight Initialization'),
      -- Linear algebra video
      (v_ri2_id, 'Matrix Multiplication'),
      (v_ri2_id, 'Dot Product'),
      (v_ri2_id, 'Eigenvalues'),
      -- Lecture 2 topics
      (v_ri4_id, 'Gradient Descent'),
      (v_ri4_id, 'Backpropagation'),
      (v_ri4_id, 'Chain Rule'),
      (v_ri4_id, 'Learning Rate'),
      (v_ri4_id, 'Loss Functions'),
      -- DSA Week 1
      (v_ri6_id, 'Array Access Complexity'),
      (v_ri6_id, 'Linked List Insertions'),
      (v_ri6_id, 'Memory Layout');
  end if;

  -- ── STUDENT PROGRESS ──────────────────────────────────────
  -- Student has marked Week 1 complete, Week 2 in progress
  insert into public.student_progress (roadmap_item_id, student_id, status) values
    (v_ri1_id, v_student_id, 'complete'),
    (v_ri2_id, v_student_id, 'complete'),
    (v_ri3_id, v_student_id, 'in_progress'),
    (v_ri4_id, v_student_id, 'not_started'),
    (v_ri6_id, v_student_id, 'complete')
  on conflict (roadmap_item_id, student_id) do update set status = excluded.status;

end $$;

-- ── VERIFICATION QUERIES (run these manually after seed completes) ──
-- select count(*) from auth.users;                                    -- expected: 3
-- select count(*) from auth.identities where provider = 'email';      -- expected: 3
-- select count(*) from public.profiles;                               -- expected: 3
-- select count(*) from public.courses;                                -- expected: 2
-- select count(*) from public.module_items;                           -- expected: 6
-- select count(*) from public.roadmap_items;                          -- expected: 6
-- select count(*) from public.topics;                                 -- expected: 16
-- select count(*) from public.student_progress;                       -- expected: 5
