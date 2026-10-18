'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { CMSHero } from '@novarion/shared';
import { COHORT_CONFIG } from '@/lib/config/cohort';
import { Reveal } from './Reveal';

interface HeroSectionProps {
  hero: CMSHero | null;
}

export function HeroSection({ hero }: HeroSectionProps) {
  // Use CMS uploaded hero image if present, or fallback to real uploaded cohort photo
  const photoUrl = hero?.imageUrl || '/foto_angkatan.jpeg';
  const hasPhoto = Boolean(photoUrl);

  return (
    <section
      id="hero"
      className="relative w-full min-h-[92vh] flex flex-col justify-between pt-24 pb-14 md:pt-32 md:pb-20 scroll-mt-0 overflow-hidden bg-[#112A24]"
    >
      {/* Full-Bleed Cohort Photograph Background */}
      {hasPhoto && (
        <div className="absolute inset-0 z-0">
          <Image
            src={photoUrl}
            alt={hero?.title || 'Foto Angkatan Novarion 62 Statistika IPB'}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: `${hero?.focalPointX || '50%'} ${hero?.focalPointY || '50%'}`,
            }}
          />
          {/* Dual-tone gradient scrim ensuring high contrast & brand harmony */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#112A24] via-[#112A24]/75 to-[#112A24]/45" />
        </div>
      )}

      {/* Main Content Container (No Nested Boxes) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-between flex-1 gap-8 text-[#FAF9F5]">
        {/* Cohort Identity Bar */}
        <Reveal yOffset={12}>
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm sm:text-base tracking-tight text-[#FAF9F5]">
                {COHORT_CONFIG.program}
              </span>
              <span className="font-semibold text-xs opacity-85">
                Angkatan {COHORT_CONFIG.cohortNumber}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs opacity-85">
              <span>{COHORT_CONFIG.institution}</span>
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#FFAE5D]" />
                <span>Dramaga, Bogor</span>
              </span>
            </div>
          </div>
        </Reveal>

        {/* Central Typographic Composition (Flat, Confident, Zero Box-Within-Box) */}
        <div className="flex flex-col gap-5 max-w-4xl my-auto">
          <Reveal delayMs={100} yOffset={16}>
            <div className="flex flex-col gap-3">
              <h1 className="font-heading font-black text-6xl sm:text-8xl lg:text-9xl tracking-tighter leading-[0.92] text-[#FAF9F5]">
                NOVARION
              </h1>

              <div className="font-heading font-bold text-2xl sm:text-4xl tracking-tight text-[#FFAE5D]">
                &ldquo;{COHORT_CONFIG.tagline}&rdquo;
              </div>
            </div>
          </Reveal>

          {/* Documentary Narrative (Plain text without enclosing box) */}
          <Reveal delayMs={180} yOffset={16}>
            <p className="text-base sm:text-lg max-w-2xl leading-relaxed font-sans text-[#FAF9F5]/90">
              Sebuah ikhtiar kolektif mahasiswa Statistika dan Sains Data Angkatan 62 IPB University. Menyatukan kilau energi analitis dengan kompas kepemimpinan berintegritas tinggi untuk melangkah bersama menuntaskan tantangan akademik dan kemaslahatan bersama.
            </p>
          </Reveal>

          {/* Quick Links Navigation */}
          <Reveal delayMs={240} yOffset={16}>
            <div className="pt-2 flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-[#FAF9F5]/75">
                Jelajahi Angkatan
              </span>
              <div className="flex flex-wrap gap-2.5 text-xs">
                <a
                  href="#tentang"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-xs bg-[#FAF9F5]/15 text-[#FAF9F5] hover:bg-[#FFAE5D] hover:text-[#112A24]"
                >
                  <span>Tentang Novarion</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#pengurus"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-xs bg-[#FAF9F5]/15 text-[#FAF9F5] hover:bg-[#FFAE5D] hover:text-[#112A24]"
                >
                  <span>Pengurus Angkatan</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#berita"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-xs bg-[#FAF9F5]/15 text-[#FAF9F5] hover:bg-[#FFAE5D] hover:text-[#112A24]"
                >
                  <span>Berita dan Kegiatan</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#galeri"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-xs bg-[#FAF9F5]/15 text-[#FAF9F5] hover:bg-[#FFAE5D] hover:text-[#112A24]"
                >
                  <span>Galeri dan Dokumentasi</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#prestasi"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-xs bg-[#FAF9F5]/15 text-[#FAF9F5] hover:bg-[#FFAE5D] hover:text-[#112A24]"
                >
                  <span>Prestasi Angkatan</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom Editorial Caption */}
        <div className="flex items-center justify-between text-xs opacity-75 pt-4">
          <span>Departemen Statistika dan Sains Data</span>
          <span className="font-semibold">FMIPA IPB University</span>
        </div>
      </div>
    </section>
  );
}
