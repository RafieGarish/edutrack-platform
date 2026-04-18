"use client";

import { FolderOpen, Users, CheckSquare, Clock, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Absensi Hari Ini",
    value: "24",
    change: "+3",
    positive: true,
    icon: FolderOpen,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    label: "Hadir",
    value: "1,847",
    change: "+12%",
    positive: true,
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Sakit",
    value: "78%",
    change: "+5%",
    positive: true,
    icon: CheckSquare,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    label: "Izin",
    value: "32 min",
    change: "0%",
    positive: null,
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
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
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-foreground tracking-tight">
                {stat.value}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {stat.positive === true ? (
                <TrendingUp className="w-3 h-3 text-primary" />
              ) : stat.positive === false ? (
                <TrendingDown className="w-3 h-3 text-destructive" />
              ) : (
                <span className="w-3 h-3 text-muted-foreground">→</span>
              )}
              <span
                className={cn(
                  "text-xs font-medium font-mono",
                  stat.positive === true
                    ? "text-primary"
                    : stat.positive === false
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground/60">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
