'use client';

import React from 'react';
import Image from 'next/image';
import { COHORT_CONFIG } from '@/lib/config/cohort';
import { Reveal } from './Reveal';

export function LeadershipSection() {
  const { leadership } = COHORT_CONFIG;
  const coreLeadership = leadership.find((l) => l.divisionName === 'Pengurus Inti') || leadership[0];
  const divisionLeaderships = leadership.filter((l) => l.divisionName !== 'Pengurus Inti');

  const getRoleAccent = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-[#FFAE5D] text-[#112A24]'; // Ketua: Warm Orange
      case 1:
        return 'bg-[#41C2A1] text-[#112A24]'; // Wakil: Mint
      case 2:
        return 'bg-[#EAEAB7] text-[#112A24]'; // Sekretaris: Butter Cream
      default:
        return 'bg-[#C9FBD4] text-[#112A24]'; // Bendahara: Soft Green
    }
  };

  return (
    <section id="pengurus" className="w-full bg-[#FAF9F5] py-16 md:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontally Centered Section Header */}
        <Reveal yOffset={16}>
          <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col items-center gap-3">
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#112A24] tracking-tight leading-tight">
              Pengurus Angkatan
            </h2>
            <p className="text-sm sm:text-base text-[#112A24]/80 max-w-xl mx-auto leading-relaxed font-sans font-medium">
              Struktur kepengurusan dan divisi mahasiswa Statistika dan Sains Data Angkatan 62.
            </p>
          </div>
        </Reveal>

        {/* Part 1: Pengurus Inti */}
        <div className="mb-14">
          <Reveal yOffset={12}>
            <div className="text-center mb-7">
              <h3 className="font-heading font-black text-2xl text-[#112A24] tracking-tight">
                Pengurus Inti
              </h3>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coreLeadership.members.map((member, idx) => (
              <Reveal key={idx} delayMs={idx * 70} yOffset={18}>
                <div className="group p-5 rounded-xs bg-[#FFFFFF] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-sm h-full">
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#112A24]/85">
                        {member.role}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs shadow-2xs ${getRoleAccent(idx)}`}>
                        BPH
                      </span>
                    </div>

                    {/* Portrait Photograph or Monogram */}
                    <div className="relative w-full aspect-square rounded-xs overflow-hidden bg-[#FAF9F5] flex items-center justify-center">
                      {member.photoUrl ? (
                        <Image
                          src={member.photoUrl}
                          alt={member.name}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#EAEAB7]/35 text-[#112A24] rounded-xs">
                          <span className="font-heading font-black text-3xl text-[#112A24]/85">
                            {member.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col pt-1">
                      <h4 className="font-heading font-black text-base text-[#112A24] tracking-tight">
                        {member.name}
                      </h4>
                      <span className="text-xs font-mono font-semibold text-[#112A24]/70">
                        {member.role}
                      </span>
                    </div>

                    {member.bio && (
                      <p className="text-xs text-[#112A24]/80 leading-relaxed font-sans pt-1">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Part 2: Divisi Pelaksana */}
        <div className="flex flex-col gap-6">
          <Reveal yOffset={12}>
            <div className="text-center mb-2">
              <h3 className="font-heading font-black text-2xl text-[#112A24] tracking-tight">
                Divisi Angkatan
              </h3>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {divisionLeaderships.map((div, idx) => (
              <Reveal key={idx} delayMs={100 + idx * 80} yOffset={18}>
                <div className="p-6 rounded-xs bg-[#FFFFFF] hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3.5 shadow-xs hover:shadow-sm h-full">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-black text-lg text-[#112A24] tracking-tight">
                      {div.divisionName}
                    </h4>
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#FFAE5D]" />
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-[#112A24]/80 leading-relaxed font-sans">
                      {div.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 flex flex-col gap-2">
                    <div className="flex flex-col gap-1.5">
                      {div.members.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between text-xs py-1">
                          <span className="font-semibold text-[#112A24]">{m.name}</span>
                          <span className="text-[11px] font-mono text-[#112A24]/70">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
