import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, knowledgeItems } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { BookOpen, HelpCircle } from 'lucide-react';

export default async function KnowledgeHubPage() {
  await requireAuth();
  const db = getDb();

  const items = await db
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.status, 'published'))
    .orderBy(desc(knowledgeItems.createdAt));

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          Knowledge Hub & FAQ Akademik
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Kumpulan panduan praktikum, jawaban pertanyaan umum perkuliahan, dan tautan resmi.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="py-16 text-center text-xs text-text-muted">
            <HelpCircle className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
            <p>Belum ada artikel atau FAQ yang dipublikasikan.</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col gap-3">
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
