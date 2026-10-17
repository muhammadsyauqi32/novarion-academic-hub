'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { FolderDown, Search, ExternalLink, BookOpen } from 'lucide-react';

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
  const courseOptions = Array.from(
    new Set(
      initialMaterials
        .filter((m) => m.courseCode)
        .map((m) => JSON.stringify({ code: m.courseCode, name: m.courseName }))
    )
  ).map((str) => JSON.parse(str) as { code: string; name: string });

  const filteredMaterials = initialMaterials.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase())) ||
      (m.courseName && m.courseName.toLowerCase().includes(search.toLowerCase()));

    const matchCourse =
      selectedCourse === 'all' || m.courseCode === selectedCourse;

    return matchSearch && matchCourse;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          File Materi & Modul Perkuliahan
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Kumpulan modul praktikum, slide presentasi dosen, dan bahan latihan resmi angkatan.
        </p>
      </div>

      {/* Search & Course Filter */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari materi kuliah atau topik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-text-muted font-medium whitespace-nowrap">Mata Kuliah:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:outline-none"
          >
            <option value="all">Semua Mata Kuliah</option>
            {courseOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Grid of Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-muted bg-surface rounded-card border border-border p-8">
            <FolderDown className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
            <p>Tidak ada file materi yang sesuai dengan pencarian atau filter.</p>
          </div>
        ) : (
          filteredMaterials.map((m) => (
            <Card key={m.id} className="flex flex-col justify-between gap-4 hover:border-brand-primary/40 transition-colors">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant={m.courseCode ? 'primary' : 'neutral'} size="sm">
                    {m.courseCode || 'Umum'}
                  </Badge>
                  <span className="text-[11px] text-text-muted capitalize">
                    {m.assetType === 'external_link' ? 'Tautan Luar' : 'Dokumen'}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  {m.title}
                </h3>
                {m.description && (
                  <p className="text-xs text-text-muted line-clamp-2">{m.description}</p>
                )}
                {m.courseName && (
                  <p className="text-[11px] text-teal-deep font-semibold">
                    {m.courseName}
                  </p>
                )}
              </div>

              {m.externalUrl && (
                <a
                  href={m.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between text-xs font-bold text-teal-deep hover:underline pt-2.5 border-t border-border"
                >
                  <span>Buka / Unduh Berkas</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
