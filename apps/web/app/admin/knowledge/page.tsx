import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, knowledgeItems } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { BookOpen, Plus, Trash2, HelpCircle } from 'lucide-react';
import { addKnowledgeItemAction, deleteKnowledgeItemAction } from '@/actions/knowledge';

export default async function AdminKnowledgePage() {
  await requireAdmin();
  const db = getDb();

  const allItems = await db
    .select()
    .from(knowledgeItems)
    .orderBy(desc(knowledgeItems.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Knowledge Hub & FAQ Akademik
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Kelola artikel panduan praktikum, jawaban pertanyaan umum mahasiswa, dan referensi akademik.
          </p>
        </div>

        <Badge variant="primary" size="md">
          {allItems.length} Artikel
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Tambah Artikel / FAQ */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <BookOpen className="w-4 h-4 text-teal-deep" />
            <h2 className="font-heading font-bold text-sm text-text-primary">
              Tulis Artikel / FAQ Baru
            </h2>
          </div>

          <form
            action={async (formData) => {
              'use server';
              await addKnowledgeItemAction(formData);
            }}
            className="flex flex-col gap-3"
          >
            <Input
              name="title"
              label="Judul FAQ / Panduan"
              placeholder="Contoh: Panduan Instalasi R & RStudio di Windows"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">Kategori</label>
              <select
                name="category"
                defaultValue="faq"
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:outline-none"
              >
                <option value="faq">FAQ Perkuliahan</option>
                <option value="guide">Panduan Teknis / Praktikum</option>
                <option value="important_link">Tautan Penting Kampus</option>
                <option value="reference">Referensi Akademik</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">Konten Penjelasan</label>
              <textarea
                name="content"
                rows={5}
                placeholder="Tuliskan petunjuk langkah demi langkah atau jawaban FAQ secara lengkap..."
                required
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:outline-none"
              />
            </div>

            <Button variant="primary" size="sm" type="submit" className="mt-2">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Publikasikan Artikel</span>
            </Button>
          </form>
        </Card>

        {/* Tabel Daftar Artikel */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-text-primary">
                Daftar Artikel Tersimpan ({allItems.length})
              </span>
            </div>

            <div className="divide-y divide-border">
              {allItems.length === 0 ? (
                <div className="p-12 text-center text-xs text-text-muted">
                  Belum ada artikel panduan atau FAQ yang dipublikasikan.
                </div>
              ) : (
                allItems.map((item) => (
                  <div key={item.id} className="p-5 flex items-start justify-between gap-4 hover:bg-surface-soft/40 transition-colors">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">{item.category}</Badge>
                        <span className="text-[11px] text-text-muted font-mono">{item.slug}</span>
                      </div>
                      <h3 className="font-heading font-bold text-sm text-text-primary">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                        {item.content}
                      </p>
                    </div>

                    <form
                      action={async () => {
                        'use server';
                        await deleteKnowledgeItemAction(item.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger-text hover:bg-danger-surface transition-colors"
                        title="Hapus Artikel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
