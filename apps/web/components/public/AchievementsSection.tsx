'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { CMSAchievement } from '@novarion/shared';
import { Trophy, ExternalLink, X, Award } from 'lucide-react';
import { Reveal } from './Reveal';
import { useFilterAnimation } from './useFilterAnimation';

interface AchievementsSectionProps {
  achievements: CMSAchievement[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<CMSAchievement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const categories = ['Semua', ...Array.from(new Set(achievements.map((a) => a.category).filter(Boolean)))];

  const filterFn = useCallback(
    (a: CMSAchievement) => activeCategory === 'Semua' || a.category === activeCategory,
    [activeCategory]
  );

  const getItemId = useCallback((a: CMSAchievement) => a.id, []);

  const { displayedItems, registerItemRef } = useFilterAnimation({
    items: achievements,
    filterFn,
    getItemId,
  });

  const formatDate = (d?: Date | string | null) => {
    if (!d) return 'Tahun ini';
    const date = new Date(d);
    return date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAchievement(null);
    };
    if (selectedAchievement) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedAchievement]);

  return (
    <section id="prestasi" className="w-full bg-canvas py-16 md:py-24 scroll-mt-16 transition-colors duration-200 border-b border-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal yOffset={16}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-border">
            <div className="max-w-2xl">
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight leading-tight">
                Lembar Kehormatan Mahasiswa.
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-2 leading-relaxed font-sans">
                Dokumentasi capaian mahasiswa Statistika 62 pada kompetisi sains data, hackathon, esai ilmiah, dan olimpiade matematika.
              </p>
            </div>

            {/* Filter Categories */}
            {achievements.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-1.5 shrink-0"
                role="group"
                aria-label="Filter kategori prestasi"
              >
                {categories.map((cat) => {
                  const isSelected = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs font-sans px-3 py-1.5 rounded-input transition-all duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep ${
                        isSelected
                          ? 'bg-teal-deep text-white dark:text-[#0C1815] font-bold shadow-xs'
                          : 'bg-surface text-text-muted hover:text-text-primary border border-border hover:bg-surface-soft font-medium'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>

        {displayedItems.length === 0 ? (
          /* Honest, Clear Student Empty State */
          <Reveal yOffset={16}>
            <div className="py-16 px-6 text-center max-w-lg mx-auto flex flex-col items-center gap-3 border border-border rounded-card bg-surface-soft">
              <Trophy className="w-8 h-8 text-brand-orange" />
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Lembar Prestasi Terbuka
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                Lembar ini mengarsipkan kejuaraan kompetisi sains data, karya tulis, dan lomba akademik mahasiswa Angkatan 62. Kamu yang baru saja meraih kejuaraan dapat menghubungi Divisi Akademik untuk dicatatkan di sini.
              </p>
            </div>
          </Reveal>
        ) : (
          /* Editorial Ledger Format */
          <div className="flex flex-col gap-3">
            {/* Desktop Ledger Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 text-xs font-mono font-bold text-text-muted uppercase tracking-wider border-b border-border">
              <span className="col-span-2">Predikat</span>
              <span className="col-span-5">Kompetisi &amp; Karya</span>
              <span className="col-span-3">Penerima Apresiasi</span>
              <span className="col-span-2 text-right">Periode</span>
            </div>

            {/* Ledger Rows */}
            <div className="flex flex-col gap-2.5">
              {displayedItems.map(({ data: item, id, isExiting }) => (
                <div
                  key={id}
                  ref={registerItemRef(id)}
                  style={{
                    transition: isExiting ? 'opacity 160ms ease-out, transform 160ms ease-out' : undefined,
                    opacity: isExiting ? 0 : undefined,
                    transform: isExiting ? 'translateY(-8px) scale(0.98)' : undefined,
                    pointerEvents: isExiting ? 'none' : 'auto',
                  }}
                >
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
                    className="p-4 sm:p-5 rounded-card bg-surface border border-border hover:border-border-strong hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col md:grid md:grid-cols-12 md:items-center gap-3 sm:gap-4 shadow-xs focus-visible:outline-2 focus-visible:outline-teal-deep"
                  >
                    {/* Rank Typography */}
                    <div className="md:col-span-2 flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-brand-orange/15 text-[#9E5507] dark:text-brand-orange border border-brand-orange/30 text-xs font-mono font-bold uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5" />
                        <span>{item.rank || 'Prestasi'}</span>
                      </span>
                    </div>

                    {/* Title & Competition */}
                    <div className="md:col-span-5 flex flex-col">
                      <h3 className="font-heading font-bold text-base text-text-primary group-hover:text-teal-deep dark:group-hover:text-brand-primary transition-colors tracking-tight">
                        {item.title}
                      </h3>
                      {item.competition && (
                        <span className="text-xs text-text-muted font-sans mt-0.5">
                          {item.competition}
                        </span>
                      )}
                    </div>

                    {/* Recipient */}
                    <div className="md:col-span-3 flex flex-col">
                      <span className="text-xs font-bold text-text-primary">
                        {item.recipient}
                      </span>
                      <span className="text-[11px] font-mono text-text-muted">
                        {item.category || 'Statistika & Sains Data'}
                      </span>
                    </div>

                    {/* Date & Action */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3 text-xs font-mono text-text-muted">
                      <span>{formatDate(item.eventDate)}</span>
                      <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-teal-deep dark:group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedAchievement(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="achievement-modal-title"
        >
          <div
            className="w-full max-w-2xl bg-surface border border-border rounded-modal p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex flex-col gap-1.5 pr-4">
                <span className="inline-block self-start px-2.5 py-0.5 rounded-xs bg-brand-orange/20 text-[#9E5507] dark:text-brand-orange text-xs font-mono font-bold uppercase border border-brand-orange/40">
                  {selectedAchievement.rank || 'PRESTASI RESMI'}
                </span>
                <h3
                  id="achievement-modal-title"
                  className="font-heading font-black text-2xl text-text-primary tracking-tight mt-1"
                >
                  {selectedAchievement.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="p-2 rounded-input hover:bg-surface-soft text-text-muted hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-teal-deep shrink-0"
                aria-label="Tutup detail prestasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAchievement.imageUrl && (
              <div className="relative aspect-[16/10] w-full rounded-card overflow-hidden bg-surface-soft border border-border shadow-xs">
                <Image
                  src={selectedAchievement.imageUrl}
                  alt={selectedAchievement.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-4 rounded-input bg-surface-soft border border-border text-xs font-mono">
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Kompetisi:</span>
                <span className="font-bold text-text-primary">
                  {selectedAchievement.competition || 'Kompetisi Terbuka'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Penerima:</span>
                <span className="font-bold text-text-primary">{selectedAchievement.recipient}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Bidang:</span>
                <span className="font-bold text-text-primary">
                  {selectedAchievement.category || 'Sains Data'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Periode:</span>
                <span className="font-bold text-text-primary">
                  {formatDate(selectedAchievement.eventDate)}
                </span>
              </div>
            </div>

            {selectedAchievement.description && (
              <p className="text-sm text-text-primary/90 leading-relaxed font-sans">
                {selectedAchievement.description}
              </p>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="px-5 py-2.5 rounded-input bg-surface-soft text-text-primary font-sans text-xs font-bold hover:bg-border/60 transition-colors border border-border"
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
