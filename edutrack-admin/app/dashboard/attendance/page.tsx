"use client"

import { useState, useEffect, useCallback } from "react"
import { Home, Users as UsersIcon, UserCheck, UserMinus, UserX, Clock, Search, Loader2, Eye, X, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import React from "react"
import { getAttendanceRecords, getAttendanceStats, getAttendanceChartData } from "@/actions/dashboard"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface SiswaRef {
  id: string
  nisn: string
  nama_lengkap: string
  kelas: string | null
  foto_url: string | null
}

interface MapelRef {
  id: number
  kode: string
  nama: string
}

interface AttendanceRow {
  id: number
  siswa_id: string
  mata_pelajaran_id: number | null
  jadwal_id: number | null
  tanggal: string
  check_in_time: string | null
  status: string
  catatan: string | null
  created_at: string
  siswa: SiswaRef
  mata_pelajaran: MapelRef | null
}

interface AttendanceStatsData {
  total: number
  present: number
  late: number
  excused: number
  absent: number
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  attendance: "Attendance",
}

function getLabel(segment: string): string {
  return ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

const PAGE_SIZE = 10

const STATUS_LABELS: Record<string, string> = {
  Present: "Masuk",
  Late: "Terlambat",
  Excused: "Izin",
  Absent: "Alpha",
}

const STATUS_COLORS: Record<string, string> = {
  Present: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Late: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Excused: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  Absent: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
}

interface ChartDataPoint {
  date: string
  present: number
  late: number
  excused: number
  absent: number
}

const chartConfig = {
  present: { label: "Masuk", color: "#10b981" },
  late: { label: "Terlambat", color: "#f59e0b" },
  excused: { label: "Izin", color: "#3b82f6" },
  absent: { label: "Alpha", color: "#ef4444" },
} satisfies ChartConfig

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

export default function AttendancePage() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const afterDashboard = segments.slice(1)
  const breadcrumbItems = afterDashboard.length === 0
    ? [{ label: 'Overview', href: '/dashboard', isCurrent: true }]
    : afterDashboard.map((seg, i) => ({
        label: getLabel(seg),
        href: '/' + segments.slice(0, i + 2).join('/'),
        isCurrent: i === afterDashboard.length - 1,
      }))

  // Data state
  const [records, setRecords] = useState<AttendanceRow[]>([])
  const [stats, setStats] = useState<AttendanceStatsData>({ total: 0, present: 0, late: 0, excused: 0, absent: 0 })
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 6)
    return { from, to }
  })
  const [page, setPage] = useState(1)

  // Detail modal
  const [detailRecord, setDetailRecord] = useState<AttendanceRow | null>(null)

  const dateFrom = dateRange?.from ? toDateStr(dateRange.from) : undefined
  const dateTo = dateRange?.to ? toDateStr(dateRange.to) : dateFrom

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const result = await getAttendanceRecords({
      dateFrom,
      dateTo,
      status: filterStatus || undefined,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
    setRecords((result.data || []) as AttendanceRow[])
    setTotalCount(result.count || 0)
    setLoading(false)
  }, [search, filterStatus, dateFrom, dateTo, page])

  const fetchStats = useCallback(async () => {
    const [s, chart] = await Promise.all([
      getAttendanceStats(dateFrom, dateTo),
      getAttendanceChartData(dateFrom, dateTo),
    ])
    setStats(s)
    setChartData(chart as ChartDataPoint[])
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filterStatus, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(page * PAGE_SIZE, totalCount)

  function formatTime(timeStr: string | null, createdAt: string): string {
    if (timeStr) return timeStr.slice(0, 5)
    return new Date(createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDateDisplay(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb — mobile only */}
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
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">Semua Absensi</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Pantau & kelola absensi siswa</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard icon={UsersIcon} label="Total Absensi" value={stats.total.toString()} />
        <StatCard icon={UserCheck} label="Masuk" value={stats.present.toString()} color="emerald" />
        <StatCard icon={Clock} label="Terlambat" value={stats.late.toString()} color="amber" />
        <StatCard icon={UserMinus} label="Izin" value={stats.excused.toString()} color="blue" />
        <StatCard icon={UserX} label="Alpha" value={stats.absent.toString()} color="red" />
      </div>

      {/* Attendance Line Chart */}
      {chartData.length >= 1 && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 md:p-6">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-4">Tren Absensi</h2>
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => format(new Date(value), "dd MMM", { locale: localeId })}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value: string) => format(new Date(value), "dd MMM yyyy", { locale: localeId })}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="present" stroke="var(--color-present)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="late" stroke="var(--color-late)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="excused" stroke="var(--color-excused)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="absent" stroke="var(--color-absent)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama atau NISN..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow sm:w-44"
          >
            <option value="">Semua Status</option>
            <option value="Present">Masuk</option>
            <option value="Late">Terlambat</option>
            <option value="Excused">Izin</option>
            <option value="Absent">Alpha</option>
          </select>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal sm:w-[280px] h-[38px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <span className="text-sm text-zinc-900 dark:text-zinc-50">
                      {format(dateRange.from, "dd MMM yyyy", { locale: localeId })} - {format(dateRange.to, "dd MMM yyyy", { locale: localeId })}
                    </span>
                  ) : (
                    <span className="text-sm text-zinc-900 dark:text-zinc-50">
                      {format(dateRange.from, "dd MMM yyyy", { locale: localeId })}
                    </span>
                  )
                ) : (
                  <span className="text-sm text-zinc-500">Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
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
                <th className="px-4 sm:px-6 py-4 font-medium">Kelas</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Mata Pelajaran</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Status</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Waktu</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    Tidak ada data absensi ditemukan.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {r.siswa?.nisn || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-50">
                      {r.siswa?.nama_lengkap || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {r.siswa?.kelas || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {r.mata_pelajaran?.nama || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {formatDateDisplay(r.tanggal)} {formatTime(r.check_in_time, r.created_at)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setDetailRecord(r)}
                          className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <div>Showing {showingFrom} to {showingTo} of {totalCount} results</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...")
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      page === p
                        ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-medium"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-50 font-medium disabled:opacity-40 disabled:font-normal"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Detail Absensi</h2>
              <button
                onClick={() => setDetailRecord(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <DetailRow label="NISN" value={detailRecord.siswa?.nisn || "-"} />
              <DetailRow label="Nama" value={detailRecord.siswa?.nama_lengkap || "-"} />
              <DetailRow label="Kelas" value={detailRecord.siswa?.kelas || "-"} />
              <DetailRow label="Mata Pelajaran" value={detailRecord.mata_pelajaran?.nama || "-"} />
              <DetailRow label="Tanggal" value={formatDateDisplay(detailRecord.tanggal)} />
              <DetailRow label="Waktu Check-in" value={formatTime(detailRecord.check_in_time, detailRecord.created_at)} />
              <div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Status</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[detailRecord.status] || ""}`}>
                    {STATUS_LABELS[detailRecord.status] || detailRecord.status}
                  </span>
                </div>
              </div>
              <DetailRow label="Catatan" value={detailRecord.catatan || "-"} />
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setDetailRecord(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mt-0.5">{value}</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: string }) {
  const iconColorMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    blue: "text-blue-600 dark:text-blue-400",
    red: "text-red-600 dark:text-red-400",
  }

  const bgColorMap: Record<string, string> = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
    amber: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
    blue: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
    red: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${color ? bgColorMap[color] || "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>
          <Icon className={`w-4 h-4 ${color ? iconColorMap[color] || "text-zinc-600 dark:text-zinc-400" : "text-zinc-600 dark:text-zinc-400"}`} />
        </div>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      </div>
      <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
      <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-50 dark:text-zinc-900/50 opacity-50 z-0" strokeWidth={1} />
    </div>
  )
}
