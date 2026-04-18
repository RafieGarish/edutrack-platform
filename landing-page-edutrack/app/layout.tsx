import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'EduTrack - Smart Attendance',
  description: 'Smart Attendance, Verified Location.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-slate-900 bg-slate-50 antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}

