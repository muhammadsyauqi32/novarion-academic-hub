'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Camera } from 'lucide-react';
import { CMSHero } from '@novarion/shared';
import { COHORT_CONFIG } from '@/lib/config/cohort';
import { Reveal } from './Reveal';

interface HeroSectionProps {
  hero: CMSHero | null;
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section id="hero" className="w-full bg-[#EAEAB7] pt-8 pb-16 md:pt-12 md:pb-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cohort Identity Bar (Typographic composition without bullet separators or horizontal lines) */}
        <Reveal yOffset={12}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 md:mb-12 text-xs font-sans text-[#112A24]/85">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#112A24] text-sm sm:text-base tracking-tight">
                {COHORT_CONFIG.program}
              </span>
              <span className="px-2.5 py-0.5 rounded-xs bg-[#FAF9F5] text-[#112A24] font-semibold text-xs shadow-2xs">
                Angkatan {COHORT_CONFIG.cohortNumber}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <span className="font-medium text-[#112A24]/80">{COHORT_CONFIG.institution}</span>
              <span className="flex items-center gap-1 font-semibold text-[#112A24]">
                <MapPin className="w-3.5 h-3.5 text-[#FFAE5D]" />
                <span>Dramaga, Bogor</span>
              </span>
            </div>
          </div>
        </Reveal>

        {/* Asymmetrical Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Typography & Cohort Motto */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Reveal delayMs={100} yOffset={16}>
              <div className="flex flex-col gap-4">
                <h1 className="font-heading font-black text-6xl sm:text-8xl lg:text-9xl text-[#112A24] tracking-tighter leading-[0.92]">
                  NOVARION
                </h1>

                <div className="inline-block self-start bg-[#FFAE5D] text-[#112A24] px-4 py-2 rounded-xs font-heading font-bold text-xl sm:text-2xl tracking-tight shadow-xs">
                  &ldquo;{COHORT_CONFIG.tagline}&rdquo;
                </div>
              </div>
            </Reveal>

            {/* Documentary Narrative Paragraph */}
            <Reveal delayMs={180} yOffset={16}>
              <div className="p-5 bg-[#FAF9F5] rounded-xs shadow-xs">
                <p className="text-sm sm:text-base text-[#112A24]/90 leading-relaxed font-sans">
                  Sebuah ikhtiar kolektif mahasiswa Statistika dan Sains Data Angkatan 62 IPB University. Menyatukan kilau energi analitis dengan kompas kepemimpinan berintegritas tinggi untuk melangkah bersama menuntaskan tantangan akademik dan kemaslahatan bersama.
                </p>
              </div>
            </Reveal>

            {/* Quick Links Navigation */}
            <Reveal delayMs={260} yOffset={16}>
              <div className="pt-2 flex flex-col gap-2.5">
                <span className="text-xs font-semibold text-[#112A24]/75">
                  Jelajahi Angkatan
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <a
                    href="#tentang"
                    className="group flex items-center justify-between p-3.5 rounded-xs bg-[#FAF9F5] hover:bg-[#FFAE5D] hover:-translate-y-1 shadow-xs transition-all duration-200"
                  >
                    <span className="font-semibold text-[#112A24]">
                      Tentang Novarion
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  <a
                    href="#pengurus"
                    className="group flex items-center justify-between p-3.5 rounded-xs bg-[#FAF9F5] hover:bg-[#FFAE5D] hover:-translate-y-1 shadow-xs transition-all duration-200"
                  >
                    <span className="font-semibold text-[#112A24]">
                      Pengurus Angkatan
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  <a
                    href="#berita"
                    className="group flex items-center justify-between p-3.5 rounded-xs bg-[#FAF9F5] hover:bg-[#FFAE5D] hover:-translate-y-1 shadow-xs transition-all duration-200"
                  >
                    <span className="font-semibold text-[#112A24]">
                      Berita dan Kegiatan
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  <a
                    href="#galeri"
                    className="group flex items-center justify-between p-3.5 rounded-xs bg-[#FAF9F5] hover:bg-[#FFAE5D] hover:-translate-y-1 shadow-xs transition-all duration-200"
                  >
                    <span className="font-semibold text-[#112A24]">
                      Galeri dan Dokumentasi
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Cohort Photograph Frame */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <Reveal delayMs={200} yOffset={20}>
              <div className="relative bg-[#FAF9F5] p-4 rounded-xs shadow-sm flex flex-col gap-3">
                {/* Top Frame Label */}
                <div className="flex items-center justify-between px-1 text-xs font-medium text-[#112A24]">
                  <span className="font-bold tracking-tight">Dokumentasi Angkatan 62</span>
                  <span className="bg-[#41C2A1] text-[#112A24] px-2.5 py-0.5 text-[11px] font-bold rounded-xs shadow-2xs">
                    Statistika IPB
                  </span>
                </div>

                {/* Image Container with Sharp Corners */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF9F5] rounded-xs group">
                  {hero?.imageUrl ? (
                    <Image
                      src={hero.imageUrl}
                      alt="Foto Bersama Angkatan Novarion 62"
                      fill
                      priority
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 45vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-3 bg-[#EAEAB7]/40 rounded-xs">
                      <div className="w-12 h-12 rounded-xs bg-[#FFAE5D]/40 flex items-center justify-center text-[#112A24] shadow-2xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span className="font-heading font-bold text-sm text-[#112A24]">
                          Dokumentasi Kolektif Angkatan
                        </span>
                        <p className="text-xs text-[#112A24]/75 leading-relaxed font-sans">
                          Foto resmi angkatan diarsipkan di sini sebagai memori visual kebersamaan Statistika 62.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Frame Caption */}
                <div className="px-1 flex items-center justify-between text-xs text-[#112A24]/80">
                  <span className="font-sans">Departemen Statistika dan Sains Data</span>
                  <span className="font-semibold text-[#112A24]">FMIPA IPB University</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
