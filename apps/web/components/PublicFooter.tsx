import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';

export function PublicFooter() {
  return (
    <footer className="w-full bg-surface border-t border-border mt-20 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <BrandLogo size="sm" showTagline={true} />
          <p className="text-xs text-text-muted text-center md:text-left max-w-sm mt-1">
            Rumah digital dan pusat informasi akademik terpadu untuk satu angkatan. Dirancang untuk kemudahan dan produktivitas bersama.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-text-muted">
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Kebijakan Privasi
          </Link>
          <a href="#fitur" className="hover:text-text-primary transition-colors">
            Fitur
          </a>
          <a href="#identitas" className="hover:text-text-primary transition-colors">
            Identitas Angkatan
          </a>
          <Link href="/login" className="hover:text-text-primary transition-colors">
            Akses Masuk
          </Link>
        </div>

        <div className="text-xs text-text-muted text-center md:text-right">
          <p>© {new Date().getFullYear()} Novarion Academic Hub.</p>
          <p className="text-[11px] text-text-muted/70 mt-0.5">One batch, one space.</p>
        </div>
      </div>
    </footer>
  );
}
