'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CMSAchievement } from '@novarion/shared';
import { Trophy, ExternalLink, X } from 'lucide-react';

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
    <section id="prestasi" className="w-full bg-[#FFAE5D] border-b border-[#1A1815]/10 py-16 md:py-24 scroll-mt-16 text-[#1A1815]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontally Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center gap-3">
          <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#1A1815] tracking-tight leading-tight">
            Prestasi Angkatan
          </h2>
          <p className="text-sm sm:text-base text-[#1A1815]/80 max-w-xl mx-auto leading-relaxed font-sans font-medium">
            Rekognisi dan apresiasi karya mahasiswa Statistika dan Sains Data Angkatan 62.
          </p>

          {/* Filter Categories */}
          {achievements.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xs border transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#1A1815] text-[#FFAE5D] border-[#1A1815]'
                      : 'bg-[#FFFDF8] text-[#1A1815] border-[#1A1815]/30 hover:border-[#1A1815]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          /* Visually Restrained Clean Empty State (Zero Technical CMS Jargon) */
          <div className="p-12 sm:p-16 rounded-xs bg-[#FFFDF8] border border-[#1A1815]/15 text-center max-w-lg mx-auto flex flex-col items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xs bg-[#FFAE5D]/30 border border-[#1A1815]/30 flex items-center justify-center text-[#1A1815]">
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
        ) : (
          /* Expressive Editorial Roll of Honor Ledger (Sharp Borders, No Generic SaaS Cards) */
          <div className="flex flex-col gap-3">
            {/* Desktop Ledger Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 border-b border-[#1A1815]/20 text-xs font-mono font-black text-[#1A1815] uppercase tracking-wider">
              <span className="col-span-2">PREDIKAT</span>
              <span className="col-span-5">KOMPETISI & KARYA</span>
              <span className="col-span-3">PENERIMA APRESIASI</span>
              <span className="col-span-2 text-right">PERIODE</span>
            </div>

            {/* Ledger Rows */}
            <div className="flex flex-col gap-2.5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAchievement(item)}
                  className="p-5 sm:p-6 rounded-xs bg-[#FFFDF8] border border-[#1A1815]/15 hover:border-[#1A1815]/35 transition-all cursor-pointer group shadow-xs flex flex-col md:grid md:grid-cols-12 md:items-center gap-4"
                >
                  {/* Rank Badge */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#1A1815] text-[#FFAE5D] text-xs font-mono font-bold uppercase tracking-wider">
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
                    <ExternalLink className="w-3.5 h-3.5 text-[#1A1815]/60 group-hover:text-[#1A1815] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Detail Modal (Sharp Corners) */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#112A24]/75 backdrop-blur-xs"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#FFFDF8] border border-[#1A1815]/20 rounded-xs p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-[#1A1815]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#1A1815]/20 pb-4">
              <div className="flex flex-col gap-1">
                <span className="inline-block self-start px-2.5 py-0.5 rounded-xs bg-[#1A1815] text-[#FFAE5D] text-xs font-mono font-bold uppercase">
                  {selectedAchievement.rank || 'PRESTASI RESMI'}
                </span>
                <h3 className="font-heading font-black text-2xl text-[#1A1815] tracking-tight mt-1">
                  {selectedAchievement.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="p-1.5 rounded-xs border border-[#1A1815]/20 hover:bg-[#FFAE5D] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAchievement.imageUrl && (
              <div className="relative aspect-[16/10] w-full rounded-xs overflow-hidden border border-[#1A1815]/20 bg-[#FAF9F5]">
                <Image
                  src={selectedAchievement.imageUrl}
                  alt={selectedAchievement.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xs bg-[#FAF9F5] border border-[#1A1815]/20 text-xs font-mono">
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

            <div className="pt-3 border-t border-[#1A1815]/20 flex justify-end">
              <button
                onClick={() => setSelectedAchievement(null)}
                className="px-5 py-2 rounded-xs bg-[#1A1815] text-[#FFAE5D] font-mono text-xs font-bold uppercase hover:bg-[#112A24] transition-colors"
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
