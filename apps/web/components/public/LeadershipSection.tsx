import React from 'react';
import Image from 'next/image';
import { COHORT_CONFIG } from '@/lib/config/cohort';

export function LeadershipSection() {
  const { leadership } = COHORT_CONFIG;
  const coreLeadership = leadership.find((l) => l.divisionName === 'Pengurus Inti') || leadership[0];
  const divisionLeaderships = leadership.filter((l) => l.divisionName !== 'Pengurus Inti');

  const getRoleAccent = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-[#FFAE5D] text-[#112A24] border-[#112A24]/30'; // Ketua: Warm Orange
      case 1:
        return 'bg-[#41C2A1] text-[#112A24] border-[#112A24]/30'; // Wakil: Mint
      case 2:
        return 'bg-[#EAEAB7] text-[#112A24] border-[#112A24]/30'; // Sekretaris: Butter Cream
      default:
        return 'bg-[#C9FBD4] text-[#112A24] border-[#112A24]/30'; // Bendahara: Soft Green
    }
  };

  return (
    <section id="pengurus" className="w-full bg-[#FAF9F5] border-b border-[#112A24]/10 py-16 md:py-24 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#112A24]">
              <span className="bg-[#112A24] text-[#EAEAB7] px-2 py-0.5 rounded-xs">BAB II</span>
              <span>/</span>
              <span>DIREKTORI KEPENGURUSAN</span>
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-6xl text-[#112A24] tracking-tight leading-tight">
              Struktur & Roster Angkatan 62
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#112A24]/80 max-w-md leading-relaxed font-sans font-medium">
            Mewujudkan mandat kolektivitas melalui tata kelola yang transparan, harmonis, dan berorientasi pada kemajuan akademik seluruh mahasiswa.
          </p>
        </div>

        {/* Part 1: Pengurus Inti (The Core Cabinet) */}
        <div className="mb-14">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#112A24] font-bold mb-4 pb-2 border-b border-[#112A24]/10">
            <span>KABINET PENGURUS INTI (BPH)</span>
            <span className="text-[11px] text-[#112A24]/60">MANDAT EKSEKUTIF</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreLeadership.members.map((member, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xs bg-[#FFFFFF] border border-[#112A24]/15 hover:border-[#112A24]/30 transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#112A24]/10 pb-2">
                    <span className="font-mono text-[10px] text-[#112A24] font-black tracking-widest">
                      [BPH-0{idx + 1}]
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs border ${getRoleAccent(idx)}`}>
                      {member.role.split(' ')[0]}
                    </span>
                  </div>

                  {/* Portrait Photograph or Monogram (Sharp Corners) */}
                  <div className="relative w-full aspect-square rounded-xs overflow-hidden bg-[#FAF9F5] border border-[#112A24]/20 flex items-center justify-center">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#EAEAB7]/25 text-[#112A24]">
                        <span className="font-heading font-black text-3xl text-[#112A24]/80">
                          {member.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#112A24]/60 mt-1">
                          PORTRAIT
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col pt-1">
                    <h4 className="font-heading font-black text-base text-[#112A24] tracking-tight">
                      {member.name}
                    </h4>
                    <span className="text-xs font-mono font-semibold text-[#112A24]/75">
                      {member.role}
                    </span>
                  </div>

                  {member.bio && (
                    <p className="text-xs text-[#112A24]/80 leading-relaxed pt-2 border-t border-[#112A24]/10 font-sans">
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part 2: Divisi Pelaksana & Koordinator Bidang (Editorial Tabular Ledger Style) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#112A24]/20 pb-2 text-xs font-mono uppercase tracking-wider text-[#112A24] font-bold">
            <span>DIVISI KERJA ANGKATAN</span>
            <span className="text-[11px] text-[#112A24]/60">NOVARION 62</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {divisionLeaderships.map((div, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xs bg-[#FFFFFF] border border-[#112A24]/20 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b border-[#112A24]/10 pb-2">
                  <span className="text-xs font-mono font-black text-[#112A24]">
                    DIVISI 0{idx + 1}
                  </span>
                  <span className="w-2 h-2 rounded-xs bg-[#FFAE5D]" />
                </div>

                <div>
                  <h4 className="font-heading font-black text-base text-[#112A24] tracking-tight">
                    {div.divisionName}
                  </h4>
                  <p className="text-xs text-[#112A24]/75 leading-relaxed font-sans mt-1">
                    {div.description}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-[#112A24]/10 flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#112A24]/60 font-bold">
                    ROSTER ANGGOTA
                  </span>
                  <div className="flex flex-col gap-1">
                    {div.members.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between text-xs py-1 border-b border-[#112A24]/5">
                        <span className="font-semibold text-[#112A24]">{m.name}</span>
                        <span className="text-[11px] font-mono text-[#112A24]/70">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
