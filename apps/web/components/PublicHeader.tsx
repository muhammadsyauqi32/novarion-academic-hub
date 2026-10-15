import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { Button } from './Button';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-canvas/80 backdrop-blur-md border-b border-border/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <BrandLogo size="md" showTagline={true} />

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
          <Link href="#fitur" className="hover:text-text-primary transition-colors">
            Fitur Utama
          </Link>
          <Link href="#cara-kerja" className="hover:text-text-primary transition-colors">
            Cara Kerja
          </Link>
          <Link href="#identitas" className="hover:text-text-primary transition-colors">
            Tentang Angkatan
          </Link>
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Privasi
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="primary" size="sm">
              Masuk ke Hub
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
