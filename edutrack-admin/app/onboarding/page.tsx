'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitAllOnboarding } from '@/actions/onboarding';
import type {
  OnboardingClassEntry,
  OnboardingTeacherEntry,
  OnboardingRoomEntry,
  OnboardingScheduleEntry,
  OnboardingStudentEntry,
  OnboardingScannerEntry,
} from '@/lib/types';
import { StepSchoolInfo } from './steps/step-school-info';
import { StepClasses } from './steps/step-classes';
import { StepTeachers } from './steps/step-teachers';
import { StepRooms } from './steps/step-rooms';
import { StepSchedules } from './steps/step-schedules';
import { StepStudents } from './steps/step-students';
import { StepScanners } from './steps/step-scanners';

const STEPS = [
  { label: 'School Info', description: 'Basic school information' },
  { label: 'Classes', description: 'Create your classes' },
  { label: 'Teachers', description: 'Add your teachers' },
  { label: 'Rooms', description: 'Add your rooms' },
  { label: 'Schedules', description: 'Set up class schedules' },
  { label: 'Students', description: 'Import your students' },
  { label: 'Scanners', description: 'Create scanner accounts' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [finishing, setFinishing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Lifted state for all steps ──
  const [schoolInfo, setSchoolInfo] = useState({ name: '', address: '', latitude: null as number | null, longitude: null as number | null, radius: 100 });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [classes, setClasses] = useState<OnboardingClassEntry[]>([{ nama: '' }]);
  const [teachers, setTeachers] = useState<OnboardingTeacherEntry[]>([{ name: '', email: '', subject: '' }]);
  const [rooms, setRooms] = useState<OnboardingRoomEntry[]>([{ nama: '', lantai: '', gedung: '' }]);
  const [schedules, setSchedules] = useState<OnboardingScheduleEntry[]>([
    { kelas_nama: '', mata_pelajaran_kode: '', mata_pelajaran_nama: '', teacher_name: '', hari: 'Senin', jam_mulai: '07:00', jam_selesai: '08:30', ruangan: '' },
  ]);
  const [students, setStudents] = useState<OnboardingStudentEntry[]>([{ nisn: '', nama_lengkap: '', kelas: '', password: '' }]);
  const [scanners, setScanners] = useState<OnboardingScannerEntry[]>([{ full_name: '', email: '', password: '' }]);

  function handleStepComplete() {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleFinish() {
    setFinishing(true);
    setSubmitError('');
    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    const formData = new FormData();
    formData.set('data', JSON.stringify({
      schoolInfo,
      classes,
      teachers,
      rooms,
      schedules,
      students,
      scanners,
    }));
    if (logoFile) {
      formData.set('logo', logoFile);
    }

    const result = await submitAllOnboarding(formData);

    if (result.error) {
      setSubmitError(result.error);
      setFinishing(false);
      return;
    }

    // Show warnings for partial failures (students/scanners that failed to create)
    const warnings: string[] = [];
    if (result.studentErrors) {
      warnings.push(`Some student accounts failed:\n${result.studentErrors.join('\n')}`);
    }
    if (result.scannerErrors) {
      warnings.push(`Some scanner accounts failed:\n${result.scannerErrors.join('\n')}`);
    }
    if (warnings.length > 0) {
      alert(warnings.join('\n\n'));
    }

    router.push('/dashboard');
    router.refresh();
  }

  // Derive subjects from teachers for the schedules step
  const localSubjects = Array.from(
    new Map(
      teachers
        .filter((t) => t.subject?.trim())
        .map((t) => [t.subject, { nama: t.subject, kode: t.subject.substring(0, 3).toUpperCase() }])
    ).values()
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-green">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              Edu<span className="text-primary">Track</span>
            </span>
          </div>
          <span className="text-sm text-muted-foreground">Setup Wizard</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-display font-bold text-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </h2>
            <span className="text-sm text-muted-foreground">
              {Math.round(((completedSteps.size) / STEPS.length) * 100)}% complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-secondary rounded-full mb-6">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((completedSteps.size) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="hidden md:flex items-center justify-between">
            {STEPS.map((step, index) => (
              <button
                key={index}
                onClick={() => index <= Math.max(...Array.from(completedSteps), currentStep) && setCurrentStep(index)}
                className={cn(
                  'flex items-center gap-2 text-sm transition-all',
                  index === currentStep
                    ? 'text-primary font-medium'
                    : completedSteps.has(index)
                    ? 'text-primary/60'
                    : 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                    index === currentStep
                      ? 'border-primary bg-primary/20 text-primary'
                      : completedSteps.has(index)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-secondary text-muted-foreground'
                  )}
                >
                  {completedSteps.has(index) ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden lg:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {/* Step Content */}
        <div key={currentStep} className="bg-card rounded-2xl border border-border/50 p-6 lg:p-8 animate-fade-in-up">
          <div className="mb-6">
            <h3 className="text-xl font-display font-bold text-foreground">
              {STEPS[currentStep].label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {STEPS[currentStep].description}
            </p>
          </div>

          {currentStep === 0 && (
            <StepSchoolInfo
              data={schoolInfo}
              logoFile={logoFile}
              onDataChange={setSchoolInfo}
              onLogoChange={setLogoFile}
              onNext={handleStepComplete}
            />
          )}
          {currentStep === 1 && (
            <StepClasses
              classes={classes}
              onClassesChange={setClasses}
              onNext={handleStepComplete}
              onBack={handleBack}
            />
          )}
          {currentStep === 2 && (
            <StepTeachers
              teachers={teachers}
              onTeachersChange={setTeachers}
              onNext={handleStepComplete}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepRooms
              rooms={rooms}
              onRoomsChange={setRooms}
              onNext={handleStepComplete}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <StepSchedules
              schedules={schedules}
              onSchedulesChange={setSchedules}
              localClasses={classes.filter((c) => c.nama.trim()).map((c) => ({ nama: c.nama }))}
              localTeachers={teachers.filter((t) => t.name.trim()).map((t) => ({ name: t.name }))}
              localSubjects={localSubjects}
              localRooms={rooms.filter((r) => r.nama.trim())}
              onNext={handleStepComplete}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <StepStudents
              students={students}
              onStudentsChange={setStudents}
              localClasses={classes.filter((c) => c.nama.trim()).map((c) => ({ nama: c.nama }))}
              onNext={handleStepComplete}
              onBack={handleBack}
            />
          )}
          {currentStep === 6 && (
            <StepScanners
              scanners={scanners}
              onScannersChange={setScanners}
              onFinish={handleFinish}
              onBack={handleBack}
              finishing={finishing}
            />
          )}
        </div>
      </div>
    </div>
  );
}
