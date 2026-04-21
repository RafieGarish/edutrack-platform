"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  Clock,
  FileText,
  UserX,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecentAttendance } from "@/actions/dashboard";
import Link from "next/link";

interface SiswaRef {
  id: string;
  nisn: string;
  nama_lengkap: string;
  kelas: string | null;
  foto_url: string | null;
}

interface AttendanceRecord {
  id: number;
  tanggal: string;
  status: string;
  check_in_time: string | null;
  catatan: string | null;
  created_at: string;
  siswa: SiswaRef;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof UserCheck; color: string; bg: string; badge: string }
> = {
  Present: {
    label: "Hadir",
    icon: UserCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    badge: "bg-emerald-400/15 text-emerald-400 border-emerald-400/20",
  },
  Late: {
    label: "Terlambat",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    badge: "bg-amber-400/15 text-amber-400 border-amber-400/20",
  },
  Excused: {
    label: "Izin",
    icon: FileText,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    badge: "bg-blue-400/15 text-blue-400 border-blue-400/20",
  },
  Absent: {
    label: "Alpha",
    icon: UserX,
    color: "text-red-400",
    bg: "bg-red-400/10",
    badge: "bg-red-400/15 text-red-400 border-red-400/20",
  },
};

const PAGE_SIZE = 5;

function formatTime(timeStr: string | null, createdAt: string): string {
  if (timeStr) return timeStr.slice(0, 5);
  return new Date(createdAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AbsensiTerkini() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRecentAttendance(20);
      setRecords((result.data || []) as AttendanceRecord[]);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const paginatedRecords = records.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const showingFrom = records.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, records.length);

  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Absensi Terkini</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pantau absensi terkini siswa
          </p>
        </div>
        <Link
          href="/dashboard/attendance"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              {["Siswa", "Kelas", "Status", "Waktu"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-muted-foreground pb-3 pr-4 last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Memuat data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Eye className="w-5 h-5 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">
                      Belum ada data absensi
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => {
                const config = STATUS_CONFIG[record.status] || STATUS_CONFIG.Absent;
                const StatusIcon = config.icon;

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    {/* Student Info */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        {record.siswa?.foto_url ? (
                          <img
                            src={record.siswa.foto_url}
                            alt={record.siswa.nama_lengkap}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold",
                              config.bg,
                              config.color
                            )}
                          >
                            {getInitials(record.siswa?.nama_lengkap || "?")}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
                            {record.siswa?.nama_lengkap || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {record.siswa?.nisn || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3.5 pr-4">
                      <span className="text-sm text-muted-foreground">
                        {record.siswa?.kelas || "-"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                          config.badge
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground font-mono text-xs">
                          {formatTime(record.check_in_time, record.created_at)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(record.tanggal)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && records.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Menampilkan {showingFrom} - {showingTo} dari {records.length} data
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-border/50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all",
                  page === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/50"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-border/50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
