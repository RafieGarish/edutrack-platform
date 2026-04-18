'use client';

import { useState } from 'react';
import { Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';
import type { OnboardingTeacherEntry } from '@/lib/types';

interface Props {
  teachers: OnboardingTeacherEntry[];
  onTeachersChange: (teachers: OnboardingTeacherEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTeachers({ teachers, onTeachersChange, onNext, onBack }: Props) {
  const [error, setError] = useState('');

  function addRow() {
    onTeachersChange([...teachers, { name: '', email: '', subject: '' }]);
  }

  function removeRow(index: number) {
    if (teachers.length <= 1) return;
    onTeachersChange(teachers.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof OnboardingTeacherEntry, value: string) {
    const updated = [...teachers];
    updated[index] = { ...updated[index], [field]: value };
    onTeachersChange(updated);
  }

  function handleNext() {
    const valid = teachers.filter((t) => t.name.trim());
    if (valid.length === 0) {
      setError('Add at least one teacher.');
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
        {teachers.map((teacher, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={teacher.name}
                onChange={(e) => updateRow(index, 'name', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Teacher name"
              />
              <input
                type="email"
                value={teacher.email}
                onChange={(e) => updateRow(index, 'email', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="teacher@school.edu"
              />
              <input
                type="text"
                value={teacher.subject}
                onChange={(e) => updateRow(index, 'subject', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Subject (e.g. Matematika)"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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
        Add Teacher
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
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
