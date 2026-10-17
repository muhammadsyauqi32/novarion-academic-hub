'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CMSNews } from '@novarion/shared';
import { Calendar, Tag, ArrowRight, X, Newspaper, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/Button';

interface NewsSectionProps {
  news: CMSNews[];
}

export function NewsSection({ news }: NewsSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<CMSNews | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const categories = ['Semua', ...Array.from(new Set(news.map((n) => n.category).filter(Boolean)))];

  const filteredNews = activeCategory === 'Semua' 
    ? news 
    : news.filter((n) => n.category === activeCategory);

  const featured = filteredNews.find((n) => n.isFeatured) || filteredNews[0];
  const regularUpdates = filteredNews.filter((n) => n.id !== featured?.id);

  const formatDate = (d?: Date | string | null) => {
    if (!d) return 'Baru saja';
    const date = new Date(d);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section id="berita" className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80 scroll-mt-16">
      {/* Editorial Header & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-deep">
            <span>{'// BAB III'}</span>
            <span>•</span>
            <span>WARTA & JURNAL KEGIATAN</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-text-primary tracking-tight leading-tight">
            Kabar Kolektif & Dinamika Angkatan
          </h2>
        </div>

        {/* Category Pills */}
        {news.length > 0 && (
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

      {news.length === 0 ? (
        /* Visually Restrained Clean Empty State (Zero Technical CMS jargon) */
        <div className="p-12 sm:p-16 rounded-2xl bg-surface border border-border/80 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center text-teal-deep">
            <Newspaper className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading font-bold text-lg text-text-primary">
              Belum Ada Catatan Warta untuk Edisi Ini
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Liputan kegiatan resmi, kabar akademik, dan buletin berkala angkatan akan dipublikasikan pada kolom warta ini.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* Featured Headline Article (Newspaper Lead Story Style) */}
          {featured && (
            <div className="p-6 sm:p-10 rounded-2xl bg-surface border border-border shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {featured.coverImageUrl && (
                <div className="lg:col-span-5 relative aspect-[16/10] rounded-xl overflow-hidden bg-surface-soft border border-border/70">
                  <Image
                    src={featured.coverImageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className={`${featured.coverImageUrl ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col gap-4`}>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded bg-[#FFAE5D]/20 text-[#B54708] font-bold">
                    EDISI PILIHAN
                  </span>
                  <span className="text-teal-deep font-semibold">
                    {featured.category}
                  </span>
                  <span className="text-text-muted">
                    {formatDate(featured.publishedAt)}
                  </span>
                </div>

                <h3 className="font-heading font-black text-2xl sm:text-4xl text-text-primary leading-tight tracking-tight">
                  {featured.title}
                </h3>

                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 font-sans">
                  {featured.excerpt || featured.content.slice(0, 200)}...
                </p>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedArticle(featured)}
                    className="font-bold text-xs gap-1.5"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Articles Grid */}
          {regularUpdates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularUpdates.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedArticle(item)}
                  className="p-6 rounded-2xl bg-surface border border-border hover:border-teal-deep/50 transition-all flex flex-col justify-between cursor-pointer group shadow-2xs"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                      <span className="text-teal-deep font-semibold">{item.category}</span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-text-primary group-hover:text-teal-deep transition-colors line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                      {item.excerpt || item.content.slice(0, 120)}...
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-teal-deep">
                    <span>Baca Warta</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-2xl flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
              aria-label="Tutup warta"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              <span className="text-teal-deep font-bold">{selectedArticle.category}</span>
              <span>•</span>
              <span>{formatDate(selectedArticle.publishedAt)}</span>
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
              {selectedArticle.title}
            </h2>

            {selectedArticle.coverImageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-surface-soft border border-border/80">
                <Image
                  src={selectedArticle.coverImageUrl}
                  alt={selectedArticle.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-sans border-t border-border/60 pt-4">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedArticle(null)}
                className="text-xs"
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
