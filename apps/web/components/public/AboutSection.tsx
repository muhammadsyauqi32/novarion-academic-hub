import React from 'react';
import { COHORT_CONFIG } from '@/lib/config/cohort';

export function AboutSection() {
  const { philosophy, values } = COHORT_CONFIG;

  return (
    <section id="tentang" className="w-full bg-[#41C2A1] border-b border-[#112A24]/10 py-16 md:py-24 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontally Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center gap-3">
          <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#112A24] tracking-tight leading-tight">
            Tentang Novarion
          </h2>
          <p className="text-sm sm:text-base text-[#112A24]/85 max-w-xl mx-auto leading-relaxed font-sans font-medium">
            {philosophy.summary}
          </p>
        </div>

        {/* Typographic Compositions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Nova Composition */}
          <div className="relative p-6 sm:p-10 rounded-xs bg-[#112A24] text-[#EAEAB7] border border-[#112A24]/20 overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="font-mono text-7xl sm:text-9xl font-black text-[#41C2A1]/15 leading-none select-none pointer-events-none mb-4">
              NOVA
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="border-b border-[#EAEAB7]/20 pb-2 text-xs font-mono text-[#41C2A1]">
                <span>Energi & Daya Nalar</span>
              </div>

              <div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#EAEAB7] tracking-tight mb-2">
                  {philosophy.nova.term}: Kilau Inovasi
                </h3>
                <p className="text-sm text-[#EAEAB7]/85 leading-relaxed font-sans">
                  {philosophy.nova.meaning}
                </p>
              </div>

              <div className="p-3 rounded-xs bg-[#1A3830] border border-[#41C2A1]/30 text-xs text-[#C9FBD4] font-mono">
                Simbol ledakan ide, kecerdasan komputasional, dan ketajaman berpikir analitis.
              </div>
            </div>
          </div>

          {/* Orion Composition */}
          <div className="relative p-6 sm:p-10 rounded-xs bg-[#EAEAB7] text-[#112A24] border border-[#112A24]/20 overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="font-mono text-7xl sm:text-9xl font-black text-[#FFAE5D]/35 leading-none select-none pointer-events-none mb-4">
              ORION
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="border-b border-[#112A24]/20 pb-2 text-xs font-mono text-[#112A24]">
                <span>Kompas & Kepemimpinan</span>
              </div>

              <div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#112A24] tracking-tight mb-2">
                  {philosophy.orion.term}: Panduan Arah
                </h3>
                <p className="text-sm text-[#112A24]/90 leading-relaxed font-sans">
                  {philosophy.orion.meaning}
                </p>
              </div>

              <div className="p-3 rounded-xs bg-[#FAF9F5] border border-[#FFAE5D] text-xs text-[#112A24] font-mono">
                Kompas moral, etika pengolahan informasi, dan kepemimpinan visioner.
              </div>
            </div>
          </div>
        </div>

        {/* Synthesis Quote */}
        <div className="p-6 sm:p-8 rounded-xs bg-[#FAF9F5] border border-[#112A24]/15 shadow-xs mb-10 text-center">
          <blockquote className="font-heading font-bold text-lg sm:text-2xl text-[#112A24] tracking-tight leading-relaxed max-w-3xl mx-auto">
            &ldquo;{philosophy.synthesis}&rdquo;
          </blockquote>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {values.map((v, i) => (
            <div
              key={i}
              className="p-5 rounded-xs bg-[#FAF9F5] border border-[#112A24]/25 flex flex-col gap-2.5"
            >
              <div className="border-b border-[#112A24]/15 pb-2">
                <span className="font-mono text-xs font-bold text-[#112A24]">
                  0{i + 1}
                </span>
              </div>
              <h4 className="font-heading font-black text-base text-[#112A24] tracking-tight">
                {v.title}
              </h4>
              <p className="text-xs text-[#112A24]/80 leading-relaxed font-sans">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
