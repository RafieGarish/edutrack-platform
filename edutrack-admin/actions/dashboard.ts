'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser } from './auth';

async function getSchoolId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.school_id) throw new Error('Unauthorized');
  return user.school_id;
}

// ── Dashboard Stats ──
export async function getDashboardStats() {
  const schoolId = await getSchoolId();
  const today = new Date().toISOString().split('T')[0];

  const [
    { count: studentCount },
    { count: teacherCount },
    { count: classCount },
    { data: todayAttendance },
  ] = await Promise.all([
    supabaseAdmin
      .from('siswa')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId),
    supabaseAdmin
      .from('teachers')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId),
    supabaseAdmin
      .from('kelas')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId),
    supabaseAdmin
      .from('absensi')
      .select('status')
      .eq('school_id', schoolId)
      .eq('tanggal', today),
  ]);

  const present = todayAttendance?.filter((d) => d.status === 'Present').length || 0;
  const late = todayAttendance?.filter((d) => d.status === 'Late').length || 0;
  const excused = todayAttendance?.filter((d) => d.status === 'Excused').length || 0;
  const absent = todayAttendance?.filter((d) => d.status === 'Absent').length || 0;

  return {
    students: studentCount || 0,
    teachers: teacherCount || 0,
    classes: classCount || 0,
    todayAttendance: {
      present,
      late,
      excused,
      absent,
      total: (todayAttendance?.length) || 0,
    },
  };
}

// ── Attendance Records ──
export async function getAttendanceRecords(params?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const schoolId = await getSchoolId();

  const selectFields = `
    *,
    siswa!inner(id, nisn, nama_lengkap, kelas, foto_url),
    mata_pelajaran(id, kode, nama)
  `;

  // Count query
  let countQuery = supabaseAdmin
    .from('absensi')
    .select('*, siswa!inner(nisn, nama_lengkap)', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  // Data query
  let query = supabaseAdmin
    .from('absensi')
    .select(selectFields)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (params?.dateFrom) {
    query = query.gte('tanggal', params.dateFrom);
    countQuery = countQuery.gte('tanggal', params.dateFrom);
  }
  if (params?.dateTo) {
    query = query.lte('tanggal', params.dateTo);
    countQuery = countQuery.lte('tanggal', params.dateTo);
  }
  if (params?.status) {
    query = query.eq('status', params.status);
    countQuery = countQuery.eq('status', params.status);
  }
  if (params?.search) {
    const filter = `nama_lengkap.ilike.%${params.search}%,nisn.ilike.%${params.search}%`;
    query = query.or(filter, { referencedTable: 'siswa' });
    countQuery = countQuery.or(filter, { referencedTable: 'siswa' });
  }

  const limit = params?.limit || 10;
  const offset = params?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const [{ data, error }, { count }] = await Promise.all([query, countQuery]);
  if (error) return { error: error.message, data: [], count: 0 };
  return { data: data || [], count: count || 0 };
}

// ── Attendance Stats ──
export async function getAttendanceStats(dateFrom?: string, dateTo?: string) {
  const schoolId = await getSchoolId();
  const from = dateFrom || new Date().toISOString().split('T')[0];
  const to = dateTo || from;

  let query = supabaseAdmin
    .from('absensi')
    .select('status')
    .eq('school_id', schoolId)
    .gte('tanggal', from)
    .lte('tanggal', to);

  const { data, error } = await query;

  if (error) return { total: 0, present: 0, late: 0, excused: 0, absent: 0 };

  const records = data || [];
  return {
    total: records.length,
    present: records.filter((r) => r.status === 'Present').length,
    late: records.filter((r) => r.status === 'Late').length,
    excused: records.filter((r) => r.status === 'Excused').length,
    absent: records.filter((r) => r.status === 'Absent').length,
  };
}

// ── Attendance Chart Data (daily counts per status) ──
export async function getAttendanceChartData(dateFrom?: string, dateTo?: string) {
  const schoolId = await getSchoolId();
  const from = dateFrom || new Date().toISOString().split('T')[0];
  const to = dateTo || from;

  const { data, error } = await supabaseAdmin
    .from('absensi')
    .select('tanggal, status')
    .eq('school_id', schoolId)
    .gte('tanggal', from)
    .lte('tanggal', to)
    .order('tanggal');

  if (error || !data) return [];

  // Group by date
  const grouped: Record<string, { present: number; late: number; excused: number; absent: number }> = {};

  // Fill all dates in range
  const start = new Date(from);
  const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    grouped[key] = { present: 0, late: 0, excused: 0, absent: 0 };
  }

  for (const row of data) {
    const key = row.tanggal;
    if (!grouped[key]) grouped[key] = { present: 0, late: 0, excused: 0, absent: 0 };
    const status = row.status as string;
    if (status === 'Present') grouped[key].present++;
    else if (status === 'Late') grouped[key].late++;
    else if (status === 'Excused') grouped[key].excused++;
    else if (status === 'Absent') grouped[key].absent++;
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));
}

// ── Classes List ──
export async function getClassesList() {
  const schoolId = await getSchoolId();
  const { data, error } = await supabaseAdmin
    .from('kelas')
    .select('id, nama')
    .eq('school_id', schoolId)
    .order('nama');
  if (error) return [];
  return data || [];
}

// ── Students List ──
export async function getStudentsList(params?: {
  search?: string;
  kelasId?: number;
  limit?: number;
  offset?: number;
}) {
  const schoolId = await getSchoolId();

  // Count query
  let countQuery = supabaseAdmin
    .from('siswa')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  // Data query
  let query = supabaseAdmin
    .from('siswa')
    .select('*, users(email), kelas_ref:kelas_id(nama)')
    .eq('school_id', schoolId)
    .order('nama_lengkap');

  if (params?.search) {
    const filter = `nama_lengkap.ilike.%${params.search}%,nisn.ilike.%${params.search}%`;
    query = query.or(filter);
    countQuery = countQuery.or(filter);
  }
  if (params?.kelasId) {
    query = query.eq('kelas_id', params.kelasId);
    countQuery = countQuery.eq('kelas_id', params.kelasId);
  }

  const limit = params?.limit || 10;
  const offset = params?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const [{ data, error }, { count }] = await Promise.all([query, countQuery]);
  if (error) return { error: error.message, data: [], count: 0 };
  return { data: data || [], count: count || 0 };
}

// ── Create Student ──
export async function createStudent(input: {
  nisn: string;
  nama_lengkap: string;
  kelas_id: number | null;
  password: string;
}) {
  const schoolId = await getSchoolId();
  const studentEmail = `${input.nisn}@edutrack.internal`;

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: studentEmail,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.nama_lengkap },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to create auth user' };
  }

  // Insert users row
  const { error: userError } = await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    school_id: schoolId,
    email: studentEmail,
    full_name: input.nama_lengkap,
    role: 'student',
  });

  if (userError) {
    // Cleanup auth user on failure
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: userError.message };
  }

  // Get class name
  let kelasName: string | null = null;
  if (input.kelas_id) {
    const { data: kelas } = await supabaseAdmin
      .from('kelas')
      .select('nama')
      .eq('id', input.kelas_id)
      .single();
    kelasName = kelas?.nama || null;
  }

  // Insert siswa row
  const { error: siswaError } = await supabaseAdmin.from('siswa').insert({
    school_id: schoolId,
    user_id: authData.user.id,
    nisn: input.nisn,
    nama_lengkap: input.nama_lengkap,
    kelas: kelasName,
    kelas_id: input.kelas_id,
  });

  if (siswaError) {
    return { error: siswaError.message };
  }

  return { success: true };
}

// ── Update Student ──
export async function updateStudent(
  studentId: string,
  input: { nama_lengkap?: string; kelas_id?: number | null; nisn?: string }
) {
  const schoolId = await getSchoolId();

  const update: Record<string, unknown> = {};
  if (input.nama_lengkap !== undefined) update.nama_lengkap = input.nama_lengkap;
  if (input.nisn !== undefined) update.nisn = input.nisn;
  if (input.kelas_id !== undefined) {
    update.kelas_id = input.kelas_id;
    if (input.kelas_id) {
      const { data: kelas } = await supabaseAdmin
        .from('kelas')
        .select('nama')
        .eq('id', input.kelas_id)
        .single();
      update.kelas = kelas?.nama || null;
    } else {
      update.kelas = null;
    }
  }

  const { error } = await supabaseAdmin
    .from('siswa')
    .update(update)
    .eq('id', studentId)
    .eq('school_id', schoolId);

  if (error) return { error: error.message };

  // Also update full_name in users table if changed
  if (input.nama_lengkap) {
    const { data: siswa } = await supabaseAdmin
      .from('siswa')
      .select('user_id')
      .eq('id', studentId)
      .single();
    if (siswa?.user_id) {
      await supabaseAdmin
        .from('users')
        .update({ full_name: input.nama_lengkap })
        .eq('id', siswa.user_id);
    }
  }

  return { success: true };
}

// ── Delete Student ──
export async function deleteStudent(studentId: string) {
  const schoolId = await getSchoolId();

  // Get user_id before deleting
  const { data: siswa } = await supabaseAdmin
    .from('siswa')
    .select('user_id')
    .eq('id', studentId)
    .eq('school_id', schoolId)
    .single();

  if (!siswa) return { error: 'Student not found' };

  // Delete siswa row (triggers student_count decrement)
  const { error } = await supabaseAdmin
    .from('siswa')
    .delete()
    .eq('id', studentId)
    .eq('school_id', schoolId);

  if (error) return { error: error.message };

  // Delete users row and auth user
  if (siswa.user_id) {
    await supabaseAdmin.from('users').delete().eq('id', siswa.user_id);
    await supabaseAdmin.auth.admin.deleteUser(siswa.user_id);
  }

  return { success: true };
}

// ── Permission Requests ──
export async function getPermissionRequests(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const schoolId = await getSchoolId();

  // Count query
  let countQuery = supabaseAdmin
    .from('perizinan')
    .select('*, siswa!inner(nisn, nama_lengkap)', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  // Data query
  let query = supabaseAdmin
    .from('perizinan')
    .select('*, siswa!inner(id, nisn, nama_lengkap, kelas)')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status);
    countQuery = countQuery.eq('status', params.status);
  }
  if (params?.search) {
    const filter = `nama_lengkap.ilike.%${params.search}%,nisn.ilike.%${params.search}%`;
    query = query.or(filter, { referencedTable: 'siswa' });
    countQuery = countQuery.or(filter, { referencedTable: 'siswa' });
  }

  const limit = params?.limit || 10;
  const offset = params?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const [{ data, error }, { count }] = await Promise.all([query, countQuery]);
  if (error) return { error: error.message, data: [], count: 0 };
  return { data: data || [], count: count || 0 };
}

// ── Permission Stats ──
export async function getPermissionStats() {
  const schoolId = await getSchoolId();

  const { data, error } = await supabaseAdmin
    .from('perizinan')
    .select('status')
    .eq('school_id', schoolId);

  if (error) return { total: 0, pending: 0, approved: 0, rejected: 0 };

  const records = data || [];
  return {
    total: records.length,
    pending: records.filter((r) => r.status === 'Pending').length,
    approved: records.filter((r) => r.status === 'Approved').length,
    rejected: records.filter((r) => r.status === 'Rejected').length,
  };
}

// ── Update Permission Status ──
export async function updatePermissionStatus(
  permissionId: number,
  status: 'Approved' | 'Rejected',
  adminNote?: string
) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  // Get permission details first
  const { data: permission, error: getError } = await supabaseAdmin
    .from('perizinan')
    .select('siswa_id, tanggal_mulai, tanggal_selesai, alasan')
    .eq('id', permissionId)
    .eq('school_id', user.school_id)
    .single();

  if (getError || !permission) return { error: getError?.message || 'Permission not found' };

  const { error } = await supabaseAdmin
    .from('perizinan')
    .update({
      status,
      admin_note: adminNote || null,
      reviewed_by: user.id,
    })
    .eq('id', permissionId)
    .eq('school_id', user.school_id);

  if (error) return { error: error.message };

  if (status === 'Approved') {
    // Generate dates from tanggal_mulai to tanggal_selesai
    const start = new Date(permission.tanggal_mulai);
    const end = new Date(permission.tanggal_selesai);
    const absensiRecords = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      absensiRecords.push({
        school_id: user.school_id,
        siswa_id: permission.siswa_id,
        tanggal: dateStr,
        status: 'Excused',
        catatan: permission.alasan,
        scanned_by: user.id,
      });
    }

    if (absensiRecords.length > 0) {
      // Clean up any existing attendance for these dates to prevent duplicates
      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];
      await supabaseAdmin
        .from('absensi')
        .delete()
        .eq('siswa_id', permission.siswa_id)
        .gte('tanggal', startDateStr)
        .lte('tanggal', endDateStr);

      await supabaseAdmin.from('absensi').insert(absensiRecords);
    }
  }

  return { success: true };
}

// ── Teachers List ──
export async function getTeachersList(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const schoolId = await getSchoolId();

  // Count query
  let countQuery = supabaseAdmin
    .from('teachers')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  // Data query
  let query = supabaseAdmin
    .from('teachers')
    .select('*')
    .eq('school_id', schoolId)
    .order('name');

  if (params?.search) {
    const filter = `name.ilike.%${params.search}%,nip.ilike.%${params.search}%,email.ilike.%${params.search}%`;
    query = query.or(filter);
    countQuery = countQuery.or(filter);
  }

  const limit = params?.limit || 10;
  const offset = params?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const [{ data, error }, { count }] = await Promise.all([query, countQuery]);
  if (error) return { error: error.message, data: [], count: 0 };
  return { data: data || [], count: count || 0 };
}

// ── Create Teacher ──
export async function createTeacher(input: {
  name: string;
  nip: string;
  email: string;
  phone?: string;
  subject?: string;
}) {
  const schoolId = await getSchoolId();

  const { error } = await supabaseAdmin.from('teachers').insert({
    school_id: schoolId,
    name: input.name,
    nip: input.nip || null,
    email: input.email || null,
    phone: input.phone || null,
    subject: input.subject || null,
  });

  if (error) return { error: error.message };
  return { success: true };
}

// ── Update Teacher ──
export async function updateTeacher(
  teacherId: string,
  input: {
    name?: string;
    nip?: string;
    email?: string;
    phone?: string;
    subject?: string;
  }
) {
  const schoolId = await getSchoolId();

  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.nip !== undefined) update.nip = input.nip || null;
  if (input.email !== undefined) update.email = input.email || null;
  if (input.phone !== undefined) update.phone = input.phone || null;
  if (input.subject !== undefined) update.subject = input.subject || null;

  const { error } = await supabaseAdmin
    .from('teachers')
    .update(update)
    .eq('id', teacherId)
    .eq('school_id', schoolId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Delete Teacher ──
export async function deleteTeacher(teacherId: string) {
  const schoolId = await getSchoolId();

  const { error } = await supabaseAdmin
    .from('teachers')
    .delete()
    .eq('id', teacherId)
    .eq('school_id', schoolId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Schedules List ──
export async function getSchedulesList(params?: { kelasId?: number; hari?: string }) {
  const schoolId = await getSchoolId();

  let query = supabaseAdmin
    .from('jadwal')
    .select(`
      *,
      kelas(id, nama),
      mata_pelajaran(id, kode, nama),
      teachers(id, name)
    `)
    .eq('school_id', schoolId)
    .order('hari')
    .order('jam_mulai');

  if (params?.kelasId) {
    query = query.eq('kelas_id', params.kelasId);
  }
  if (params?.hari) {
    query = query.eq('hari', params.hari);
  }

  const { data, error } = await query;
  if (error) return { error: error.message, data: [] };
  return { data };
}

// ── Recent Attendance (Dashboard Widget) ──
export async function getRecentAttendance(limit: number = 10) {
  const schoolId = await getSchoolId();

  const { data, error } = await supabaseAdmin
    .from('absensi')
    .select(`
      id,
      tanggal,
      status,
      check_in_time,
      catatan,
      created_at,
      siswa!inner(id, nisn, nama_lengkap, kelas, foto_url)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}
