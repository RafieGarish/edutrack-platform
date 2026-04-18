'use client';

import { useState } from 'react';
import { Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';
import type { OnboardingClassEntry } from '@/lib/types';

const TINGKAT_OPTIONS = ['X', 'XI', 'XII'];

interface Props {
  classes: OnboardingClassEntry[];
  onClassesChange: (classes: OnboardingClassEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
}

function buildNama(tingkat: string, jurusan: string): string {
  if (tingkat && jurusan) return `${tingkat} ${jurusan}`;
  if (tingkat) return tingkat;
  if (jurusan) return jurusan;
  return '';
}

export function StepClasses({ classes, onClassesChange, onNext, onBack }: Props) {
  const [error, setError] = useState('');

  function addRow() {
    onClassesChange([...classes, { nama: '', tingkat: '', jurusan: '' }]);
  }

  function removeRow(index: number) {
    if (classes.length <= 1) return;
    onClassesChange(classes.filter((_, i) => i !== index));
  }

  function updateRow(index: number, fields: Partial<OnboardingClassEntry>) {
    const updated = [...classes];
    const row = { ...updated[index], ...fields };
    row.nama = buildNama(row.tingkat || '', row.jurusan || '');
    updated[index] = row;
    onClassesChange(updated);
  }

  function handleNext() {
    const valid = classes.filter((c) => c.nama.trim());
    if (valid.length === 0) {
      setError('Tambahkan minimal satu kelas.');
      return;
    }
    setError('');
    onNext();
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {classes.map((cls, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3">
              {/* Tingkat (Kelas) */}
              {/* <select
                value={cls.tingkat || ''}
                onChange={(e) => updateRow(index, { tingkat: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="">Pilih tingkat</option>
                {TINGKAT_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select> */}

              <input
                type="text"
                value={cls.tingkat || ''}
                onChange={(e) => updateRow(index, { tingkat: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Tingkat (contoh: VII)"
              />

              {/* Jurusan */}
              <input
                type="text"
                value={cls.jurusan || ''}
                onChange={(e) => updateRow(index, { jurusan: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Jurusan (contoh: RPL 1)"
              />
            </div>

            {/* Preview nama */}
            {cls.nama && (
              <span className="hidden sm:block text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/30 min-w-20 text-center">
                {cls.nama}
              </span>
            )}

            <button
              type="button"
              onClick={() => removeRow(index)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
      >
        <Plus className="w-4 h-4" />
        Tambah Kelas
      </button>

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
