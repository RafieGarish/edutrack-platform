import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Attendance QR Scanner',
  description: 'Scan student QR codes to log attendance instantly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* <body className="bg-background-light text-slate-900 font-display min-h-screen flex" suppressHydrationWarning> */}
      <body className="bg-background-light text-slate-900 font-display flex h-screen items-center justify-center" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
