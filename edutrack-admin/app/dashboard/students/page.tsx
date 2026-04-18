"use client"

import { useState, useEffect, useCallback } from "react"
import { Home, Plus, Users as UsersIcon, Search, Pencil, Trash2, X, Loader2 } from "lucide-react"
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
  getStudentsList,
  getClassesList,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/actions/dashboard"

interface StudentRow {
  id: string
  nisn: string
  nama_lengkap: string
  kelas: string | null
  kelas_id: number | null
  kelas_ref: { nama: string } | null
  device_id: string | null
  foto_url: string | null
  users: { email: string } | null
}

interface KelasOption {
  id: number
  nama: string
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  students: "Students",
}

function getLabel(segment: string): string {
  return ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

const PAGE_SIZE = 10

export default function StudentsPage() {
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
  const [students, setStudents] = useState<StudentRow[]>([])
  const [classes, setClasses] = useState<KelasOption[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState("")
  const [filterKelasId, setFilterKelasId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null)
  const [formNisn, setFormNisn] = useState("")
  const [formName, setFormName] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formKelasId, setFormKelasId] = useState<number | null>(null)
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    const result = await getStudentsList({
      search: search || undefined,
      kelasId: filterKelasId || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
    setStudents((result.data || []) as StudentRow[])
    setTotalCount(result.count || 0)
    setLoading(false)
  }, [search, filterKelasId, page])

  useEffect(() => {
    getClassesList().then(setClasses)
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filterKelasId])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(page * PAGE_SIZE, totalCount)

  // Count per class for stat cards
  const classCounts = classes.map((c) => ({
    ...c,
    count: students.filter((s) => s.kelas_id === c.id).length,
  }))

  function openCreateModal() {
    setEditingStudent(null)
    setFormNisn("")
    setFormName("")
    setFormPassword("")
    setFormKelasId(null)
    setFormError("")
    setShowModal(true)
  }

  function openEditModal(student: StudentRow) {
    setEditingStudent(student)
    setFormNisn(student.nisn)
    setFormName(student.nama_lengkap)
    setFormPassword("")
    setFormKelasId(student.kelas_id)
    setFormError("")
    setShowModal(true)
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)

    if (editingStudent) {
      const result = await updateStudent(editingStudent.id, {
        nisn: formNisn,
        nama_lengkap: formName,
        kelas_id: formKelasId,
      })
      if (result.error) {
        setFormError(result.error)
        setFormLoading(false)
        return
      }
    } else {
      if (!formPassword.trim()) {
        setFormError("Password is required for new students.")
        setFormLoading(false)
        return
      }
      const result = await createStudent({
        nisn: formNisn,
        nama_lengkap: formName,
        kelas_id: formKelasId,
        password: formPassword,
      })
      if (result.error) {
        setFormError(result.error)
        setFormLoading(false)
        return
      }
    }

    setFormLoading(false)
    setShowModal(false)
    fetchStudents()
  }

  async function handleDelete(studentId: string) {
    if (!confirm("Are you sure you want to delete this student? This will also remove their login account.")) return
    setDeletingId(studentId)
    const result = await deleteStudent(studentId)
    if (result.error) {
      alert("Failed to delete: " + result.error)
    }
    setDeletingId(null)
    fetchStudents()
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
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">Semua Siswa</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Kelola akun siswa</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambahkan Siswa
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={UsersIcon} label="Total Siswa" value={totalCount.toString()} />
        {classCounts.slice(0, 3).map((c) => (
          <StatCard key={c.id} icon={UsersIcon} label={c.nama} value={c.count.toString()} />
        ))}
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
            value={filterKelasId ?? ""}
            onChange={(e) => setFilterKelasId(e.target.value ? Number(e.target.value) : null)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow sm:w-48"
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </select>
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
                <th className="px-4 sm:px-6 py-4 font-medium">Kelas</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Device ID</th>
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{s.nisn}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-50">{s.nama_lengkap}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{s.users?.email || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{s.kelas_ref?.nama || s.kelas || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{s.device_id || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(s)}
                          className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                          {deletingId === s.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Delete
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {editingStudent ? "Edit Siswa" : "Tambah Siswa"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">NISN</label>
                <input
                  type="text"
                  value={formNisn}
                  onChange={(e) => setFormNisn(e.target.value)}
                  required
                  readOnly={!!editingStudent}
                  placeholder="0012345678"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow read-only:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Nama Lengkap</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Nama siswa"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
              </div>

              {!editingStudent && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Password</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Kelas</label>
                <select
                  value={formKelasId ?? ""}
                  onChange={(e) => setFormKelasId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingStudent ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      </div>
      <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
      <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-50 dark:text-zinc-900/50 opacity-50 z-0" strokeWidth={1} />
    </div>
  )
}
