-- ============================================================
-- EduTrack SaaS — Complete Supabase Schema
-- Multi-tenant school attendance platform
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. SCHOOLS (Tenants)
-- ============================================================
create table public.schools (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  address       text,
  logo_url      text,
  timezone      text not null default 'Asia/Jakarta',
  latitude      DOUBLE PRECISION DEFAULT NULL,
  longitude     DOUBLE PRECISION DEFAULT NULL,
  radius        INTEGER          DEFAULT 100
  student_limit int not null default 100,
  student_count int not null default 0,
  subscription_plan text not null default 'free',
  onboarding_completed boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

COMMENT ON COLUMN schools.latitude  IS 'Koordinat latitude lokasi sekolah';
COMMENT ON COLUMN schools.longitude IS 'Koordinat longitude lokasi sekolah';
COMMENT ON COLUMN schools.radius    IS 'Radius geofencing dalam meter untuk validasi kehadiran';

-- ============================================================
-- 2. USERS (Linked to Supabase Auth)
--    Roles: superadmin, admin, teacher, scanner, student
-- ============================================================
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  school_id     uuid references public.schools(id) on delete cascade,
  email         text not null,
  full_name     text not null,
  role          text not null check (role in ('superadmin', 'admin', 'teacher', 'scanner', 'student')),
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_users_school on public.users(school_id);
create index idx_users_role on public.users(role);
create index idx_users_email on public.users(email);

-- ============================================================
-- 3. KELAS (Classes)
-- ============================================================
create table public.kelas (
  id            serial primary key,
  school_id     uuid not null references public.schools(id) on delete cascade,
  nama          text not null,
  jurusan       text,
  tingkat       text,
  gedung        text,
  created_at    timestamptz not null default now()
);

create index idx_kelas_school on public.kelas(school_id);

-- ============================================================
-- 4. TEACHERS
-- ============================================================
create table public.teachers (
  id            uuid primary key default uuid_generate_v4(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  user_id       uuid references public.users(id) on delete set null,
  name          text not null,
  email         text,
  subject       text,
  nip           text,
  phone         text,
  created_at    timestamptz not null default now()
);

create index idx_teachers_school on public.teachers(school_id);

-- ============================================================
-- 5. MATA_PELAJARAN (Subjects)
-- ============================================================
create table public.mata_pelajaran (
  id            serial primary key,
  school_id     uuid not null references public.schools(id) on delete cascade,
  kode          text not null,
  nama          text not null,
  guru          text,
  teacher_id    uuid references public.teachers(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index idx_mapel_school on public.mata_pelajaran(school_id);

-- ============================================================
-- 6. SISWA (Students)
-- ============================================================
create table public.siswa (
  id            uuid primary key default uuid_generate_v4(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  user_id       uuid references public.users(id) on delete set null,
  nisn          text not null,
  nama_lengkap  text not null,
  kelas         text,
  kelas_id      int references public.kelas(id) on delete set null,
  device_id     text,
  foto_url      text,
  created_at    timestamptz not null default now()
);

create unique index idx_siswa_nisn_school on public.siswa(school_id, nisn);
create index idx_siswa_school on public.siswa(school_id);
create index idx_siswa_kelas on public.siswa(kelas_id);
create index idx_siswa_user on public.siswa(user_id);

-- ============================================================
-- 7. CLASS_STUDENTS (Junction: class <-> student)
-- ============================================================
create table public.class_students (
  id            serial primary key,
  kelas_id      int not null references public.kelas(id) on delete cascade,
  siswa_id      uuid not null references public.siswa(id) on delete cascade,
  school_id     uuid not null references public.schools(id) on delete cascade,
  enrolled_at   timestamptz not null default now(),
  unique(kelas_id, siswa_id)
);

create index idx_class_students_school on public.class_students(school_id);

-- ============================================================
-- 8. JADWAL (Schedules)
-- ============================================================
create table public.jadwal (
  id              serial primary key,
  school_id       uuid not null references public.schools(id) on delete cascade,
  kelas_id        int not null references public.kelas(id) on delete cascade,
  mata_pelajaran_id int not null references public.mata_pelajaran(id) on delete cascade,
  teacher_id      uuid references public.teachers(id) on delete set null,
  hari            text not null check (hari in ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
  jam_mulai       time not null,
  jam_selesai     time not null,
  ruangan         text,
  created_at      timestamptz not null default now()
);

create index idx_jadwal_school on public.jadwal(school_id);
create index idx_jadwal_kelas on public.jadwal(kelas_id);
create index idx_jadwal_day on public.jadwal(hari);

-- ============================================================
-- 9. ABSENSI (Attendance)
-- ============================================================
create table public.absensi (
  id              serial primary key,
  school_id       uuid not null references public.schools(id) on delete cascade,
  siswa_id        uuid not null references public.siswa(id) on delete cascade,
  mata_pelajaran_id int references public.mata_pelajaran(id) on delete set null,
  jadwal_id       int references public.jadwal(id) on delete set null,
  tanggal         date not null,
  check_in_time   time,
  status          text not null check (status in ('Present', 'Late', 'Excused', 'Absent')),
  catatan         text,
  scanned_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index idx_absensi_school on public.absensi(school_id);
create index idx_absensi_siswa on public.absensi(siswa_id);
create index idx_absensi_tanggal on public.absensi(tanggal);
create unique index idx_absensi_unique on public.absensi(siswa_id, mata_pelajaran_id, tanggal);

-- ============================================================
-- 10. PERIZINAN (Permissions / Leave Requests)
-- ============================================================
create table public.perizinan (
  id              serial primary key,
  school_id       uuid not null references public.schools(id) on delete cascade,
  siswa_id        uuid not null references public.siswa(id) on delete cascade,
  alasan          text not null,
  bukti_url       text,
  status          text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  tanggal_mulai   date not null,
  tanggal_selesai date not null,
  catatan         text,
  admin_note      text,
  reviewed_by     uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index idx_perizinan_school on public.perizinan(school_id);
create index idx_perizinan_siswa on public.perizinan(siswa_id);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id              uuid primary key default uuid_generate_v4(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  user_id         uuid references public.users(id) on delete cascade,
  title           text not null,
  body            text not null,
  type            text not null default 'info' check (type in ('info', 'warning', 'success', 'attendance', 'permission')),
  is_read         boolean not null default false,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_school on public.notifications(school_id);
create index idx_notifications_read on public.notifications(user_id, is_read);

-- ============================================================
-- 12. STUDENT LIMIT TRIGGER
-- ============================================================

-- Function: increment student_count on insert
create or replace function public.fn_increment_student_count()
returns trigger as $$
declare
  current_count int;
  max_limit int;
begin
  select student_count, student_limit
    into current_count, max_limit
    from public.schools
    where id = NEW.school_id
    for update;

  if current_count >= max_limit then
    raise exception 'Student limit reached. Current: %, Limit: %', current_count, max_limit
      using errcode = 'P0001';
  end if;

  update public.schools
    set student_count = student_count + 1,
        updated_at = now()
    where id = NEW.school_id;

  return NEW;
end;
$$ language plpgsql security definer;

-- Function: decrement student_count on delete
create or replace function public.fn_decrement_student_count()
returns trigger as $$
begin
  update public.schools
    set student_count = greatest(student_count - 1, 0),
        updated_at = now()
    where id = OLD.school_id;
  return OLD;
end;
$$ language plpgsql security definer;

-- Triggers
create trigger trg_student_insert_limit
  before insert on public.siswa
  for each row
  execute function public.fn_increment_student_count();

create trigger trg_student_delete_count
  after delete on public.siswa
  for each row
  execute function public.fn_decrement_student_count();

-- ============================================================
-- 13. UPDATED_AT AUTO-UPDATE TRIGGER
-- ============================================================
create or replace function public.fn_update_timestamp()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_schools_updated
  before update on public.schools
  for each row execute function public.fn_update_timestamp();

create trigger trg_users_updated
  before update on public.users
  for each row execute function public.fn_update_timestamp();

-- ============================================================
-- 14. HELPER: Get current user's school_id
-- ============================================================
create or replace function public.get_user_school_id()
returns uuid as $$
  select school_id from public.users where id = auth.uid();
$$ language sql stable security definer;

-- ============================================================
-- 15. HELPER: Get current user's role
-- ============================================================
create or replace function public.get_user_role()
returns text as $$
  select role from public.users where id = auth.uid();
$$ language sql stable security definer;

-- ============================================================
-- 16. RPC: Handle new user signup (creates school + user record)
-- ============================================================
create or replace function public.handle_new_admin_signup(
  p_school_name text,
  p_full_name text
)
returns json as $$
declare
  v_school_id uuid;
  v_user_id uuid := auth.uid();
  v_email text;
begin
  -- Get user email from auth
  select email into v_email from auth.users where id = v_user_id;

  -- Create school
  insert into public.schools (name)
  values (p_school_name)
  returning id into v_school_id;

  -- Create user record
  insert into public.users (id, school_id, email, full_name, role)
  values (v_user_id, v_school_id, v_email, p_full_name, 'admin');

  return json_build_object(
    'school_id', v_school_id,
    'user_id', v_user_id
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- 17. RPC: Complete onboarding
-- ============================================================
create or replace function public.complete_onboarding()
returns void as $$
begin
  update public.schools
  set onboarding_completed = true
  where id = public.get_user_school_id();
end;
$$ language plpgsql security definer;

-- ============================================================
-- 18. RPC: Create scanner account
-- ============================================================
create or replace function public.create_scanner_account(
  p_email text,
  p_password text,
  p_full_name text
)
returns uuid as $$
declare
  v_school_id uuid := public.get_user_school_id();
  v_user_id uuid;
begin
  -- Only admins can create scanner accounts
  if public.get_user_role() not in ('admin', 'superadmin') then
    raise exception 'Unauthorized: only admins can create scanner accounts';
  end if;

  -- Create auth user via Supabase admin
  -- NOTE: This must be called from the server using service_role key
  -- The actual user creation happens via the API. This function only
  -- creates the users table record after the auth user is created.
  -- The user_id is passed in after server-side auth.users.create()

  raise exception 'Scanner accounts must be created via server API with service_role key';
end;
$$ language plpgsql security definer;

-- ============================================================
-- 19. RPC: Batch import students
-- ============================================================
create or replace function public.batch_import_students(
  p_students jsonb
)
returns json as $$
declare
  v_school_id uuid := public.get_user_school_id();
  v_inserted int := 0;
  v_skipped int := 0;
  v_student jsonb;
  v_kelas_id int;
begin
  for v_student in select * from jsonb_array_elements(p_students)
  loop
    -- Resolve kelas_id by name
    select id into v_kelas_id
    from public.kelas
    where school_id = v_school_id
      and nama = (v_student->>'kelas')
    limit 1;

    begin
      insert into public.siswa (school_id, nisn, nama_lengkap, kelas, kelas_id)
      values (
        v_school_id,
        v_student->>'nisn',
        v_student->>'nama_lengkap',
        v_student->>'kelas',
        v_kelas_id
      );
      v_inserted := v_inserted + 1;
    exception
      when unique_violation then
        v_skipped := v_skipped + 1;
      when others then
        v_skipped := v_skipped + 1;
    end;
  end loop;

  return json_build_object(
    'inserted', v_inserted,
    'skipped', v_skipped,
    'total', v_inserted + v_skipped
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- 20. ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.schools enable row level security;
alter table public.users enable row level security;
alter table public.kelas enable row level security;
alter table public.teachers enable row level security;
alter table public.mata_pelajaran enable row level security;
alter table public.siswa enable row level security;
alter table public.class_students enable row level security;
alter table public.jadwal enable row level security;
alter table public.absensi enable row level security;
alter table public.perizinan enable row level security;
alter table public.notifications enable row level security;

-- ── SCHOOLS ──
create policy "Users can view their own school"
  on public.schools for select
  using (id = public.get_user_school_id());

create policy "Admins can update their own school"
  on public.schools for update
  using (id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

-- ── USERS ──
create policy "Users can view users in their school"
  on public.users for select
  using (school_id = public.get_user_school_id());

create policy "Admins can insert users in their school"
  on public.users for insert
  with check (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

create policy "Admins can update users in their school"
  on public.users for update
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

create policy "Users can update their own profile"
  on public.users for update
  using (id = auth.uid());

-- ── KELAS ──
create policy "Users can view classes in their school"
  on public.kelas for select
  using (school_id = public.get_user_school_id());

create policy "Admins can manage classes"
  on public.kelas for all
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

-- ── TEACHERS ──
create policy "Users can view teachers in their school"
  on public.teachers for select
  using (school_id = public.get_user_school_id());

create policy "Admins can manage teachers"
  on public.teachers for all
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

-- ── MATA_PELAJARAN ──
create policy "Users can view subjects in their school"
  on public.mata_pelajaran for select
  using (school_id = public.get_user_school_id());

create policy "Admins can manage subjects"
  on public.mata_pelajaran for all
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

-- ── SISWA ──
create policy "Users can view students in their school"
  on public.siswa for select
  using (school_id = public.get_user_school_id());

create policy "Students can view their own record"
  on public.siswa for select
  using (user_id = auth.uid());

create policy "Admins can manage students"
  on public.siswa for all
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

-- ── CLASS_STUDENTS ──
create policy "Users can view class_students in their school"
  on public.class_students for select
  using (school_id = public.get_user_school_id());

create policy "Admins can manage class_students"
  on public.class_students for all
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

-- ── JADWAL ──
create policy "Users can view schedules in their school"
  on public.jadwal for select
  using (school_id = public.get_user_school_id());

create policy "Admins can manage schedules"
  on public.jadwal for all
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

-- ── ABSENSI ──
create policy "School users can view attendance"
  on public.absensi for select
  using (school_id = public.get_user_school_id());

create policy "Students can view their own attendance"
  on public.absensi for select
  using (siswa_id in (select id from public.siswa where user_id = auth.uid()));

create policy "Scanners and admins can insert attendance"
  on public.absensi for insert
  with check (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin', 'scanner', 'teacher'));

-- ── PERIZINAN ──
create policy "School users can view permissions"
  on public.perizinan for select
  using (school_id = public.get_user_school_id());

create policy "Students can view their own permissions"
  on public.perizinan for select
  using (siswa_id in (select id from public.siswa where user_id = auth.uid()));

create policy "Students can create permissions"
  on public.perizinan for insert
  with check (siswa_id in (select id from public.siswa where user_id = auth.uid()));

create policy "Admins can update permissions"
  on public.perizinan for update
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin', 'teacher'));

-- ── NOTIFICATIONS ──
create policy "Users can view their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "System can insert notifications"
  on public.notifications for insert
  with check (school_id = public.get_user_school_id());

-- ============================================================
-- 21. STORAGE BUCKETS
-- ============================================================

-- Create buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('school-logos', 'school-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('surat-izin', 'surat-izin', false, 5242880, array['image/png', 'image/jpeg', 'application/pdf']),
  ('student-photos', 'student-photos', false, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ── school-logos: public read, admins write ──

create policy "Public read school logos"
  on storage.objects for select
  using (bucket_id = 'school-logos');

create policy "Admins can upload school logos"
  on storage.objects for insert
  with check (
    bucket_id = 'school-logos'
    and public.get_user_role() in ('admin', 'superadmin')
  );

create policy "Admins can update school logos"
  on storage.objects for update
  using (
    bucket_id = 'school-logos'
    and public.get_user_role() in ('admin', 'superadmin')
  );

create policy "Admins can delete school logos"
  on storage.objects for delete
  using (
    bucket_id = 'school-logos'
    and public.get_user_role() in ('admin', 'superadmin')
  );

-- ── surat-izin: students upload own, school staff read ──

create policy "Students can upload surat izin"
  on storage.objects for insert
  with check (
    bucket_id = 'surat-izin'
    and auth.role() = 'authenticated'
  );

create policy "Authenticated users can read surat izin"
  on storage.objects for select
  using (
    bucket_id = 'surat-izin'
    and auth.role() = 'authenticated'
  );

create policy "Admins can delete surat izin"
  on storage.objects for delete
  using (
    bucket_id = 'surat-izin'
    and public.get_user_role() in ('admin', 'superadmin')
  );

-- ── student-photos: students upload own, school staff read ──

create policy "Students can upload own photo"
  on storage.objects for insert
  with check (
    bucket_id = 'student-photos'
    and auth.role() = 'authenticated'
  );

create policy "Students can update own photo"
  on storage.objects for update
  using (
    bucket_id = 'student-photos'
    and auth.role() = 'authenticated'
  );

create policy "Authenticated users can read student photos"
  on storage.objects for select
  using (
    bucket_id = 'student-photos'
    and auth.role() = 'authenticated'
  );

create policy "Admins can delete student photos"
  on storage.objects for delete
  using (
    bucket_id = 'student-photos'
    and public.get_user_role() in ('admin', 'superadmin')
  );

-- ============================================================
-- 22. RUANGAN (Rooms)
-- ============================================================
create table public.ruangan (
  id         bigint generated always as identity primary key,
  school_id  uuid not null references public.schools(id) on delete cascade,
  nama       text not null,
  lantai     text,
  gedung     text,
  created_at timestamptz default now()
);

-- Index untuk query per sekolah
create index idx_ruangan_school_id on public.ruangan(school_id);

-- RLS
alter table public.ruangan enable row level security;

create policy "Users can view rooms of their school"
  on public.ruangan for select
  using (school_id = public.get_user_school_id());

create policy "Admins can manage rooms"
  on public.ruangan for all
  using (school_id = public.get_user_school_id() and public.get_user_role() in ('admin', 'superadmin'));

-- ============================================================
-- 23. REALTIME PUBLICATION
-- ============================================================
-- Enable realtime for attendance table
alter publication supabase_realtime add table public.absensi;
alter publication supabase_realtime add table public.notifications;