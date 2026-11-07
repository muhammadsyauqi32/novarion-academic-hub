'use client';

import React from 'react';
import Image from 'next/image';
import { CMSHero } from '@novarion/shared';
import { COHORT_CONFIG } from '@/lib/config/cohort';
import { getHubLoginUrl } from '@/lib/links';

interface HeroSectionProps {
  hero: CMSHero | null;
}

export function HeroSection({ hero }: HeroSectionProps) {
  const photoUrl = hero?.imageUrl || '/foto_angkatan.jpeg';
  const hubLoginUrl = getHubLoginUrl();

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex flex-col justify-between pt-24 pb-8 md:pt-28 md:pb-10 scroll-mt-0 overflow-hidden bg-[#0A1311] text-[#FAF9F5] border-b border-white/10"
    >
      {/* Background Layer: Authentic Cohort Photograph with Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <Image
          src={photoUrl}
          alt={hero?.title || 'Foto Bersama Mahasiswa Novarion 62 Statistika dan Sains Data IPB'}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.01]"
          style={{
            objectPosition: `${hero?.focalPointX || '50%'} ${hero?.focalPointY || '45%'}`,
          }}
        />
        {/* Contrast Scrim: Preserves authentic photo visibility while guaranteeing AAA text readability */}
        <div className="absolute inset-0 bg-[#0A1311]/75 backdrop-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1311] via-transparent to-[#0A1311]/60" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-between flex-1 gap-10">
        <div className="max-w-3xl my-auto py-8 sm:py-12 flex flex-col gap-5">
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#C9FBD4]">
            Statistika dan Sains Data / IPB University Angkatan 62
          </span>

          <div className="flex flex-col gap-2">
            <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-[6rem] tracking-tighter leading-[0.92] text-[#FAF9F5]">
              {COHORT_CONFIG.name}
            </h1>
            <p className="font-heading font-bold text-xl sm:text-2xl md:text-3xl tracking-tight text-[#FFAE5D]">
              &ldquo;{COHORT_CONFIG.tagline}&rdquo;
            </p>
          </div>

          <p className="text-base sm:text-lg leading-relaxed font-sans text-[#FAF9F5]/90 max-w-2xl">
            Website resmi mahasiswa Statistika dan Sains Data Angkatan 62 IPB University. Wadah informasi perkuliahan di Dramaga, bank materi dan tugas, dokumentasi kegiatan, serta kabar seputar angkatan.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <a
              href={hubLoginUrl}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-input bg-brand-primary text-brand-foreground font-sans text-xs sm:text-sm font-bold hover:bg-[#C9FBD4] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep"
            >
              Buka Academic Hub
            </a>

            <a
              href="#tentang"
              className="inline-flex items-center justify-center px-5 py-3.5 rounded-input bg-white/[0.08] hover:bg-white/[0.14] text-[#FAF9F5] border border-white/20 font-sans text-xs sm:text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep"
            >
              Tentang Novarion
            </a>
          </div>
        </div>

        {/* Bottom Metadata Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs font-sans text-[#FAF9F5]/75">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#C9FBD4] block">
              Program Studi
            </span>
            <span className="font-semibold text-[#FAF9F5] mt-0.5 block">
              S1 Statistika dan Sains Data (Angkatan 62)
            </span>
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAB7] block">
              Fakultas &amp; Departemen
            </span>
            <span className="font-semibold text-[#FAF9F5] mt-0.5 block">
              Departemen Statistika dan Sains Data, FMIPA IPB
            </span>
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#FFAE5D] block">
              Lokasi Kampus
            </span>
            <span className="font-semibold text-[#FAF9F5] mt-0.5 block">
              Kampus IPB Dramaga, Bogor
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
