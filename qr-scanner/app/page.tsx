'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';
import RecentAttendance from '@/components/RecentAttendance';
import { processAttendance, getRecentAttendance, getAttendanceStats } from '@/actions/attendance';
import { logout } from '@/app/login/actions';
import type { Absensi } from '@/lib/supabase/browser';

// ============================================================
// Toast Notification Types
// ============================================================
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  title: string;
  subtitle?: string;
}

// ============================================================
// Beep Sound (Web Audio API — no external file needed)
// ============================================================
function playBeep(type: 'success' | 'error') {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = type === 'success' ? 880 : 220;
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext might be blocked on some browsers — silently ignore
  }
}

// ============================================================
// Toast Component
// ============================================================
function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = {
    success: {
      bg: 'bg-green-500',
      icon: 'check_circle',
    },
    error: {
      bg: 'bg-red-500',
      icon: 'cancel',
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: 'warning',
    },
  }[toast.type];

  return (
    <div
      className={`${config.bg} text-white px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3 min-w-64 max-w-sm animate-[slideDown_0.3s_ease-out]`}
    >
      <span className="material-symbols-outlined text-[22px] mt-0.5 shrink-0">{config.icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.subtitle && <p className="text-xs opacity-80 mt-0.5">{toast.subtitle}</p>}
      </div>
      <button onClick={onDismiss} className="opacity-70 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

// ============================================================
// Page Component
// ============================================================
export default function Page() {
  const [initialLogs, setInitialLogs] = useState<Absensi[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const[isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ hadir: 0, terlambat: 0 });
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial attendance data and accurate stats on mount
  useEffect(() => {
    getRecentAttendance().then((data) => {
      setInitialLogs(data as unknown as Absensi[]);
    });
    getAttendanceStats().then((data) => {
      setStats(data);
    });
  },[]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 4)); // Max 4 toasts

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Pause scanner for `durationMs` then resume
  const pauseScanner = useCallback((durationMs = 2500) => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, durationMs);
  }, []);

  // Main scan handler — called every time QRScanner detects a code
  const handleScan = useCallback(
    async (rawQrData: string) => {
      pauseScanner(3000);

      try {
        const result = await processAttendance(rawQrData);

        if (result.success) {
          playBeep('success');
          addToast({
            type: 'success',
            title: result.message,
            subtitle: `${result.mata_pelajaran ?? ''} · ${result.kelas ?? ''}`,
          });

          // Update stats counter optimistically based on actual status
          setStats((prev) => ({
            ...prev,
            hadir: result.status === 'Present' ? prev.hadir + 1 : prev.hadir,
            terlambat: result.status === 'Late' ? prev.terlambat + 1 : prev.terlambat,
          }));
        } else {
          playBeep('error');

          const errorMessages: Record<string, string> = {
            qr_expired: 'QR Code kedaluwarsa',
            student_not_found: 'Siswa tidak ditemukan',
            already_checked_in: 'Sudah absen hari ini',
            decrypt_failed: 'QR Code tidak valid',
            invalid_format: 'Format QR tidak dikenali',
            no_active_class: 'Tidak ada jadwal aktif', // Added missing error mapping
            has_permission: 'Status Izin',
          };

          addToast({
            type: result.error === 'already_checked_in' ? 'warning' : 'error',
            title: errorMessages[result.error ?? ''] ?? 'Terjadi kesalahan',
            subtitle: result.message,
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        playBeep('error');
        addToast({
          type: 'error',
          title: 'Kesalahan Jaringan',
          subtitle: 'Gagal menghubungi server. Periksa koneksi internet.',
        });
      }
    },
    [addToast, pauseScanner]
  );

  const handleError = useCallback(
    (error: string) => {
      console.error('Scanner error:', error);
      addToast({
        type: 'error',
        title: 'Error Kamera',
        subtitle: 'Izinkan akses kamera di pengaturan browser.',
      });
    },
    [addToast]
  );

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-20">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Monitor Absensi</h2>
          <p className="text-sm text-slate-500">Scan QR Code siswa untuk mencatat absensi secara langsung.</p>
        </div>
        {/* Quick stats & Actions */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
              <p className="text-xs text-slate-500 font-medium">Hadir</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.terlambat}</p>
              <p className="text-xs text-slate-500 font-medium">Terlambat</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-lg font-medium text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Keluar
          </button>
        </div>
      </header>

      {/* ── Toast Notifications (top-center, stacked) ── */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNotification toast={toast} onDismiss={() => dismissToast(toast.id)} />
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="p-8 mx-auto w-full flex flex-col gap-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Camera Feed ── */}
          <div className="lg:col-span-1 relative bg-black rounded-xl overflow-hidden shadow-lg aspect-[9/16]">
            <QRScanner onScan={handleScan} onError={handleError} isPaused={isPaused} />

            {/* Scanner Overlay UI */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-white/20 rounded-2xl overflow-hidden">
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

                {/* Scanning Laser (hidden when paused) */}
                {!isPaused && (
                  <div className="absolute left-0 right-0 h-0.5 animate-scan z-20" />
                )}

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white/80 text-xs font-medium bg-black/40 inline-block px-3 py-1 rounded-full backdrop-blur-md">
                    {isPaused ? 'Memproses scan...' : 'Arahkan QR Code ke dalam bingkai'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Real-time Attendance Table ── */}
          <RecentAttendance initialData={initialLogs} />
        </section>
      </div>
    </main>
  );
}