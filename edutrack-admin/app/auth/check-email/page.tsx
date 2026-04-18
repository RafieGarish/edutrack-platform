'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronDown, Sun, Moon, Mail, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function CheckEmailPage() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <button className="flex items-center gap-2 text-sm font-medium bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3 py-2 rounded-full transition-colors text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
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
            <div className="mb-6 w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Check Your Email</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              We&apos;ve sent a confirmation link to your email address. Please check your inbox and click the link to verify your account.
            </p>
          </div>

          <div className="space-y-4 animate-stagger animate-fade-in-up delay-200">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                Didn&apos;t receive the email? Check your spam folder or try signing up again.
              </p>
            </div>

            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Check Email
            </a>

            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400 animate-stagger animate-fade-in-up delay-700">
        © 2026 EduTrack. All rights reserved.
      </footer>
    </div>
  );
}
