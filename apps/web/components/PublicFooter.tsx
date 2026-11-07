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
        return <Instagram className="w-4 h-4 shrink-0 text-brand-orange" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 shrink-0 text-brand-orange" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 shrink-0 text-brand-orange" />;
      default:
        return (
          <span className="w-4 h-4 shrink-0 font-mono text-xs font-bold text-brand-orange flex items-center justify-center">
            #
          </span>
        );
    }
  };

  return (
    <footer className="w-full bg-[#0A1311] py-16 md:py-20 text-[#FAF9F5] border-t border-white/10 transition-colors duration-200">
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
            <p className="text-xs font-mono font-bold text-brand-orange tracking-wide">
              &ldquo;Kita Satu, Kita Bisa!&rdquo;
            </p>
            <p className="text-xs text-[#FAF9F5]/70 font-sans leading-relaxed max-w-xs mt-1">
              Website angkatan mahasiswa Statistika dan Sains Data Angkatan 62 IPB University. Memuat info kegiatan, materi kuliah, dan dokumentasi angkatan.
            </p>
          </div>

          {/* Column 2: Jelajahi */}
          <div className="flex flex-col items-start gap-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-orange">
              Jelajahi
            </h3>
            <nav className="flex flex-col gap-2.5 text-xs font-sans font-medium text-[#FAF9F5]/80" aria-label="Navigasi footer">
              <a href="#tentang" className="hover:text-brand-orange transition-colors focus-visible:outline-2 focus-visible:outline-teal-deep">
                Tentang
              </a>
              <a href="#pengurus" className="hover:text-brand-orange transition-colors focus-visible:outline-2 focus-visible:outline-teal-deep">
                Pengurus
              </a>
              <a href="#berita" className="hover:text-brand-orange transition-colors focus-visible:outline-2 focus-visible:outline-teal-deep">
                Kabar Angkatan
              </a>
              <a href="#galeri" className="hover:text-brand-orange transition-colors focus-visible:outline-2 focus-visible:outline-teal-deep">
                Galeri Momen
              </a>
              <a href="#prestasi" className="hover:text-brand-orange transition-colors focus-visible:outline-2 focus-visible:outline-teal-deep">
                Lembar Kehormatan
              </a>
            </nav>
          </div>

          {/* Column 3: Media Sosial */}
          <div className="flex flex-col items-start gap-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-orange">
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
                    className="group inline-flex items-center gap-2 text-[#FAF9F5]/80 hover:text-brand-orange transition-colors"
                  >
                    {getSocialIcon(social.platform)}
                    <span className="font-medium">{social.name}</span>
                    {social.handle && (
                      <span className="text-[11px] font-mono text-[#FAF9F5]/50 group-hover:text-brand-orange/75 transition-colors">
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
                <span className="text-[11px] font-mono text-brand-primary">
                  IPB University / Angkatan 62
                </span>
              </div>
            )}
          </div>

          {/* Column 4: Academic Hub & Akses Mahasiswa */}
          <div className="flex flex-col items-start gap-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-brand-primary">
              Academic Hub
            </h3>
            <p className="text-xs text-[#FAF9F5]/70 font-sans leading-relaxed max-w-xs">
              Portal belajar untuk mengecek jadwal kuliah, mengunduh bahan praktikum, dan mengelola tenggat tugas.
            </p>
            <a
              href={hubLoginUrl}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-mint-soft transition-colors group mt-1"
            >
              <span>Masuk ke Academic Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="mt-4 pt-2 flex flex-col items-start gap-1">
              <span className="text-[11px] text-[#FAF9F5]/50 font-sans">
                Departemen Statistika dan Sains Data
              </span>
              <span className="text-[11px] text-[#FAF9F5]/50 font-sans">
                FMIPA IPB University
              </span>

              {/* Back to Top */}
              <button
                type="button"
                onClick={scrollToTop}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FAF9F5]/70 hover:text-brand-orange transition-colors focus-visible:outline-2 focus-visible:outline-teal-deep"
                aria-label="Kembali ke atas halaman"
              >
                <ArrowUp className="w-3.5 h-3.5 text-brand-orange" />
                <span>Kembali ke atas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#FAF9F5]/60">
          <p>© {new Date().getFullYear()} NOVARION 62 / IPB UNIVERSITY</p>

          <p className="text-[11px] text-[#FAF9F5]/50 font-sans text-center">
            Dikelola bersama untuk angkatan Novarion 62
          </p>

          <Link
            href="/privacy"
            className="hover:text-brand-orange transition-colors font-sans text-xs"
          >
            Kebijakan Privasi
          </Link>
        </div>
      </div>
    </footer>
  );
}
