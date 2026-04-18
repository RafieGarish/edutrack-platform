"use client"

import { Home, ChevronRight, Plus, Users as UsersIcon, UserMinus, UserX, UserCheck, Search, RotateCcw, Eye, MoreVertical, GripHorizontal, ToggleLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

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

export default function Students() {
  const pathname = usePathname();
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb — mobile only (desktop header already shows it) */}
      <div className="lg:hidden">
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
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">Semua Guru</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Kelola akun guru</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors self-start sm:self-auto shrink-0">
          <Plus className="w-4 h-4" />
          Tambahkan Guru
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={UsersIcon} label="Total Guru" value="28" type="default" />
        <StatCard icon={UserMinus} label="Kelas X" value="13" type="toggle" />
        <StatCard icon={UserX} label="Kelas XI" value="15" type="toggle" />
        <StatCard icon={UserCheck} label="Kelas XII" value="13" type="check" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <FilterInput label="Username" placeholder="Filter by username" />
          <FilterInput label="Email" placeholder="Filter by email" />
          <FilterInput label="Phone" placeholder="Filter by phone" />
          <FilterInput label="First Name" placeholder="Filter by first name" />
          <FilterInput label="Last Name" placeholder="Filter by last name" />
          <FilterInput label="From Date" placeholder="YYYY-MM-DD" type="date" />
          <FilterInput label="To Date" placeholder="YYYY-MM-DD" type="date" />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            <Search className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-medium">NISN</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Nama</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Email</th>
                <th className="px-4 sm:px-6 py-4 font-medium">No. HP</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Kelas</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Device ID</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <UserRow nisn="0012345678" name="Mike Johnson" email="mike.johnson@example.com" phone="+1555123456" kelas="XI RPL" device_id="PQ.1A4C" foto_url="https://restartbooking.com/img/artists/alan-walker.png" />
              <UserRow nisn="0087654321" name="Charles Wilson" email="charles.wilson@example.com" phone="+1555741852" kelas="XI RPL" device_id="M2304QGC" foto_url="https://i.scdn.co/image/ab67616100005174670c3c362b6b4e622e04fdc4" />
              <UserRow nisn="0011223344" name="James Garcia" email="james.garcia@example.com" phone="+1555951753" kelas="XI RPL" device_id="2106119AG" foto_url="https://i.scdn.co/image/ab6761610000517444c1e1613516d7cf8226375f" />
              <UserRow nisn="0044332211" name="William Rodriguez" email="william.rodriguez@example.com" phone="+1555357159" kelas="XI RPL" device_id="2106119MG" foto_url="https://bookingagentinfo.com/wp-content/uploads/2023/12/ab6761610000e5ebcd9e2b8f901285164a7fde6c.jpg" />
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <div>Showing 1 to 10 of 15 results</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">Previous</button>
            <button className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center font-medium">1</button>
            <button className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors">2</button>
            <button className="px-3 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-50 font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, type = "default" }: { icon: any, label: string, value: string, type?: "default" | "toggle" | "check" }) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        </div>
        <GripHorizontal className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
      </div>
      <div className="flex items-end justify-between relative z-10">
        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
        {type === "toggle" && (
          <ToggleLeft className="w-8 h-8 text-zinc-200 dark:text-zinc-800" strokeWidth={1.5} />
        )}
      </div>
      {type === "default" && (
        <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-50 dark:text-zinc-900/50 opacity-50 z-0" strokeWidth={1} />
      )}
      {type === "check" && (
        <svg className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-50 dark:text-zinc-900/50 opacity-50 z-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  )
}

function FilterInput({ label, placeholder, type = "text" }: { label: string, placeholder: string, type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</label>
      <div className="relative">
        {type === "date" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <input 
          type={type} 
          placeholder={placeholder}
          className={`w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow ${type === 'date' ? 'pl-9' : ''}`}
        />
      </div>
    </div>
  )
}

function UserRow({ nisn, name, email, phone, kelas, device_id, foto_url }: { nisn: string, name: string, email: string, phone: string, kelas: string, device_id: string, foto_url: string }) {
  
  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{nisn}</td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
            <Image
              src={foto_url || "https://placehold.co/400"}
              alt={name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{name}</span>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{email}</td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{phone}</td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{kelas}</td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{device_id}</td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          <button className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
