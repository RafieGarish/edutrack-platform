"use client";

import Link from "next/link";

export default function CheckEmailPage() {
  const handleResendEmail = () => {
    // TODO: wire up resend logic
    console.log("Resend email clicked");
  };

  return (
    <div className="relative flex h-dvh w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">

        {/* Navigation Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-3 lg:px-10">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-black">
              <span className="material-symbols-outlined text-xl">bolt</span>
            </div>
            <span className="text-lg font-bold tracking-tight">AcmeCorp</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="layout-content-container flex flex-col max-w-[480px] w-full text-center">

            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative bg-white dark:bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700">
                  <span
                    className="material-symbols-outlined text-primary text-3xl"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    mail
                  </span>
                </div>
              </div>
            </div>

            {/* Messaging */}
            <div className="flex flex-col gap-2 mb-5">
              <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-extrabold leading-tight tracking-tight">
                Check your email
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
                We&apos;ve sent a magic link to your inbox. Please click the link to
                confirm your account and get started.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-xl h-11 px-8 bg-primary text-slate-900 text-base font-semibold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <span className="truncate">Open Email App</span>
              </a>
              <button
                onClick={handleResendEmail}
                className="flex items-center justify-center rounded-xl h-11 px-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="truncate">Resend Email</span>
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
                Didn&apos;t receive the email?{" "}
                <br className="sm:hidden" />
                <span className="text-slate-700 dark:text-slate-300">
                  Check your spam folder or try another address.
                </span>
              </p>
            </div>

            {/* Visual Accent */}
            <div className="mt-5 flex justify-center opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
              <div className="flex -space-x-2">
                <div
                  className="w-8 h-8 rounded-full border-2 border-background-dark bg-slate-400"
                  aria-label="Abstract profile avatar placeholder one"
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-background-dark bg-slate-500"
                  aria-label="Abstract profile avatar placeholder two"
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-background-dark bg-slate-600"
                  aria-label="Abstract profile avatar placeholder three"
                />
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 flex justify-center">
          <nav className="flex gap-6 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
            <Link href="#" className="hover:text-primary transition-colors">
              Help Center
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms
            </Link>
          </nav>
        </footer>

      </div>
    </div>
  );
}