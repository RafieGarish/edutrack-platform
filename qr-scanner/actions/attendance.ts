// actions/attendance.ts
'use server';

import CryptoJS from 'crypto-js';
import { supabaseAdmin, createClient } from '@/lib/supabase/server';

export interface AttendanceResult {
  success: boolean;
  message: string;
  student_name?: string;
  kelas?: string;
  mata_pelajaran?: string;
  status?: 'Present' | 'Late';
  error?: string;
}

// ============================================================
// HELPERS (Fixed Timezone to Asia/Jakarta)
// ============================================================
function getJakartaDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
}

function getHariIni(): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[getJakartaDate().getDay()];
}

function getTodayDate(): string {
  const d = getJakartaDate();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentTimeStr(): string {
  const d = getJakartaDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// ============================================================
// CORE DECRYPT
// ============================================================
function decryptQrPayload(encryptedBase64: string): string | null {
  try {
    const aesKey = process.env.QR_AES_KEY; 
    const aesIv  = process.env.QR_AES_IV;  

    if (!aesKey || !aesIv) {
      throw new Error('QR_AES_KEY atau QR_AES_IV belum dikonfigurasi di .env.local');
    }

    const key = CryptoJS.enc.Utf8.parse(aesKey);
    const iv  = CryptoJS.enc.Utf8.parse(aesIv);

    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    return plaintext || null;
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
}

// ============================================================
// SERVER ACTION: processAttendance
// ============================================================
export async function processAttendance(
  encryptedString: string
): Promise<AttendanceResult> {
  try {
    // 1. Get logged in scanner user and their school_id
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'unauthorized', message: 'Anda belum login sebagai scanner.' };
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (!userData?.school_id) {
       return { success: false, error: 'no_school', message: 'Akun ini tidak terkait dengan sekolah manapun.' };
    }
    const schoolId = userData.school_id;

    // 2. Decrypt QR
    const decryptedText = decryptQrPayload(encryptedString);

    if (!decryptedText) {
      return { success: false, error: 'decrypt_failed', message: 'QR Code tidak valid atau tidak dapat dibaca.' };
    }

    const parts = decryptedText.split(';');
    if (parts.length < 2) {
      return { success: false, error: 'invalid_format', message: 'Format QR Code tidak dikenali.' };
    }

    const [nisn, isoTimestamp, latStr, lngStr] = parts;

    const qrTime = new Date(isoTimestamp);
    if (isNaN(qrTime.getTime())) {
      return { success: false, error: 'invalid_timestamp', message: 'Timestamp QR Code tidak valid.' };
    }

    const ageSeconds = (Date.now() - qrTime.getTime()) / 1000;

    if (ageSeconds > 30 || ageSeconds < -15) {
      return { success: false, error: 'qr_expired', message: 'QR Code sudah kedaluwarsa. Silakan generate ulang di aplikasi.' };
    }

    // 3. Find Siswa, scoped to scanner's school
    const { data: siswa, error: siswaError } = await supabaseAdmin
      .from('siswa')
      .select('id, nisn, nama_lengkap, kelas, kelas_id, school_id')
      .eq('nisn', nisn.trim())
      .eq('school_id', schoolId)
      .single();

    if (siswaError || !siswa) {
      return { success: false, error: 'student_not_found', message: `Siswa dengan NISN "${nisn}" tidak ditemukan di sekolah Anda.` };
    }

    const hariIni = getHariIni();
    const currentTimeStr = getCurrentTimeStr(); 
    const currentMinutes = timeToMinutes(currentTimeStr);

    // 4. Find Active Jadwal
    const { data: jadwalList, error: jadwalError } = await supabaseAdmin
      .from('jadwal')
      .select(`id, mata_pelajaran_id, hari, jam_mulai, jam_selesai, ruangan, mata_pelajaran ( id, kode, nama, guru )`)
      .eq('kelas_id', siswa.kelas_id)
      .eq('school_id', schoolId)
      .eq('hari', hariIni);

    if (jadwalError) {
      return { success: false, error: 'db_error', message: 'Gagal membaca jadwal.' };
    }

    const activeJadwal = jadwalList?.find((j) => {
      const mulaiMinus30 = timeToMinutes(j.jam_mulai) - 30;
      const selesai = timeToMinutes(j.jam_selesai);
      return currentMinutes >= mulaiMinus30 && currentMinutes <= selesai;
    });

    if (!activeJadwal) {
      return { success: false, error: 'no_active_class', message: `Tidak ada jadwal pelajaran aktif untuk ${siswa.kelas} saat ini (${hariIni}, ${currentTimeStr.substring(0, 5)}).` };
    }

    const mataPelajaran = activeJadwal.mata_pelajaran as any;
    const today = getTodayDate();

    // 5. Check already checked in
    const { data: existingRecord, error: checkError } = await supabaseAdmin
      .from('absensi')
      .select('id')
      .eq('siswa_id', siswa.id)
      .eq('mata_pelajaran_id', activeJadwal.mata_pelajaran_id)
      .eq('tanggal', today)
      .maybeSingle();

    if (checkError) {
      return { success: false, error: 'db_error', message: 'Gagal memeriksa data absensi.' };
    }

    if (existingRecord) {
      return { success: false, error: 'already_checked_in', message: `${siswa.nama_lengkap} sudah absen untuk ${mataPelajaran?.nama ?? 'mata pelajaran ini'} hari ini.` };
    }

    const jamMulaiMinutes = timeToMinutes(activeJadwal.jam_mulai);
    const status: 'Present' | 'Late' = currentMinutes <= jamMulaiMinutes + 10 ? 'Present' : 'Late';

    // 6. Insert Absensi
    const { error: insertError } = await supabaseAdmin.from('absensi').insert({
      school_id: schoolId,
      siswa_id: siswa.id,
      mata_pelajaran_id: activeJadwal.mata_pelajaran_id,
      jadwal_id: activeJadwal.id,
      tanggal: today,
      check_in_time: currentTimeStr,
      status,
      catatan: null,
      scanned_by: user.id
    });

    if (insertError) {
      return { success: false, error: 'insert_failed', message: 'Gagal menyimpan data absensi.' };
    }

    return {
      success: true,
      message: `Selamat Datang, ${siswa.nama_lengkap}!`,
      student_name: siswa.nama_lengkap,
      kelas: siswa.kelas,
      mata_pelajaran: mataPelajaran?.nama,
      status,
    };
  } catch (err) {
    console.error('Unexpected error in processAttendance:', err);
    return { success: false, error: 'unexpected_error', message: 'Terjadi kesalahan yang tidak terduga pada server.' };
  }
}

// ============================================================
// SERVER ACTION: getRecentAttendance
// ============================================================
export async function getRecentAttendance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single();
    
  const schoolId = userData?.school_id;
  if (!schoolId) return [];

  const today = getTodayDate();

  const { data, error } = await supabaseAdmin
    .from('absensi')
    .select(`id, tanggal, check_in_time, status, catatan, created_at, siswa ( id, nisn, nama_lengkap, kelas, foto_url ), mata_pelajaran ( id, kode, nama, guru )`)
    .eq('school_id', schoolId)
    .eq('tanggal', today)
    .order('created_at', { ascending: false })
    .limit(10);

  return data ?? [];
}

// ============================================================
// SERVER ACTION: getAttendanceStats
// ============================================================
export async function getAttendanceStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hadir: 0, terlambat: 0 };

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single();
    
  const schoolId = userData?.school_id;
  if (!schoolId) return { hadir: 0, terlambat: 0 };

  const today = getTodayDate();

  const { data, error } = await supabaseAdmin
    .from('absensi')
    .select('status')
    .eq('school_id', schoolId)
    .eq('tanggal', today);

  if (error) return { hadir: 0, terlambat: 0 };

  const hadir = data.filter((d) => d.status === 'Present').length;
  const terlambat = data.filter((d) => d.status === 'Late').length;

  return { hadir, terlambat };
}