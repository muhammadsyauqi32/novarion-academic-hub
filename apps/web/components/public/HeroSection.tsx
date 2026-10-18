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
    <section id="hero" className="w-full bg-[#EAEAB7] border-b border-[#112A24]/15 pt-8 pb-16 md:pt-12 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Masthead Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#112A24]/20 pb-3 mb-8 md:mb-12 text-[11px] font-mono uppercase tracking-wider text-[#112A24]/75">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#112A24] bg-[#FFAE5D] px-2 py-0.5 rounded-xs">VOL. 62</span>
            <span>/</span>
            <span>{COHORT_CONFIG.program}</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>{COHORT_CONFIG.institution}</span>
            <span>/</span>
            <span className="flex items-center gap-1 font-semibold text-[#112A24]">
              <MapPin className="w-3.5 h-3.5 text-[#FFAE5D]" />
              <span>Dramaga, Bogor</span>
            </span>
          </div>
        </div>

        {/* Asymmetrical Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Massive Editorial Typography & Cohort Manifesto */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 rounded-xs bg-[#112A24] text-[#EAEAB7] text-xs font-mono font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-xs bg-[#FFAE5D]" />
                <span>Dokumen Identitas Angkatan {COHORT_CONFIG.cohortNumber}</span>
              </div>

              <h1 className="font-heading font-black text-6xl sm:text-8xl lg:text-9xl text-[#112A24] tracking-tighter leading-[0.92]">
                NOVARION
              </h1>

              <div className="inline-block self-start bg-[#FFAE5D] text-[#112A24] px-3.5 py-1.5 rounded-xs border border-[#112A24]/20 font-heading font-bold text-xl sm:text-2xl tracking-tight">
                &ldquo;{COHORT_CONFIG.tagline}&rdquo;
              </div>
            </div>

            {/* Documentary Narrative Paragraph */}
            <div className="p-4 bg-[#FAF9F5] border border-[#112A24]/15 rounded-xs">
              <p className="text-sm sm:text-base text-[#112A24]/90 leading-relaxed font-sans">
                Sebuah ikhtiar kolektif mahasiswa Statistika dan Sains Data Angkatan 62 IPB University. Menyatukan kilau energi analitis dengan kompas kepemimpinan berintegritas tinggi untuk melangkah bersama menuntaskan tantangan akademik dan kemaslahatan bersama.
              </p>
            </div>

            {/* Editorial Navigation Index */}
            <div className="pt-2 flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#112A24]/70 font-bold">
                ARSIP DOKUMEN ANGKATAN
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <a
                  href="#tentang"
                  className="group flex items-center justify-between p-3 rounded-xs border border-[#112A24]/20 bg-[#FAF9F5] hover:bg-[#FFAE5D] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-[#112A24] font-black">[01]</span>
                    <span className="font-semibold text-[#112A24]">
                      Filosofi Nova & Orion
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#pengurus"
                  className="group flex items-center justify-between p-3 rounded-xs border border-[#112A24]/20 bg-[#FAF9F5] hover:bg-[#FFAE5D] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-[#112A24] font-black">[02]</span>
                    <span className="font-semibold text-[#112A24]">
                      Struktur Kepengurusan
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#berita"
                  className="group flex items-center justify-between p-3 rounded-xs border border-[#112A24]/20 bg-[#FAF9F5] hover:bg-[#FFAE5D] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-[#112A24] font-black">[03]</span>
                    <span className="font-semibold text-[#112A24]">
                      Warta & Catatan Kegiatan
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href="#galeri"
                  className="group flex items-center justify-between p-3 rounded-xs border border-[#112A24]/20 bg-[#FAF9F5] hover:bg-[#FFAE5D] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-[#112A24] font-black">[04]</span>
                    <span className="font-semibold text-[#112A24]">
                      Arsip Visual Memori
                    </span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#112A24] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Cohort Photograph Frame */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative border-2 border-[#112A24] bg-[#FAF9F5] p-2.5 rounded-xs shadow-md">
              {/* Archival Physical Registration Markers */}
              <div className="absolute top-1 left-1 text-[9px] font-mono text-[#112A24] font-black select-none">+</div>
              <div className="absolute top-1 right-1 text-[9px] font-mono text-[#112A24] font-black select-none">+</div>
              <div className="absolute bottom-1 left-1 text-[9px] font-mono text-[#112A24] font-black select-none">+</div>
              <div className="absolute bottom-1 right-1 text-[9px] font-mono text-[#112A24] font-black select-none">+</div>

              {/* Top Frame Label */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[#112A24]/20 text-[10px] font-mono uppercase tracking-wider text-[#112A24]">
                <span className="font-bold">ARSIP RESMI NOVARION 62</span>
                <span className="bg-[#41C2A1] text-[#112A24] px-1.5 py-0.5 font-bold rounded-xs">TERVERIFIKASI</span>
              </div>

              {/* Image Container with Sharp Corners (max 4px / rounded-xs) */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF9F5] rounded-xs mt-2 border border-[#112A24]/20">
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
                  /* Dignified Archival Empty State (Zero Technical CMS Jargon) */
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-3 bg-[#EAEAB7]/30">
                    <div className="w-12 h-12 rounded-xs bg-[#FFAE5D]/30 border border-[#112A24]/30 flex items-center justify-center text-[#112A24]">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-1 max-w-xs">
                      <span className="font-heading font-bold text-sm text-[#112A24]">
                        Dokumentasi Kolektif Angkatan
                      </span>
                      <p className="text-[11px] text-[#112A24]/70 leading-relaxed font-sans">
                        Foto resmi angkatan akan diarsipkan di sini sebagai memori visual kebersamaan Statistika 62.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Frame Metadata Caption */}
              <div className="mt-3 pt-2.5 border-t border-[#112A24]/20 flex items-center justify-between text-[10px] font-mono text-[#112A24]/80">
                <span>LAT 6.5595° S, LONG 106.7262° E</span>
                <span className="font-bold text-[#112A24]">IPB UNIVERSITY</span>
              </div>
            </div>

            {/* Micro Archival Tag */}
            <div className="flex items-center justify-between text-[11px] font-mono px-1 text-[#112A24]/70">
              <span>LEMBAR IDENTITAS NOVARION</span>
              <span>NO. REG: 62-SSD-2024</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
