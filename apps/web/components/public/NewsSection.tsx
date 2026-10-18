'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CMSNews } from '@novarion/shared';
import { ArrowRight, X, Newspaper, Calendar } from 'lucide-react';

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
    <section id="berita" className="w-full bg-[#C9FBD4] border-b border-[#0F2821]/10 py-16 md:py-24 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#0F2821]">
              <span className="bg-[#0F2821] text-[#C9FBD4] px-2 py-0.5 rounded-xs">BAB III</span>
              <span>/</span>
              <span>WARTA & JURNAL KEGIATAN</span>
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-6xl text-[#0F2821] tracking-tight leading-tight">
              Kabar Kolektif & Dinamika Angkatan
            </h2>
          </div>

          {/* Category Filter Pills (Sharp Corners) */}
          {news.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xs border transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#0F2821] text-[#C9FBD4] border-[#0F2821]'
                      : 'bg-[#FAF9F5] text-[#0F2821] border-[#0F2821]/20 hover:border-[#0F2821]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {news.length === 0 ? (
          /* Visually Restrained Clean Empty State (Zero Technical CMS Jargon) */
          <div className="p-12 sm:p-16 rounded-xs bg-[#FAF9F5] border border-[#0F2821]/15 text-center max-w-lg mx-auto flex flex-col items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xs bg-[#41C2A1]/20 border border-[#0F2821]/20 flex items-center justify-center text-[#0F2821]">
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
        ) : (
          <div className="flex flex-col gap-8">
            {/* Featured Headline Article (Magazine Lead Story Style) */}
            {featured && (
              <div className="p-6 sm:p-8 rounded-xs bg-[#FAF9F5] border border-[#0F2821]/15 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {featured.coverImageUrl && (
                  <div className="lg:col-span-5 relative aspect-[16/10] rounded-xs overflow-hidden bg-[#FAF9F5] border border-[#0F2821]/20">
                    <Image
                      src={featured.coverImageUrl}
                      alt={featured.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  </div>
                )}

                <div className={`${featured.coverImageUrl ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col gap-4`}>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-xs bg-[#FFAE5D] text-[#112A24] font-black uppercase tracking-wider">
                      {featured.category || 'WARTA UTAMA'}
                    </span>
                    <span className="text-[#0F2821]/70">{formatDate(featured.publishedAt)}</span>
                  </div>

                  <h3 className="font-heading font-black text-2xl sm:text-4xl text-[#0F2821] tracking-tight leading-tight">
                    {featured.title}
                  </h3>

                  <p className="text-sm text-[#0F2821]/80 leading-relaxed font-sans line-clamp-3">
                    {featured.excerpt || featured.content.slice(0, 220)}...
                  </p>

                  <button
                    onClick={() => setSelectedArticle(featured)}
                    className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xs bg-[#0F2821] text-[#C9FBD4] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#FFAE5D] hover:text-[#0F2821] transition-colors mt-2"
                  >
                    <span>Baca Catatan Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Secondary Updates (Asymmetrical Magazine Column Layout) */}
            {regularUpdates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {regularUpdates.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="p-5 rounded-xs bg-[#FAF9F5] border border-[#0F2821]/20 hover:border-[#0F2821] transition-all cursor-pointer flex flex-col justify-between shadow-xs group"
                  >
                    <div className="flex flex-col gap-3">
                      {item.coverImageUrl && (
                        <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden bg-[#FAF9F5] border border-[#0F2821]/10">
                          <Image
                            src={item.coverImageUrl}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] font-mono text-[#0F2821]/70 pt-1">
                        <span className="font-bold text-[#0F2821] uppercase">{item.category || 'BULETIN'}</span>
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>

                      <h4 className="font-heading font-black text-lg text-[#0F2821] tracking-tight leading-snug group-hover:text-[#176C5B] transition-colors">
                        {item.title}
                      </h4>

                      <p className="text-xs text-[#0F2821]/75 leading-relaxed font-sans line-clamp-2">
                        {item.excerpt || item.content.slice(0, 120)}...
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#0F2821]/10 flex items-center justify-between text-xs font-mono font-bold text-[#0F2821]">
                      <span>BACA SELENGKAPNYA</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reader Modal (Sharp Corners / No AI Slop) */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#112A24]/75 backdrop-blur-xs"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#FAF9F5] border border-[#0F2821]/20 rounded-xs p-6 sm:p-10 shadow-2xl flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#0F2821]/20 pb-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-xs bg-[#FFAE5D] text-[#112A24] font-bold">
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
                className="p-1.5 rounded-xs border border-[#0F2821]/20 hover:bg-[#FFAE5D] text-[#0F2821] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedArticle.coverImageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden border border-[#0F2821]/20">
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

            <div className="pt-4 border-t border-[#0F2821]/20 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xs bg-[#0F2821] text-[#C9FBD4] font-mono text-xs font-bold uppercase hover:bg-[#FFAE5D] hover:text-[#0F2821] transition-colors"
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
