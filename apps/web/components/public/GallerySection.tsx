'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CMSAlbum, CMSAlbumPhoto } from '@novarion/shared';
import { Camera, X, ChevronLeft, ChevronRight, Sparkles, FolderArchive } from 'lucide-react';

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
    <section id="galeri" className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-border/80 scroll-mt-16">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal-deep">
            <span>{'// BAB IV'}</span>
            <span>•</span>
            <span>ARSIP VISUAL & MEMORI</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-text-primary tracking-tight leading-tight">
            Jejak Langkah & Dokumentasi
          </h2>
        </div>

        {/* Album Selector Tabs */}
        {albums.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedAlbumId('all')}
              className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                selectedAlbumId === 'all'
                  ? 'bg-teal-deep text-white border-teal-deep shadow-2xs'
                  : 'bg-surface text-text-muted border-border hover:border-teal-deep/50'
              }`}
            >
              Semua Album ({allPhotos.length})
            </button>
            {albums.map((alb) => (
              <button
                key={alb.id}
                onClick={() => setSelectedAlbumId(alb.id)}
                className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedAlbumId === alb.id
                    ? 'bg-teal-deep text-white border-teal-deep shadow-2xs'
                    : 'bg-surface text-text-muted border-border hover:border-teal-deep/50'
                }`}
              >
                {alb.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {displayedPhotos.length === 0 ? (
        /* Visually Restrained Clean Empty State (Zero Technical CMS jargon) */
        <div className="p-12 sm:p-16 rounded-2xl bg-surface border border-border/80 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center text-teal-deep">
            <Camera className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading font-bold text-lg text-text-primary">
              Dokumentasi Visual Sedang Dikurasi
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Arsip album foto kegiatan, praktikum laboratorium, dan momen kebersamaan angkatan akan tersimpan rapi di sini.
            </p>
          </div>
        </div>
      ) : (
        /* Curated Asymmetrical Collage */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayedPhotos.map((item, idx) => {
            const isFeatured = idx === 0 || idx === 7;
            return (
              <div
                key={item.photo.id || idx}
                onClick={() => openLightbox(idx)}
                className={`relative rounded-xl overflow-hidden bg-surface-soft border border-border group cursor-pointer shadow-2xs ${
                  isFeatured ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'
                }`}
              >
                <Image
                  src={item.photo.imageUrl}
                  alt={item.photo.caption || 'Foto Dokumentasi Angkatan 62'}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9FBD4]">
                    {item.albumTitle}
                  </span>
                  {item.photo.caption && (
                    <p className="text-xs font-semibold line-clamp-2 mt-0.5">
                      {item.photo.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && displayedPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white"
              aria-label="Tutup lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-2xl overflow-hidden bg-black/50 border border-white/10">
              <Image
                src={displayedPhotos[lightboxIndex].photo.imageUrl}
                alt={displayedPhotos[lightboxIndex].photo.caption || 'Foto Momen'}
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Navigation and Caption */}
            <div className="w-full flex items-center justify-between text-white text-xs px-2">
              <div className="flex flex-col">
                <span className="font-mono text-[#C9FBD4] text-[11px]">
                  {displayedPhotos[lightboxIndex].albumTitle}
                </span>
                <span className="font-medium text-sm text-white/90">
                  {displayedPhotos[lightboxIndex].photo.caption || 'Dokumentasi Novarion 62'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={showPrev}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-mono text-xs">
                  {lightboxIndex + 1} / {displayedPhotos.length}
                </span>
                <button
                  onClick={showNext}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
