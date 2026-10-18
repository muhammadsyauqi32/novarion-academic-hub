'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CMSAlbum, CMSAlbumPhoto } from '@novarion/shared';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GallerySectionProps {
  albums: CMSAlbum[];
}

export function GallerySection({ albums }: GallerySectionProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Flatten all photos with album metadata for unified viewing
  const allPhotos: Array<{ photo: CMSAlbumPhoto; albumTitle: string }> = albums.flatMap((album) =>
    (album.photos || []).map((photo) => ({
      photo,
      albumTitle: album.title,
    }))
  );

  const displayedPhotos =
    selectedAlbumId === 'all'
      ? allPhotos
      : allPhotos.filter((item) => {
          const alb = albums.find((a) => a.id === selectedAlbumId);
          return alb && alb.photos?.some((p) => p.id === item.photo.id);
        });

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! + 1) % displayedPhotos.length);
    }
  }, [lightboxIndex, displayedPhotos.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev! - 1 + displayedPhotos.length) % displayedPhotos.length);
    }
  }, [lightboxIndex, displayedPhotos.length]);

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
    <section id="galeri" className="w-full bg-[#0D1B2A] border-b border-[#FAF9F5]/15 py-16 md:py-24 scroll-mt-16 text-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FFAE5D]">
              <span className="bg-[#FFAE5D] text-[#0D1B2A] px-2 py-0.5 rounded-xs">BAB IV</span>
              <span>/</span>
              <span>ARSIP VISUAL & MEMORI</span>
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-6xl text-[#FAF9F5] tracking-tight leading-tight">
              Jejak Langkah & Dokumentasi
            </h2>
          </div>

          {/* Album Selector Tabs (Sharp Corners) */}
          {albums.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedAlbumId('all')}
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xs border transition-colors ${
                  selectedAlbumId === 'all'
                    ? 'bg-[#FFAE5D] text-[#0D1B2A] border-[#FFAE5D]'
                    : 'bg-[#15283C] text-[#FAF9F5] border-[#FAF9F5]/20 hover:border-[#FFAE5D]'
                }`}
              >
                Semua Album ({allPhotos.length})
              </button>
              {albums.map((alb) => (
                <button
                  key={alb.id}
                  onClick={() => setSelectedAlbumId(alb.id)}
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xs border transition-colors ${
                    selectedAlbumId === alb.id
                      ? 'bg-[#FFAE5D] text-[#0D1B2A] border-[#FFAE5D]'
                      : 'bg-[#15283C] text-[#FAF9F5] border-[#FAF9F5]/20 hover:border-[#FFAE5D]'
                  }`}
                >
                  {alb.title} ({alb.photos?.length || 0})
                </button>
              ))}
            </div>
          )}
        </div>

        {displayedPhotos.length === 0 ? (
          /* Visually Restrained Clean Empty State (Zero Technical CMS Jargon) */
          <div className="p-12 sm:p-16 rounded-xs bg-[#15283C] border border-[#FAF9F5]/20 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xs bg-[#41C2A1]/20 border border-[#41C2A1]/40 flex items-center justify-center text-[#41C2A1]">
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
        ) : (
          /* Asymmetrical Photography Collage with Square Image Edges (rounded-xs / rounded-none) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {displayedPhotos.map((item, idx) => {
              // Asymmetric editorial sizing pattern
              const isLarge = idx % 5 === 0;
              const isMedium = idx % 5 === 1 || idx % 5 === 2;
              const colSpan = isLarge ? 'lg:col-span-8' : isMedium ? 'lg:col-span-4' : 'lg:col-span-6';
              const aspect = isLarge ? 'aspect-[16/10]' : 'aspect-square';

              return (
                <div
                  key={item.photo.id || idx}
                  onClick={() => openLightbox(idx)}
                  className={`${colSpan} group relative ${aspect} overflow-hidden rounded-xs bg-[#15283C] border-2 border-[#FAF9F5]/20 hover:border-[#FFAE5D] transition-all cursor-pointer`}
                >
                  <Image
                    src={item.photo.imageUrl}
                    alt={item.photo.caption || item.albumTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {/* Archival Physical Marker Overlay */}
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-[#FFAE5D] font-bold select-none opacity-0 group-hover:opacity-100 transition-opacity">
                    + FRAME #{String(idx + 1).padStart(3, '0')}
                  </div>

                  {/* Caption Strip */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/80 to-transparent flex flex-col justify-end">
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
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Viewer (Sharp Corners) */}
      {lightboxIndex !== null && displayedPhotos[lightboxIndex] && (
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
                DOKUMEN {lightboxIndex + 1} / {displayedPhotos.length}
              </span>
              <button
                onClick={closeLightbox}
                className="p-2 rounded-xs border border-[#FAF9F5]/30 hover:bg-[#FFAE5D] hover:text-[#0D1B2A] text-[#FAF9F5] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-xs overflow-hidden border-2 border-[#FAF9F5]/30 bg-[#0D1B2A]">
              <Image
                src={displayedPhotos[lightboxIndex].photo.imageUrl}
                alt={displayedPhotos[lightboxIndex].photo.caption || 'Foto Galeri'}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Navigation & Caption */}
            <div className="w-full flex items-center justify-between px-2 text-xs font-mono">
              <button
                onClick={showPrev}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-[#FAF9F5]/30 hover:bg-[#FFAE5D] hover:text-[#0D1B2A] text-[#FAF9F5] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="text-center max-w-md px-4">
                <span className="font-bold text-[#FFAE5D] block">
                  {displayedPhotos[lightboxIndex].albumTitle}
                </span>
                {displayedPhotos[lightboxIndex].photo.caption && (
                  <p className="text-xs text-[#FAF9F5]/90 mt-0.5">
                    {displayedPhotos[lightboxIndex].photo.caption}
                  </p>
                )}
              </div>

              <button
                onClick={showNext}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-[#FAF9F5]/30 hover:bg-[#FFAE5D] hover:text-[#0D1B2A] text-[#FAF9F5] transition-colors"
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
