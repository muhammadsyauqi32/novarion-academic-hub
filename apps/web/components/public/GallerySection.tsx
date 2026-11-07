'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { CMSAlbum, CMSAlbumPhoto } from '@novarion/shared';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { useFilterAnimation } from './useFilterAnimation';

interface GallerySectionProps {
  albums: CMSAlbum[];
}

export function GallerySection({ albums }: GallerySectionProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Flatten all photos with album metadata for unified viewing
  const allPhotos: Array<{ photo: CMSAlbumPhoto; albumTitle: string }> = useMemo(
    () =>
      albums.flatMap((album) =>
        (album.photos || []).map((photo) => ({
          photo,
          albumTitle: album.title,
        }))
      ),
    [albums]
  );

  const filterFn = useCallback(
    (item: { photo: CMSAlbumPhoto; albumTitle: string }) => {
      if (selectedAlbumId === 'all') return true;
      const alb = albums.find((a) => a.id === selectedAlbumId);
      return alb ? alb.photos?.some((p) => p.id === item.photo.id) ?? false : false;
    },
    [albums, selectedAlbumId]
  );

  const getItemId = useCallback(
    (item: { photo: CMSAlbumPhoto; albumTitle: string }) => item.photo.id || item.photo.imageUrl,
    []
  );

  const { displayedItems, registerItemRef } = useFilterAnimation({
    items: allPhotos,
    filterFn,
    getItemId,
  });

  const activePhotos = useMemo(
    () => displayedItems.filter((i) => !i.isExiting).map((i) => i.data),
    [displayedItems]
  );

  const openLightbox = (photoId: string) => {
    const idx = activePhotos.findIndex((p) => (p.photo.id || p.photo.imageUrl) === photoId);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex !== null && activePhotos.length > 0) {
      setLightboxIndex((prev) => (prev! + 1) % activePhotos.length);
    }
  }, [lightboxIndex, activePhotos.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex !== null && activePhotos.length > 0) {
      setLightboxIndex((prev) => (prev! - 1 + activePhotos.length) % activePhotos.length);
    }
  }, [lightboxIndex, activePhotos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, showNext, showPrev]);

  return (
    <section id="galeri" className="w-full bg-canvas py-16 md:py-24 scroll-mt-16 transition-colors duration-200 border-b border-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal yOffset={16}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-border">
            <div className="max-w-2xl">
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight leading-tight">
                Rekam Jejak Kebersamaan di Kampus dan Lapangan.
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-2 leading-relaxed font-sans">
                Kompilasi momen perkuliahan di Dramaga, sesi praktikum komputasi statistik, hingga temu akrab keluarga besar Angkatan 62.
              </p>
            </div>

            {/* Album Selector Tabs */}
            {albums.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-1.5 shrink-0"
                role="group"
                aria-label="Pilihan album galeri"
              >
                <button
                  type="button"
                  aria-pressed={selectedAlbumId === 'all'}
                  onClick={() => setSelectedAlbumId('all')}
                  className={`text-xs font-sans px-3 py-1.5 rounded-input transition-all duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep ${
                    selectedAlbumId === 'all'
                      ? 'bg-teal-deep text-white dark:text-[#0C1815] font-bold shadow-xs'
                      : 'bg-surface text-text-muted hover:text-text-primary border border-border hover:bg-surface-soft font-medium'
                  }`}
                >
                  Semua ({allPhotos.length})
                </button>
                {albums.map((alb) => {
                  const isSelected = selectedAlbumId === alb.id;
                  return (
                    <button
                      key={alb.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedAlbumId(alb.id)}
                      className={`text-xs font-sans px-3 py-1.5 rounded-input transition-all duration-150 focus-visible:outline-2 focus-visible:outline-teal-deep ${
                        isSelected
                          ? 'bg-teal-deep text-white dark:text-[#0C1815] font-bold shadow-xs'
                          : 'bg-surface text-text-muted hover:text-text-primary border border-border hover:bg-surface-soft font-medium'
                      }`}
                    >
                      {alb.title} ({alb.photos?.length || 0})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>

        {displayedItems.length === 0 ? (
          /* Editorial Empty State */
          <Reveal yOffset={16}>
            <div className="py-16 px-6 text-center max-w-lg mx-auto flex flex-col items-center gap-3 border border-border rounded-card bg-surface-soft">
              <Camera className="w-8 h-8 text-text-muted/60" />
              <h3 className="font-heading font-bold text-lg text-text-primary">
                Belum Ada Foto dalam Album Ini
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
                Dokumentasi foto kegiatan kuliah, praktikum, dan kumpul angkatan sedang dikurasi oleh Divisi Media.
              </p>
            </div>
          </Reveal>
        ) : (
          /* Editorial Photo Mosaic Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
            {displayedItems.map(({ data: item, id, isExiting }, idx) => {
              // Create an asymmetric visual rhythm: first item is featured wide (7 cols on lg), next is 5 cols, etc.
              const colSpanClass =
                idx % 4 === 0
                  ? 'lg:col-span-7 aspect-[16/10]'
                  : idx % 4 === 1
                  ? 'lg:col-span-5 aspect-[16/10]'
                  : idx % 4 === 2
                  ? 'lg:col-span-5 aspect-[16/10]'
                  : 'lg:col-span-7 aspect-[16/10]';

              return (
                <div
                  key={id}
                  ref={registerItemRef(id)}
                  style={{
                    transition: isExiting ? 'opacity 160ms ease-out, transform 160ms ease-out' : undefined,
                    opacity: isExiting ? 0 : undefined,
                    transform: isExiting ? 'translateY(-8px) scale(0.96)' : undefined,
                    pointerEvents: isExiting ? 'none' : 'auto',
                  }}
                  className={`w-full flex ${colSpanClass.split(' ')[0]}`}
                >
                  <div
                    onClick={() => openLightbox(id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lihat foto dari album ${item.albumTitle}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(id);
                      }
                    }}
                    className={`group relative w-full overflow-hidden rounded-card bg-surface-soft border border-border shadow-xs hover:border-border-strong hover:-translate-y-0.5 transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-teal-deep ${colSpanClass.split(' ')[1]}`}
                  >
                    <Image
                      src={item.photo.imageUrl}
                      alt={item.photo.caption || item.albumTitle}
                      fill
                      className="object-cover group-hover:scale-102 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 700px"
                    />

                    {/* Editorial Caption Bar */}
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end text-white">
                      <span className="text-[10px] font-mono font-bold text-brand-orange uppercase tracking-wider">
                        {item.albumTitle}
                      </span>
                      {item.photo.caption && (
                        <p className="text-xs font-medium text-white/95 line-clamp-1 mt-0.5">
                          {item.photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Viewer */}
      {lightboxIndex !== null && activePhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Penampil foto ukuran penuh"
        >
          <div
            className="relative w-full max-w-5xl flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between text-xs font-mono text-white/80 px-2">
              <span className="font-bold text-brand-orange">
                Foto {lightboxIndex + 1} dari {activePhotos.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 rounded-input hover:bg-white/10 text-white transition-colors focus-visible:outline-2 focus-visible:outline-teal-deep"
                aria-label="Tutup penampil foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Stage with Nav Arrows */}
            <div className="relative aspect-[16/10] w-full max-h-[70vh] rounded-card overflow-hidden bg-black/40 flex items-center justify-center border border-white/10">
              <Image
                src={activePhotos[lightboxIndex].photo.imageUrl}
                alt={activePhotos[lightboxIndex].photo.caption || activePhotos[lightboxIndex].albumTitle}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1200px"
              />

              {activePhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showPrev();
                    }}
                    className="absolute left-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-teal-deep"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showNext();
                    }}
                    className="absolute right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-teal-deep"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption */}
            <div className="text-center px-4 max-w-xl">
              <span className="text-[11px] font-mono text-brand-orange uppercase tracking-wider block mb-1">
                Album: {activePhotos[lightboxIndex].albumTitle}
              </span>
              {activePhotos[lightboxIndex].photo.caption && (
                <p className="text-sm text-white/90 font-sans">
                  {activePhotos[lightboxIndex].photo.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
