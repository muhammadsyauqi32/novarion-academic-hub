import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Compass, Sparkles, MapPin } from 'lucide-react';
import { CMSHero } from '@novarion/shared';
import { COHORT_CONFIG } from '@/lib/config/cohort';

interface HeroSectionProps {
  hero: CMSHero | null;
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section id="hero" className="relative pt-6 pb-16 md:pt-10 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Editorial subtle atmospheric wash using cohort palette */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-gradient-to-br from-[#C9FBD4]/35 via-[#EAEAB7]/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Editorial Masthead Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3 mb-8 md:mb-12 text-[11px] font-mono uppercase tracking-wider text-text-muted">
        <div className="flex items-center gap-3">
          <span className="font-bold text-teal-deep tracking-widest">VOL. 62</span>
          <span>•</span>
          <span>{COHORT_CONFIG.program}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>{COHORT_CONFIG.institution}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-teal-deep">
            <MapPin className="w-3 h-3" />
            <span>Dramaga, Bogor</span>
          </span>
        </div>
      </div>

      {/* Asymmetrical Editorial Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Bold Editorial Typography & Cohort Manifesto */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#EAEAB7]/40 border border-[#EAEAB7] text-[#7A5B0B] text-xs font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FFAE5D]" />
              <span>Angkatan {COHORT_CONFIG.cohortNumber} · Dokumen Identitas Kolektif</span>
            </div>

            <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl text-text-primary tracking-tight leading-[0.95]">
              NOVARION
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-heading font-bold text-2xl sm:text-3xl text-teal-deep tracking-tight">
                &ldquo;{COHORT_CONFIG.tagline}&rdquo;
              </span>
            </div>
          </div>

          {/* Documentary Narrative Paragraph */}
          <div className="border-l-2 border-[#41C2A1] pl-4 py-1 flex flex-col gap-2">
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-sans">
              Sebuah ikhtiar kolektif mahasiswa Statistika dan Sains Data Angkatan 62 IPB University. Menyatukan kilau energi analitis dengan kompas kepemimpinan berintegritas tinggi—melangkah bersama menaklukkan tantangan sains data untuk kemaslahatan almamater dan bangsa.
            </p>
          </div>

          {/* Editorial Navigation Index */}
          <div className="pt-2 flex flex-col gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/80">
              ARSIP DOKUMEN ANGKATAN
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="#tentang"
                className="group flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-teal-deep/60 hover:bg-teal-deep/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-teal-deep font-bold">01</span>
                  <span className="font-semibold text-text-primary group-hover:text-teal-deep transition-colors">
                    Filosofi Nova & Orion
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-deep group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              <a
                href="#pengurus"
                className="group flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-teal-deep/60 hover:bg-teal-deep/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-teal-deep font-bold">02</span>
                  <span className="font-semibold text-text-primary group-hover:text-teal-deep transition-colors">
                    Struktur Kepengurusan
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-deep group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              <a
                href="#berita"
                className="group flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-teal-deep/60 hover:bg-teal-deep/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-teal-deep font-bold">03</span>
                  <span className="font-semibold text-text-primary group-hover:text-teal-deep transition-colors">
                    Warta & Catatan Kegiatan
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-deep group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              <a
                href="#galeri"
                className="group flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-teal-deep/60 hover:bg-teal-deep/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-teal-deep font-bold">04</span>
                  <span className="font-semibold text-text-primary group-hover:text-teal-deep transition-colors">
                    Arsip Foto & Jejak Langkah
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-deep group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Dominant Editorial Photograph Frame */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="relative rounded-2xl p-2 bg-surface border border-border shadow-md">
            {/* Corner aesthetic registration marks */}
            <span className="absolute -top-1.5 -left-1.5 text-xs text-text-muted font-mono leading-none select-none">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-text-muted font-mono leading-none select-none">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-text-muted font-mono leading-none select-none">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-text-muted font-mono leading-none select-none">+</span>

            <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] rounded-xl overflow-hidden bg-surface-soft border border-border/70">
              {hero && hero.imageUrl ? (
                <Image
                  src={hero.imageUrl}
                  alt={hero.title || 'Foto Angkatan Novarion 62'}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
                  style={{
                    objectPosition: `${hero.focalPointX || '50%'} ${hero.focalPointY || '50%'}`,
                  }}
                />
              ) : (
                /* Dignified editorial yearbook placeholder without exposing CMS backend details */
                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-b from-[#C9FBD4]/20 via-surface-soft to-surface border border-border/50">
                  <div className="flex items-center justify-between text-[10px] font-mono text-teal-deep font-semibold uppercase tracking-wider">
                    <span>ARCHIVE FRAME #01</span>
                    <span>STAT-62-IPB</span>
                  </div>

                  <div className="flex flex-col items-center text-center my-auto gap-4 py-8">
                    <div className="w-16 h-16 rounded-2xl bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center text-teal-deep">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col gap-1 max-w-xs">
                      <h2 className="font-heading font-black text-xl text-text-primary tracking-tight">
                        NOVARION 62
                      </h2>
                      <p className="text-xs text-teal-deep font-semibold">
                        Statistika dan Sains Data
                      </p>
                      <p className="text-[11px] text-text-muted leading-relaxed mt-1">
                        Institut Pertanian Bogor · Kampus Dramaga
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[10px] font-mono text-text-muted">
                    <span>LAT 6.5595° S</span>
                    <span>LONG 106.7262° E</span>
                  </div>
                </div>
              )}
            </div>

            {/* Photo metadata strip */}
            <div className="flex items-center justify-between px-2 pt-2 text-[10px] font-mono text-text-muted">
              <span>{hero?.title || 'DOKUMENTASI ANGKATAN 62'}</span>
              <span>{hero?.subtitle || 'FMIPA IPB'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
