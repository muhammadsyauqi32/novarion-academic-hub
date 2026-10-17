'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import {
  BookOpen,
  Plus,
  Trash2,
  Pencil,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Archive,
  Send,
  HelpCircle,
  FileText,
  Link as LinkIcon,
  Bookmark,
} from 'lucide-react';
import {
  addKnowledgeItemAction,
  updateKnowledgeItemAction,
  setKnowledgeItemStatusAction,
  deleteKnowledgeItemAction,
} from '@/actions/knowledge';

export interface AdminKnowledgeItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminKnowledgeClientProps {
  initialItems: AdminKnowledgeItem[];
}

export function AdminKnowledgeClient({ initialItems }: AdminKnowledgeClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<AdminKnowledgeItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminKnowledgeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminKnowledgeItem) => {
    setEditingItem(item);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (editingItem) {
        formData.append('id', editingItem.id);
        const res = await updateKnowledgeItemAction(formData);
        if (!res.success) {
          setFormError(res.error || 'Gagal memperbarui artikel.');
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await addKnowledgeItemAction(formData);
        if (!res.success) {
          setFormError(res.error || 'Gagal menambahkan artikel.');
          setIsSubmitting(false);
          return;
        }
      }

      setIsModalOpen(false);
      setIsSubmitting(false);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (item: AdminKnowledgeItem, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const res = await setKnowledgeItemStatusAction(item.id, newStatus);
      if (!res.success) {
        alert(res.error || 'Gagal mengubah status.');
        return;
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (item: AdminKnowledgeItem) => {
    if (!confirm(`Hapus artikel "${item.title}" secara permanen?`)) return;

    try {
      const res = await deleteKnowledgeItemAction(item.id);
      if (!res.success) {
        alert(res.error || 'Gagal menghapus artikel.');
        return;
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Knowledge Hub & FAQ Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Kelola panduan praktikum, jawaban pertanyaan umum, referensi, dan tautan resmi mahasiswa.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Tulis Artikel / FAQ Baru</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-surface border-border shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul, kata kunci, konten..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-soft border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface-soft border border-border rounded-lg text-text-primary focus:outline-none focus:border-teal-deep"
          >
            <option value="all">Semua Status</option>
            <option value="published">Terpublikasi</option>
            <option value="draft">Draf</option>
            <option value="archived">Diarsipkan</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface-soft border border-border rounded-lg text-text-primary focus:outline-none focus:border-teal-deep"
          >
            <option value="all">Semua Kategori</option>
            <option value="faq">FAQ</option>
            <option value="guide">Panduan Teknis</option>
            <option value="important_link">Tautan Penting</option>
            <option value="reference">Referensi</option>
          </select>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden divide-y divide-border bg-surface border-border shadow-xs">
        <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
          <span className="font-heading font-bold text-xs text-text-primary">
            Daftar Artikel ({filteredItems.length})
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Tidak ada artikel atau FAQ yang sesuai dengan filter yang dipilih.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-surface-soft/40 transition-colors"
            >
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">{item.category}</Badge>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'published'
                        ? 'bg-success-surface text-success-text border border-success-border'
                        : item.status === 'draft'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        : 'bg-surface-soft text-text-muted border border-border'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[11px] text-text-muted font-mono">{item.slug}</span>
                </div>

                <h3 className="font-heading font-bold text-sm sm:text-base text-text-primary">
                  {item.title}
                </h3>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                  {item.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                {/* Status Toggle Quick Buttons */}
                {item.status !== 'published' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(item, 'published')}
                    className="text-xs gap-1 text-teal-deep hover:bg-teal-deep/10"
                    title="Publikasikan Artikel"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </Button>
                )}
                {item.status === 'published' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(item, 'draft')}
                    className="text-xs gap-1 text-amber-600 hover:bg-amber-500/10"
                    title="Jadikan Draf"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Draft</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(item)}
                  className="gap-1 text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger-text hover:bg-danger-surface transition-colors"
                  title="Hapus Artikel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-modal border border-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-soft">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-deep" />
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  {editingItem ? 'Edit Artikel Knowledge Hub' : 'Tulis Artikel / FAQ Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:bg-border/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {formError && (
                <div className="p-3 rounded-lg bg-danger-surface border border-danger-border text-danger-text text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <Input
                name="title"
                label="Judul Artikel / Pertanyaan FAQ"
                placeholder="Contoh: Cara Menghubungkan RStudio ke Git"
                defaultValue={editingItem?.title || ''}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Kategori</label>
                  <select
                    name="category"
                    defaultValue={editingItem?.category || 'faq'}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                  >
                    <option value="faq">FAQ Perkuliahan</option>
                    <option value="guide">Panduan Teknis / Praktikum</option>
                    <option value="important_link">Tautan Penting Kampus</option>
                    <option value="reference">Referensi Akademik</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Status Publikasi</label>
                  <select
                    name="status"
                    defaultValue={editingItem?.status || 'published'}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                  >
                    <option value="published">Terpublikasi (Published)</option>
                    <option value="draft">Draf (Private)</option>
                    <option value="archived">Diarsipkan (Archived)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-primary">Isi Konten & Penjelasan</label>
                <textarea
                  name="content"
                  rows={7}
                  placeholder="Tuliskan petunjuk langkah-langkah, penjelasan rinci, atau jawaban pertanyaan..."
                  defaultValue={editingItem?.content || ''}
                  required
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:border-teal-deep focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Menyimpan...'
                    : editingItem
                    ? 'Simpan Perubahan'
                    : 'Publikasikan Artikel'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
