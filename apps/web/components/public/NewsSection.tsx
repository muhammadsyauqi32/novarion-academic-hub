'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { CMSNews } from '@novarion/shared';
import { ArrowRight, X, Newspaper, Calendar } from 'lucide-react';
import { Reveal } from './Reveal';
import { useFilterAnimation } from './useFilterAnimation';

interface NewsSectionProps {
  news: CMSNews[];
}

export function NewsSection({ news }: NewsSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<CMSNews | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const categories = ['Semua', ...Array.from(new Set(news.map((n) => n.category).filter(Boolean)))];

  const filterFn = useCallback(
    (n: CMSNews) => activeCategory === 'Semua' || n.category === activeCategory,
    [activeCategory]
  );

  const getItemId = useCallback((n: CMSNews) => n.id, []);

  const { displayedItems, registerItemRef } = useFilterAnimation({
    items: news,
    filterFn,
    getItemId,
  });

  const formatDate = (d?: Date | string | null) => {
    if (!d) return 'Baru saja';
    const date = new Date(d);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedArticle(null);
    };
    if (selectedArticle) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedArticle]);

  const activeItems = displayedItems.filter((i) => !i.isExiting);
  const featuredItem = activeItems[0]?.data;
  const secondaryItems = activeItems.slice(1);

  return (
    <section id="berita" className="w-full bg-canvas py-16 md:py-24 scroll-mt-16 transition-colors duration-200 border-b border-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Broadsheet Masthead */}
        <Reveal yOffset={16}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-border">
            <div className="max-w-2xl">
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight leading-tight">
                Kabar dari Kampus dan Kegiatan Bersama.
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-2 leading-relaxed font-sans">
                Rangkuman agenda akademik, informasi praktikum lab, kegiatan sosial, dan dokumentasi kebersamaan Novarion 62.
              </p>
            </div>

            {/* Category Filter Pills */}
            {news.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-1.5 shrink-0"
                role="group"
                aria-label="Filter kategori warta"
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

        {activeItems.length === 0 ? (
          /* Editorial Empty State */
          <Reveal yOffset={16}>
            <div className="py-16 px-6 text-center max-w-lg mx-auto flex flex-col items-center gap-3 border border-border rounded-card bg-surface-soft">
              <Newspaper className="w-8 h-8 text-text-muted/60" />
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Belum Ada Catatan Warta
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                Liputan kegiatan angkatan, edaran kurikulum, dan buletin berkala akan dipublikasikan pada kolom warta ini.
              </p>
            </div>
          </Reveal>
        ) : (
          /* Broadsheet Layout: 1 Featured Lead + Chronological Digest */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Lead / Featured Article (7 cols) */}
            {featuredItem && (
              <div
                ref={registerItemRef(featuredItem.id)}
                className="lg:col-span-7 flex flex-col group cursor-pointer"
                onClick={() => setSelectedArticle(featuredItem)}
                tabIndex={0}
                role="button"
                aria-label={`Baca warta utama: ${featuredItem.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedArticle(featuredItem);
                  }
                }}
              >
                <div className="relative aspect-[16/10] w-full rounded-card overflow-hidden bg-surface-soft border border-border">
                  {featuredItem.coverImageUrl ? (
                    <Image
                      src={featuredItem.coverImageUrl}
                      alt={featuredItem.title}
                      fill
                      priority
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 700px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted/40">
                      <Newspaper className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs bg-[#0C1815]/80 text-[#41C2A1] border border-white/10 backdrop-blur-xs">
                      {featuredItem.category || 'Warta Utama'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(featuredItem.publishedAt)}</span>
                  </div>

                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight leading-snug group-hover:text-teal-deep dark:group-hover:text-brand-primary transition-colors">
                    {featuredItem.title}
                  </h3>

                  <p className="text-sm sm:text-base text-text-muted leading-relaxed font-sans line-clamp-3">
                    {featuredItem.excerpt || featuredItem.content.slice(0, 180)}...
                  </p>

                  <div className="inline-flex items-center gap-2 text-xs font-sans font-bold text-teal-deep dark:text-brand-primary mt-2">
                    <span>Baca Liputan Lengkap</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Digest Articles List (5 cols) */}
            <div className="lg:col-span-5 flex flex-col divide-y divide-border border-t lg:border-t-0 border-border">
              {secondaryItems.length === 0 ? (
                <div className="py-6 text-xs text-text-muted font-sans">
                  Artikel berikutnya akan terbit seiring berjalannya kegiatan semester.
                </div>
              ) : (
                secondaryItems.map(({ data: item, id }) => (
                  <article
                    key={id}
                    ref={registerItemRef(id)}
                    className="py-5 first:pt-0 last:pb-0 flex flex-col gap-2 group cursor-pointer"
                    onClick={() => setSelectedArticle(item)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Buka warta: ${item.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedArticle(item);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                      <span className="font-bold text-teal-deep dark:text-brand-primary uppercase">
                        {item.category || 'Warta'}
                      </span>
                      <span className="text-border-strong">/</span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-text-primary tracking-tight leading-snug group-hover:text-teal-deep dark:group-hover:text-brand-primary transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans line-clamp-2">
                      {item.excerpt || item.content.slice(0, 120)}...
                    </p>

                    <div className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-teal-deep dark:text-brand-primary mt-1">
                      <span>Buka Catatan</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedArticle(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-modal-title"
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-surface border border-border rounded-modal p-6 sm:p-8 shadow-2xl flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex flex-col gap-1.5 pr-4">
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                  <span className="font-bold text-teal-deep dark:text-brand-primary uppercase">
                    {selectedArticle.category || 'Warta'}
                  </span>
                  <span className="text-border-strong">/</span>
                  <span>{formatDate(selectedArticle.publishedAt)}</span>
                </div>
                <h3
                  id="article-modal-title"
                  className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight"
                >
                  {selectedArticle.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-input hover:bg-surface-soft text-text-muted hover:text-text-primary transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-teal-deep"
                aria-label="Tutup jendela warta"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedArticle.coverImageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-card overflow-hidden border border-border">
                <Image
                  src={selectedArticle.coverImageUrl}
                  alt={selectedArticle.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="prose prose-sm max-w-none text-text-primary/90 leading-relaxed font-sans whitespace-pre-wrap">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-input bg-surface-soft text-text-primary font-sans text-xs font-bold hover:bg-border/60 transition-colors border border-border"
              >
                Tutup Pembaca
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
