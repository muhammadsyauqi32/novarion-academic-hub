'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { getHubLoginUrl } from '@/lib/links';
import { OFFICIAL_SOCIALS } from '@/lib/config/socials';
import { ArrowUp, ArrowRight, Instagram, Linkedin, Youtube } from 'lucide-react';

export function PublicFooter() {
  const hubLoginUrl = getHubLoginUrl();
  const activeSocials = OFFICIAL_SOCIALS.filter((s) => Boolean(s.url));

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4 shrink-0 text-[#FFAE5D]" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 shrink-0 text-[#FFAE5D]" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 shrink-0 text-[#FFAE5D]" />;
      default:
        return (
          <span className="w-4 h-4 shrink-0 font-mono text-xs font-bold text-[#FFAE5D] flex items-center justify-center">
            #
          </span>
        );
    }
  };

  return (
    <footer className="w-full bg-[#0D1B2A] py-16 md:py-20 text-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 md:gap-16">
        {/* Editorial Multi-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-start gap-3">
            <BrandLogo size="md" inverted={true} />
            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-black text-sm tracking-wide text-[#FAF9F5]">
                NOVARION
              </span>
              <span className="text-xs text-[#FAF9F5]/70 font-sans">
                Statistika dan Sains Data Angkatan 62
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-[#FFAE5D] tracking-wide">
              &ldquo;Kita Satu, Kita Bisa!&rdquo;
            </p>
            <p className="text-xs text-[#FAF9F5]/70 font-sans leading-relaxed max-w-xs mt-1">
              Arsip visual, warta dokumentasi, dan portal akademik terpadu keluarga besar Mahasiswa Statistika dan Sains Data Angkatan 62 IPB University.
            </p>
          </div>

          {/* Column 2: Jelajahi (Strictly Vertical Navigation) */}
          <div className="flex flex-col items-start gap-3">
            <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#FFAE5D]">
              Jelajahi
            </h3>
            <nav className="flex flex-col gap-2.5 text-xs font-sans font-medium text-[#FAF9F5]/80">
              <a href="#tentang" className="hover:text-[#FFAE5D] transition-colors focus-visible:outline-2 focus-visible:outline-[#FFAE5D]">
                Tentang
              </a>
              <a href="#pengurus" className="hover:text-[#FFAE5D] transition-colors focus-visible:outline-2 focus-visible:outline-[#FFAE5D]">
                Pengurus
              </a>
              <a href="#berita" className="hover:text-[#FFAE5D] transition-colors focus-visible:outline-2 focus-visible:outline-[#FFAE5D]">
                Berita
              </a>
              <a href="#galeri" className="hover:text-[#FFAE5D] transition-colors focus-visible:outline-2 focus-visible:outline-[#FFAE5D]">
                Galeri
              </a>
              <a href="#prestasi" className="hover:text-[#FFAE5D] transition-colors focus-visible:outline-2 focus-visible:outline-[#FFAE5D]">
                Prestasi
              </a>
            </nav>
          </div>

          {/* Column 3: Media Sosial */}
          <div className="flex flex-col items-start gap-3">
            <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#FFAE5D]">
              Media Sosial
            </h3>
            {activeSocials.length > 0 ? (
              <div className="flex flex-col gap-3 text-xs font-sans">
                {activeSocials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-[#FAF9F5]/80 hover:text-[#FFAE5D] transition-colors"
                  >
                    {getSocialIcon(social.platform)}
                    <span className="font-medium">{social.name}</span>
                    {social.handle && (
                      <span className="text-[11px] font-mono text-[#FAF9F5]/50 group-hover:text-[#FFAE5D]/75 transition-colors">
                        {social.handle}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-[#FAF9F5]/70 font-sans leading-relaxed max-w-xs">
                  Kanal komunikasi resmi angkatan dikelola oleh Divisi Komunikasi &amp; Media. Tautan terverifikasi akan dipublikasikan di sini.
                </p>
                <span className="text-[11px] font-mono text-[#41C2A1]">
                  IPB University · Angkatan 62
                </span>
              </div>
            )}
          </div>

          {/* Column 4: Academic Hub & Akses Mahasiswa */}
          <div className="flex flex-col items-start gap-3">
            <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#41C2A1]">
              Academic Hub
            </h3>
            <p className="text-xs text-[#FAF9F5]/70 font-sans leading-relaxed max-w-xs">
              Portal akademik mandiri untuk silabus mata kuliah, bank latihan soal, kalender evaluasi, dan repositori belajar Statistika 62.
            </p>
            <a
              href={hubLoginUrl}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#41C2A1] hover:text-[#C9FBD4] transition-colors group mt-1"
            >
              <span>Masuk ke Academic Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="mt-4 pt-2 flex flex-col items-start gap-1">
              <span className="text-[11px] text-[#FAF9F5]/50 font-sans">
                Departemen Statistika dan Sains Data
              </span>
              <span className="text-[11px] text-[#FAF9F5]/50 font-sans">
                Fakultas Matematika dan Ilmu Pengetahuan Alam
              </span>

              {/* Back to Top */}
              <button
                type="button"
                onClick={scrollToTop}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FAF9F5]/70 hover:text-[#FFAE5D] transition-colors focus-visible:outline-2 focus-visible:outline-[#FFAE5D]"
                aria-label="Kembali ke atas halaman"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#FFAE5D]" />
                <span>Kembali ke atas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer Area (Clean and Editorial, No Dividers) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#FAF9F5]/60">
          <p>© {new Date().getFullYear()} NOVARION 62 · IPB UNIVERSITY</p>

          <p className="text-[11px] text-[#FAF9F5]/50 font-sans text-center">
            Dirancang dengan dedikasi untuk keluarga besar Novarion 62
          </p>

          <Link
            href="/privacy"
            className="hover:text-[#FFAE5D] transition-colors font-sans"
          >
            Kebijakan Privasi
          </Link>
        </div>
      </div>
    </footer>
  );
}
