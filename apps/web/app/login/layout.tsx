import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Masuk ke Portal Akademik | Novarion',
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
      {/* Minimal Top Header - Tanpa menu navbar publik (Tentang, Pengurus, dll.) */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-border/40 bg-surface/50 backdrop-blur-sm">
        <Link
          href={mainSiteUrl}
          className="inline-flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-surface-soft"
          title="Kembali ke Beranda"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-[11px] font-mono text-text-muted/60 uppercase tracking-widest hidden sm:inline">
          Academic Hub · Angkatan 62
        </span>
      </header>

      {/* Main Content: Form Login Mandiri */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {children}
      </main>

      {/* Footer Minimalist */}
      <footer className="w-full py-4 text-center text-xs text-text-muted/70 border-t border-border/40">
        © {new Date().getFullYear()} Novarion · Statistika dan Sains Data IPB University
      </footer>
    </div>
  );
}
