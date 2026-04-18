'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser, type Absensi } from '@/lib/supabase/browser';
import { getRecentAttendance } from '@/actions/attendance';

interface RecentAttendanceProps {
  initialData: Absensi[];
}

const STATUS_CONFIG = {
  Present: { label: 'Hadir', className: 'bg-green-100 text-green-800' },
  Late:    { label: 'Terlambat', className: 'bg-yellow-100 text-yellow-800' },
  Excused: { label: 'Izin', className: 'bg-blue-100 text-blue-800' },
  Absent:  { label: 'Alfa', className: 'bg-red-100 text-red-800' },
} as const;

export default function RecentAttendance({ initialData }: RecentAttendanceProps) {
  const [logs, setLogs] = useState<Absensi[]>(initialData);

  // Fetch full record with joins when realtime INSERT arrives
  const fetchFullRecord = useCallback(async (absensiId: number) => {
    const { data, error } = await supabaseBrowser
      .from('absensi')
      .select(`
        id, tanggal, check_in_time, status, catatan, created_at,
        siswa ( id, nisn, nama_lengkap, kelas, foto_url ),
        mata_pelajaran ( id, kode, nama, guru )
      `)
      .eq('id', absensiId)
      .single();

    if (error || !data) return;

    setLogs((prev) => {
      const filtered = prev.filter((l) => l.id !== data.id);
      return [data as unknown as Absensi, ...filtered].slice(0, 10);
    });
  }, []);

  useEffect(() => {
    // Force timezone to Asia/Jakarta for the realtime filter
    const getTodayDate = () => {
      const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const today = getTodayDate();

    const channel = supabaseBrowser
      .channel('absensi-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'absensi',
          filter: `tanggal=eq.${today}`,
        },
        (payload) => {
          fetchFullRecord(payload.new.id as number);
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  },[fetchFullRecord]);

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Jakarta' // Force timezone for display
  });

  return (
    <section className="flex flex-col gap-4 lg:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Absensi Terbaru
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Live
          </span>
        </h3>
        <p className="text-xs text-slate-400 hidden sm:block">{today}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3">event_available</span>
              <p className="font-medium">Belum ada absensi hari ini</p>
              <p className="text-sm mt-1">Data muncul otomatis saat siswa melakukan scan</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-5 py-4">Siswa</th>
                  <th className="px-5 py-4">Mata Pelajaran</th>
                  <th className="px-5 py-4">Kelas</th>
                  <th className="px-5 py-4">Jam Masuk</th>
                  <th className="px-5 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => {
                  const siswa = log.siswa as any;
                  const mapel = log.mata_pelajaran as any;
                  const statusCfg = STATUS_CONFIG[log.status] ?? {
                    label: log.status,
                    className: 'bg-slate-100 text-slate-600',
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar: foto_url or initials */}
                          {siswa?.foto_url ? (
                            <img
                              src={siswa.foto_url}
                              alt={siswa.nama_lengkap}
                              className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 uppercase">
                              {siswa?.nama_lengkap?.charAt(0) ?? '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900 leading-tight">
                              {siswa?.nama_lengkap ?? '—'}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                              {siswa?.nisn ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-800 font-medium text-xs leading-tight">
                          {mapel?.nama ?? '—'}
                        </p>
                        <p className="text-xs text-slate-400">{mapel?.kode ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {siswa?.kelas ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">
                        {formatTime(log.check_in_time)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-medium text-slate-900">{logs.length}</span> absensi hari ini
          </p>
          <a
            href="#"
            className="text-sm font-medium text-primary hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            Lihat Semua
            <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
          </a>
        </div>
      </div>
    </section>
  );
}