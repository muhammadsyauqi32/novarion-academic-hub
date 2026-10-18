import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Camera } from 'lucide-react';
import { CMSHero } from '@novarion/shared';
import { COHORT_CONFIG } from '@/lib/config/cohort';

interface HeroSectionProps {
  hero: CMSHero | null;
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section id="hero" className="w-full bg-[#EAEAB7] border-b border-[#112A24]/10 pt-8 pb-16 md:pt-12 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cohort Identity Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#112A24]/10 pb-3 mb-8 md:mb-12 text-xs font-sans text-[#112A24]/80">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#112A24]">{COHORT_CONFIG.program}</span>
            <span className="text-[#112A24]/40">•</span>
            <span>Angkatan {COHORT_CONFIG.cohortNumber}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span>{COHORT_CONFIG.institution}</span>
            <span className="text-[#112A24]/40">•</span>
            <span className="flex items-center gap-1 font-medium text-[#112A24]">
              <MapPin className="w-3.5 h-3.5 text-[#FFAE5D]" />
              <span>Dramaga, Bogor</span>
            </span>
          </div>
        </div>

        {/* Asymmetrical Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Typography & Cohort Motto */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="font-heading font-black text-6xl sm:text-8xl lg:text-9xl text-[#112A24] tracking-tighter leading-[0.92]">
                NOVARION
              </h1>

              <div className="inline-block self-start bg-[#FFAE5D] text-[#112A24] px-3.5 py-1.5 rounded-xs border border-[#112A24]/15 font-heading font-bold text-xl sm:text-2xl tracking-tight">
                &ldquo;{COHORT_CONFIG.tagline}&rdquo;
              </div>
            </div>

            {/* Documentary Narrative Paragraph */}
            <div className="p-4 bg-[#FAF9F5] border border-[#112A24]/10 rounded-xs">
              <p className="text-sm sm:text-base text-[#112A24]/90 leading-relaxed font-sans">
                Sebuah ikhtiar kolektif mahasiswa Statistika dan Sains Data Angkatan 62 IPB University. Menyatukan kilau energi analitis dengan kompas kepemimpinan berintegritas tinggi untuk melangkah bersama menuntaskan tantangan akademik dan kemaslahatan bersama.
              </p>
            </div>

            {/* Quick Links Navigation */}
            <div className="pt-2 flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#112A24]/75">
                Jelajahi Angkatan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <a
                  href="#tentang"
                  className="group flex items-center justify-between p-3 rounded-xs border border-[#112A24]/15 bg-[#FAF9F5] hover:bg-[#FFAE5D] transition-colors"
                >
                  <span className="font-semibold text-[#112A24]">
                    Tentang Novarion
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#pengurus"
                  className="group flex items-center justify-between p-3 rounded-xs border border-[#112A24]/15 bg-[#FAF9F5] hover:bg-[#FFAE5D] transition-colors"
                >
                  <span className="font-semibold text-[#112A24]">
                    Pengurus Angkatan
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#berita"
                  className="group flex items-center justify-between p-3 rounded-xs border border-[#112A24]/15 bg-[#FAF9F5] hover:bg-[#FFAE5D] transition-colors"
                >
                  <span className="font-semibold text-[#112A24]">
                    Berita dan Kegiatan
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#galeri"
                  className="group flex items-center justify-between p-3 rounded-xs border border-[#112A24]/15 bg-[#FAF9F5] hover:bg-[#FFAE5D] transition-colors"
                >
                  <span className="font-semibold text-[#112A24]">
                    Galeri dan Dokumentasi
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Cohort Photograph Frame */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative border border-[#112A24]/20 bg-[#FAF9F5] p-3 rounded-xs shadow-xs">
              {/* Top Frame Label */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-[#112A24]/10 text-xs font-medium text-[#112A24]">
                <span className="font-semibold">Dokumentasi Angkatan 62</span>
                <span className="bg-[#41C2A1] text-[#112A24] px-2 py-0.5 text-[11px] font-semibold rounded-xs">Statistika IPB</span>
              </div>

              {/* Image Container with Sharp Corners (max 4px / rounded-xs) */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF9F5] rounded-xs mt-2 border border-[#112A24]/10">
                {hero?.imageUrl ? (
                  <Image
                    src={hero.imageUrl}
                    alt="Foto Bersama Angkatan Novarion 62"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 45vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-3 bg-[#EAEAB7]/30">
                    <div className="w-12 h-12 rounded-xs bg-[#FFAE5D]/30 border border-[#112A24]/30 flex items-center justify-center text-[#112A24]">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-1 max-w-xs">
                      <span className="font-heading font-bold text-sm text-[#112A24]">
                        Dokumentasi Kolektif Angkatan
                      </span>
                      <p className="text-xs text-[#112A24]/70 leading-relaxed font-sans">
                        Foto resmi angkatan akan diarsipkan di sini sebagai memori visual kebersamaan Statistika 62.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Frame Caption */}
              <div className="mt-3 pt-2.5 border-t border-[#112A24]/10 flex items-center justify-between text-xs text-[#112A24]/75">
                <span>Departemen Statistika dan Sains Data</span>
                <span className="font-semibold text-[#112A24]">FMIPA IPB University</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
