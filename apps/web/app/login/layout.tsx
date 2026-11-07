import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Halaman masuk portal Novarion Academic Hub khusus mahasiswa dan administrator terdaftar.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mainSiteUrl = process.env.NEXT_PUBLIC_APP_URL || '/';

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      {/* Minimal Top Header */}
      <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between border-b border-border/60 bg-surface/80 backdrop-blur-sm">
        <Link
          href={mainSiteUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors min-h-[40px] px-3 rounded-input hover:bg-surface-soft"
          title="Kembali ke Beranda"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider hidden sm:inline">
            Academic Hub · Angkatan 62
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content: Form Login Mandiri */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {children}
      </main>

      {/* Footer Minimalist */}
      <footer className="w-full py-4 text-center text-xs text-text-muted border-t border-border/60">
        © {new Date().getFullYear()} Novarion · Statistika dan Sains Data IPB University
      </footer>
    </div>
  );
}
