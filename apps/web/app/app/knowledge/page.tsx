import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, knowledgeItems } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { KnowledgeHubClient } from './KnowledgeHubClient';

export default async function KnowledgeHubPage() {
  await requireAuth();
  const db = getDb();

  const items = await db
    .select({
      id: knowledgeItems.id,
      title: knowledgeItems.title,
      slug: knowledgeItems.slug,
      content: knowledgeItems.content,
      category: knowledgeItems.category,
      createdAt: knowledgeItems.createdAt,
    })
    .from(knowledgeItems)
    .where(eq(knowledgeItems.status, 'published'))
    .orderBy(desc(knowledgeItems.createdAt))
    .limit(100);

  return <KnowledgeHubClient initialItems={items} />;
}
