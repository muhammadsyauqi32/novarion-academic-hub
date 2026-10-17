import React from 'react';
import Image from 'next/image';
import { COHORT_CONFIG, CohortLeader } from '@/lib/config/cohort';
import { User, Users } from 'lucide-react';

export function LeadershipSection() {
  const { leadership } = COHORT_CONFIG;

  return (
    <section id="pengurus" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/60 scroll-mt-16">
      {/* Section Header */}
      <div className="flex flex-col items-start gap-3 max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-deep">
          Struktur Pengurus
        </span>
        <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
          Sinergi & Struktur Kerja Angkatan 62
        </h2>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          Kolektivitas diorganisasi melalui mandat kepengurusan yang mengabdi bagi kelancaran akademik, kebersamaan, dan warta resmi angkatan.
        </p>
      </div>

      {/* Leadership Divisions */}
      <div className="flex flex-col gap-12">
        {leadership.map((div, idx) => (
          <div key={idx} className="flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#41C2A1]" />
              <h3 className="font-heading font-bold text-lg sm:text-xl text-text-primary">
                {div.divisionName}
              </h3>
              <span className="text-xs text-text-muted hidden sm:inline">
                — {div.description}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {div.members.map((member, mIdx) => (
                <div
                  key={mIdx}
                  className="p-5 rounded-xl bg-surface border border-border hover:border-border-focus transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Photo or Clean Avatar Fallback */}
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-soft border border-border flex items-center justify-center mb-4 text-text-muted">
                      {member.photoUrl ? (
                        <Image
                          src={member.photoUrl}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-text-muted/60" />
                      )}
                    </div>

                    <h4 className="font-heading font-bold text-sm sm:text-base text-text-primary line-clamp-1">
                      {member.name}
                    </h4>
                    <p className="text-xs font-semibold text-teal-deep mt-0.5">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
