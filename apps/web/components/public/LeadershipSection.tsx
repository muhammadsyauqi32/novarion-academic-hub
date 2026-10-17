import React from 'react';
import Image from 'next/image';
import { COHORT_CONFIG } from '@/lib/config/cohort';
import { Shield, Sparkles, User, BookOpen, Camera, HeartHandshake } from 'lucide-react';

export function LeadershipSection() {
  const { leadership } = COHORT_CONFIG;
  const coreLeadership = leadership.find((l) => l.divisionName === 'Pengurus Inti') || leadership[0];
  const divisionLeaderships = leadership.filter((l) => l.divisionName !== 'Pengurus Inti');

  const getDivisionIcon = (name: string) => {
    if (name.includes('Akademik')) return <BookOpen className="w-4 h-4 text-teal-deep" />;
    if (name.includes('Komunikasi') || name.includes('Dokumentasi')) return <Camera className="w-4 h-4 text-teal-deep" />;
    return <HeartHandshake className="w-4 h-4 text-teal-deep" />;
  };

  return (
    <section id="pengurus" className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80 scroll-mt-16">
      {/* Section Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-deep">
            <span>{'// BAB II'}</span>
            <span>•</span>
            <span>DIREKTORI KEPENGURUSAN</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-text-primary tracking-tight leading-tight">
            Struktur & Roster Angkatan 62
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-text-muted max-w-md leading-relaxed font-sans">
          Mewujudkan mandat kolektivitas melalui tata kelola yang transparan, harmonis, dan berorientasi pada kemajuan akademik seluruh mahasiswa.
        </p>
      </div>

      {/* Part 1: Pengurus Inti (The Core Cabinet) */}
      <div className="mb-14">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-deep font-bold mb-4 pb-2 border-b border-border/80">
          <Shield className="w-3.5 h-3.5" />
          <span>KABINET PENGURUS INTI (BPH)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreLeadership.members.map((member, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface border border-border hover:border-teal-deep/50 transition-all flex flex-col justify-between shadow-2xs group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-muted font-bold tracking-widest">
                    [BPH-0{idx + 1}]
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#41C2A1]" />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-soft border border-border flex items-center justify-center shrink-0 text-teal-deep group-hover:border-teal-deep/50 transition-colors">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-heading font-black text-sm text-teal-deep">
                        {member.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col overflow-hidden">
                    <h4 className="font-heading font-bold text-sm text-text-primary tracking-tight truncate">
                      {member.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-teal-deep truncate">
                      {member.role}
                    </span>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-xs text-text-secondary leading-relaxed pt-2 border-t border-border/50">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Divisi Kerja Angkatan (Editorial Tabular Yearbook Style) */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border/80 pb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
            DIVISI PELAKSANA & KOORDINATOR BIDANG
          </span>
          <span className="text-[11px] font-mono text-teal-deep font-semibold">NOVARION 62</span>
        </div>

        <div className="flex flex-col gap-6">
          {divisionLeaderships.map((div, dIdx) => (
            <div
              key={dIdx}
              className="p-6 rounded-2xl bg-surface border border-border flex flex-col lg:flex-row gap-6 items-start justify-between"
            >
              {/* Division Charter Column */}
              <div className="lg:w-1/3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-deep/10 flex items-center justify-center">
                    {getDivisionIcon(div.divisionName)}
                  </div>
                  <h3 className="font-heading font-bold text-base text-text-primary">
                    {div.divisionName}
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  {div.description}
                </p>
              </div>

              {/* Division Members Roster */}
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {div.members.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-3.5 rounded-xl bg-surface-soft/80 border border-border/70 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 font-heading font-bold text-xs text-text-muted">
                      {m.photoUrl ? (
                        <Image src={m.photoUrl} alt={m.name} width={36} height={36} className="rounded-lg object-cover" />
                      ) : (
                        <span>0{mIdx + 1}</span>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-text-primary truncate">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-teal-deep font-medium truncate">
                        {m.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
