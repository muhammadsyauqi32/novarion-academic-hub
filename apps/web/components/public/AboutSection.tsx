import React from 'react';
import { COHORT_CONFIG } from '@/lib/config/cohort';
import { Compass, Sparkles, Users, Award } from 'lucide-react';

export function AboutSection() {
  const { philosophy, values } = COHORT_CONFIG;

  return (
    <section id="tentang" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/60 scroll-mt-16">
      {/* Section Header */}
      <div className="flex flex-col items-start gap-3 max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-deep">
          Tentang Angkatan
        </span>
        <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
          Menyatukan Cahaya, Menentukan Arah Masa Depan
        </h2>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          {philosophy.summary}
        </p>
      </div>

      {/* Asymmetrical Editorial Composition: Nova & Orion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Nova Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border hover:border-[#41C2A1]/40 transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#C9FBD4]/60 border border-[#41C2A1]/30 flex items-center justify-center text-teal-deep mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="font-heading font-black text-2xl text-text-primary">
                {philosophy.nova.term}
              </h3>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                — Kilau Cahaya
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              {philosophy.nova.meaning}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-teal-deep">
            <span>Energi & Potensi Akademik Kolektif</span>
          </div>
        </div>

        {/* Orion Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border hover:border-[#FFAE5D]/40 transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FFAE5D]/15 border border-[#FFAE5D]/30 flex items-center justify-center text-[#B54708] mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="font-heading font-black text-2xl text-text-primary">
                {philosophy.orion.term}
              </h3>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                — Penunjuk Arah
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              {philosophy.orion.meaning}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-[#B54708]">
            <span>Kepemimpinan Berbasis Integritas & Data</span>
          </div>
        </div>
      </div>

      {/* Synthesis Callout */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-soft border border-border text-center max-w-3xl mx-auto mb-16 shadow-2xs">
        <p className="font-heading font-bold text-base sm:text-lg text-text-primary leading-relaxed">
          &ldquo;{philosophy.synthesis}&rdquo;
        </p>
      </div>

      {/* 3 Core Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {values.map((v, i) => (
          <div key={i} className="p-5 sm:p-6 rounded-xl bg-surface border border-border/80 flex flex-col gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.accent }} />
            <h4 className="font-heading font-bold text-base text-text-primary">
              {v.title}
            </h4>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {v.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
