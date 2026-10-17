'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CMSAchievement } from '@novarion/shared';
import { Award, Trophy, Medal, Star, Calendar, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/Button';

interface AchievementsSectionProps {
  achievements: CMSAchievement[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [selectedAchievement, setSelectedAchievement] = useState<CMSAchievement | null>(null);

  const categories = ['Semua', ...Array.from(new Set(achievements.map((a) => a.category).filter(Boolean)))];

  const filtered = activeCategory === 'Semua'
    ? achievements
    : achievements.filter((a) => a.category === activeCategory);

  return (
    <section id="prestasi" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/60 scroll-mt-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col items-start gap-3 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-deep">
            Prestasi Angkatan
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
            Pencapaian, Karya & Apresiasi
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Daftar prestasi mahasiswa Statistika 62 dalam berbagai kompetisi sains data, riset ilmiah, dan kegiatan kemahasiswaan.
          </p>
        </div>

        {/* Filter Tabs */}
        {achievements.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                  activeCategory === cat
                    ? 'bg-teal-deep text-white border-teal-deep shadow-2xs'
                    : 'bg-surface text-text-muted border-border hover:border-border-focus'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center max-w-md mx-auto">
          <Trophy className="w-10 h-10 text-text-muted/60 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-text-primary">
            Belum Ada Prestasi yang Tercatat
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Data prestasi akademik dan kompetisi dikurasi langsung oleh admin angkatan melalui CMS Prestasi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-surface border border-border hover:border-border-focus transition-all flex flex-col justify-between shadow-2xs group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFAE5D]/15 text-[#B54708] text-[11px] font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{item.rank}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-text-muted px-2 py-0.5 rounded bg-surface-soft border border-border">
                    {item.level}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-base text-text-primary leading-snug line-clamp-2">
                  {item.title}
                </h4>

                <p className="text-xs font-medium text-teal-deep mt-1">
                  {item.competition}
                </p>

                <p className="text-xs text-text-muted mt-2">
                  Oleh: <span className="font-semibold text-text-primary">{item.recipient}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-text-muted">
                  {item.category}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAchievement(item)}
                  className="text-xs font-bold text-teal-deep hover:underline flex items-center gap-1"
                >
                  <span>Detail</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAchievement && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 sm:p-7 flex flex-col gap-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFAE5D]/15 text-[#B54708] text-xs font-bold w-fit">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{selectedAchievement.rank}</span>
                </span>
                <h3 className="font-heading font-black text-xl text-text-primary mt-1">
                  {selectedAchievement.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="p-1 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
                aria-label="Tutup detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAchievement.imageUrl && (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border">
                <Image
                  src={selectedAchievement.imageUrl}
                  alt={selectedAchievement.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex flex-col gap-2 text-xs text-text-muted">
              <div>
                <span className="font-semibold text-text-primary">Kompetisi / Acara:</span>{' '}
                {selectedAchievement.competition}
              </div>
              <div>
                <span className="font-semibold text-text-primary">Penerima / Tim:</span>{' '}
                {selectedAchievement.recipient}
              </div>
              <div>
                <span className="font-semibold text-text-primary">Tingkat & Kategori:</span>{' '}
                {selectedAchievement.level} • {selectedAchievement.category}
              </div>
              {selectedAchievement.eventDate && (
                <div>
                  <span className="font-semibold text-text-primary">Tahun / Tanggal:</span>{' '}
                  {selectedAchievement.eventDate}
                </div>
              )}
            </div>

            {selectedAchievement.description && (
              <p className="text-xs sm:text-sm text-text-primary leading-relaxed bg-surface-soft p-3.5 rounded-xl border border-border/70">
                {selectedAchievement.description}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAchievement(null)}
                className="text-xs font-semibold"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
