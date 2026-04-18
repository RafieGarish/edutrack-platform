'use client';

import { useState } from 'react';
import type { OnboardingScannerEntry } from '@/lib/types';
import { Loader2, Plus, X, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  scanners: OnboardingScannerEntry[];
  onScannersChange: (scanners: OnboardingScannerEntry[]) => void;
  onFinish: () => void;
  onBack: () => void;
  finishing: boolean;
}

export function StepScanners({ scanners, onScannersChange, onFinish, onBack, finishing }: Props) {
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState<Set<number>>(new Set());

  function addRow() {
    onScannersChange([...scanners, { full_name: '', email: '', password: '' }]);
  }

  function removeRow(index: number) {
    if (scanners.length <= 1) return;
    onScannersChange(scanners.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof OnboardingScannerEntry, value: string) {
    const updated = [...scanners];
    updated[index] = { ...updated[index], [field]: value };
    onScannersChange(updated);
  }

  function togglePassword(index: number) {
    const updated = new Set(showPasswords);
    if (updated.has(index)) updated.delete(index);
    else updated.add(index);
    setShowPasswords(updated);
  }

  function handleFinish() {
    const valid = scanners.filter((s) => s.full_name.trim() && s.email.trim() && s.password.trim());
    if (valid.length === 0) {
      setError('Add at least one scanner account.');
      return;
    }

    for (const s of valid) {
      if (s.password.length < 6) {
        setError(`Password for ${s.email} must be at least 6 characters.`);
        return;
      }
    }

    setError('');
    onFinish();
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Scanner accounts are used by the QR Scanner app to record attendance.
        Each scanner needs a separate email and password.
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {scanners.map((scanner, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={scanner.full_name}
                onChange={(e) => updateRow(index, 'full_name', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Scanner name"
              />
              <input
                type="email"
                value={scanner.email}
                onChange={(e) => updateRow(index, 'email', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="scanner@school.edu"
              />
              <div className="relative">
                <input
                  type={showPasswords.has(index) ? 'text' : 'password'}
                  value={scanner.password}
                  onChange={(e) => updateRow(index, 'password', e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Password (min 6 chars)"
                />
                <button
                  type="button"
                  onClick={() => togglePassword(index)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.has(index) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="w-8 h-8 mt-0.5 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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
        Add Scanner
      </button>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={finishing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {finishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Complete Setup
            </>
          )}
        </button>
      </div>
    </div>
  );
}
