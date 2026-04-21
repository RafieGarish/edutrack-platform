"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ScanLine,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import Dialog02 from "./dialog-logout";

type NavLink = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hasChildren?: boolean;
  target?: string;
};

const navItems: { section: string; links: NavLink[] }[] = [
  {
    section: "MAIN",
    links: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Kehadiran", href: "/dashboard/attendance", icon: ClipboardCheck },
      { label: "Siswa", href: "/dashboard/students", icon: GraduationCap, hasChildren: true },
      { label: "Guru", href: "/dashboard/teachers", icon: BookOpen, hasChildren: true },
      // { label: "Classes", href: "/dashboard/classes", icon: CalendarDays },
    ],
  },
  {
    section: "MANAGEMENT",
    links: [
      { label: "Jadwal", href: "/dashboard/schedules", icon: CalendarDays },
      { label: "Kelola Izin", href: "/dashboard/permissions", icon: FileText },
      { label: "Kelola Scanner", href: "https://edutrack-scanner.vercel.app", icon: ScanLine, target: "_blank" },
      { label: "Notifikasi (Coming Soon)", href: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    section: "SETTINGS",
    links: [
      // { label: "Users", href: "/dashboard/users", icon: Users },
      { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  userName?: string;
  schoolName?: string;
  logoUrl?: string;
}

export function Sidebar({ userName, schoolName, logoUrl }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "AD";

  const NavLinks = () => (
    <>
      {navItems.map((group) => (
        <div key={group.section}>
          <p className="text-[10px] font-semibold text-muted-foreground tracking-widest px-2 mb-2">
            {group.section}
          </p>
          <ul className="space-y-0.5">
            {group.links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.target}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          active ? "text-primary" : "group-hover:text-foreground"
                        )}
                      />
                      {link.label}
                    </span>
                    {link.hasChildren && (
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );

  const DesktopSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <Image src={logoUrl} alt={schoolName ?? "School logo"} width={32} height={32} className="w-full h-full object-cover" />
          ) : (
            <Zap className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-display font-700 text-lg text-foreground tracking-tight leading-none">
            Edu<span className="text-primary">Track</span>
          </span>
          {schoolName && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
              {schoolName}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <NavLinks />
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-border/50">
        {userName && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </form>
        {/* <form action={logoutAction}>
          <Dialog02 />
        </form> */}

      </div>

      {/* Version */}
      <div className="px-5 py-3 text-[10px] text-muted-foreground/40 font-mono">
        EduTrack v1.0.0
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 h-screen bg-sidebar sticky top-0 border-r border-border/50">
        <DesktopSidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-3 inset-x-3 z-40 bg-card border border-border/50 rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground hover:bg-secondary transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <span className="font-bold text-base text-foreground tracking-tight">
            Edu<span className="text-primary">Track</span>
          </span>
        </div>

        {/* Right: theme toggle, bell, user avatar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="relative w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">1</span>
          </button>
          <button className="flex items-center gap-1 pl-1 pr-2 py-1 rounded-full border border-border/50 hover:bg-secondary transition-colors">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              {initials}
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground rotate-90" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-backdrop-in"
            onClick={() => setMobileOpen(false)}
          />

          {/* Floating panel */}
          <aside className="lg:hidden fixed left-3 top-[72px] bottom-3 z-50 w-72 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-in-left">
            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              <NavLinks />
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-border/50">
              {userName && (
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                  <p className="text-[10px] text-muted-foreground">Administrator</p>
                </div>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </form>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
