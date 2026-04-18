'use client';

import { useState } from 'react';
import { MasterScheduleGrid } from '@/components/schedule/MasterScheduleGrid';
import { ClassDetailModal } from '@/components/schedule/ClassDetailModal';
import { FilterDrawer } from '@/components/schedule/FilterDrawer';
import { ScheduleSession, CLASSES } from '@/data/mockData';
import { Search, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const [visibleClasses, setVisibleClasses] = useState<string[]>(CLASSES);

  return (
    <>
      {/* Header */}
      <header className="flex-none px-6 py-6 lg:px-10 bg-white/80 dark:bg-background backdrop-blur-sm sticky top-0 z-20 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Schedule Management
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Manage weekly lesson plans and teacher assignments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-primary bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
              <Search size={20} />
            </button>
            <button className="hidden md:flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-primary bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-800" />
            </button>
            <Button className="flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg shadow-md">
              <Plus size={20} />
              <span className="truncate">Create New Schedule</span>
            </Button>
          </div>
        </div>
      </header>
      <MasterScheduleGrid
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenClassDetail={(session) => setSelectedSession(session)}
        visibleClasses={visibleClasses}
      />
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        visibleClasses={visibleClasses}
        onApply={(classes) => {
          setVisibleClasses(classes);
          setIsFilterOpen(false);
        }}
      />
      <ClassDetailModal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
      />
    </>
  );
}
