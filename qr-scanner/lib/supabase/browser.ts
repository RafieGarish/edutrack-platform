// lib/supabase/browser.ts
// ✅ Aman digunakan di Client Components — hanya pakai NEXT_PUBLIC_ keys
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// TypeScript types matching the actual Supabase DB schema
// ============================================================

export interface Kelas {
  id: number;
  nama: string;
  jurusan: string;
  gedung: string;
}

export interface Siswa {
  id: string;
  nisn: string;
  nama_lengkap: string;
  kelas: string;       // text label, e.g. "XII RPL 1"
  kelas_id: number;    // FK to kelas table
  device_id: string | null;
  foto_url: string | null;
  created_at: string;
}

export interface MataPelajaran {
  id: number;
  kode: string;
  nama: string;
  guru: string;
}

export interface Jadwal {
  id: number;
  kelas_id: number;
  mata_pelajaran_id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string;
}

export interface Absensi {
  id: number;
  siswa_id: string;
  mata_pelajaran_id: number;
  tanggal: string;
  check_in_time: string | null;
  status: 'Present' | 'Late' | 'Excused' | 'Absent';
  catatan: string | null;
  created_at: string;
  // Joined via Supabase select
  siswa?: Siswa;
  mata_pelajaran?: MataPelajaran;
}

export interface Perizinan {
  id: number;
  siswa_id: string;
  alasan: string;
  bukti_url: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  tanggal_mulai: string;
  tanggal_selesai: string;
  catatan: string | null;
  admin_note: string | null;
  created_at: string;
}