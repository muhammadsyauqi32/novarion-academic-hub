'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CMSAchievement } from '@novarion/shared';
import { Trophy, ExternalLink, X } from 'lucide-react';
import { Reveal } from './Reveal';

interface AchievementsSectionProps {
  achievements: CMSAchievement[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<CMSAchievement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const categories = ['Semua', ...Array.from(new Set(achievements.map((a) => a.category).filter(Boolean)))];

  const filtered = activeCategory === 'Semua'
    ? achievements
    : achievements.filter((a) => a.category === activeCategory);

  const formatDate = (d?: Date | string | null) => {
    if (!d) return 'Tahun ini';
    const date = new Date(d);
    return date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section id="prestasi" className="w-full bg-[#FFAE5D] py-16 md:py-24 scroll-mt-20 text-[#1A1815]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontally Centered Section Header */}
        <Reveal yOffset={16}>
          <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center gap-3">
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#1A1815] tracking-tight leading-tight">
              Prestasi Angkatan
            </h2>
            <p className="text-sm sm:text-base text-[#1A1815]/85 max-w-xl mx-auto leading-relaxed font-sans font-medium">
              Rekognisi dan apresiasi karya mahasiswa Statistika dan Sains Data Angkatan 62.
            </p>

            {/* Filter Categories (No decorative borders) */}
            {achievements.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xs transition-colors shadow-2xs ${
                      activeCategory === cat
                        ? 'bg-[#1A1815] text-[#FFAE5D]'
                        : 'bg-[#FFFDF8] text-[#1A1815] hover:bg-[#1A1815] hover:text-[#FFAE5D]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          /* Visually Restrained Clean Empty State */
          <Reveal yOffset={16}>
            <div className="p-12 sm:p-16 rounded-xs bg-[#FFFDF8] text-center max-w-lg mx-auto flex flex-col items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xs bg-[#FFAE5D]/30 flex items-center justify-center text-[#1A1815] shadow-2xs">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading font-black text-lg text-[#1A1815]">
                  Lembar Kehormatan Terbuka
                </h3>
                <p className="text-xs text-[#1A1815]/80 leading-relaxed font-sans">
                  Pencatatan kompetisi sains data, olimpiade matematika, dan karya ilmiah mahasiswa Statistika 62 akan terarsip di lembar kehormatan ini.
                </p>
              </div>
            </div>
          </Reveal>
        ) : (
          /* Expressive Editorial Roll of Honor Ledger (No borders, subtle hover lift) */
          <div className="flex flex-col gap-3">
            {/* Desktop Ledger Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-mono font-black text-[#1A1815] uppercase tracking-wider">
              <span className="col-span-2">PREDIKAT</span>
              <span className="col-span-5">KOMPETISI & KARYA</span>
              <span className="col-span-3">PENERIMA APRESIASI</span>
              <span className="col-span-2 text-right">PERIODE</span>
            </div>

            {/* Ledger Rows */}
            <div className="flex flex-col gap-3">
              {filtered.map((item, idx) => (
                <Reveal key={item.id} delayMs={(idx % 6) * 60} yOffset={14}>
                  <div
                    onClick={() => setSelectedAchievement(item)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lihat detail prestasi: ${item.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedAchievement(item);
                      }
                    }}
                    className="p-5 sm:p-6 rounded-xs bg-[#FFFDF8] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 focus-visible:outline-2 focus-visible:outline-[#176C5B]"
                  >
                    {/* Rank Badge */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#1A1815] text-[#FFAE5D] text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
                        {item.rank || 'PRESTASI'}
                      </span>
                    </div>

                    {/* Title & Competition */}
                    <div className="md:col-span-5 flex flex-col">
                      <h4 className="font-heading font-black text-base text-[#1A1815] group-hover:text-[#176C5B] transition-colors tracking-tight">
                        {item.title}
                      </h4>
                      {item.competition && (
                        <span className="text-xs text-[#1A1815]/75 font-sans mt-0.5">
                          {item.competition}
                        </span>
                      )}
                    </div>

                    {/* Recipient */}
                    <div className="md:col-span-3 flex flex-col">
                      <span className="text-xs font-bold text-[#1A1815]">
                        {item.recipient}
                      </span>
                      <span className="text-[11px] font-mono text-[#1A1815]/70">
                        {item.category || 'Statistika & Sains Data'}
                      </span>
                    </div>

                    {/* Date & Action */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3 text-xs font-mono text-[#1A1815]">
                      <span>{formatDate(item.eventDate)}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#1A1815]/60 group-hover:text-[#1A1815] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#112A24]/75 backdrop-blur-xs"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#FFFDF8] rounded-xs p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-[#1A1815]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3">
              <div className="flex flex-col gap-1.5">
                <span className="inline-block self-start px-2.5 py-0.5 rounded-xs bg-[#1A1815] text-[#FFAE5D] text-xs font-mono font-bold uppercase shadow-2xs">
                  {selectedAchievement.rank || 'PRESTASI RESMI'}
                </span>
                <h3 className="font-heading font-black text-2xl text-[#1A1815] tracking-tight mt-1">
                  {selectedAchievement.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="p-1.5 rounded-xs hover:bg-[#FFAE5D] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAchievement.imageUrl && (
              <div className="relative aspect-[16/10] w-full rounded-xs overflow-hidden bg-[#FAF9F5] shadow-xs">
                <Image
                  src={selectedAchievement.imageUrl}
                  alt={selectedAchievement.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xs bg-[#FAF9F5] text-xs font-mono shadow-2xs">
              <div>
                <span className="text-[#1A1815]/60 block">KOMPETISI:</span>
                <span className="font-bold text-[#1A1815]">{selectedAchievement.competition || 'Kompetisi Terbuka'}</span>
              </div>
              <div>
                <span className="text-[#1A1815]/60 block">PENERIMA:</span>
                <span className="font-bold text-[#1A1815]">{selectedAchievement.recipient}</span>
              </div>
              <div>
                <span className="text-[#1A1815]/60 block">BIDANG:</span>
                <span className="font-bold text-[#1A1815]">{selectedAchievement.category || 'Sains Data'}</span>
              </div>
              <div>
                <span className="text-[#1A1815]/60 block">PERIODE:</span>
                <span className="font-bold text-[#1A1815]">{formatDate(selectedAchievement.eventDate)}</span>
              </div>
            </div>

            {selectedAchievement.description && (
              <p className="text-sm text-[#1A1815]/85 leading-relaxed font-sans">
                {selectedAchievement.description}
              </p>
            )}

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedAchievement(null)}
                className="px-5 py-2.5 rounded-xs bg-[#1A1815] text-[#FFAE5D] font-mono text-xs font-bold uppercase hover:bg-[#112A24] transition-colors shadow-xs"
              >
                Tutup Lembar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
