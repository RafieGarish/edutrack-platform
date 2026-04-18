'use client';

import { useState, useRef } from 'react';
import type { OnboardingScheduleEntry, OnboardingRoomEntry } from '@/lib/types';
import { Plus, X, ArrowRight, ArrowLeft, BookOpen, User, MapPin, Clock, Coffee, Pencil, Trash2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const ALL_days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DEFAULT_days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DEFAULT_TIMES = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

interface Props {
  schedules: OnboardingScheduleEntry[];
  onSchedulesChange: (schedules: OnboardingScheduleEntry[]) => void;
  localClasses: { nama: string }[];
  localTeachers: { name: string }[];
  localSubjects: { nama: string; kode: string }[];
  localRooms: OnboardingRoomEntry[];
  onNext: () => void;
  onBack: () => void;
}

export function StepSchedules({ schedules, onSchedulesChange, localClasses, localTeachers, localSubjects, localRooms, onNext, onBack }: Props) {
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalData, setModalData] = useState<OnboardingScheduleEntry>({
    kelas_nama: '',
    mata_pelajaran_kode: '',
    mata_pelajaran_nama: '',
    teacher_name: '',
    hari: 'Senin',
    jam_mulai: '07:00',
    jam_selesai: '08:30',
    ruangan: '',
  });

  // Dynamic rows (jam) and columns (hari)
  const [days, setDays] = useState<string[]>(DEFAULT_days);
  const [times, setTimes] = useState<string[]>(DEFAULT_TIMES);
  const [newTime, setNewTime] = useState('');
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [editingTimeValue, setEditingTimeValue] = useState('');
  const timeInputRef = useRef<HTMLInputElement>(null);

  // Break times
  const [breakTimes, setBreakTimes] = useState<string[]>(['12:00']);
  const [breakEditOpen, setBreakEditOpen] = useState(false);

  // Selected class filter for the grid
  const [selectedClass, setSelectedClass] = useState<string>('');

  // Available days that can still be added
  const availableDaysToAdd = ALL_days.filter((d) => !days.includes(d));

  function addDay(day: string) {
    const ordered = ALL_days.filter((d) => [...days, day].includes(d));
    setDays(ordered);
  }

  function removeDay(day: string) {
    if (days.length <= 1) return;
    setDays(days.filter((d) => d !== day));
    // Also remove schedules for this day
    onSchedulesChange(schedules.filter((s) => s.hari !== day));
  }

  function addTime(time: string) {
    if (!time || times.includes(time)) return;
    setTimes([...times, time].sort());
    setNewTime('');
  }

  function removeTime(time: string) {
    if (times.length <= 1) return;
    setTimes(times.filter((t) => t !== time));
    setBreakTimes(breakTimes.filter((t) => t !== time));
    // Also remove schedules for this time
    onSchedulesChange(schedules.filter((s) => s.jam_mulai !== time));
  }

  function renameTime(oldTime: string, newTimeVal: string) {
    if (!newTimeVal || newTimeVal === oldTime) {
      setEditingTime(null);
      return;
    }
    if (times.includes(newTimeVal)) {
      setEditingTime(null);
      return;
    }
    setTimes(times.map((t) => (t === oldTime ? newTimeVal : t)).sort());
    setBreakTimes(breakTimes.map((t) => (t === oldTime ? newTimeVal : t)));
    onSchedulesChange(schedules.map((s) => (s.jam_mulai === oldTime ? { ...s, jam_mulai: newTimeVal } : s)));
    setEditingTime(null);
  }

  // Get the active class (first available if none selected)
  const activeClass = selectedClass || (localClasses.length > 0 ? localClasses[0].nama : '');

  // Get schedules for a specific cell
  function getScheduleAt(day: string, time: string): { entry: OnboardingScheduleEntry; index: number } | null {
    const idx = schedules.findIndex(
      (s) => s.kelas_nama === activeClass && s.hari === day && s.jam_mulai === time
    );
    if (idx !== -1) return { entry: schedules[idx], index: idx };
    return null;
  }

  function openAddModal(day: string, time: string) {
    setEditIndex(null);
    setModalData({
      kelas_nama: activeClass,
      mata_pelajaran_kode: '',
      mata_pelajaran_nama: '',
      teacher_name: '',
      hari: day,
      jam_mulai: time,
      jam_selesai: getEndTime(time),
      ruangan: '',
    });
    setModalOpen(true);
  }

  function openEditModal(index: number) {
    setEditIndex(index);
    setModalData({ ...schedules[index] });
    setModalOpen(true);
  }

  function getEndTime(startTime: string): string {
    const [h, m] = startTime.split(':').map(Number);
    const endH = h + 1;
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function handleModalSave() {
    if (!modalData.mata_pelajaran_nama || !modalData.kelas_nama) return;

    if (editIndex !== null) {
      const updated = [...schedules];
      updated[editIndex] = { ...modalData };
      onSchedulesChange(updated);
    } else {
      onSchedulesChange([...schedules, { ...modalData }]);
    }
    setModalOpen(false);
  }

  function handleModalDelete() {
    if (editIndex === null) return;
    onSchedulesChange(schedules.filter((_, i) => i !== editIndex));
    setModalOpen(false);
  }

  function handleNext() {
    const valid = schedules.filter((s) => s.kelas_nama && s.mata_pelajaran_nama && s.hari);
    if (valid.length === 0) {
      setError('Tambahkan minimal satu jadwal.');
      return;
    }
    setError('');
    onNext();
  }

  // Count schedules per class
  function getClassScheduleCount(className: string): number {
    return schedules.filter((s) => s.kelas_nama === className).length;
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Class Selector Tabs */}
      {localClasses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {localClasses.map((c) => {
            const isActive = c.nama === activeClass;
            const count = getClassScheduleCount(c.nama);
            return (
              <button
                key={c.nama}
                type="button"
                onClick={() => setSelectedClass(c.nama)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all border ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                    : 'bg-secondary/50 text-muted-foreground border-border/30 hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {c.nama}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Break Time Settings */}
      {localClasses.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Coffee className="w-3.5 h-3.5" />
            Jam Istirahat:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {breakTimes.map((bt) => (
              <span
                key={bt}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400"
              >
                <Coffee className="w-3 h-3" />
                {bt}
                {breakTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setBreakTimes(breakTimes.filter((t) => t !== bt))}
                    className="ml-0.5 p-0.5 rounded hover:bg-amber-500/20 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setBreakEditOpen(!breakEditOpen)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/40 transition-all"
          >
            <Pencil className="w-3 h-3" />
            Ubah
          </button>
        </div>
      )}

      {/* Break Time Editor */}
      {breakEditOpen && (
        <div className="p-4 rounded-xl bg-secondary/50 border border-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Atur Jam Istirahat
            </span>
            <button
              type="button"
              onClick={() => setBreakEditOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {times.map((time) => {
              const isBreak = breakTimes.includes(time);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    if (isBreak) {
                      setBreakTimes(breakTimes.filter((t) => t !== time));
                    } else {
                      setBreakTimes([...breakTimes, time].sort());
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border ${
                    isBreak
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400'
                      : 'bg-background border-border/40 text-muted-foreground hover:border-amber-500/40 hover:text-amber-600'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Klik jam untuk menandai/menghapus sebagai jam istirahat. Baris istirahat tidak bisa diisi jadwal.
          </p>
        </div>
      )}

      {/* Schedule Grid */}
      {localClasses.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
          Tambahkan kelas terlebih dahulu di langkah sebelumnya.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/30 bg-secondary/20">
          <table className="w-full min-w-150 border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-secondary/80 backdrop-blur-sm w-20 p-2 border-b border-r border-border/30">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="bg-secondary/80 backdrop-blur-sm border-b border-border/30 px-1 py-2"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {day}
                      </span>
                      {days.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDay(day)}
                          className="p-0.5 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title={`Hapus ${day}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                {/* Add day column */}
                {availableDaysToAdd.length > 0 && (
                  <th className="bg-secondary/80 backdrop-blur-sm border-b border-border/30 px-2 py-2 w-12">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="w-8 h-7 rounded-md bg-transparent border border-dashed border-border/40 text-muted-foreground/40 hover:border-primary/50 hover:text-primary cursor-pointer text-xs outline-none transition-all flex items-center justify-center"
                          title="Tambah hari"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Tambah Hari</DropdownMenuLabel>
                        {availableDaysToAdd.map((d) => (
                          <DropdownMenuItem key={d} onClick={() => addDay(d)}>
                            {d}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {times.map((time, rowIdx) => {
                const isBreak = breakTimes.includes(time);
                const colCount = days.length + (availableDaysToAdd.length > 0 ? 1 : 0);
                return (
                  <tr key={time}>
                    <td className={`sticky left-0 z-10 w-20 p-1 border-r border-border/30 ${
                      isBreak ? 'bg-amber-50/50 dark:bg-amber-900/10' : rowIdx % 2 === 0 ? 'bg-background' : 'bg-secondary/30'
                    }`}>
                      <div className="flex items-center justify-center gap-1">
                        {editingTime === time ? (
                          <input
                            ref={timeInputRef}
                            type="time"
                            value={editingTimeValue}
                            onChange={(e) => setEditingTimeValue(e.target.value)}
                            onBlur={() => renameTime(time, editingTimeValue)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') renameTime(time, editingTimeValue);
                              if (e.key === 'Escape') setEditingTime(null);
                            }}
                            autoFocus
                            className="w-16 px-1 py-0.5 rounded bg-secondary border border-primary/50 text-xs font-mono font-semibold text-foreground outline-none transition-all"
                          />
                        ) : (
                          <span
                            className={`font-mono text-xs font-semibold cursor-pointer select-none ${isBreak ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}
                            onDoubleClick={() => {
                              setEditingTime(time);
                              setEditingTimeValue(time);
                            }}
                            title="Double-click untuk edit"
                          >
                            {time}
                          </span>
                        )}
                        {times.length > 1 && editingTime !== time && (
                          <button
                            type="button"
                            onClick={() => removeTime(time)}
                            className="p-0.5 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title={`Hapus ${time}`}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    {isBreak ? (
                      <td colSpan={colCount} className="bg-amber-50/50 dark:bg-amber-900/10 p-2 text-center border-b border-border/20">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                          <Coffee className="w-3 h-3" />
                          Istirahat
                        </span>
                      </td>
                    ) : (
                      <>
                        {days.map((day) => {
                          const found = getScheduleAt(day, time);
                          return (
                            <td
                              key={`${day}-${time}`}
                              className={`border-b border-border/20 p-1 ${
                                rowIdx % 2 === 0 ? 'bg-background' : 'bg-secondary/30'
                              }`}
                            >
                              {found ? (
                                <button
                                  type="button"
                                  onClick={() => openEditModal(found.index)}
                                  className="w-full p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all text-left group cursor-pointer"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-foreground truncate leading-tight">
                                      {found.entry.mata_pelajaran_nama}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate">
                                      {found.entry.teacher_name || '—'}
                                    </span>
                                    {found.entry.ruangan && (
                                      <span className="text-[10px] text-muted-foreground/70 truncate">
                                        {found.entry.ruangan}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openAddModal(day, time)}
                                  className="w-full h-14 flex items-center justify-center rounded-lg border border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                        {availableDaysToAdd.length > 0 && (
                          <td className={`border-b border-border/20 ${rowIdx % 2 === 0 ? 'bg-background' : 'bg-secondary/30'}`} />
                        )}
                      </>
                    )}
                  </tr>
                );
              })}
              {/* Add time row */}
              <tr>
                <td colSpan={days.length + 1 + (availableDaysToAdd.length > 0 ? 1 : 0)} className="p-2 bg-background">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-secondary border border-border/50 text-xs font-mono text-foreground outline-none focus:border-primary/50 transition-all w-28"
                    />
                    <button
                      type="button"
                      onClick={() => addTime(newTime)}
                      disabled={!newTime || times.includes(newTime)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary border border-dashed border-border/40 hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                      Tambah Jam
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule count summary */}
      <div className="text-xs text-muted-foreground">
        Total: {schedules.length} jadwal terdaftar
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
        >
          Selanjutnya
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ===== Modal Tambah/Edit Jadwal ===== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden border border-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {editIndex !== null ? 'Edit Jadwal' : 'Tambah Jadwal'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {modalData.hari}, {modalData.jam_mulai} — {activeClass}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <BookOpen className="w-3 h-3" /> Mata Pelajaran
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-all"
                    >
                      <span className={modalData.mata_pelajaran_nama ? 'text-foreground' : 'text-muted-foreground/60'}>
                        {modalData.mata_pelajaran_nama || 'Pilih mata pelajaran'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                    {localSubjects.map((s) => (
                      <DropdownMenuItem
                        key={s.nama}
                        onClick={() => {
                          setModalData({
                            ...modalData,
                            mata_pelajaran_nama: s.nama,
                            mata_pelajaran_kode: s.kode,
                          });
                        }}
                      >
                        {s.nama}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Teacher */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <User className="w-3 h-3" /> Guru
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-all"
                    >
                      <span className={modalData.teacher_name ? 'text-foreground' : 'text-muted-foreground/60'}>
                        {modalData.teacher_name || 'Pilih guru'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                    {localTeachers.map((t) => (
                      <DropdownMenuItem
                        key={t.name}
                        onClick={() => setModalData({ ...modalData, teacher_name: t.name })}
                      >
                        {t.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <Clock className="w-3 h-3" /> Mulai
                  </label>
                  <input
                    type="time"
                    value={modalData.jam_mulai}
                    onChange={(e) => setModalData({ ...modalData, jam_mulai: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-sm text-foreground outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <Clock className="w-3 h-3" /> Selesai
                  </label>
                  <input
                    type="time"
                    value={modalData.jam_selesai}
                    onChange={(e) => setModalData({ ...modalData, jam_selesai: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-sm text-foreground outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Room */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <MapPin className="w-3 h-3" /> Ruangan
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-all"
                    >
                      <span className={modalData.ruangan ? 'text-foreground' : 'text-muted-foreground/60'}>
                        {modalData.ruangan || 'Pilih ruangan'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                    {localRooms.map((r, i) => (
                      <DropdownMenuItem
                        key={i}
                        onClick={() => setModalData({ ...modalData, ruangan: r.nama })}
                      >
                        <div className="flex flex-col">
                          <span>{r.nama}</span>
                          {(r.lantai || r.gedung) && (
                            <span className="text-[10px] text-muted-foreground">
                              {[r.gedung, r.lantai ? `Lt. ${r.lantai}` : ''].filter(Boolean).join(' — ')}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border/30 flex items-center gap-3">
              {editIndex !== null && (
                <button
                  type="button"
                  onClick={handleModalDelete}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 transition-all"
                >
                  Hapus
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/50 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleModalSave}
                disabled={!modalData.mata_pelajaran_nama}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20"
              >
                {editIndex !== null ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
