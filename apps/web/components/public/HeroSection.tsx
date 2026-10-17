import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { ArrowRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { CMSHero } from '@novarion/shared';
import { COHORT_CONFIG } from '@/lib/config/cohort';

interface HeroSectionProps {
  hero: CMSHero | null;
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section id="hero" className="relative pt-8 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* Restrained identity atmosphere utilizing brand colors */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[340px] bg-gradient-to-b from-[#C9FBD4]/30 via-[#EAEAB7]/15 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6">
        {/* Cohort Identity Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-soft border border-border text-teal-deep text-xs font-semibold tracking-wider shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#41C2A1] animate-pulse" />
          <span>{COHORT_CONFIG.program} · Angkatan {COHORT_CONFIG.cohortNumber} · {COHORT_CONFIG.institution}</span>
        </div>

        {/* Main Headline & Tagline */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-text-primary tracking-tight leading-[1.08]">
            {COHORT_CONFIG.name}
          </h1>
          <p className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-teal-deep tracking-tight">
            &ldquo;{COHORT_CONFIG.tagline}&rdquo;
          </p>
        </div>

        {/* Authentic Supporting Narrative */}
        <p className="text-sm sm:text-base md:text-lg text-text-muted max-w-2xl leading-relaxed">
          {COHORT_CONFIG.philosophy.synthesis}
        </p>

        {/* Primary and Secondary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
          <a href="#tentang">
            <Button variant="primary" size="lg" className="shadow-xs text-xs sm:text-sm font-bold py-3 px-6">
              <span>Tentang Kita</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
          <a href="#galeri">
            <Button variant="secondary" size="lg" className="text-xs sm:text-sm font-semibold py-3 px-6 border-border">
              <span>Jelajahi Momen</span>
            </Button>
          </a>
        </div>

        {/* Editorial Hero Photograph */}
        <div className="w-full mt-6 md:mt-10">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-border/80 shadow-md bg-surface-soft">
            {hero && hero.imageUrl ? (
              <Image
                src={hero.imageUrl}
                alt={hero.title || 'Foto Angkatan Novarion 62 Statistika IPB'}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.01]"
                style={{
                  objectPosition: `${hero.focalPointX || '50%'} ${hero.focalPointY || '50%'}`,
                }}
              />
            ) : (
              /* Deliberate Neutral Editorial Placeholder (Authentic fallback until cohort photo is uploaded via CMS) */
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-surface to-surface-soft border border-dashed border-border/70">
                <div className="w-14 h-14 rounded-2xl bg-[#41C2A1]/10 border border-[#41C2A1]/20 flex items-center justify-center mb-3 text-teal-deep">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-text-primary">
                  Dokumentasi Resmi Angkatan 62
                </h3>
                <p className="text-xs sm:text-sm text-text-muted max-w-md mt-1.5">
                  Foto utama angkatan dapat dikonfigurasi langsung oleh Administrator melalui CMS Hero Manager tanpa perlu deploy ulang.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-teal-deep bg-surface px-3 py-1.5 rounded-lg border border-border">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Foto Asli Akan Ditampilkan di Sini</span>
                </div>
              </div>
            )}
          </div>
          {hero && hero.title && (
            <p className="text-xs text-text-muted mt-2.5 text-right font-medium italic">
              {hero.title} {hero.subtitle ? `— ${hero.subtitle}` : ''}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
