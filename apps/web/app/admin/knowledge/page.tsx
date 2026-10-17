import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { hasPermission } from '@/lib/auth/permissions';
import { getDb, knowledgeItems } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { AdminKnowledgeClient } from './AdminKnowledgeClient';
import { redirect } from 'next/navigation';

export default async function AdminKnowledgePage() {
  const user = await requireAuth();

  // Allow admin or users with knowledge.manage permission
  const canManage = user.role === 'admin' || (await hasPermission(user, 'knowledge.manage'));
  if (!canManage) {
    redirect('/app');
  }

  const db = getDb();
  const allItems = await db
    .select({
      id: knowledgeItems.id,
      title: knowledgeItems.title,
      slug: knowledgeItems.slug,
      content: knowledgeItems.content,
      category: knowledgeItems.category,
      status: knowledgeItems.status,
      createdAt: knowledgeItems.createdAt,
      updatedAt: knowledgeItems.updatedAt,
    })
    .from(knowledgeItems)
    .orderBy(desc(knowledgeItems.createdAt));

  return <AdminKnowledgeClient initialItems={allItems} />;
}
