'use client';

import React, { useState, useMemo } from 'react';
import { 
  FolderDown, 
  Search, 
  ExternalLink, 
  FileText, 
  Link as LinkIcon, 
  BookOpen, 
  SlidersHorizontal,
  Calendar,
  Download
} from 'lucide-react';
import { Badge } from '@/components/Badge';
import { formatWIBShort } from '@novarion/shared';

interface MaterialItem {
  id: string;
  title: string;
  description: string | null;
  assetType: string;
  externalUrl: string | null;
  courseId: string | null;
  courseCode: string | null;
  courseName: string | null;
  createdAt: Date;
}

interface MaterialsClientProps {
  initialMaterials: MaterialItem[];
}

export function MaterialsClient({ initialMaterials }: MaterialsClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Extract unique courses for filtering
  const courseOptions = useMemo(() => {
    return Array.from(
      new Set(
        initialMaterials
          .filter((m) => m.courseCode)
          .map((m) => JSON.stringify({ code: m.courseCode, name: m.courseName }))
      )
    ).map((str) => JSON.parse(str) as { code: string; name: string });
  }, [initialMaterials]);

  const filteredMaterials = useMemo(() => {
    return initialMaterials.filter((m) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.courseName && m.courseName.toLowerCase().includes(q)) ||
        (m.courseCode && m.courseCode.toLowerCase().includes(q));

      const matchCourse =
        selectedCourse === 'all' || m.courseCode === selectedCourse;

      return matchSearch && matchCourse;
    });
  }, [initialMaterials, search, selectedCourse]);

  const getAssetTypeMeta = (type: string) => {
    switch (type) {
      case 'external_link':
        return { label: 'Tautan Luar', icon: LinkIcon, color: 'text-sky-600' };
      case 'slide':
        return { label: 'Slide Presentasi', icon: FileText, color: 'text-brand-orange' };
      case 'module':
        return { label: 'Modul / Diktat', icon: BookOpen, color: 'text-teal-deep' };
      default:
        return { label: 'Dokumen', icon: FileText, color: 'text-text-muted' };
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
            File Materi & Modul Perkuliahan
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Repositori resmi slide kuliah, modul praktikum, dan bahan ajar angkatan Statistika 62.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-teal-deep/10 text-teal-deep border border-teal-deep/20">
            {filteredMaterials.length} Berkas Tersedia
          </span>
        </div>
      </div>

      {/* 2. Search & Course Filter Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-card bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari materi kuliah, topik, atau kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted shrink-0 hidden sm:block" />
          <span className="text-xs text-text-muted whitespace-nowrap">Mata Kuliah:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          >
            <option value="all">Semua Mata Kuliah ({initialMaterials.length})</option>
            {courseOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Organized Resource List / File Explorer Layout */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 rounded-card bg-surface border border-border text-center flex flex-col items-center gap-2">
          <FolderDown className="w-8 h-8 text-text-muted/40" />
          <p className="text-xs font-bold text-text-primary">Tidak Ada File Materi Ditemukan</p>
          <p className="text-[11px] text-text-muted">
            Tidak ada dokumen yang cocok dengan kata kunci atau filter mata kuliah yang dipilih.
          </p>
          {(search || selectedCourse !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCourse('all');
              }}
              className="text-xs font-semibold text-teal-deep hover:underline mt-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-card bg-surface border border-border overflow-hidden shadow-xs">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 bg-surface-soft/80 border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <div className="col-span-6">Nama Berkas & Deskripsi</div>
            <div className="col-span-3">Mata Kuliah</div>
            <div className="col-span-1 text-center">Tipe</div>
            <div className="col-span-2 text-right">Tindakan</div>
          </div>

          {/* List Rows */}
          <div className="divide-y divide-border">
            {filteredMaterials.map((m) => {
              const meta = getAssetTypeMeta(m.assetType);
              const Icon = meta.icon;

              return (
                <div
                  key={m.id}
                  className="p-4 md:px-4 md:py-3.5 hover:bg-surface-soft/40 transition-colors flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center gap-2"
                >
                  {/* File Title and Description */}
                  <div className="md:col-span-6 flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-surface-soft shrink-0 mt-0.5">
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-text-primary leading-snug">
                        {m.title}
                      </span>
                      {m.description && (
                        <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                          {m.description}
                        </p>
                      )}
                      <span className="text-[10px] text-text-muted font-mono md:hidden mt-1">
                        Diunggah: {formatWIBShort(new Date(m.createdAt))}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="md:col-span-3 flex flex-col gap-0.5">
                    {m.courseCode ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-deep/10 text-teal-deep border border-teal-deep/20">
                          {m.courseCode}
                        </span>
                        <span className="text-xs text-text-primary truncate">
                          {m.courseName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted italic">Materi Umum</span>
                    )}
                  </div>

                  {/* Asset Type */}
                  <div className="md:col-span-1 text-left md:text-center">
                    <span className="text-[10px] font-semibold text-text-muted bg-surface-soft px-2 py-0.5 rounded border border-border inline-block">
                      {meta.label}
                    </span>
                  </div>

                  {/* Action Link */}
                  <div className="md:col-span-2 flex items-center justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border">
                    {m.externalUrl ? (
                      <a
                        href={m.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-deep/10 text-teal-deep hover:bg-teal-deep hover:text-white transition-colors"
                      >
                        <span>Akses Berkas</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-text-muted italic">Tidak ada tautan</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
