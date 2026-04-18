"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Smartphone,
  BarChart2,
  Network,
  MoreVertical,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const projects = [
  {
    name: "E-Commerce Platform",
    desc: "Complete online store with payment integra...",
    icon: ShoppingCart,
    iconBg: "bg-blue-400/10",
    iconColor: "text-blue-400",
    status: "Ready",
    statusColor: "bg-primary/15 text-primary border-primary/20",
    updated: "2/18/2026",
  },
  {
    name: "Mobile App (iOS & Android)",
    desc: "Cross-platform mobile application with pus...",
    icon: Smartphone,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    status: "Ready",
    statusColor: "bg-primary/15 text-primary border-primary/20",
    updated: "2/18/2026",
  },
  {
    name: "Dashboard Analytics",
    desc: "Real-time business intelligence dashboard ...",
    icon: BarChart2,
    iconBg: "bg-amber-400/10",
    iconColor: "text-amber-400",
    status: "In Progress",
    statusColor: "bg-amber-400/15 text-amber-400 border-amber-400/20",
    updated: "2/18/2026",
  },
  {
    name: "API Gateway Service",
    desc: "Microservices architecture with GraphQL an...",
    icon: Network,
    iconBg: "bg-purple-400/10",
    iconColor: "text-purple-400",
    status: "Ready",
    statusColor: "bg-primary/15 text-primary border-primary/20",
    updated: "2/18/2026",
  },
];

export function RecentProjects() {
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="rounded-xl bg-card border border-border/50 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Absensi Terkini</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pantau absensi terkini
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              {["Name", "Status", "Last Updated", "Actions"].map((h) => (
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
            {projects.map((project) => {
              const Icon = project.icon;
              return (
                <tr key={project.name} className="hover:bg-secondary/30 transition-colors group">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          project.iconBg
                        )}
                      >
                        <Icon className={cn("w-4 h-4", project.iconColor)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {project.desc}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                        project.statusColor
                      )}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-sm text-muted-foreground font-mono text-xs">
                      {project.updated}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          Showing 1 to 4 of 15 results
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-border/50"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[1, 2, 3].map((p) => (
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
    </div>
  );
}
