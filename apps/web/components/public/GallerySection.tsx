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

  const { displayedItems, registerItemRef } = useFilterAnimation({
    items: allPhotos,
    filterFn,
    getItemId: (item) => item.photo.id || item.photo.imageUrl,
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  return (
    <section id="galeri" className="w-full bg-[#0D1B2A] py-16 md:py-24 scroll-mt-20 text-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontally Centered Section Header */}
        <Reveal yOffset={16}>
          <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center gap-3">
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#FAF9F5] tracking-tight leading-tight">
              Galeri dan Dokumentasi
            </h2>
            <p className="text-sm sm:text-base text-[#FAF9F5]/75 max-w-xl mx-auto leading-relaxed font-sans font-medium">
              Arsip visual dan rekaman momen kebersamaan Angkatan 62.
            </p>

            {/* Album Selector Tabs (Clean buttons, smooth color transition, no borders) */}
            {albums.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3" role="group" aria-label="Pilihan album galeri">
                <button
                  type="button"
                  aria-pressed={selectedAlbumId === 'all'}
                  onClick={() => setSelectedAlbumId('all')}
                  className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xs transition-colors duration-200 shadow-2xs ${
                    selectedAlbumId === 'all'
                      ? 'bg-[#FFAE5D] text-[#0D1B2A]'
                      : 'bg-[#15283C] text-[#FAF9F5] hover:bg-[#FFAE5D] hover:text-[#0D1B2A]'
                  }`}
                >
                  Semua Album ({allPhotos.length})
                </button>
                {albums.map((alb) => {
                  const isSelected = selectedAlbumId === alb.id;
                  return (
                    <button
                      key={alb.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedAlbumId(alb.id)}
                      className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-xs transition-colors duration-200 shadow-2xs ${
                        isSelected
                          ? 'bg-[#FFAE5D] text-[#0D1B2A]'
                          : 'bg-[#15283C] text-[#FAF9F5] hover:bg-[#FFAE5D] hover:text-[#0D1B2A]'
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
          /* Visually Restrained Clean Empty State */
          <Reveal yOffset={16}>
            <div className="p-12 sm:p-16 rounded-xs bg-[#15283C] text-center max-w-lg mx-auto flex flex-col items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xs bg-[#41C2A1]/20 flex items-center justify-center text-[#41C2A1] shadow-2xs">
                <Camera className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading font-black text-lg text-[#FAF9F5]">
                  Belum Ada Foto dalam Album Ini
                </h3>
                <p className="text-xs text-[#FAF9F5]/70 leading-relaxed font-sans">
                  Arsip visual kegiatan angkatan akan didokumentasikan di sini sebagai rekam jejak memori kebersamaan Statistika 62.
                </p>
              </div>
            </div>
          </Reveal>
        ) : (
          /* Clean Editorial Photography Grid (Always reflows from leftmost position with smooth FLIP transitions) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch justify-start">
            {displayedItems.map(({ data: item, id, isExiting }) => {
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
                  className="w-full flex"
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
                    className="group relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-[#15283C] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FFAE5D]"
                  >
                    <Image
                      src={item.photo.imageUrl}
                      alt={item.photo.caption || item.albumTitle}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Caption Strip */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/75 to-transparent flex flex-col justify-end">
                      <span className="text-[10px] font-mono font-bold text-[#FFAE5D] uppercase tracking-wider">
                        {item.albumTitle}
                      </span>
                      {item.photo.caption && (
                        <p className="text-xs font-semibold text-[#FAF9F5] line-clamp-1 mt-0.5">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1B2A]/95 backdrop-blur-xs"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-5xl flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between text-xs font-mono text-[#FAF9F5]/80 px-2">
              <span className="font-bold text-[#FFAE5D]">
                Foto {lightboxIndex + 1} dari {activePhotos.length}
              </span>
              <button
                onClick={closeLightbox}
                className="p-2 rounded-xs hover:bg-[#FFAE5D] hover:text-[#0D1B2A] text-[#FAF9F5] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-xs overflow-hidden bg-[#0D1B2A] shadow-2xl">
              <Image
                src={activePhotos[lightboxIndex].photo.imageUrl}
                alt={activePhotos[lightboxIndex].photo.caption || 'Foto Galeri'}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Navigation & Caption */}
            <div className="w-full flex items-center justify-between px-2 text-xs font-mono">
              <button
                onClick={showPrev}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs hover:bg-[#FFAE5D] hover:text-[#0D1B2A] text-[#FAF9F5] transition-colors bg-[#15283C]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="text-center max-w-md px-4">
                <span className="font-bold text-[#FFAE5D] block">
                  {activePhotos[lightboxIndex].albumTitle}
                </span>
                {activePhotos[lightboxIndex].photo.caption && (
                  <p className="text-xs text-[#FAF9F5]/90 mt-0.5">
                    {activePhotos[lightboxIndex].photo.caption}
                  </p>
                )}
              </div>

              <button
                onClick={showNext}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs hover:bg-[#FFAE5D] hover:text-[#0D1B2A] text-[#FAF9F5] transition-colors bg-[#15283C]"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

