import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { getDb, knowledgeAssets, courses } from '@novarion/db';
import { desc, eq } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { FolderDown, Plus, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import { addMaterialAction, deleteMaterialAction } from '@/actions/materials';

export default async function AdminMaterialsPage() {
  await requireAdmin();
  const db = getDb();

  const allCourses = await db.select().from(courses).orderBy(courses.code);
  const allMaterials = await db
    .select({
      id: knowledgeAssets.id,
      title: knowledgeAssets.title,
      description: knowledgeAssets.description,
      assetType: knowledgeAssets.assetType,
      externalUrl: knowledgeAssets.externalUrl,
      createdAt: knowledgeAssets.createdAt,
      courseId: knowledgeAssets.courseId,
      courseName: courses.name,
      courseCode: courses.code,
    })
    .from(knowledgeAssets)
    .leftJoin(courses, eq(knowledgeAssets.courseId, courses.id))
    .orderBy(desc(knowledgeAssets.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Manajemen File & Materi Kuliah
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Unggah modul perkuliahan, slide presentasi dosen, dan tautan rujukan resmi untuk mahasiswa.
          </p>
        </div>

        <Badge variant="primary" size="md">
          {allMaterials.length} File Terdaftar
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Tambah Materi */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <FolderDown className="w-4 h-4 text-teal-deep" />
            <h2 className="font-heading font-bold text-sm text-text-primary">
              Tambah Materi Baru
            </h2>
          </div>

          <form
            action={async (formData) => {
              'use server';
              await addMaterialAction(formData);
            }}
            className="flex flex-col gap-3"
          >
            <Input
              name="title"
              label="Judul Materi / Modul"
              placeholder="Contoh: Modul Praktikum Sesi 4 Regresi"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">Mata Kuliah Terkait</label>
              <select
                name="course_id"
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:outline-none"
              >
                <option value="">Umum (Seluruh Mata Kuliah)</option>
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">Tipe Konten</label>
              <select
                name="asset_type"
                defaultValue="external_link"
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:outline-none"
              >
                <option value="external_link">Tautan Luar (Google Drive / Cloud / Web)</option>
                <option value="file_upload">Dokumen Internal</option>
              </select>
            </div>

            <Input
              name="external_url"
              label="Tautan Berkas / URL Dokumen"
              placeholder="https://drive.google.com/..."
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-primary">Deskripsi Ringkas (Opsional)</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Penjelasan singkat isi modul..."
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-input text-text-primary focus:outline-none"
              />
            </div>

            <Button variant="primary" size="sm" type="submit" className="mt-2">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Simpan Materi</span>
            </Button>
          </form>
        </Card>

        {/* Tabel Daftar Materi */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-4 bg-surface-soft border-b border-border flex items-center justify-between">
              <span className="font-heading font-bold text-xs text-text-primary">
                Daftar Seluruh Materi ({allMaterials.length})
              </span>
            </div>

            <div className="divide-y divide-border">
              {allMaterials.length === 0 ? (
                <div className="p-12 text-center text-xs text-text-muted">
                  Belum ada file materi yang diunggah.
                </div>
              ) : (
                allMaterials.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-soft/40 transition-colors">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">
                          {m.courseCode ? m.courseCode : 'Umum'}
                        </Badge>
                        <span className="text-[11px] text-text-muted capitalize">
                          • {m.assetType === 'external_link' ? 'Tautan Luar' : 'Dokumen'}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-sm text-text-primary">
                        {m.title}
                      </h3>
                      {m.description && (
                        <p className="text-xs text-text-muted line-clamp-1">{m.description}</p>
                      )}
                      {m.externalUrl && (
                        <a
                          href={m.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-teal-deep hover:underline mt-0.5"
                        >
                          <span>Buka Berkas</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <form
                      action={async () => {
                        'use server';
                        await deleteMaterialAction(m.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger-text hover:bg-danger-surface transition-colors"
                        title="Hapus Materi"
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
