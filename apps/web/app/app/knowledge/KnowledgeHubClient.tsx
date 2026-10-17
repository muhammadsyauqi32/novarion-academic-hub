'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { BookOpen, Search, HelpCircle, ExternalLink } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  createdAt: Date;
}

interface KnowledgeHubClientProps {
  initialItems: KnowledgeItem[];
}

export function KnowledgeHubClient({ initialItems }: KnowledgeHubClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = initialItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          Knowledge Hub & FAQ Perkuliahan
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Kumpulan panduan praktikum, jawaban pertanyaan umum perkuliahan, dan tautan resmi kampus.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kata kunci (misal: RStudio, KRS, modul)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'faq', label: 'FAQ' },
            { id: 'guide', label: 'Panduan' },
            { id: 'important_link', label: 'Tautan' },
            { id: 'reference', label: 'Referensi' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-deep text-white font-bold'
                  : 'bg-surface-soft text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Articles List */}
      <div className="flex flex-col gap-4">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-xs text-text-muted bg-surface rounded-card border border-border p-8">
            <HelpCircle className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
            <p>Tidak ada artikel atau FAQ yang cocok dengan pencarian.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col gap-3 hover:border-brand-primary/40 transition-colors">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">{item.category}</Badge>
              </div>
              <h3 className="font-heading font-bold text-base text-text-primary">
                {item.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
