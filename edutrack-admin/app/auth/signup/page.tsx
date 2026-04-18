'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signupAction } from '@/actions/auth';
import { Sparkles, ChevronDown, Sun, Moon, Mail, Lock, User, Building2, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const result = await signupAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push('/auth/check-email');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex flex-col relative overflow-hidden font-sans text-zinc-950 dark:text-zinc-50">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 dark:opacity-30" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 md:p-6 animate-slide-in-down">
        <div className="flex items-center gap-2 font-bold text-2xl text-zinc-900 dark:text-zinc-50">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-md flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          EduTrack
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="flex items-center gap-2 tex  t-sm font-medium bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3 py-2 rounded-full transition-colors text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            EN
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-[440px] bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 md:p-10 animate-scale-in">

          {/* Icon + heading */}
          <div className="flex flex-col items-center text-center mb-8 animate-stagger animate-fade-in-up delay-100">
            <div className="mb-6">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="16" y="20" width="32" height="28" rx="4" fill="#3F3F46" />
                <rect x="18" y="22" width="28" height="24" rx="2" fill="#27272A" />
                <rect x="22" y="14" width="8" height="10" rx="2" fill="#3F3F46" />
                <rect x="34" y="14" width="8" height="10" rx="2" fill="#3F3F46" />
                <circle cx="32" cy="34" r="4" fill="#E4E4E7" />
                <rect x="30" y="36" width="4" height="6" rx="1" fill="#E4E4E7" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Register School</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Create an admin account to get started</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* School Name */}
            <div className="space-y-1.5 animate-stagger animate-fade-in-up delay-150">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">School Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="school_name"
                  required
                  placeholder="SMK Negeri 1 Malang"
                  className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5 animate-stagger animate-fade-in-up delay-200">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Your Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="John Doe"
                  className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 animate-stagger animate-fade-in-up delay-300">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@school.edu"
                  className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 animate-stagger animate-fade-in-up delay-400">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 animate-stagger animate-fade-in-up delay-500">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm_password"
                  required
                  minLength={6}
                  placeholder="Confirm your password"
                  className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="animate-stagger animate-fade-in-up delay-600 w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8 animate-stagger animate-fade-in-up delay-700">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400 animate-stagger animate-fade-in-up delay-700">
        © 2026 EduTrack. All rights reserved.
      </footer>
    </div>
  );
}
