export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'scanner' | 'student';

export interface School {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
  logo_url: string | null;
  timezone: string;
  student_limit: number;
  student_count: number;
  subscription_plan: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  school_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Kelas {
  id: number;
  school_id: string;
  nama: string;
  jurusan: string | null;
  tingkat: string | null;
  gedung: string | null;
  created_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  subject: string | null;
  nip: string | null;
  phone: string | null;
  created_at: string;
}

export interface MataPelajaran {
  id: number;
  school_id: string;
  kode: string;
  nama: string;
  guru: string | null;
  teacher_id: string | null;
  created_at: string;
}

export interface Siswa {
  id: string;
  school_id: string;
  user_id: string | null;
  nisn: string;
  nama_lengkap: string;
  kelas: string | null;
  kelas_id: number | null;
  device_id: string | null;
  foto_url: string | null;
  created_at: string;
}

export interface Jadwal {
  id: number;
  school_id: string;
  kelas_id: number;
  mata_pelajaran_id: number;
  teacher_id: string | null;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string | null;
  created_at: string;
  // Joined
  mata_pelajaran?: MataPelajaran;
  kelas?: Kelas;
  teacher?: Teacher;
}

export interface Absensi {
  id: number;
  school_id: string;
  siswa_id: string;
  mata_pelajaran_id: number | null;
  jadwal_id: number | null;
  tanggal: string;
  check_in_time: string | null;
  status: 'Present' | 'Late' | 'Excused' | 'Absent';
  catatan: string | null;
  scanned_by: string | null;
  created_at: string;
  // Joined
  siswa?: Siswa;
  mata_pelajaran?: MataPelajaran;
}

export interface Perizinan {
  id: number;
  school_id: string;
  siswa_id: string;
  alasan: string;
  bukti_url: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  tanggal_mulai: string;
  tanggal_selesai: string;
  catatan: string | null;
  admin_note: string | null;
  reviewed_by: string | null;
  created_at: string;
  // Joined
  siswa?: Siswa;
}

export interface Notification {
  id: string;
  school_id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'attendance' | 'permission';
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Onboarding wizard types
export interface OnboardingClassEntry {
  nama: string;
  jurusan?: string;
  tingkat?: string;
}

export interface OnboardingAllData {
  schoolInfo: { name: string; address: string; latitude: number | null; longitude: number | null; radius: number };
  classes: OnboardingClassEntry[];
  teachers: OnboardingTeacherEntry[];
  rooms: OnboardingRoomEntry[];
  schedules: OnboardingScheduleEntry[];
  students: OnboardingStudentEntry[];
  scanners: OnboardingScannerEntry[];
}
export interface OnboardingScheduleEntry {
  kelas_nama: string;
  mata_pelajaran_kode: string;
  mata_pelajaran_nama: string;
  teacher_name: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan?: string;
}

export interface OnboardingStudentEntry {
  nisn: string;
  nama_lengkap: string;
  kelas: string;
  password: string;
}

export interface OnboardingTeacherEntry {
  name: string;
  email: string;
  subject: string;
}

export interface OnboardingRoomEntry {
  nama: string;
  lantai: string;
  gedung: string;
}

export interface OnboardingScannerEntry {
  full_name: string;
  email: string;
  password: string;
}
