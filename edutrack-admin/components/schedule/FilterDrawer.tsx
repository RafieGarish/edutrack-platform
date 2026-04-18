"use client";

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { CLASSES } from '@/data/mockData';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  visibleClasses: string[];
  onApply: (classes: string[]) => void;
  /** Full list of classes — falls back to the static CLASSES constant if omitted */
  availableClasses?: string[];
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  visibleClasses,
  onApply,
  availableClasses,
}) => {
  // Use injected list when available, otherwise fall back to mock constant
  const allClasses = availableClasses ?? CLASSES;

  const [localVisible, setLocalVisible] = useState<string[]>(visibleClasses);

  useEffect(() => {
    if (isOpen) setLocalVisible(visibleClasses);
  }, [isOpen, visibleClasses]);

  const toggleClass = (cls: string) => {
    setLocalVisible((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls],
    );
  };

  const applyGroup = (group: string) => {
    let selection: string[] = [];
    switch (group) {
      case 'All':
        selection = [...allClasses];
        break;
      case 'Science':
        selection = allClasses.filter(
          (c) => c.startsWith('SCI') || c.includes('10A') || c.includes('11A'),
        );
        break;
      case 'Humanities':
        selection = allClasses.filter(
          (c) => c.startsWith('ART') || c.includes('10B') || c.includes('12A'),
        );
        break;
      case 'Grade 10':
        selection = allClasses.filter((c) => c.startsWith('10'));
        break;
      case 'Grade 11':
        selection = allClasses.filter((c) => c.startsWith('11'));
        break;
      default:
        selection = [...allClasses];
    }
    setLocalVisible(selection);
  };

  const handleApply = () => onApply(localVisible);

  const quickFilters = ['All', 'Grade 10', 'Grade 11', 'Science', 'Humanities'];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-zinc-900/50 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[85vh] bg-white dark:bg-zinc-800 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-600" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Filter Kelas
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {localVisible.length} dari {allClasses.length} kelas dipilih
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocalVisible([...allClasses])}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Group Chips */}
        <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-zinc-100 dark:border-zinc-700">
          {quickFilters.map((group) => {
            const isActive =
              group === 'All'
                ? localVisible.length === allClasses.length
                : group === 'Grade 10'
                ? allClasses.filter((c) => c.startsWith('10')).every((c) => localVisible.includes(c))
                : group === 'Grade 11'
                ? allClasses.filter((c) => c.startsWith('11')).every((c) => localVisible.includes(c))
                : false;

            return (
              <button
                key={group}
                onClick={() => applyGroup(group)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600 hover:border-primary/40 hover:text-primary'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>

        {/* Class Toggle List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
          {allClasses.map((cls) => {
            const isChecked = localVisible.includes(cls);
            const wing = cls.startsWith('SCI')
              ? 'Science Wing'
              : cls.startsWith('ART')
              ? 'Art Wing'
              : 'Main Building';

            return (
              <div
                key={cls}
                onClick={() => toggleClass(cls)}
                className="flex items-center justify-between py-3.5 border-b border-zinc-50 dark:border-zinc-700 last:border-0 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      isChecked
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {cls}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                      Kelas {cls}
                    </span>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{wing}</p>
                  </div>
                </div>
                {/* Custom toggle */}
                <div
                  className={`w-11 h-6 rounded-full transition-all flex items-center px-0.5 ${
                    isChecked ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
          <div className="h-24" />
        </div>

        {/* Apply Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleApply}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-base py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Terapkan ({localVisible.length} Kelas)
          </button>
        </div>
      </div>
    </>
  );
};