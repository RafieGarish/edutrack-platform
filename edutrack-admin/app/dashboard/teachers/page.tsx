"use client"

import { useState, useEffect, useCallback } from "react"
import { Home, Plus, Users as UsersIcon, Search, Pencil, Trash2, X, Loader2, BookOpen } from "lucide-react"
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
  getTeachersList,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "@/actions/dashboard"

interface TeacherRow {
  id: string
  name: string
  nip: string | null
  email: string | null
  phone: string | null
  subject: string | null
  created_at: string
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Overview",
  teachers: "Teachers",
}

function getLabel(segment: string): string {
  return ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

const PAGE_SIZE = 10

export default function TeachersPage() {
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
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<TeacherRow | null>(null)
  const [formName, setFormName] = useState("")
  const [formNip, setFormNip] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formSubject, setFormSubject] = useState("")
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    const result = await getTeachersList({
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
    setTeachers((result.data || []) as TeacherRow[])
    setTotalCount(result.count || 0)
    setLoading(false)
  }, [search, page])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const showingFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(page * PAGE_SIZE, totalCount)

  function openCreateModal() {
    setEditingTeacher(null)
    setFormName("")
    setFormNip("")
    setFormEmail("")
    setFormPhone("")
    setFormSubject("")
    setFormError("")
    setShowModal(true)
  }

  function openEditModal(teacher: TeacherRow) {
    setEditingTeacher(teacher)
    setFormName(teacher.name)
    setFormNip(teacher.nip || "")
    setFormEmail(teacher.email || "")
    setFormPhone(teacher.phone || "")
    setFormSubject(teacher.subject || "")
    setFormError("")
    setShowModal(true)
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)

    if (editingTeacher) {
      const result = await updateTeacher(editingTeacher.id, {
        name: formName,
        nip: formNip,
        email: formEmail,
        phone: formPhone,
        subject: formSubject,
      })
      if (result.error) {
        setFormError(result.error)
        setFormLoading(false)
        return
      }
    } else {
      if (!formName.trim()) {
        setFormError("Nama guru wajib diisi.")
        setFormLoading(false)
        return
      }
      const result = await createTeacher({
        name: formName,
        nip: formNip,
        email: formEmail,
        phone: formPhone,
        subject: formSubject,
      })
      if (result.error) {
        setFormError(result.error)
        setFormLoading(false)
        return
      }
    }

    setFormLoading(false)
    setShowModal(false)
    fetchTeachers()
  }

  async function handleDelete(teacherId: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus guru ini?")) return
    setDeletingId(teacherId)
    const result = await deleteTeacher(teacherId)
    if (result.error) {
      alert("Gagal menghapus: " + result.error)
    }
    setDeletingId(null)
    fetchTeachers()
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
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">Semua Guru</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Kelola data guru</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambahkan Guru
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={UsersIcon} label="Total Guru" value={totalCount.toString()} />
        <StatCard icon={BookOpen} label="Halaman" value={`${page} / ${totalPages}`} />
        <StatCard icon={UsersIcon} label="Ditampilkan" value={teachers.length.toString()} />
        <StatCard icon={Search} label="Hasil Pencarian" value={totalCount.toString()} />
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
              placeholder="Cari berdasarkan nama, NIP, atau email..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-medium">NIP</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Nama</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Email</th>
                <th className="px-4 sm:px-6 py-4 font-medium">No. HP</th>
                <th className="px-4 sm:px-6 py-4 font-medium">Mata Pelajaran</th>
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
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    Tidak ada data guru ditemukan.
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{t.nip || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-50">{t.name}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{t.email || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{t.phone || "-"}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {t.subject ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {t.subject}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(t)}
                          className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                          {deletingId === t.id ? (
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
                {editingTeacher ? "Edit Guru" : "Tambah Guru"}
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
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Nama Lengkap</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Nama guru"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">NIP</label>
                <input
                  type="text"
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value)}
                  placeholder="Nomor Induk Pegawai"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="guru@email.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">No. HP</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+6281234567890"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Mata Pelajaran</label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Contoh: Matematika"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
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
                  {editingTeacher ? "Simpan" : "Tambah"}
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
