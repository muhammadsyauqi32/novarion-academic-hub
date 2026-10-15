import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, knowledgeAssets, courses } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { FolderDown, FileText, ExternalLink } from 'lucide-react';

export default async function MaterialsPage() {
  await requireAuth();
  const db = getDb();

  const materials = await db
    .select()
    .from(knowledgeAssets)
    .where(eq(knowledgeAssets.status, 'published'))
    .orderBy(desc(knowledgeAssets.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          File Materi Perkuliahan
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Modul, bahan tayang dosen, dan dokumen latihan resmi angkatan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-muted">
            <FolderDown className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
            <p>Belum ada file materi yang diunggah.</p>
          </div>
        ) : (
          materials.map((m) => (
            <Card key={m.id} className="flex flex-col justify-between gap-4 hover:border-brand-primary/40 transition-colors">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant={m.assetType === 'external_link' ? 'orange' : 'primary'} size="sm">
                    {m.assetType === 'external_link' ? 'Tautan Luar' : 'Dokumen'}
                  </Badge>
                </div>
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  {m.title}
                </h3>
                {m.description && (
                  <p className="text-xs text-text-muted line-clamp-2">{m.description}</p>
                )}
              </div>

              {m.externalUrl && (
                <a
                  href={m.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-deep hover:underline pt-2 border-t border-border"
                >
                  <span>Buka Sumber Materi</span>
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
