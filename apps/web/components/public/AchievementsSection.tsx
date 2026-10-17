'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CMSAchievement } from '@novarion/shared';
import { Trophy, Award, Calendar, ExternalLink, X, Medal, Sparkles } from 'lucide-react';

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
    <section id="prestasi" className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80 scroll-mt-16">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-deep">
            <span>{'// BAB V'}</span>
            <span>•</span>
            <span>REKOGNISI & APRESIASI</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-text-primary tracking-tight leading-tight">
            Lembar Kehormatan & Prestasi
          </h2>
        </div>

        {/* Filter categories */}
        {achievements.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  activeCategory === cat
                    ? 'bg-teal-deep text-white border-teal-deep shadow-2xs'
                    : 'bg-surface text-text-muted border-border hover:border-teal-deep/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        /* Visually Restrained Clean Empty State (Zero Technical CMS jargon) */
        <div className="p-12 sm:p-16 rounded-2xl bg-surface border border-border/80 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFAE5D]/15 border border-[#FFAE5D]/30 flex items-center justify-center text-[#B54708]">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading font-bold text-lg text-text-primary">
              Lembar Kehormatan Terbuka
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Pencatatan kompetisi sains data, olimpiade matematika, dan karya ilmiah mahasiswa Statistika 62 akan terarsip di lembar kehormatan ini.
            </p>
          </div>
        </div>
      ) : (
        /* Editorial Roll of Honor Ledger */
        <div className="flex flex-col gap-3">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 border-b border-border text-[11px] font-mono text-text-muted uppercase tracking-wider">
            <span className="col-span-2">Predikat</span>
            <span className="col-span-5">Kompetisi & Karya</span>
            <span className="col-span-3">Penerima Apresiasi</span>
            <span className="col-span-2 text-right">Periode</span>
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAchievement(item)}
                className="p-5 sm:p-6 rounded-2xl bg-surface border border-border hover:border-teal-deep/50 transition-all cursor-pointer group shadow-2xs flex flex-col md:grid md:grid-cols-12 md:items-center gap-4"
              >
                {/* Rank Badge */}
                <div className="md:col-span-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFAE5D]/15 text-[#B54708] text-xs font-bold font-mono">
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.rank}</span>
                  </span>
                </div>

                {/* Title & Event */}
                <div className="md:col-span-5 flex flex-col gap-1">
                  <h4 className="font-heading font-bold text-base text-text-primary group-hover:text-teal-deep transition-colors">
                    {item.title}
                  </h4>
                  {item.competition && (
                    <span className="text-xs text-text-muted">
                      {item.competition} • Tingkat {item.level}
                    </span>
                  )}
                </div>

                {/* Recipients */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    {item.recipient || 'Mahasiswa Statistika 62'}
                  </span>
                </div>

                {/* Date */}
                <div className="md:col-span-2 flex items-center md:justify-end text-xs font-mono text-text-muted">
                  <span>{formatDate(item.eventDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="relative w-full max-w-lg bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-2xl flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
              aria-label="Tutup detail prestasi"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#FFAE5D]/20 text-[#B54708] text-xs font-bold font-mono">
                {selectedAchievement.rank}
              </span>
              <span className="text-xs font-mono text-text-muted">
                Tingkat {selectedAchievement.level}
              </span>
            </div>

            <h3 className="font-heading font-black text-2xl text-text-primary tracking-tight">
              {selectedAchievement.title}
            </h3>

            {selectedAchievement.competition && (
              <p className="text-xs text-text-muted font-medium -mt-2">
                Ajang: {selectedAchievement.competition}
              </p>
            )}

            {selectedAchievement.imageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-surface-soft border border-border">
                <Image
                  src={selectedAchievement.imageUrl}
                  alt={selectedAchievement.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-4 rounded-xl bg-surface-soft border border-border flex flex-col gap-2 text-xs">
              <div>
                <span className="text-text-muted block">Penerima Penghargaan:</span>
                <span className="font-semibold text-text-primary">
                  {selectedAchievement.recipient || 'Mahasiswa Statistika 62'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Tanggal Capaian:</span>
                <span className="font-semibold text-text-primary">
                  {formatDate(selectedAchievement.eventDate)}
                </span>
              </div>
            </div>

            {selectedAchievement.description && (
              <p className="text-xs text-text-secondary leading-relaxed">
                {selectedAchievement.description}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
