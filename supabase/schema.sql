-- Profiles (linked to Supabase Auth)
create table profiles (
  id uuid references auth.users primary key,
  cr_name text not null,
  batch text not null,
  dept_code text not null,
  section text not null,
  class_id text generated always as (batch || dept_code || '-' || section) stored,
  created_at timestamptz default now()
);

-- Students
create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  roll_number text not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, roll_number)
);

-- Subjects
create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- Sessions
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  date date not null default current_date,
  total_students int not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Attendance Records
create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  status text check (status in ('present', 'absent')) not null,
  created_at timestamptz default now(),
  unique(session_id, student_id)
);

-- Enable RLS
alter table profiles enable row level security;
alter table students enable row level security;
alter table subjects enable row level security;
alter table sessions enable row level security;
alter table attendance_records enable row level security;

-- Profiles policies
create policy "Users own their profile"
  on profiles for all
  using (id = auth.uid());

-- Students policies
create policy "Users own their students"
  on students for all
  using (user_id = auth.uid());

-- Subjects policies
create policy "Users own their subjects"
  on subjects for all
  using (user_id = auth.uid());

-- Sessions policies
create policy "Users own their sessions"
  on sessions for all
  using (user_id = auth.uid());

-- Attendance records policies
create policy "Users own their attendance records"
  on attendance_records for all
  using (
    session_id in (
      select id from sessions where user_id = auth.uid()
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, cr_name, batch, dept_code, section)
  values (new.id, '', '', '', '');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger (optional, if you want auto-insert; we handle in app)
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
