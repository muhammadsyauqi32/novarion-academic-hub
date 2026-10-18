import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';

export function PublicFooter() {
  return (
    <footer className="w-full bg-[#0D1B2A] border-t border-[#FAF9F5]/15 py-12 text-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <BrandLogo size="sm" showSubtitle={true} inverted={true} />
          <p className="text-xs text-[#FAF9F5]/70 text-center md:text-left max-w-sm mt-1 font-sans">
            Arsip digital dan portal akademik terpadu Mahasiswa Statistika dan Sains Data Angkatan 62 IPB University.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs font-mono text-[#FAF9F5]/80">
          <Link href="/privacy" className="hover:text-[#FFAE5D] transition-colors">
            Kebijakan Privasi
          </Link>
          <a href="#tentang" className="hover:text-[#FFAE5D] transition-colors">
            Tentang Kita
          </a>
          <a href="#pengurus" className="hover:text-[#FFAE5D] transition-colors">
            Pengurus
          </a>
          <a href="#berita" className="hover:text-[#FFAE5D] transition-colors">
            Warta
          </a>
          <a href="#galeri" className="hover:text-[#FFAE5D] transition-colors">
            Galeri
          </a>
          <a href="#prestasi" className="hover:text-[#FFAE5D] transition-colors">
            Prestasi
          </a>
          <Link href="/login" className="hover:text-[#FFAE5D] transition-colors font-bold text-[#41C2A1]">
            Academic Hub
          </Link>
        </div>

        <div className="text-xs text-[#FAF9F5]/70 text-center md:text-right font-mono">
          <p>© {new Date().getFullYear()} NOVARION 62 · IPB UNIVERSITY</p>
          <p className="text-[11px] text-[#FFAE5D] font-bold mt-0.5">&ldquo;Kita Satu, Kita Bisa!&rdquo;</p>
        </div>
      </div>
    </footer>
  );
}
