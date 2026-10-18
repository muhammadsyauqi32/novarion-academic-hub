'use client';

import React, { useState, useMemo } from 'react';
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
  Layers
} from 'lucide-react';
import { Badge } from '@/components/Badge';

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
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(
    new Set(initialItems.slice(0, 3).map((i) => i.id))
  );

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

  const categories = [
    { id: 'all', label: 'Semua Kategori', icon: Layers },
    { id: 'faq', label: 'FAQ Perkuliahan', icon: HelpCircle },
    { id: 'guide', label: 'Panduan Teknis', icon: FileText },
    { id: 'important_link', label: 'Tautan Resmi', icon: LinkIcon },
    { id: 'reference', label: 'Referensi Belajar', icon: Bookmark },
  ];

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialItems, search, selectedCategory]);

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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* 1. Documentation Header */}
      <div className="flex flex-col gap-2 p-6 rounded-card bg-surface border border-border">
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-teal-deep uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge Hub</span>
          <span>•</span>
          <span>Statistika & Sains Data 62</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
          Panduan & FAQ Perkuliahan
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Dokumentasi teknis, pertanyaan umum seputar perkuliahan, dan direktori tautan resmi kampus IPB University.
        </p>
      </div>

      {/* 2. Search Toolbar */}
      <div className="p-4 rounded-card bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari panduan, RStudio, KRS, modul praktikum..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-text-muted w-full sm:w-auto justify-between sm:justify-end">
          <span className="font-mono">{filteredItems.length} artikel</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-semibold text-teal-deep hover:underline"
            >
              Buka Semua
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
                isSelected
                  ? 'bg-teal-deep text-white font-bold'
                  : 'bg-surface text-text-muted hover:text-text-primary border border-border font-medium'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Reading Interface / Documentation Articles */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-card bg-surface border border-border text-center flex flex-col items-center gap-2">
          <HelpCircle className="w-8 h-8 text-text-muted/40" />
          <p className="text-xs font-bold text-text-primary">Tidak Ada Artikel Ditemukan</p>
          <p className="text-[11px] text-text-muted">
            Coba gunakan kata kunci pencarian lain atau pilih kategori &quot;Semua Kategori&quot;.
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs font-semibold text-teal-deep hover:underline mt-1"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => {
            const isExpanded = expandedItemIds.has(item.id);
            const meta = getCategoryMeta(item.category);
            const Icon = meta.icon;

            return (
              <div
                key={item.id}
                className="rounded-card bg-surface border border-border overflow-hidden transition-colors hover:border-border-strong"
              >
                {/* Accordion Heading Trigger */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-surface-soft/40 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-surface-soft shrink-0 mt-0.5 border border-border">
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wide text-teal-deep bg-teal-deep/10 px-1.5 py-0.5 rounded border border-teal-deep/20">
                          {meta.label}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-sm sm:text-base text-text-primary leading-snug">
                        {item.title}
                      </h3>
                      {!isExpanded && (
                        <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 p-1 rounded-md text-text-muted hover:text-text-primary">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-teal-deep" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Article Prose Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-border bg-surface text-text-primary">
                    <div className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-sans max-w-prose">
                      {item.content}
                    </div>

                    {item.category === 'important_link' && (
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                        <span>Tautan resmi kampus IPB University</span>
                        <span className="font-semibold text-teal-deep flex items-center gap-1">
                          Gunakan akun Apps IPB (@apps.ipb.ac.id) <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
