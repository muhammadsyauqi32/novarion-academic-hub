'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { Menu, X, ArrowRight } from 'lucide-react';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F5] border-b border-[#112A24]/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <BrandLogo size="md" showSubtitle={true} />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-bold text-[#112A24]/80 uppercase tracking-wider">
          <a href="#tentang" className="hover:text-[#112A24] hover:bg-[#EAEAB7] px-2 py-1 rounded-xs transition-colors">
            Tentang Kita
          </a>
          <a href="#pengurus" className="hover:text-[#112A24] hover:bg-[#EAEAB7] px-2 py-1 rounded-xs transition-colors">
            Pengurus
          </a>
          <a href="#berita" className="hover:text-[#112A24] hover:bg-[#EAEAB7] px-2 py-1 rounded-xs transition-colors">
            Warta & Jurnal
          </a>
          <a href="#galeri" className="hover:text-[#112A24] hover:bg-[#EAEAB7] px-2 py-1 rounded-xs transition-colors">
            Galeri Memori
          </a>
          <a href="#prestasi" className="hover:text-[#112A24] hover:bg-[#EAEAB7] px-2 py-1 rounded-xs transition-colors">
            Prestasi
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login">
            <button className="px-4 py-2 rounded-xs bg-[#112A24] text-[#EAEAB7] hover:bg-[#FFAE5D] hover:text-[#112A24] font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-[#112A24]/20">
              <span>Masuk Academic Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* Mobile & Tablet Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link href="/login">
            <button className="px-3 py-1.5 rounded-xs bg-[#112A24] text-[#EAEAB7] hover:bg-[#FFAE5D] hover:text-[#112A24] font-mono text-xs font-bold uppercase transition-colors">
              Masuk
            </button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xs border border-[#112A24]/15 text-[#112A24] hover:bg-[#EAEAB7] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#112A24]/10 bg-[#FAF9F5] px-4 py-4 flex flex-col gap-2">
          <a
            href="#tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-xs text-xs font-mono font-bold text-[#112A24] hover:bg-[#EAEAB7] transition-colors uppercase tracking-wider"
          >
            Tentang Kita
          </a>
          <a
            href="#pengurus"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-xs text-xs font-mono font-bold text-[#112A24] hover:bg-[#EAEAB7] transition-colors uppercase tracking-wider"
          >
            Struktur Pengurus
          </a>
          <a
            href="#berita"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-xs text-xs font-mono font-bold text-[#112A24] hover:bg-[#EAEAB7] transition-colors uppercase tracking-wider"
          >
            Warta & Jurnal
          </a>
          <a
            href="#galeri"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-xs text-xs font-mono font-bold text-[#112A24] hover:bg-[#EAEAB7] transition-colors uppercase tracking-wider"
          >
            Galeri Memori
          </a>
          <a
            href="#prestasi"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-xs text-xs font-mono font-bold text-[#112A24] hover:bg-[#EAEAB7] transition-colors uppercase tracking-wider"
          >
            Prestasi Angkatan
          </a>
          <div className="pt-2 border-t border-[#112A24]/10">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <button className="w-full py-2.5 rounded-xs bg-[#112A24] text-[#EAEAB7] hover:bg-[#FFAE5D] hover:text-[#112A24] font-mono text-xs font-bold uppercase tracking-wider transition-colors">
                Masuk ke Academic Hub
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
