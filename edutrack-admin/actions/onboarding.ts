'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser } from './auth';
import type { OnboardingAllData } from '@/lib/types';

async function getSchoolId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.school_id) throw new Error('Unauthorized');
  return user.school_id;
}

// ── Submit All Onboarding Data ──
export async function submitAllOnboarding(formData: FormData) {
  const schoolId = await getSchoolId();

  const data: OnboardingAllData = JSON.parse(formData.get('data') as string);
  const logoFile = formData.get('logo') as File | null;

  // 1. Update School Info
  let logo_url: string | undefined;
  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split('.').pop();
    const filePath = `${schoolId}/logo.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('school-logos')
      .upload(filePath, logoFile, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabaseAdmin.storage
        .from('school-logos')
        .getPublicUrl(filePath);
      logo_url = urlData.publicUrl;
    }
  }

  const schoolUpdate: Record<string, unknown> = {
    name: data.schoolInfo.name,
    address: data.schoolInfo.address,
    latitude: data.schoolInfo.latitude,
    longitude: data.schoolInfo.longitude,
    radius: data.schoolInfo.radius,
  };
  if (logo_url) schoolUpdate.logo_url = logo_url;

  const { error: schoolError } = await supabaseAdmin
    .from('schools')
    .update(schoolUpdate)
    .eq('id', schoolId);

  if (schoolError) return { error: `School info: ${schoolError.message}` };

  // 2. Create Classes
  const validClasses = data.classes.filter((c) => c.nama.trim());
  let kelasData: { id: number; nama: string }[] = [];

  if (validClasses.length > 0) {
    const classRows = validClasses.map((c) => ({
      school_id: schoolId,
      nama: c.nama,
      jurusan: c.jurusan || null,
      tingkat: c.tingkat || null,
    }));

    const { data: insertedClasses, error: classError } = await supabaseAdmin
      .from('kelas')
      .insert(classRows)
      .select('id, nama');

    if (classError) return { error: `Classes: ${classError.message}` };
    kelasData = insertedClasses || [];
  }

  // 3. Create Teachers + Subjects
  const validTeachers = data.teachers.filter((t) => t.name.trim());
  let teacherData: { id: string; name: string; subject: string | null }[] = [];

  if (validTeachers.length > 0) {
    const teacherRows = validTeachers.map((t) => ({
      school_id: schoolId,
      name: t.name,
      email: t.email || null,
      subject: t.subject || null,
    }));

    const { data: insertedTeachers, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .insert(teacherRows)
      .select('id, name, subject');

    if (teacherError) return { error: `Teachers: ${teacherError.message}` };
    teacherData = insertedTeachers || [];

    // Create mata_pelajaran entries for unique subjects
    const subjectMap = new Map<string, string>();
    for (const t of validTeachers) {
      if (t.subject && !subjectMap.has(t.subject)) {
        subjectMap.set(t.subject, t.name);
      }
    }

    if (subjectMap.size > 0) {
      const subjectRows = Array.from(subjectMap.entries()).map(([subject, guru]) => ({
        school_id: schoolId,
        kode: subject.substring(0, 3).toUpperCase(),
        nama: subject,
        guru,
        teacher_id: teacherData.find((d) => d.subject === subject)?.id || null,
      }));

      await supabaseAdmin.from('mata_pelajaran').insert(subjectRows);
    }
  }

  // 4. Create Rooms
  const validRooms = (data.rooms || []).filter((r) => r.nama.trim());

  if (validRooms.length > 0) {
    const roomRows = validRooms.map((r) => ({
      school_id: schoolId,
      nama: r.nama,
      lantai: r.lantai || null,
      gedung: r.gedung || null,
    }));

    const { error: roomError } = await supabaseAdmin
      .from('ruangan')
      .insert(roomRows);

    if (roomError) return { error: `Rooms: ${roomError.message}` };
  }

  // 5. Create Schedules
  const validSchedules = data.schedules.filter((s) => s.kelas_nama && s.mata_pelajaran_nama && s.hari);

  if (validSchedules.length > 0) {
    // Fetch the just-created mata_pelajaran to get IDs
    const { data: mapelList } = await supabaseAdmin
      .from('mata_pelajaran')
      .select('id, nama, kode')
      .eq('school_id', schoolId);

    const scheduleRows = validSchedules.map((s) => {
      const kelas = kelasData.find((k) => k.nama === s.kelas_nama);
      const mapel = mapelList?.find((m) => m.nama === s.mata_pelajaran_nama || m.kode === s.mata_pelajaran_kode);
      const teacher = teacherData.find((t) => t.name === s.teacher_name);

      return {
        school_id: schoolId,
        kelas_id: kelas?.id,
        mata_pelajaran_id: mapel?.id,
        teacher_id: teacher?.id || null,
        hari: s.hari,
        jam_mulai: s.jam_mulai,
        jam_selesai: s.jam_selesai,
        ruangan: s.ruangan || null,
      };
    }).filter((r) => r.kelas_id && r.mata_pelajaran_id);

    if (scheduleRows.length > 0) {
      const { error: scheduleError } = await supabaseAdmin
        .from('jadwal')
        .insert(scheduleRows);

      if (scheduleError) return { error: `Schedules: ${scheduleError.message}` };
    }
  }

  // 5. Import Students (create Auth user + users row + siswa row)
  const validStudents = data.students.filter((s) => s.nisn.trim() && s.nama_lengkap.trim());
  const studentErrors: string[] = [];

  if (validStudents.length > 0) {
    // Check student limit
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('student_limit, student_count')
      .eq('id', schoolId)
      .single();

    if (school) {
      const remaining = school.student_limit - school.student_count;
      if (validStudents.length > remaining) {
        return {
          error: `Student limit exceeded. You can add ${remaining} more students (limit: ${school.student_limit}).`,
        };
      }
    }

    for (const s of validStudents) {
      const studentEmail = `${s.nisn}@edutrack.internal`;
      const kelas = kelasData.find((k) => k.nama === s.kelas);

      // Create Supabase Auth user (no email verification)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: studentEmail,
        password: s.password,
        email_confirm: true,
        user_metadata: { full_name: s.nama_lengkap },
      });

      if (authError || !authData.user) {
        studentErrors.push(`${s.nisn} (${s.nama_lengkap}): ${authError?.message || 'Failed to create auth user'}`);
        continue;
      }

      // Insert into users table with student role
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          school_id: schoolId,
          email: studentEmail,
          full_name: s.nama_lengkap,
          role: 'student',
        });

      if (userError) {
        studentErrors.push(`${s.nisn} (${s.nama_lengkap}): ${userError.message}`);
        continue;
      }

      // Insert into siswa table linked to the auth user
      const { error: siswaError } = await supabaseAdmin
        .from('siswa')
        .insert({
          school_id: schoolId,
          user_id: authData.user.id,
          nisn: s.nisn,
          nama_lengkap: s.nama_lengkap,
          kelas: s.kelas,
          kelas_id: kelas?.id || null,
        });

      if (siswaError) {
        if (siswaError.message.includes('Student limit reached')) {
          return { error: `Student limit reached. Some students were not imported.` };
        }
        studentErrors.push(`${s.nisn} (${s.nama_lengkap}): ${siswaError.message}`);
      }
    }
  }

  // 6. Create Scanner Accounts
  const validScanners = data.scanners.filter((s) => s.full_name.trim() && s.email.trim() && s.password.trim());
  const scannerErrors: string[] = [];

  for (const scanner of validScanners) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: scanner.email,
      password: scanner.password,
      email_confirm: true,
      user_metadata: { full_name: scanner.full_name },
    });

    if (authError || !authData.user) {
      scannerErrors.push(`${scanner.email}: ${authError?.message || 'Failed'}`);
      continue;
    }

    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        school_id: schoolId,
        email: scanner.email,
        full_name: scanner.full_name,
        role: 'scanner',
      });

    if (userError) {
      scannerErrors.push(`${scanner.email}: ${userError.message}`);
    }
  }

  // 7. Mark onboarding as complete
  const { error: completeError } = await supabaseAdmin
    .from('schools')
    .update({ onboarding_completed: true })
    .eq('id', schoolId);

  if (completeError) return { error: `Complete: ${completeError.message}` };

  return {
    success: true,
    studentErrors: studentErrors.length > 0 ? studentErrors : undefined,
    scannerErrors: scannerErrors.length > 0 ? scannerErrors : undefined,
  };
}

// ── Fetch helpers (still used by onboarding steps for student limit) ──
export async function getSchoolStudentCount() {
  const schoolId = await getSchoolId();
  const { data } = await supabaseAdmin
    .from('schools')
    .select('student_count, student_limit')
    .eq('id', schoolId)
    .single();
  return data || { student_count: 0, student_limit: 100 };
}

export async function getSchoolInfo() {
  const schoolId = await getSchoolId();
  const { data } = await supabaseAdmin
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single();
  return data;
}
