'use client';

import { useState, useEffect, useRef } from 'react';
import { getSchoolStudentCount } from '@/actions/onboarding';
import type { OnboardingStudentEntry } from '@/lib/types';
import Papa from 'papaparse';
import { Plus, X, ArrowRight, ArrowLeft, Upload, FileText, Users, Eye, EyeOff } from 'lucide-react';

interface Props {
  students: OnboardingStudentEntry[];
  onStudentsChange: (students: OnboardingStudentEntry[]) => void;
  localClasses: { nama: string }[];
  onNext: () => void;
  onBack: () => void;
}

export function StepStudents({ students, onStudentsChange, localClasses, onNext, onBack }: Props) {
  const [mode, setMode] = useState<'manual' | 'csv'>('manual');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [limits, setLimits] = useState({ student_count: 0, student_limit: 100 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    getSchoolStudentCount().then(setLimits);
  }, []);

  function addRow() {
    onStudentsChange([...students, { nisn: '', nama_lengkap: '', kelas: '', password: '' }]);
  }

  function removeRow(index: number) {
    if (students.length <= 1) return;
    onStudentsChange(students.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof OnboardingStudentEntry, value: string) {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    onStudentsChange(updated);
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const parsed: OnboardingStudentEntry[] = results.data
          .map((row) => ({
            nisn: row.nisn || row.NISN || '',
            nama_lengkap: row.nama_lengkap || row.nama || row.name || row['Nama Lengkap'] || '',
            kelas: row.kelas || row.class || row.Kelas || '',
            password: row.password || row.Password || '',
          }))
          .filter((s) => s.nisn && s.nama_lengkap);

        if (parsed.length === 0) {
          setError('No valid rows found. CSV must have columns: nisn, nama_lengkap, kelas');
          return;
        }

        onStudentsChange(parsed);
        setError('');
        setSuccessMsg(`Loaded ${parsed.length} students from CSV.`);
      },
      error() {
        setError('Failed to parse CSV file.');
      },
    });
  }

  function handleNext() {
    const valid = students.filter((s) => s.nisn.trim() && s.nama_lengkap.trim() && s.password.trim());
    if (valid.length === 0) {
      setError('Add at least one student with NISN, name, and password.');
      return;
    }

    const missingPassword = students.filter((s) => s.nisn.trim() && s.nama_lengkap.trim() && !s.password.trim());
    if (missingPassword.length > 0) {
      setError(`${missingPassword.length} student(s) are missing a password.`);
      return;
    }

    const remaining = limits.student_limit - limits.student_count;
    if (valid.length > remaining) {
      setError(`Student limit exceeded. You can add ${remaining} more students (limit: ${limits.student_limit}).`);
      return;
    }

    setError('');
    onNext();
  }

  const remaining = limits.student_limit - limits.student_count;

  return (
    <div className="space-y-6">
      {/* Limit info */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Users className="w-5 h-5 text-primary shrink-0" />
        <div className="text-sm">
          <span className="font-medium text-foreground">{limits.student_count}</span>
          <span className="text-muted-foreground"> / {limits.student_limit} students used. </span>
          <span className="text-primary font-medium">{remaining} remaining.</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
          {successMsg}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'manual'
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-secondary text-muted-foreground border border-border/50 hover:text-foreground'
          }`}
        >
          <Plus className="w-4 h-4" />
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setMode('csv')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'csv'
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-secondary text-muted-foreground border border-border/50 hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" />
          CSV Upload
        </button>
      </div>

      {/* CSV Upload */}
      {mode === 'csv' && (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-all"
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Click to upload CSV</p>
              <p className="text-xs text-muted-foreground mt-1">
                Required columns: nisn, nama_lengkap, password, kelas
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
        </div>
      )}

      {/* Student list */}
      {students.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {students.map((student, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={student.nisn}
                  onChange={(e) => updateRow(index, 'nisn', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="NISN"
                  readOnly={mode === 'csv'}
                />
                <input
                  type="text"
                  value={student.nama_lengkap}
                  onChange={(e) => updateRow(index, 'nama_lengkap', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Full name"
                  readOnly={mode === 'csv'}
                />
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={student.password}
                    onChange={(e) => updateRow(index, 'password', e.target.value)}
                    className="w-full px-3 py-2.5 pr-9 rounded-lg bg-secondary border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="Password"
                    readOnly={mode === 'csv'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <select
                  value={student.kelas}
                  onChange={(e) => updateRow(index, 'kelas', e.target.value)}
                  disabled={mode === 'csv'}
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border/50 text-sm text-foreground outline-none focus:border-primary/50 transition-all disabled:opacity-60"
                >
                  <option value="">Select class</option>
                  {localClasses.map((c) => (
                    <option key={c.nama} value={c.nama}>{c.nama}</option>
                  ))}
                  {/* Allow CSV value even if not in dropdown */}
                  {student.kelas && !localClasses.find((c) => c.nama === student.kelas) && (
                    <option value={student.kelas}>{student.kelas}</option>
                  )}
                </select>
              </div>
              {mode === 'manual' && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {mode === 'manual' && (
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      )}

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
