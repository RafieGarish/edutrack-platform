"use client";

import React from 'react';
import { X, BookOpen, User, MapPin, Clock, AlertCircle } from 'lucide-react';
import { ScheduleSession } from '@/data/mockData';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ScheduleSession | null;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session) return null;

  const isCancelled = session.status === 'Cancelled';

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-zinc-100 dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 flex justify-between items-start ${isCancelled ? 'bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30' : 'bg-white dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700'}`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isCancelled ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-primary/10 text-primary'}`}>
                Kelas {session.classId}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isCancelled
                  ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/40'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30'
              }`}>
                {session.status || 'Active'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {session.subject}
            </h2>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <Clock size={14} />
              <span className="text-sm font-medium">{session.startTime} – {session.endTime}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-2 bg-white dark:bg-zinc-800">
          {/* Subject */}
          <div className="flex flex-col gap-1.5 p-5 border-b border-r border-zinc-100 dark:border-zinc-700">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={12} /> Mata Pelajaran
            </span>
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{session.subject}</p>
          </div>
          {/* Teacher */}
          <div className="flex flex-col gap-1.5 p-5 border-b border-zinc-100 dark:border-zinc-700">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} /> Guru
            </span>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 leading-tight">{session.teacher || 'N/A'}</p>
          </div>
          {/* Room */}
          <div className="flex flex-col gap-1.5 p-5 border-r border-zinc-100 dark:border-zinc-700">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} /> Ruangan
            </span>
            <span className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-700 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-600 w-fit">
              {session.room}
            </span>
          </div>
          {/* Duration */}
          <div className="flex flex-col gap-1.5 p-5">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} /> Durasi
            </span>
            <p className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-200">60 menit</p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border-t border-zinc-100 dark:border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={15} className={session.notes ? 'text-primary' : 'text-zinc-400'} />
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Catatan</h3>
            {session.notes && (
              <span className="w-2 h-2 rounded-full bg-primary ml-auto" />
            )}
          </div>
          <div className={`p-3 rounded-xl text-sm leading-relaxed border ${
            session.notes
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-zinc-700 dark:text-zinc-300'
              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 italic'
          }`}>
            {session.notes || 'Tidak ada catatan untuk sesi ini.'}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700 flex gap-3">
          {!isCancelled && (
            <button className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95">
              Edit Jadwal
            </button>
          )}
          <button
            onClick={onClose}
            className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
              isCancelled
                ? 'flex-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};