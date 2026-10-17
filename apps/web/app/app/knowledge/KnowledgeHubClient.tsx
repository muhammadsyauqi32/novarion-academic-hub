'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  BookOpen,
  Search,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Link as LinkIcon,
  Bookmark,
  Sparkles,
} from 'lucide-react';

export interface KnowledgeItem {
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedItemIds(new Set(initialItems.map((i) => i.id)));
  };

  const collapseAll = () => {
    setExpandedItemIds(new Set());
  };

  const filteredItems = initialItems.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'faq':
        return { label: 'FAQ Perkuliahan', icon: HelpCircle, color: 'text-teal-deep' };
      case 'guide':
        return { label: 'Panduan Teknis', icon: FileText, color: 'text-purple-600' };
      case 'important_link':
        return { label: 'Tautan Resmi', icon: LinkIcon, color: 'text-sky-600' };
      case 'reference':
        return { label: 'Referensi Belajar', icon: Bookmark, color: 'text-brand-orange' };
      default:
        return { label: cat, icon: BookOpen, color: 'text-text-primary' };
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-mint-soft/20 via-surface to-surface-soft border border-border shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-deep/10 text-teal-deep border border-teal-deep/20 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Pusat Pengetahuan
          </span>
          <span className="text-xs text-text-muted">Statistika & Sains Data 62</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
          Knowledge Hub & FAQ Perkuliahan
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
          Temukan panduan praktikum, jawaban pertanyaan seputar akademik, dan tautan resmi kampus IPB University.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari panduan, RStudio, KRS, modul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-deep text-white shadow-xs font-bold'
                  : 'bg-surface-soft text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Accordion Controls Bar */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>Menampilkan {filteredItems.length} artikel</span>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-teal-deep hover:underline font-medium"
          >
            Buka Semua
          </button>
          <span>•</span>
          <button
            onClick={collapseAll}
            className="text-text-muted hover:text-text-primary font-medium"
          >
            Tutup Semua
          </button>
        </div>
      </div>

      {/* Knowledge Items Accordion List */}
      <div className="flex flex-col gap-3">
        {filteredItems.length === 0 ? (
          <Card className="text-center py-16 flex flex-col items-center gap-3">
            <HelpCircle className="w-10 h-10 text-text-muted/40" />
            <div>
              <p className="text-sm font-bold text-text-primary">Tidak Ada Artikel yang Cocok</p>
              <p className="text-xs text-text-muted mt-0.5">
                Coba gunakan kata kunci lain atau pilih kategori "Semua".
              </p>
            </div>
            {search && (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Reset Pencarian
              </Button>
            )}
          </Card>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedItemIds.has(item.id);
            const meta = getCategoryMeta(item.category);
            const Icon = meta.icon;

            return (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all border ${
                  isExpanded ? 'border-teal-deep/50 shadow-xs' : 'border-border hover:border-border-strong'
                }`}
              >
                {/* Accordion Header (Click to toggle) */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 bg-surface hover:bg-surface-soft/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-surface-soft shrink-0 mt-0.5">
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">{meta.label}</Badge>
                      </div>
                      <h3 className="font-heading font-bold text-sm sm:text-base text-text-primary leading-snug">
                        {item.title}
                      </h3>
                      {!isExpanded && (
                        <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 p-1 rounded-lg text-text-muted hover:text-text-primary">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-teal-deep" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Progressive Disclosure Content */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-border bg-surface-soft/30 animate-in fade-in duration-200">
                    <div className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
                      {item.content}
                    </div>

                    {item.category === 'important_link' && (
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-text-muted">Tautan Resmi Kampus</span>
                        <span className="font-semibold text-teal-deep flex items-center gap-1">
                          Pastikan gunakan akun IPB Anda <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
