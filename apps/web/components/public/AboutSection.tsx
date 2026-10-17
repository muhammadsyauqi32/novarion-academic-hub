import React from 'react';
import { COHORT_CONFIG } from '@/lib/config/cohort';
import { Sparkles, Compass, ShieldCheck, Cpu, Users2 } from 'lucide-react';

export function AboutSection() {
  const { philosophy, values } = COHORT_CONFIG;

  return (
    <section id="tentang" className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80 scroll-mt-16">
      {/* Section Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-deep">
            <span>{'// BAB I'}</span>
            <span>•</span>
            <span>IDENTITAS & MAKNA</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-text-primary tracking-tight leading-tight">
            Menyatukan Cahaya, Menentukan Arah
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-text-muted max-w-md leading-relaxed font-sans">
          {philosophy.summary}
        </p>
      </div>

      {/* Editorial Dual Essay: Nova (Cahaya) vs Orion (Arah) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Nova Essay */}
        <div className="relative p-8 rounded-2xl bg-surface border border-[#41C2A1]/30 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6 font-mono text-6xl font-black text-[#41C2A1]/10 select-none pointer-events-none">
            NOVA
          </div>

          <div className="flex flex-col gap-5 relative z-10">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C9FBD4]/70 border border-[#41C2A1]/40 flex items-center justify-center text-teal-deep">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-deep">
                  Pilar Pertama
                </span>
              </div>
              <span className="text-[11px] font-mono text-text-muted">KILAU CAHAYA</span>
            </div>

            <div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight mb-3">
                {philosophy.nova.term}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {philosophy.nova.meaning}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-soft border border-border/70 text-xs text-teal-deep font-semibold flex items-center gap-2">
              <Cpu className="w-4 h-4 shrink-0" />
              <span>Simbol ledakan ide, kecerdasan komputasional, dan inovasi sains data.</span>
            </div>
          </div>
        </div>

        {/* Orion Essay */}
        <div className="relative p-8 rounded-2xl bg-surface border border-[#FFAE5D]/40 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6 font-mono text-6xl font-black text-[#FFAE5D]/10 select-none pointer-events-none">
            ORION
          </div>

          <div className="flex flex-col gap-5 relative z-10">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFAE5D]/20 border border-[#FFAE5D]/50 flex items-center justify-center text-[#B54708]">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#B54708]">
                  Pilar Kedua
                </span>
              </div>
              <span className="text-[11px] font-mono text-text-muted">PENUNJUK ARAH</span>
            </div>

            <div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight mb-3">
                {philosophy.orion.term}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {philosophy.orion.meaning}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-soft border border-border/70 text-xs text-[#B54708] font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Kompas moral, etika pengolahan informasi, dan kepemimpinan visioner.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis Pull-Quote Manifest */}
      <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#C9FBD4]/25 via-[#EAEAB7]/30 to-[#FFAE5D]/15 border border-border mb-16 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-deep font-bold">
            SINTESIS FILOSOFI ANGKATAN
          </span>
          <blockquote className="font-heading font-black text-lg sm:text-2xl text-text-primary leading-snug">
            &ldquo;{philosophy.synthesis}&rdquo;
          </blockquote>
          <span className="text-xs font-medium text-text-muted pt-1">
            — Piagam Angkatan 62 Statistika & Sains Data IPB
          </span>
        </div>
      </div>

      {/* 3 Core Tenets as an Editorial Ledger */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-text-muted">
            TIGA NILAI UTAMA (CORE TENETS)
          </span>
          <span className="text-[11px] font-mono text-teal-deep font-semibold">NOVARION 62</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={i} className="p-6 rounded-xl bg-surface border border-border/80 flex flex-col gap-3 relative hover:border-teal-deep/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-deep">0{i + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.accent }} />
              </div>
              <h4 className="font-heading font-bold text-base text-text-primary">
                {v.title}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
