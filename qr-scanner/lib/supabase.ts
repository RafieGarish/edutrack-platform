import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase (uses anon key, safe to expose)
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase (uses service role key, NEVER expose to client)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// TypeScript types matching the DB schema
export interface Siswa {
  id: string;
  nisn: string;
  nama_lengkap: string;
  kelas: string;
}

export interface Absensi {
  id: number;
  siswa_id: string;
  tanggal: string;
  check_in_time: string;
  status: string;
  created_at: string;
  siswa?: Siswa;
}