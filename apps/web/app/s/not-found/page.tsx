import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Link2Off, Compass } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export const metadata = {
  title: 'Tautan Tidak Ditemukan — nova.link',
  description: 'Tautan singkat kustom yang Anda tuju tidak ditemukan atau sudah tidak aktif.',
};

export default function ShortLinkNotFoundPage({
  searchParams,
}: {
  searchParams?: { slug?: string };
}) {
  const slug = searchParams?.slug || '';

  return (
    <main className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between selection:bg-brand-mint-soft selection:text-brand-foreground">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLogo href="/" size="sm" />
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-surface-soft border border-border text-text-muted">
            nova.link shortener
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-lg w-full text-center flex flex-col items-center">
          {/* Status Badge */}
          <div className="w-14 h-14 rounded-2xl bg-danger-surface border border-danger-border flex items-center justify-center text-danger-text mb-6">
            <Link2Off className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-3">
            Tautan Tidak Ditemukan
          </h1>

          {slug ? (
            <p className="text-sm sm:text-base text-text-muted mb-6 leading-relaxed">
              Tautan singkat{' '}
              <code className="px-2 py-0.5 rounded bg-surface border border-border font-mono text-teal-deep font-semibold">
                nova.link/{slug}
              </code>{' '}
              tidak ditemukan dalam database kami atau telah dinonaktifkan oleh pemiliknya.
            </p>
          ) : (
            <p className="text-sm sm:text-base text-text-muted mb-6 leading-relaxed">
              Tautan singkat kustom yang Anda tuju tidak terdaftar di sistem kami atau sudah dinonaktifkan.
            </p>
          )}

          <div className="w-full bg-surface rounded-card border border-border p-4 mb-8 text-left text-xs sm:text-sm text-text-muted space-y-2">
            <p className="font-semibold text-text-primary">Kemungkinan penyebab:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ada salah ketik pada akhiran link (slug).</li>
              <li>Kegiatan atau formulir terkait telah berakhir dan tautan ditutup.</li>
              <li>Pemilik link menghapus atau menonaktifkan tautan ini.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-input bg-teal-deep text-white text-xs sm:text-sm font-semibold hover:bg-teal-deep/90 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Ke Beranda Novarion</span>
            </Link>
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-input bg-surface border border-border text-text-primary text-xs sm:text-sm font-medium hover:bg-surface-soft transition-colors"
            >
              <span>Buka Hub Mahasiswa</span>
              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-text-muted">
        <p>© 2026 Novarion Digital Ecosystem • Statistika dan Sains Data</p>
      </footer>
    </main>
  );
}

