'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, knowledgeItems, auditLogs } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addKnowledgeItemAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const title = (formData.get('title') as string || '').trim();
  const content = (formData.get('content') as string || '').trim();
  const category = (formData.get('category') as string || 'faq');

  if (!title || !content) {
    return { success: false, error: 'Judul dan konten artikel wajib diisi.' };
  }

  // Generate URL-friendly slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  try {
    const inserted = await db.insert(knowledgeItems).values({
      title,
      slug,
      content,
      category,
      status: 'published',
      createdBy: admin.id,
    }).returning();

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'KNOWLEDGE_ITEM_ADDED',
      entityType: 'knowledge_items',
      entityId: inserted[0].id,
      newValues: { title, category, slug },
    });

    revalidatePath('/admin/knowledge');
    revalidatePath('/app/knowledge');
    revalidatePath('/app');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteKnowledgeItemAction(id: string) {
  const admin = await requireAdmin();
  const db = getDb();

  try {
    await db.delete(knowledgeItems).where(eq(knowledgeItems.id, id));

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'KNOWLEDGE_ITEM_DELETED',
      entityType: 'knowledge_items',
      entityId: id,
      newValues: { deletedBy: admin.fullName },
    });

    revalidatePath('/admin/knowledge');
    revalidatePath('/app/knowledge');
    revalidatePath('/app');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
