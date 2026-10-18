'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getHubLoginUrl } from '@/lib/links';
import { Reveal } from './Reveal';

export function AcademicHubCtaSection() {
  const hubLoginUrl = getHubLoginUrl();

  return (
    <section id="academic-hub" className="w-full bg-[#41C2A1] py-16 md:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal yOffset={16}>
          <div className="p-8 sm:p-14 rounded-xs bg-[#EAEAB7] shadow-md flex flex-col items-center text-center max-w-4xl mx-auto gap-6">
            <div className="flex flex-col items-center gap-3 max-w-2xl">
              <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#112A24] tracking-tight leading-tight">
                Academic Hub
              </h2>
              <p className="text-sm sm:text-base text-[#112A24]/90 leading-relaxed font-sans font-medium">
                Akses ruang kerja akademik terpadu, kalender perkuliahan, bank materi, dan bot pengingat deadline WhatsApp mahasiswa.
              </p>
            </div>

            <a
              href={hubLoginUrl}
              className="w-full sm:w-auto px-8 py-4 rounded-xs bg-[#112A24] text-[#EAEAB7] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#FFAE5D] hover:text-[#112A24] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Masuk ke Academic Hub</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
