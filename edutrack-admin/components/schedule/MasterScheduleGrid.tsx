"use client";

import React, { useState, useEffect } from 'react';
import { Filter, Clock } from 'lucide-react';
import { SCHEDULE_DATA, CLASSES, TIMES, ScheduleSession } from '@/data/mockData';

interface MasterScheduleGridProps {
  onOpenFilter: () => void;
  onOpenClassDetail: (session: ScheduleSession) => void;
  visibleClasses: string[];
  /** Injected from Supabase — falls back to static mock data if omitted */
  scheduleData?: ScheduleSession[];
  /** Full list of available classes — falls back to CLASSES constant if omitted */
  availableClasses?: string[];
}

export const MasterScheduleGrid: React.FC<MasterScheduleGridProps> = ({
  onOpenFilter,
  onOpenClassDetail,
  visibleClasses,
  scheduleData,
  availableClasses,
}) => {
  // Use injected data when available, otherwise fall back to static mock
  const resolvedSchedule = scheduleData ?? SCHEDULE_DATA;
  const _resolvedClasses = availableClasses ?? CLASSES; // kept for potential future use

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const days: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
    const isWeekend = currentDay === 0 || currentDay === 6;
    setSelectedDate(isWeekend ? days[0] : new Date());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getDayName = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  const getSession = (classId: string, time: string) => {
    const dayName = getDayName(selectedDate);
    return resolvedSchedule.find(
      (s) => s.classId === classId && s.startTime === time && s.day === dayName,
    );
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Day Switcher */}
      <div className="flex-none bg-white dark:bg-background border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center">
          {/* Date info */}
          <div className="flex items-center gap-2 px-5 py-3 border-r border-zinc-200 dark:border-zinc-700 min-w-[140px]">
            <Clock size={15} className="text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
          {/* Day tabs */}
          <nav className="flex flex-1 overflow-x-auto no-scrollbar">
            {weekDays.map((date) => {
              const isActive = isSameDay(date, selectedDate);
              const today = isToday(date);
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`relative flex-1 min-w-[80px] py-3 flex flex-col items-center gap-0.5 transition-all group border-b-2 ${
                    isActive
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {getDayName(date)}
                  </span>
                  <span
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : today
                        ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {today && !isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
                  )}
                </button>
              );
            })}
          </nav>
          {/* Filter button */}
          <button
            onClick={onOpenFilter}
            className="flex-none flex items-center gap-2 mx-4 px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-primary/30 hover:text-primary text-sm font-medium transition-all shadow-sm"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filter Kelas</span>
          </button>
        </div>
      </div>

      {/* Scrollable Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="inline-block min-w-full">
          {/* Column Headers — sticky top */}
          <div className="flex sticky top-0 z-20 bg-white dark:bg-background border-b-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
            <div className="sticky left-0 z-30 bg-white dark:bg-background w-16 flex-none border-r-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
              <Clock size={14} className="text-zinc-300 dark:text-zinc-600" />
            </div>
            {visibleClasses.map((cls) => (
              <div
                key={cls}
                className="w-36 flex-none h-11 px-3 flex items-center border-r border-zinc-100 dark:border-zinc-800"
              >
                <span className="font-bold text-sm text-zinc-700 dark:text-zinc-200">{cls}</span>
              </div>
            ))}
          </div>

          {/* Time rows */}
          <div className="flex flex-col">
            {TIMES.map((time, index) => {
              const isEvenRow = index % 2 === 0;
              const rowHour = parseInt(time.split(':')[0], 10);
              const isCurrentHour =
                isToday(selectedDate) && currentDateTime.getHours() === rowHour;
              const rowBg = isEvenRow
                ? 'bg-white dark:bg-background'
                : 'bg-zinc-50/50 dark:bg-zinc-950/50';

              if (time === '12:00') {
                return (
                  <div
                    key={time}
                    className={`flex h-14 border-b border-zinc-100 dark:border-zinc-800 ${isCurrentHour ? 'ring-2 ring-primary ring-inset z-10' : ''} ${rowBg}`}
                  >
                    <div
                      className={`sticky left-0 z-10 w-16 flex-none flex items-center justify-center border-r-2 border-zinc-200 dark:border-zinc-700 ${rowBg} ${isCurrentHour ? '!bg-emerald-50 dark:!bg-emerald-900/20' : ''}`}
                    >
                      <span
                        className={`font-mono text-xs font-semibold ${isCurrentHour ? 'text-primary' : 'text-zinc-400 dark:text-zinc-500'}`}
                      >
                        {time}
                      </span>
                    </div>
                    <div
                      className={`flex items-center justify-center border-r border-zinc-100 dark:border-zinc-800 ${isCurrentHour ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'bg-zinc-100 dark:bg-zinc-800'}`}
                      style={{ width: visibleClasses.length * 144 }}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${isCurrentHour ? 'text-primary' : 'text-zinc-400 dark:text-zinc-500'}`}
                      >
                        Istirahat
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={time}
                  className={`flex h-16 border-b border-zinc-100 dark:border-zinc-800 ${isCurrentHour ? 'ring-2 ring-primary ring-inset z-10' : ''} ${rowBg}`}
                >
                  {/* Time label — sticky left */}
                  <div
                    className={`sticky left-0 z-10 w-16 flex-none flex items-center justify-center border-r-2 border-zinc-200 dark:border-zinc-700 ${rowBg} ${isCurrentHour ? '!bg-emerald-50 dark:!bg-emerald-900/20' : ''}`}
                  >
                    <span
                      className={`font-mono text-xs font-semibold ${isCurrentHour ? 'text-primary font-bold' : 'text-zinc-400 dark:text-zinc-500'}`}
                    >
                      {time}
                    </span>
                  </div>

                  {/* Class cells */}
                  {visibleClasses.map((cls) => {
                    const session = getSession(cls, time);
                    const isCancelled = session?.status === 'Cancelled';
                    const hasNotes = !!session?.notes;

                    if (!session) {
                      return (
                        <div
                          key={`${time}-${cls}`}
                          className={`w-36 flex-none border-r border-zinc-100 dark:border-zinc-800 p-2 ${isCurrentHour ? 'bg-primary/5' : ''}`}
                        />
                      );
                    }

                    return (
                      <div
                        key={session.id}
                        onClick={() => onOpenClassDetail(session)}
                        className={`relative w-36 flex-none border-r border-zinc-100 dark:border-zinc-800 p-2.5 flex flex-col justify-center cursor-pointer transition-all group
                          ${
                            isCancelled
                              ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                              : hasNotes
                              ? 'bg-emerald-50/60 dark:bg-emerald-900/10 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20'
                              : 'hover:bg-primary/5 dark:hover:bg-primary/10'
                          }
                          ${isCurrentHour && !isCancelled && !hasNotes ? 'bg-primary/5 dark:bg-primary/10' : ''}
                        `}
                      >
                        {/* Left accent bar */}
                        <div
                          className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full transition-opacity ${
                            isCancelled
                              ? 'bg-red-400 opacity-100'
                              : hasNotes
                              ? 'bg-primary opacity-100'
                              : 'bg-primary opacity-0 group-hover:opacity-100'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold truncate leading-tight ${
                            isCancelled ? 'text-red-600 dark:text-red-400' : 'text-zinc-800 dark:text-zinc-100'
                          }`}
                        >
                          {session.subject}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 font-medium truncate ${
                            isCancelled
                              ? 'text-red-400 dark:text-red-500'
                              : hasNotes
                              ? 'text-primary font-semibold'
                              : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
                          {isCancelled ? `✕ ${session.teacher}` : session.room}
                        </span>
                        {hasNotes && !isCancelled && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};