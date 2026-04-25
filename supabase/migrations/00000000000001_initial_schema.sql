-- ============================================================
-- Scholera Mobile — Initial Schema Migration
-- File: supabase/migrations/00000000000001_initial_schema.sql
-- ============================================================

-- ─── Extensions ────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── PROFILES ──────────────────────────────────────────────
-- Extends auth.users 1-to-1. role drives all routing decisions.
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           text not null check (role in ('admin', 'professor', 'student')),
  display_name   text,
  bio            text,
  avatar_url     text,
  department_id  uuid,  -- FK added after departments table; backfilled below
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── DEPARTMENTS ───────────────────────────────────────────
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Add FK from profiles → departments
alter table public.profiles
  add constraint if not exists fk_profiles_department
  foreign key (department_id) references public.departments(id) on delete set null;

-- ─── PROGRAMS ──────────────────────────────────────────────
create table if not exists public.programs (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name          text not null,
  description   text,
  created_at    timestamptz not null default now()
);

-- ─── COURSES ───────────────────────────────────────────────
-- Represents a course section taught by one professor.
create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.profiles(id) on delete cascade,
  program_id   uuid references public.programs(id) on delete set null,
  title        text not null,
  code         text,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_courses_professor_id on public.courses(professor_id);

-- ─── ENROLLMENTS ───────────────────────────────────────────
create table if not exists public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index if not exists idx_enrollments_student_id on public.enrollments(student_id);
create index if not exists idx_enrollments_course_id  on public.enrollments(course_id);

-- ─── ANNOUNCEMENTS ─────────────────────────────────────────
create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  professor_id uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  body         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_announcements_course_id on public.announcements(course_id);

-- ─── MODULES ───────────────────────────────────────────────
-- Ordered grouping within a course (e.g. "Week 1 — Foundations")
create table if not exists public.modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_modules_course_id on public.modules(course_id);

-- ─── MODULE ITEMS ──────────────────────────────────────────
-- Items inside a module: link, note, or uploaded file.
create table if not exists public.module_items (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  title       text not null,
  type        text not null check (type in ('link', 'note', 'file')),
  url         text,   -- for link + file types
  content     text,   -- for note type
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_module_items_module_id on public.module_items(module_id);

-- ─── ROADMAP ITEMS ─────────────────────────────────────────
-- Auto-derived from module items. professor_status tracks taught status.
create table if not exists public.roadmap_items (
  id               uuid primary key default gen_random_uuid(),
  module_item_id   uuid not null references public.module_items(id) on delete cascade,
  course_id        uuid not null references public.courses(id) on delete cascade,
  professor_status text not null default 'not_started'
    check (professor_status in ('not_started', 'in_progress', 'complete')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (module_item_id)  -- one roadmap node per module item
);

create index if not exists idx_roadmap_items_course_id on public.roadmap_items(course_id);

-- ─── TOPICS ────────────────────────────────────────────────
-- AI-extracted topics linked to a roadmap item.
create table if not exists public.topics (
  id              uuid primary key default gen_random_uuid(),
  roadmap_item_id uuid not null references public.roadmap_items(id) on delete cascade,
  label           text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_topics_roadmap_item_id on public.topics(roadmap_item_id);

-- ─── STUDENT PROGRESS ──────────────────────────────────────
-- Student's PERSONAL progress — entirely separate from professor_status.
-- This is the core of STUD-04: two independent statuses per roadmap item.
create table if not exists public.student_progress (
  id              uuid primary key default gen_random_uuid(),
  roadmap_item_id uuid not null references public.roadmap_items(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  status          text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'complete')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (roadmap_item_id, student_id)
);

create index if not exists idx_student_progress_student_id  on public.student_progress(student_id);
create index if not exists idx_student_progress_roadmap_id  on public.student_progress(roadmap_item_id);

-- ─── UPDATED_AT TRIGGER ────────────────────────────────────
-- Auto-update updated_at on any table that has it.
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace trigger trg_courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();

create or replace trigger trg_announcements_updated_at
  before update on public.announcements
  for each row execute function public.handle_updated_at();

create or replace trigger trg_roadmap_items_updated_at
  before update on public.roadmap_items
  for each row execute function public.handle_updated_at();

create or replace trigger trg_student_progress_updated_at
  before update on public.student_progress
  for each row execute function public.handle_updated_at();

-- ─── ROW LEVEL SECURITY ────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.departments    enable row level security;
alter table public.programs       enable row level security;
alter table public.courses        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.announcements  enable row level security;
alter table public.modules        enable row level security;
alter table public.module_items   enable row level security;
alter table public.roadmap_items  enable row level security;
alter table public.topics         enable row level security;
alter table public.student_progress enable row level security;

-- Profiles: each user reads/writes their own; admin reads all
create policy "profiles: own read/write" on public.profiles
  for all using (auth.uid() = id);

create policy "profiles: admin read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Departments: all authenticated users can read; admin full access
create policy "departments: authenticated read" on public.departments
  for select using (auth.role() = 'authenticated');

-- Programs: all authenticated users can read
create policy "programs: authenticated read" on public.programs
  for select using (auth.role() = 'authenticated');

-- Courses: professors see their own; students see enrolled; admin sees all
create policy "courses: professor own" on public.courses
  for all using (professor_id = auth.uid());

create policy "courses: student enrolled" on public.courses
  for select using (
    exists (select 1 from public.enrollments e where e.course_id = id and e.student_id = auth.uid())
  );

create policy "courses: admin read all" on public.courses
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Enrollments: student sees own; professor sees their course enrollments; admin all
create policy "enrollments: student own" on public.enrollments
  for select using (student_id = auth.uid());

create policy "enrollments: professor own course" on public.enrollments
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and c.professor_id = auth.uid())
  );

-- Announcements: professor CRUD own; student enrolled read
create policy "announcements: professor own" on public.announcements
  for all using (professor_id = auth.uid());

create policy "announcements: student enrolled read" on public.announcements
  for select using (
    exists (select 1 from public.enrollments e where e.course_id = course_id and e.student_id = auth.uid())
  );

-- Modules: professor CRUD; enrolled student read
create policy "modules: professor own course" on public.modules
  for all using (
    exists (select 1 from public.courses c where c.id = course_id and c.professor_id = auth.uid())
  );

create policy "modules: student enrolled read" on public.modules
  for select using (
    exists (select 1 from public.enrollments e where e.course_id = course_id and e.student_id = auth.uid())
  );

-- Module items: same pattern as modules
create policy "module_items: professor own" on public.module_items
  for all using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.professor_id = auth.uid()
    )
  );

create policy "module_items: student enrolled read" on public.module_items
  for select using (
    exists (
      select 1 from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = module_id and e.student_id = auth.uid()
    )
  );

-- Roadmap items: professor CRUD (status update); enrolled student read
create policy "roadmap_items: professor update" on public.roadmap_items
  for all using (
    exists (
      select 1 from public.courses c where c.id = course_id and c.professor_id = auth.uid()
    )
  );

create policy "roadmap_items: student enrolled read" on public.roadmap_items
  for select using (
    exists (select 1 from public.enrollments e where e.course_id = course_id and e.student_id = auth.uid())
  );

-- Topics: all enrolled users read
create policy "topics: authenticated read" on public.topics
  for select using (
    exists (
      select 1 from public.roadmap_items ri
      join public.enrollments e on e.course_id = ri.course_id
      where ri.id = roadmap_item_id and e.student_id = auth.uid()
    )
  );

create policy "topics: professor read own course" on public.topics
  for select using (
    exists (
      select 1 from public.roadmap_items ri
      join public.courses c on c.id = ri.course_id
      where ri.id = roadmap_item_id and c.professor_id = auth.uid()
    )
  );

-- Student progress: student owns their own rows
create policy "student_progress: own all" on public.student_progress
  for all using (student_id = auth.uid());

create policy "student_progress: professor read enrolled" on public.student_progress
  for select using (
    exists (
      select 1 from public.roadmap_items ri
      join public.courses c on c.id = ri.course_id
      where ri.id = roadmap_item_id and c.professor_id = auth.uid()
    )
  );
