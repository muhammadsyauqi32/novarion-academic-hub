'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { Button } from './Button';
import { Menu, X, ArrowRight } from 'lucide-react';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-canvas/90 backdrop-blur-md border-b border-border/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <BrandLogo size="md" showTagline={true} />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-text-muted uppercase tracking-wider">
          <a href="#tentang" className="hover:text-teal-deep transition-colors">
            Tentang Kita
          </a>
          <a href="#pengurus" className="hover:text-teal-deep transition-colors">
            Pengurus
          </a>
          <a href="#berita" className="hover:text-teal-deep transition-colors">
            Warta & Kegiatan
          </a>
          <a href="#galeri" className="hover:text-teal-deep transition-colors">
            Galeri Momen
          </a>
          <a href="#prestasi" className="hover:text-teal-deep transition-colors">
            Prestasi
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login">
            <Button variant="primary" size="sm" className="font-semibold text-xs py-2 px-4 shadow-xs">
              <span>Masuk Academic Hub</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile & Tablet Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link href="/login">
            <Button variant="primary" size="sm" className="text-xs py-1.5 px-3">
              Masuk
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-border text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface px-4 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2">
          <a
            href="#tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-3 rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-soft transition-colors"
          >
            Tentang Kita
          </a>
          <a
            href="#pengurus"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-3 rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-soft transition-colors"
          >
            Struktur Pengurus
          </a>
          <a
            href="#berita"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-3 rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-soft transition-colors"
          >
            Warta & Kegiatan
          </a>
          <a
            href="#galeri"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-3 rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-soft transition-colors"
          >
            Galeri Momen
          </a>
          <a
            href="#prestasi"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2.5 px-3 rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-soft transition-colors"
          >
            Prestasi Angkatan
          </a>
          <div className="pt-2 border-t border-border">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="primary" size="sm" className="w-full justify-center font-bold">
                Masuk ke Academic Hub
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
