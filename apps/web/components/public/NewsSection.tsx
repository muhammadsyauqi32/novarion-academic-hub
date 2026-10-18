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

            {/* Category Filter Pills (No decorative borders) */}
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
          /* Visually Restrained Clean Empty State */
          <Reveal yOffset={16}>
            <div className="p-12 sm:p-16 rounded-xs bg-[#FAF9F5] text-center max-w-lg mx-auto flex flex-col items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xs bg-[#41C2A1]/20 flex items-center justify-center text-[#0F2821] shadow-2xs">
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
          /* Shared Content Container -> Flexbox Collection with Wrapping */
          <Reveal delayMs={100} yOffset={20}>
            <div className="p-4 sm:p-8 md:p-10 rounded-xs bg-[#FAF9F5]/70 backdrop-blur-xs shadow-sm">
              <div className="flex flex-wrap gap-6 items-stretch justify-start">
                {filteredNews.map((item, idx) => (
                  <div
                    key={item.id}
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
                    className="w-full md:w-[calc(50%-0.75rem)] md:basis-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] lg:basis-[calc(33.333%-1rem)] flex-grow flex flex-col justify-between p-6 rounded-xs bg-[#FFFFFF] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#176C5B]"
                  >
                    <div className="flex flex-col gap-3.5">
                      {item.coverImageUrl && (
                        <div className="relative aspect-[16/10] w-full rounded-xs overflow-hidden bg-[#FAF9F5]">
                          <Image
                            src={item.coverImageUrl}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs font-mono pt-1">
                        <span className="px-2.5 py-0.5 rounded-xs bg-[#FFAE5D] text-[#112A24] font-bold text-[11px] uppercase tracking-wider shadow-2xs">
                          {item.category || 'WARTA'}
                        </span>
                        <span className="text-[#0F2821]/70 font-medium">{formatDate(item.publishedAt)}</span>
                      </div>

                      <h3 className="font-heading font-black text-xl text-[#0F2821] tracking-tight leading-snug group-hover:text-[#176C5B] transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#0F2821]/80 leading-relaxed font-sans line-clamp-3">
                        {item.excerpt || item.content.slice(0, 160)}...
                      </p>
                    </div>

                    <div className="mt-5 pt-3 flex items-center justify-between text-xs font-mono font-bold text-[#0F2821]">
                      <span>BACA SELENGKAPNYA</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
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
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded-xs bg-[#FFAE5D] text-[#112A24] font-bold shadow-2xs">
                    {selectedArticle.category || 'WARTA'}
                  </span>
                  <span className="text-[#0F2821]/70">{formatDate(selectedArticle.publishedAt)}</span>
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
