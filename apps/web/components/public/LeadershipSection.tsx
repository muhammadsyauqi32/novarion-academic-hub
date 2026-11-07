'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { COHORT_CONFIG } from '@/lib/config/cohort';

export function LeadershipSection() {
  const { leadership } = COHORT_CONFIG;
  const coreLeadership =
    leadership.find((l) => l.divisionName === 'Pengurus Inti') || leadership[0];
  const divisionLeaderships = leadership.filter((l) => l.divisionName !== 'Pengurus Inti');

  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const getDivisionPrograms = (name: string): string[] => {
    if (name.includes('Akademik')) {
      return ['Bank Materi & Silabus', 'Responsi UTS & UAS', 'Kelompok Belajar & Lomba'];
    }
    if (name.includes('Komunikasi') || name.includes('Media')) {
      return ['Warta & Kabar Angkatan', 'Arsip Dokumentasi Foto', 'Media Sosial Resmi'];
    }
    if (name.includes('Kekeluargaan') || name.includes('Sosial')) {
      return ['Temu Santai Angkatan', 'Ucapan Milad Teman', 'Aksi Peduli Sesama'];
    }
    return ['Koordinasi Kegiatan'];
  };

  const getCleanBio = (role: string, defaultBio?: string): string => {
    if (role.includes('Ketua Angkatan') && !role.includes('Wakil')) {
      return 'Mengoordinasikan kegiatan angkatan dan menjadi narahubung utama ke pihak departemen serta organisasi kampus.';
    }
    if (role.includes('Wakil')) {
      return 'Membantu koordinasi internal antar-divisi dan memastikan agenda angkatan terlaksana dengan tertib.';
    }
    if (role.includes('Sekretaris')) {
      return 'Bertanggung jawab atas administrasi surat-menyurat, notulensi musyawarah, dan arsip data angkatan.';
    }
    if (role.includes('Bendahara')) {
      return 'Mengelola iuran kas angkatan secara transparan dan mengatur kebutuhan anggaran kegiatan bersama.';
    }
    return defaultBio || '';
  };

  const getCleanDivisionDesc = (name: string, defaultDesc: string): string => {
    if (name.includes('Akademik')) {
      return 'Mengoordinasikan bank materi kuliah, jadwal responsi sebelum UTS/UAS, dan kelompok belajar praktikum komputasi.';
    }
    if (name.includes('Komunikasi') || name.includes('Media')) {
      return 'Mengelola media sosial resmi angkatan, publikasi warta kegiatan, dan pengarsipan dokumentasi foto mahasiswa.';
    }
    if (name.includes('Kekeluargaan') || name.includes('Sosial')) {
      return 'Menyelenggarakan temu angkatan, ucapan selamat ulang tahun teman seangkatan, dan aksi kepedulian sosial.';
    }
    return defaultDesc;
  };

  const showBph = selectedFilter === 'all' || selectedFilter === 'bph';
  const visibleDivisions =
    selectedFilter === 'all' || selectedFilter === 'bph'
      ? selectedFilter === 'bph'
        ? []
        : divisionLeaderships
      : divisionLeaderships.filter((d) => d.divisionName === selectedFilter);

  return (
    <section
      id="pengurus"
      className="w-full bg-canvas py-16 md:py-24 scroll-mt-16 transition-colors duration-200 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-border">
          <div className="max-w-2xl">
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight leading-tight">
              Pengurus Angkatan 62.
            </h2>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans mt-2">
              Teman-teman yang bertugas mengoordinasikan kegiatan akademik, publikasi warta, dan kebersamaan mahasiswa Statistika dan Sains Data Angkatan 62 periode 2026/2027.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5 shrink-0"
            role="group"
            aria-label="Filter bagian kepengurusan"
          >
            <button
              type="button"
              aria-pressed={selectedFilter === 'all'}
              onClick={() => setSelectedFilter('all')}
              className={`text-xs font-sans px-3 py-1.5 rounded-input transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep ${
                selectedFilter === 'all'
                  ? 'bg-teal-deep text-white dark:bg-brand-primary dark:text-brand-foreground font-bold'
                  : 'bg-surface text-text-muted hover:text-text-primary border border-border hover:bg-surface-soft font-medium'
              }`}
            >
              Semua Bagian
            </button>
            <button
              type="button"
              aria-pressed={selectedFilter === 'bph'}
              onClick={() => setSelectedFilter('bph')}
              className={`text-xs font-sans px-3 py-1.5 rounded-input transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep ${
                selectedFilter === 'bph'
                  ? 'bg-teal-deep text-white dark:bg-brand-primary dark:text-brand-foreground font-bold'
                  : 'bg-surface text-text-muted hover:text-text-primary border border-border hover:bg-surface-soft font-medium'
              }`}
            >
              Pengurus Inti
            </button>
            {divisionLeaderships.map((div) => {
              const shortLabel = div.divisionName.replace('Divisi ', '').split(',')[0];
              const isSelected = selectedFilter === div.divisionName;
              return (
                <button
                  key={div.divisionName}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedFilter(div.divisionName)}
                  className={`text-xs font-sans px-3 py-1.5 rounded-input transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep ${
                    isSelected
                      ? 'bg-teal-deep text-white dark:bg-brand-primary dark:text-brand-foreground font-bold'
                      : 'bg-surface text-text-muted hover:text-text-primary border border-border hover:bg-surface-soft font-medium'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-5">
            <div className="relative aspect-[4/3] w-full rounded-card overflow-hidden bg-surface-soft border border-border">
              <Image
                src="/foto_angkatan.jpeg"
                alt="Pengurus dan Mahasiswa Novarion 62 di IPB Dramaga"
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover object-center"
              />
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-baseline justify-between border-b border-border pb-2.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-deep dark:text-brand-primary">
                  Koordinasi Terbuka
                </span>
                <span className="text-xs font-mono text-text-muted">
                  Periode 2026/2027
                </span>
              </div>

              <p className="text-xs sm:text-sm text-text-muted font-sans leading-relaxed">
                Pengurus angkatan bekerja sama dengan para ketua kelas paralel dan penanggung jawab praktikum di Departemen Statistika dan Sains Data IPB.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-12">
            {showBph && (
              <div className="flex flex-col gap-6">
                <div className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
                    Badan Pengurus Harian (BPH)
                  </h3>
                  <span className="text-xs font-mono text-text-muted">
                    Ketua, Wakil, Sekretaris, dan Bendahara
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                  {coreLeadership.members.map((member) => (
                    <div
                      key={member.name}
                      className="flex flex-col gap-2 pb-6 border-b border-border/70"
                    >
                      <span className="text-xs font-mono font-bold text-teal-deep dark:text-brand-primary uppercase tracking-wider">
                        {member.role}
                      </span>
                      <h4 className="font-heading font-bold text-lg text-text-primary tracking-tight">
                        {member.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans mt-0.5">
                        {getCleanBio(member.role, member.bio)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visibleDivisions.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
                    Divisi Kerja Angkatan
                  </h3>
                  <span className="text-xs font-mono text-text-muted">
                    Akademik, Publikasi Media, dan Kekeluargaan
                  </span>
                </div>

                <div className="divide-y divide-border border-b border-border">
                  {visibleDivisions.map((div) => {
                    const programs = getDivisionPrograms(div.divisionName);
                    const cleanDesc = getCleanDivisionDesc(div.divisionName, div.description);
                    return (
                      <div
                        key={div.divisionName}
                        className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start"
                      >
                        <div className="md:col-span-5 flex flex-col gap-1.5">
                          <h4 className="font-heading font-bold text-lg text-text-primary tracking-tight">
                            {div.divisionName}
                          </h4>
                          <p className="text-xs sm:text-sm text-text-muted font-sans leading-relaxed">
                            {cleanDesc}
                          </p>
                        </div>

                        <div className="md:col-span-7 flex flex-col gap-3">
                          <div>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted block mb-1">
                              Fokus Kegiatan
                            </span>
                            <p className="text-xs sm:text-sm font-sans font-medium text-text-primary">
                              {programs.join(', ')}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs font-sans">
                            {div.members.map((m) => (
                              <div key={m.name} className="flex items-baseline gap-1.5">
                                <span className="font-semibold text-text-primary">{m.name}</span>
                                <span className="text-[11px] font-mono text-text-muted">
                                  ({m.role})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
