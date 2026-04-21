"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  Clock,
  FileText,
  UserX,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardStats } from "@/actions/dashboard";

interface DashboardStats {
  students: number;
  teachers: number;
  classes: number;
  todayAttendance: {
    present: number;
    late: number;
    excused: number;
    absent: number;
    total: number;
  };
}

interface StatCardData {
  label: string;
  value: string;
  subtitle: string;
  icon: typeof Users;
  color: string;
  bg: string;
}

function buildStatCards(stats: DashboardStats): StatCardData[] {
  const { todayAttendance } = stats;
  const total = todayAttendance.total;
  const pctPresent = total > 0 ? Math.round((todayAttendance.present / total) * 100) : 0;
  const pctLate = total > 0 ? Math.round((todayAttendance.late / total) * 100) : 0;
  const pctExcused = total > 0 ? Math.round((todayAttendance.excused / total) * 100) : 0;
  const pctAbsent = total > 0 ? Math.round((todayAttendance.absent / total) * 100) : 0;

  return [
    {
      label: "Absensi Hari Ini",
      value: total.toString(),
      subtitle: `dari ${stats.students} siswa`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Hadir",
      value: todayAttendance.present.toString(),
      subtitle: total > 0 ? `${pctPresent}% dari total` : "—",
      icon: UserCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Terlambat",
      value: todayAttendance.late.toString(),
      subtitle: total > 0 ? `${pctLate}% dari total` : "—",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Izin",
      value: todayAttendance.excused.toString(),
      subtitle: total > 0 ? `${pctExcused}% dari total` : "—",
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Alpha",
      value: todayAttendance.absent.toString(),
      subtitle: total > 0 ? `${pctAbsent}% dari total` : "—",
      icon: UserX,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
  ];
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-card border border-border/50 p-4 flex flex-col gap-3 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-secondary" />
            </div>
            <div>
              <div className="h-3 w-16 rounded bg-secondary mb-2" />
              <div className="h-7 w-10 rounded bg-secondary" />
            </div>
            <div className="h-3 w-20 rounded bg-secondary" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl bg-card border border-border/50 p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4" />
        <span className="text-sm">Gagal memuat statistik</span>
      </div>
    );
  }

  const cards = buildStatCards(stats);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl bg-card border border-border/50 p-4 flex flex-col gap-3 hover:border-border transition-all duration-200 group animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg)}>
                <Icon className={cn("w-4 h-4", stat.color)} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-foreground tracking-tight">
                {stat.value}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground/60">{stat.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
