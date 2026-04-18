"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Sun, Moon, Search, ChevronDown, Download, Globe, Home } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AnimatedThemeToggle } from "@/components/animated-theme-toggle";
import { SmartCombobox } from "@/components/smart-combo-box";
import { DatePickerWithRange } from "./date-picker-home";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  attendance: "Attendance",
  students: "Students",
  teachers: "Teachers",
  classes: "Classes",
  schedules: "Schedules",
  permissions: "Permissions",
  notifications: "Notifications",
  users: "Users",
  settings: "Settings",
};

function getLabel(segment: string): string {
  return ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

type DemoOption = {
  id: string;
  label: string;
  group?: string;
  meta?: string;
};

const frameworks: DemoOption[] = [
  { id: "react", label: "React", group: "Frontend", meta: "Library" },
  { id: "vue", label: "Vue", group: "Frontend", meta: "Framework" },
  { id: "svelte", label: "Svelte", group: "Frontend", meta: "Compiler" },
  { id: "solid", label: "Solid", group: "Frontend", meta: "Signals" },
  { id: "next", label: "Next.js", group: "Full‑stack", meta: "SSR" },
  { id: "nuxt", label: "Nuxt", group: "Full‑stack", meta: "SSR" },
  { id: "remix", label: "Remix", group: "Full‑stack", meta: "SPA/SSR" },
  { id: "astro", label: "Astro", group: "Full‑stack", meta: "Islands" },
];

interface HeaderProps {
  userName?: string;
  userRole?: string;
}

export function Header({ userName, userRole }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);
  const pathname = usePathname();
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  const segments = pathname.split('/').filter(Boolean);
  const afterDashboard = segments.slice(1);
  const breadcrumbItems = afterDashboard.length === 0
    ? [{ label: 'Overview', href: '/dashboard', isCurrent: true }]
    : afterDashboard.map((seg, i) => ({
        label: getLabel(seg),
        href: '/' + segments.slice(0, i + 2).join('/'),
        isCurrent: i === afterDashboard.length - 1,
      }));

  return (
    <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between gap-4 px-4 lg:px-6 py-3.5 bg-background/80 backdrop-blur-md border-b border-border/50">
      {/* Left: breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard"><Home className="w-4 h-4" /></Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbItems.map((item) => (
            <React.Fragment key={item.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.isCurrent ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Center: Search */}
      <div
        className={cn(
          "hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 bg-card",
          searchFocused
            ? "border-primary/50 ring-2 ring-primary/10"
            : "border-border/50"
        )}
      >
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/60 w-40"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/50 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language */}
        <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50">
          <Globe className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">EN</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Theme toggle */}
        {/* <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50"
        >
          {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button> */}
        <AnimatedThemeToggle className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50" />

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-secondary transition-all border border-border/50">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary font-mono">
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">{userName || 'Admin'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
        </button>
      </div>
    </header>
  );
}

export function PageHeader() {
  const [value, setValue] = React.useState<string[]>(["react", "next"]);

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor key metrics and manage your platform
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={1.5} />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth={1.5} />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth={1.5} />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth={1.5} />
          </svg>
          This Month
          <ChevronDown className="w-3 h-3" />
        </button> */}
      {/* <SmartCombobox
        label="Frameworks"
        placeholder="Search frameworks…"
        options={frameworks}
        multiple
        value={value}
        onValueChange={(v) => setValue(Array.isArray(v) ? v : [])}
        header={<span>Popular frameworks</span>}
        footer={<span>Tip: Type to filter, Enter to select.</span>}
        emptyState={<span>No matches. Try a different keyword.</span>}
      /> */}

      <DatePickerWithRange/>
      
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-all border border-border/50">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </div>
  );
}
