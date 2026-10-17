'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CMSNews } from '@novarion/shared';
import { Calendar, Tag, ArrowRight, X, Newspaper, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';

interface NewsSectionProps {
  news: CMSNews[];
}

export function NewsSection({ news }: NewsSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<CMSNews | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(6);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  const categories = ['Semua', ...Array.from(new Set(news.map((n) => n.category).filter(Boolean)))];

  const filteredNews = activeCategory === 'Semua' 
    ? news 
    : news.filter((n) => n.category === activeCategory);

  const featured = filteredNews.find((n) => n.isFeatured) || filteredNews[0];
  const regularUpdates = filteredNews.filter((n) => n.id !== featured?.id).slice(0, displayCount);

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
    <section id="berita" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/60 scroll-mt-16">
      {/* Section Header & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col items-start gap-3 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-deep">
            Warta & Kegiatan
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
            Kabar Angkatan, Agenda & Artikel
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Ikuti dinamika kegiatan, pencapaian akademik, dan informasi terkini langsung dari pengurus angkatan.
          </p>
        </div>

        {/* Category Pills */}
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
      </div>

      {news.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center max-w-md mx-auto">
          <Newspaper className="w-10 h-10 text-text-muted/60 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-text-primary">
            Belum Ada Warta yang Dipublikasikan
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Warta dan artikel kegiatan resmi akan diterbitkan melalui CMS Berita oleh pengurus angkatan.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Featured Article Layout */}
          {featured && (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border hover:border-border-focus transition-all shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFAE5D]/15 text-[#B54708] text-[11px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Warta Pilihan</span>
                  </span>
                  <span className="text-xs font-semibold text-teal-deep px-2.5 py-1 rounded-md bg-surface-soft border border-border">
                    {featured.category}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(featured.publishedAt)}</span>
                  </span>
                </div>

                <h3 className="font-heading font-black text-2xl sm:text-3xl text-text-primary leading-tight">
                  {featured.title}
                </h3>

                <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
                  {featured.excerpt || featured.content.slice(0, 180)}...
                </p>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedArticle(featured)}
                    className="font-bold text-xs"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>

              <div className="md:col-span-5 relative aspect-[16/10] rounded-xl overflow-hidden bg-surface-soft border border-border">
                {featured.coverImageUrl ? (
                  <Image
                    src={featured.coverImageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#41C2A1]/10 to-[#EAEAB7]/20 text-teal-deep text-center">
                    <Newspaper className="w-10 h-10 mb-2 opacity-80" />
                    <span className="text-xs font-semibold">Warta Novarion 62</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grid of Other Updates */}
          {regularUpdates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {regularUpdates.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-surface border border-border hover:border-border-focus transition-all flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-3">
                    {item.coverImageUrl && (
                      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-surface-soft border border-border mb-1">
                        <Image
                          src={item.coverImageUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-text-muted">
                      <span className="font-bold text-teal-deep uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-text-primary leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                      {item.excerpt || item.content.slice(0, 120)}...
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60 mt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedArticle(item)}
                      className="text-xs font-bold text-teal-deep hover:underline flex items-center gap-1.5"
                    >
                      <span>{item.type === 'article' ? 'Baca Artikel' : 'Lihat Warta'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progressive Loading CTA */}
          {filteredNews.length > displayCount + 1 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDisplayCount((prev) => prev + 6)}
                className="text-xs font-semibold px-6"
              >
                Muat Warta Lainnya
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Accessible Inline Reader Modal (No route navigation) */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-deep">
                  <span className="px-2 py-0.5 rounded bg-surface-soft border border-border">
                    {selectedArticle.category}
                  </span>
                  <span>•</span>
                  <span className="text-text-muted">{formatDate(selectedArticle.publishedAt)}</span>
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-text-primary mt-1">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors shrink-0"
                aria-label="Tutup artikel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Optional Cover Image */}
            {selectedArticle.coverImageUrl && (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border">
                <Image
                  src={selectedArticle.coverImageUrl}
                  alt={selectedArticle.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content Body (Rendered cleanly and safely) */}
            <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {selectedArticle.content}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-border/60 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedArticle(null)}
                className="font-semibold text-xs"
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
