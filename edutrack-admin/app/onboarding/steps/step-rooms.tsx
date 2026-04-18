'use client';

import { useState } from 'react';
import { Plus, X, ArrowRight, ArrowLeft, DoorOpen, Building2, Layers } from 'lucide-react';
import type { OnboardingRoomEntry } from '@/lib/types';

interface Props {
  rooms: OnboardingRoomEntry[];
  onRoomsChange: (rooms: OnboardingRoomEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepRooms({ rooms, onRoomsChange, onNext, onBack }: Props) {
  const [error, setError] = useState('');

  function addRow() {
    onRoomsChange([...rooms, { nama: '', lantai: '', gedung: '' }]);
  }

  function removeRow(index: number) {
    if (rooms.length <= 1) return;
    onRoomsChange(rooms.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof OnboardingRoomEntry, value: string) {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    onRoomsChange(updated);
  }

  function handleNext() {
    const valid = rooms.filter((r) => r.nama.trim());
    if (valid.length === 0) {
      setError('Tambahkan minimal satu ruangan.');
      return;
    }
    setError('');
    onNext();
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {rooms.map((room, index) => (
          <div
            key={index}
            className="group flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-border/60 transition-all"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold shrink-0 mt-0.5">
              {index + 1}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Nama Ruangan */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <DoorOpen className="w-3 h-3" /> Nama Ruangan
                </label>
                <input
                  type="text"
                  value={room.nama}
                  onChange={(e) => updateRow(index, 'nama', e.target.value)}
                  placeholder="contoh: Lab Komputer 1"
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Lantai */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Layers className="w-3 h-3" /> Lantai
                </label>
                <input
                  type="text"
                  value={room.lantai}
                  onChange={(e) => updateRow(index, 'lantai', e.target.value)}
                  placeholder="contoh: 2"
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Gedung */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  <Building2 className="w-3 h-3" /> Gedung
                </label>
                <input
                  type="text"
                  value={room.gedung}
                  onChange={(e) => updateRow(index, 'gedung', e.target.value)}
                  placeholder="contoh: Gedung A"
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {rooms.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
      >
        <Plus className="w-4 h-4" />
        Tambah Ruangan
      </button>

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
    </div>
  );
}
