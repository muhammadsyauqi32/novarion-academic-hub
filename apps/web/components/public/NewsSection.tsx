'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CMSNews } from '@novarion/shared';
import { ArrowRight, X, Newspaper } from 'lucide-react';
import { Reveal } from './Reveal';

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
    <section id="berita" className="w-full bg-[#C9FBD4] py-16 md:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontally Centered Section Header */}
        <Reveal yOffset={16}>
          <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center gap-3">
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#0F2821] tracking-tight leading-tight">
              Berita dan Kegiatan
            </h2>
            <p className="text-sm sm:text-base text-[#0F2821]/80 max-w-xl mx-auto leading-relaxed font-sans font-medium">
              Kabar terbaru, dokumentasi kegiatan, dan agenda resmi angkatan.
            </p>

            {/* Category Filter Options (Plain clean buttons without decorative borders) */}
            {news.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xs transition-colors shadow-2xs ${
                      activeCategory === cat
                        ? 'bg-[#0F2821] text-[#C9FBD4]'
                        : 'bg-[#FAF9F5] text-[#0F2821] hover:bg-[#FFAE5D]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {filteredNews.length === 0 ? (
          /* Clean Empty State without Nested Containers */
          <Reveal yOffset={16}>
            <div className="p-10 sm:p-14 rounded-xs bg-[#FAF9F5] text-center max-w-lg mx-auto flex flex-col items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xs bg-[#41C2A1]/20 flex items-center justify-center text-[#0F2821]">
                <Newspaper className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading font-black text-lg text-[#0F2821]">
                  Belum Ada Catatan Warta untuk Edisi Ini
                </h3>
                <p className="text-xs text-[#0F2821]/75 leading-relaxed font-sans">
                  Liputan kegiatan resmi, kabar akademik, dan buletin berkala angkatan akan dipublikasikan pada kolom warta ini.
                </p>
              </div>
            </div>
          </Reveal>
        ) : (
          /* ONE Clean Content Container Holding All News Cards (No giant card wrapper) */
          <div className="flex flex-wrap gap-6 justify-center lg:justify-start items-stretch">
            {filteredNews.map((item, idx) => (
              <Reveal
                key={item.id}
                delayMs={(idx % 6) * 60}
                yOffset={16}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[380px] shrink-0 flex"
              >
                <div
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
                  className="w-full flex flex-col justify-between p-5 rounded-xs bg-[#FFFFFF] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#176C5B] max-h-[min(560px,85dvh)]"
                >
                  <div className="flex flex-col gap-3">
                    {/* Consistent 16:9 Cover Image without nested wrappers */}
                    {item.coverImageUrl ? (
                      <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden bg-[#FAF9F5] shrink-0">
                        <Image
                          src={item.coverImageUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden bg-[#C9FBD4]/40 flex items-center justify-center text-[#0F2821]/40 shrink-0">
                        <Newspaper className="w-8 h-8" />
                      </div>
                    )}

                    {/* Category & Date as Plain Typographic Metadata (No enclosing boxes) */}
                    <div className="flex items-center gap-2 text-xs font-mono text-[#0F2821]/70 pt-1">
                      <span className="font-bold text-[#0F2821] uppercase tracking-wider">
                        {item.category || 'Warta'}
                      </span>
                      <span>·</span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    {/* Title (2-3 lines) */}
                    <h3 className="font-heading font-black text-lg sm:text-xl text-[#0F2821] tracking-tight leading-snug line-clamp-3 group-hover:text-[#176C5B] transition-colors">
                      {item.title}
                    </h3>

                    {/* Excerpt (2-3 lines) */}
                    <p className="text-xs sm:text-sm text-[#0F2821]/75 leading-relaxed font-sans line-clamp-3">
                      {item.excerpt || item.content.slice(0, 140)}...
                    </p>
                  </div>

                  {/* Read More Interaction */}
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs font-mono font-bold text-[#0F2821]">
                    <span>BACA SELENGKAPNYA</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#112A24]/75 backdrop-blur-xs"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#FAF9F5] rounded-xs p-6 sm:p-10 shadow-2xl flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#0F2821]/70">
                  <span className="font-bold text-[#0F2821] uppercase">
                    {selectedArticle.category || 'WARTA'}
                  </span>
                  <span>·</span>
                  <span>{formatDate(selectedArticle.publishedAt)}</span>
                </div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#0F2821] tracking-tight">
                  {selectedArticle.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-xs hover:bg-[#FFAE5D] text-[#0F2821] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedArticle.coverImageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden shadow-xs">
                <Image
                  src={selectedArticle.coverImageUrl}
                  alt={selectedArticle.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="prose prose-sm max-w-none text-[#0F2821] leading-relaxed font-sans whitespace-pre-wrap">
              {selectedArticle.content}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xs bg-[#0F2821] text-[#C9FBD4] font-mono text-xs font-bold uppercase hover:bg-[#FFAE5D] hover:text-[#0F2821] transition-colors shadow-xs"
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
