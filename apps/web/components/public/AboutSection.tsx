'use client';

import React from 'react';
import { COHORT_CONFIG } from '@/lib/config/cohort';
import { Reveal } from './Reveal';

export function AboutSection() {
  const { philosophy, values } = COHORT_CONFIG;

  return (
    <section id="tentang" className="w-full bg-[#41C2A1] py-16 md:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontally Centered Section Header */}
        <Reveal yOffset={16}>
          <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col items-center gap-3">
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#112A24] tracking-tight leading-tight">
              Tentang Novarion
            </h2>
            <p className="text-sm sm:text-base text-[#112A24]/90 max-w-xl mx-auto leading-relaxed font-sans font-medium">
              {philosophy.summary}
            </p>
          </div>
        </Reveal>

        {/* Typographic Compositions (Nova & Orion) - Flat hierarchy, zero nested boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Nova Composition */}
          <Reveal delayMs={100} yOffset={20}>
            <div className="relative p-7 sm:p-10 rounded-xs bg-[#112A24] text-[#EAEAB7] overflow-hidden flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-all duration-300 h-full">
              <div className="font-mono text-7xl sm:text-9xl font-black text-[#41C2A1]/15 leading-none select-none pointer-events-none mb-4">
                NOVA
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <span className="text-xs font-mono font-bold text-[#41C2A1] tracking-wider uppercase">
                  Energi & Daya Nalar
                </span>

                <div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#EAEAB7] tracking-tight mb-2">
                    {philosophy.nova.term}: Kilau Inovasi
                  </h3>
                  <p className="text-sm text-[#EAEAB7]/90 leading-relaxed font-sans">
                    {philosophy.nova.meaning}
                  </p>
                </div>

                {/* Plain typographic footnote without nested box */}
                <p className="text-xs text-[#C9FBD4] font-mono leading-relaxed pt-2">
                  Simbol ledakan ide, kecerdasan komputasional, dan ketajaman berpikir analitis.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Orion Composition */}
          <Reveal delayMs={180} yOffset={20}>
            <div className="relative p-7 sm:p-10 rounded-xs bg-[#EAEAB7] text-[#112A24] overflow-hidden flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-all duration-300 h-full">
              <div className="font-mono text-7xl sm:text-9xl font-black text-[#FFAE5D]/35 leading-none select-none pointer-events-none mb-4">
                ORION
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <span className="text-xs font-mono font-bold text-[#112A24] tracking-wider uppercase">
                  Kompas & Kepemimpinan
                </span>

                <div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#112A24] tracking-tight mb-2">
                    {philosophy.orion.term}: Panduan Arah
                  </h3>
                  <p className="text-sm text-[#112A24]/90 leading-relaxed font-sans">
                    {philosophy.orion.meaning}
                  </p>
                </div>

                {/* Plain typographic footnote without nested box */}
                <p className="text-xs text-[#112A24]/85 font-mono leading-relaxed pt-2">
                  Kompas moral, etika pengolahan informasi, dan kepemimpinan visioner.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Synthesis Quote */}
        <Reveal delayMs={150} yOffset={16}>
          <div className="py-6 px-4 mb-12 text-center">
            <blockquote className="font-heading font-bold text-xl sm:text-3xl text-[#112A24] tracking-tight leading-relaxed max-w-3xl mx-auto">
              &ldquo;{philosophy.synthesis}&rdquo;
            </blockquote>
          </div>
        </Reveal>

        {/* Core Values (No decorative number boxes, clean flat card composition) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <Reveal key={i} delayMs={120 + i * 80} yOffset={16}>
              <div className="p-7 rounded-xs bg-[#FAF9F5] shadow-xs hover:-translate-y-1 transition-all duration-300 flex flex-col gap-2.5 h-full">
                {/* Plain text label without box */}
                <span className="font-mono text-xs font-bold text-[#112A24]/60">
                  Prinsip 0{i + 1}
                </span>
                <h4 className="font-heading font-black text-lg text-[#112A24] tracking-tight">
                  {v.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#112A24]/85 leading-relaxed font-sans">
                  {v.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
