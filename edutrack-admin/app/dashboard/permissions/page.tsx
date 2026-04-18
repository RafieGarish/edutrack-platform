"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Home,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  Eye,
  X,
  Check,
  Ban,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"
import {
  getPermissionRequests,
  getPermissionStats,
  updatePermissionStatus,
} from "@/actions/dashboard"

interface SiswaRef {
  id: string
  nisn: string
  nama_lengkap: string
  kelas: string | null
}

interface PermissionRow {
  id: number
  siswa_id: string
  alasan: string
  bukti_url: string | null
  status: string
  tanggal_mulai: string
  tanggal_selesai: string
  catatan: string | null
  admin_note: string | null
  created_at: string
  siswa: SiswaRef
}

interface PermissionStatsData {
  total: number
  pending: number
  approved: number
  rejected: number
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  permissions: "Permissions",
}

function getLabel(segment: string): string {
  return ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

const PAGE_SIZE = 10

const STATUS_LABELS: Record<string, string> = {
  Pending: "Menunggu",
  Approved: "Disetujui",
  Rejected: "Ditolak",
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Approved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
}

export default function PermissionsPage() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const afterDashboard = segments.slice(1)
  const breadcrumbItems =
    afterDashboard.length === 0
      ? [{ label: "Overview", href: "/dashboard", isCurrent: true }]
      : afterDashboard.map((seg, i) => ({
          label: getLabel(seg),
          href: "/" + segments.slice(0, i + 2).join("/"),
          isCurrent: i === afterDashboard.length - 1,
        }))

  // Data state
  const [records, setRecords] = useState<PermissionRow[]>([])
  const [stats, setStats] = useState<PermissionStatsData>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [page, setPage] = useState(1)

  // Detail modal
  const [detailRecord, setDetailRecord] = useState<PermissionRow | null>(null)

  // Review modal
  const [reviewRecord, setReviewRecord] = useState<PermissionRow | null>(null)
  const [reviewAction, setReviewAction] = useState<"Approved" | "Rejected">("Approved")
  const [adminNote, setAdminNote] = useState("")
  const [reviewLoading, setReviewLoading] = useState(false)

  // Action loading state (for inline buttons)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const result = await getPermissionRequests({
      status: filterStatus || undefined,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
    setRecords((result.data || []) as PermissionRow[])
    setTotalCount(result.count || 0)
    setLoading(false)
  }, [search, filterStatus, page])

  const fetchStats = useCallback(async () => {
    const s = await getPermissionStats()
    setStats(s)
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filterStatus])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(page * PAGE_SIZE, totalCount)

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  async function handleQuickAction(id: number, status: "Approved" | "Rejected") {
    setActionLoadingId(id)
    const result = await updatePermissionStatus(id, status)
    if (result.error) {
      alert("Gagal: " + result.error)
    }
    setActionLoadingId(null)
    fetchRecords()
    fetchStats()
  }

  async function handleReviewSubmit() {
    if (!reviewRecord) return
    setReviewLoading(true)
    const result = await updatePermissionStatus(
      reviewRecord.id,
      reviewAction,
      adminNote || undefined
    )
    if (result.error) {
      alert("Gagal: " + result.error)
    }
    setReviewLoading(false)
    setReviewRecord(null)
    setAdminNote("")
    fetchRecords()
    fetchStats()
  }

  function openReviewModal(record: PermissionRow, action: "Approved" | "Rejected") {
    setReviewRecord(record)
    setReviewAction(action)
    setAdminNote("")
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb — mobile only */}
      <div className="lg:hidden">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">
                  <Home className="w-4 h-4" />
                </Link>
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
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Perizinan Siswa
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola & pantau permintaan izin siswa
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={ClipboardList} label="Total Perizinan" value={stats.total.toString()} />
        <StatCard icon={Clock} label="Menunggu" value={stats.pending.toString()} color="amber" />
        <StatCard icon={CheckCircle2} label="Disetujui" value={stats.approved.toString()} color="emerald" />
        <StatCard icon={XCircle} label="Ditolak" value={stats.rejected.toString()} color="red" />
      </div>

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
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow sm:w-48"
          >
            <option value="">Semua Status</option>
            <option value="Pending">Menunggu</option>
            <option value="Approved">Disetujui</option>
            <option value="Rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-medium">Siswa</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Kelas</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Alasan</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Tanggal</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Status</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    Tidak ada data perizinan ditemukan.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">
                          {r.siswa?.nama_lengkap || "-"}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {r.siswa?.nisn || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {r.siswa?.kelas || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                      {r.alasan}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      <div className="text-xs">
                        {formatDate(r.tanggal_mulai)}
                        {r.tanggal_mulai !== r.tanggal_selesai && (
                          <> - {formatDate(r.tanggal_selesai)}</>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[r.status] ||
                          "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setDetailRecord(r)}
                          className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                        {r.status === "Pending" && (
                          <>
                            <button
                              onClick={() => openReviewModal(r, "Approved")}
                              disabled={actionLoadingId === r.id}
                              className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 px-2 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                            >
                              {actionLoadingId === r.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              Setujui
                            </button>
                            <button
                              onClick={() => openReviewModal(r, "Rejected")}
                              disabled={actionLoadingId === r.id}
                              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Tolak
                            </button>
                          </>
                        )}
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
          <div>
            Showing {showingFrom} to {showingTo} of {totalCount} results
          </div>
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
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...")
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1">
                    ...
                  </span>
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
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Detail Perizinan
              </h2>
              <button
                onClick={() => setDetailRecord(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <DetailRow label="Nama Siswa" value={detailRecord.siswa?.nama_lengkap || "-"} />
              <DetailRow label="NISN" value={detailRecord.siswa?.nisn || "-"} />
              <DetailRow label="Kelas" value={detailRecord.siswa?.kelas || "-"} />
              <DetailRow label="Alasan" value={detailRecord.alasan} />
              <DetailRow
                label="Tanggal"
                value={
                  detailRecord.tanggal_mulai === detailRecord.tanggal_selesai
                    ? formatDate(detailRecord.tanggal_mulai)
                    : `${formatDate(detailRecord.tanggal_mulai)} - ${formatDate(detailRecord.tanggal_selesai)}`
                }
              />
              <DetailRow label="Catatan Siswa" value={detailRecord.catatan || "-"} />
              <div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Status</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLORS[detailRecord.status] || ""
                    }`}
                  >
                    {STATUS_LABELS[detailRecord.status] || detailRecord.status}
                  </span>
                </div>
              </div>
              <DetailRow label="Catatan Admin" value={detailRecord.admin_note || "-"} />
              {detailRecord.bukti_url && (
                <div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Bukti</span>
                  <div className="mt-1">
                    <a
                      href={detailRecord.bukti_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Lihat Bukti
                    </a>
                  </div>
                </div>
              )}
              <DetailRow
                label="Diajukan pada"
                value={new Date(detailRecord.created_at).toLocaleString("id-ID")}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {detailRecord.status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      setDetailRecord(null)
                      openReviewModal(detailRecord, "Rejected")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      setDetailRecord(null)
                      openReviewModal(detailRecord, "Approved")
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Setujui
                  </button>
                </>
              )}
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

      {/* Review (Approve/Reject) Modal */}
      {reviewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {reviewAction === "Approved" ? "Setujui Perizinan" : "Tolak Perizinan"}
              </h2>
              <button
                onClick={() => setReviewRecord(null)}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {reviewRecord.siswa?.nama_lengkap}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {reviewRecord.alasan}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {formatDate(reviewRecord.tanggal_mulai)}
                  {reviewRecord.tanggal_mulai !== reviewRecord.tanggal_selesai &&
                    ` - ${formatDate(reviewRecord.tanggal_selesai)}`}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Catatan Admin (opsional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setReviewRecord(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={reviewLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                  reviewAction === "Approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {reviewLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {reviewAction === "Approved" ? "Setujui" : "Tolak"}
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

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  color?: string
}) {
  const iconColorMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  }

  const bgColorMap: Record<string, string> = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
    amber: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
    red: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
            color
              ? bgColorMap[color] || "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <Icon
            className={`w-4 h-4 ${
              color
                ? iconColorMap[color] || "text-zinc-600 dark:text-zinc-400"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          />
        </div>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      </div>
      <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
      <Icon
        className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-50 dark:text-zinc-900/50 opacity-50 z-0"
        strokeWidth={1}
      />
    </div>
  )
}
