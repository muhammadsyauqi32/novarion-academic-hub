import React from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';

export function AcademicHubCtaSection() {
  return (
    <section className="w-full bg-[#41C2A1] py-16 md:py-24 border-b border-[#112A24]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-xs bg-[#EAEAB7] border border-[#112A24]/20 shadow-sm flex flex-col items-center text-center max-w-4xl mx-auto gap-6">
          <div className="flex flex-col items-center gap-3 max-w-2xl">
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#112A24] tracking-tight leading-tight">
              Academic Hub
            </h2>
            <p className="text-sm sm:text-base text-[#112A24]/85 leading-relaxed font-sans font-medium">
              Akses ruang kerja akademik terpadu, kalender perkuliahan, bank materi, dan bot pengingat deadline WhatsApp mahasiswa.
            </p>
          </div>

          <Link href="/login" className="shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-xs bg-[#112A24] text-[#EAEAB7] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#FFAE5D] hover:text-[#112A24] transition-colors flex items-center justify-center gap-2 shadow-sm border border-[#112A24]/20">
              <span>Masuk ke Academic Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
