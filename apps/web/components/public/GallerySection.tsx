'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CMSAlbum, CMSAlbumPhoto } from '@novarion/shared';
import { Image as ImageIcon, ChevronLeft, ChevronRight, X, Calendar, Layers } from 'lucide-react';
import { Button } from '@/components/Button';

interface GallerySectionProps {
  albums: CMSAlbum[];
}

export function GallerySection({ albums }: GallerySectionProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Flatten all photos for curated collage view
  const allPhotos: { photo: CMSAlbumPhoto; albumTitle: string }[] = albums.flatMap((album) =>
    (album.photos || []).map((p) => ({
      photo: p,
      albumTitle: album.title,
    }))
  );

  const displayedPhotos = selectedAlbumId === 'all'
    ? allPhotos
    : allPhotos.filter((item) => item.photo.albumId === selectedAlbumId);

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

  // Keyboard navigation support: ArrowLeft, ArrowRight, Escape
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
    <section id="galeri" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/60 scroll-mt-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col items-start gap-3 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-deep">
            Galeri & Dokumentasi
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-text-primary tracking-tight">
            Momen Kebersamaan & Jejak Langkah
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Arsip visual setiap fase perjuangan, kegiatan kebersamaan, dan dinamika pembelajaran di IPB University.
          </p>
        </div>

        {/* Album Selector Tabs */}
        {albums.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedAlbumId('all')}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                selectedAlbumId === 'all'
                  ? 'bg-teal-deep text-white border-teal-deep shadow-2xs'
                  : 'bg-surface text-text-muted border-border hover:border-border-focus'
              }`}
            >
              Semua Momen ({allPhotos.length})
            </button>
            {albums.map((alb) => (
              <button
                key={alb.id}
                onClick={() => setSelectedAlbumId(alb.id)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                  selectedAlbumId === alb.id
                    ? 'bg-teal-deep text-white border-teal-deep shadow-2xs'
                    : 'bg-surface text-text-muted border-border hover:border-border-focus'
                }`}
              >
                {alb.title} ({(alb.photos || []).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {displayedPhotos.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center max-w-md mx-auto">
          <ImageIcon className="w-10 h-10 text-text-muted/60 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-text-primary">
            Belum Ada Dokumentasi Foto
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Album kegiatan dan galeri dokumentasi foto dapat diunggah melalui CMS Galeri oleh divisi dokumentasi.
          </p>
        </div>
      ) : (
        /* Curated Asymmetrical Collage */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayedPhotos.map((item, idx) => (
            <div
              key={item.photo.id || idx}
              onClick={() => openLightbox(idx)}
              className="relative aspect-square rounded-xl overflow-hidden bg-surface-soft border border-border group cursor-pointer shadow-2xs"
            >
              <Image
                src={item.photo.imageUrl}
                alt={item.photo.caption || item.albumTitle}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-[#C9FBD4] uppercase tracking-wider">
                  {item.albumTitle}
                </span>
                {item.photo.caption && (
                  <p className="text-xs text-white font-medium line-clamp-1 mt-0.5">
                    {item.photo.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && displayedPhotos[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Tutup foto"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {displayedPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-2 sm:left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-2 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Centered Image Container */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[70vh]">
              <Image
                src={displayedPhotos[lightboxIndex].photo.imageUrl}
                alt={displayedPhotos[lightboxIndex].photo.caption || 'Dokumentasi Novarion 62'}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
              />
            </div>

            {/* Caption & Metadata Bar */}
            <div className="mt-4 text-center px-4 max-w-xl">
              <span className="text-xs font-bold text-[#41C2A1] uppercase tracking-wider">
                {displayedPhotos[lightboxIndex].albumTitle}
              </span>
              {displayedPhotos[lightboxIndex].photo.caption && (
                <p className="text-sm text-white font-medium mt-1">
                  {displayedPhotos[lightboxIndex].photo.caption}
                </p>
              )}
              <span className="text-[11px] text-white/50 block mt-1">
                {lightboxIndex + 1} dari {displayedPhotos.length} foto • Gunakan tombol panah [← / →] atau [ESC]
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
