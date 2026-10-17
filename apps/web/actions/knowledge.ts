'use server';

import { requireAuth } from '@/lib/auth/guards';
import { hasPermission } from '@/lib/auth/permissions';
import { getDb, knowledgeItems, auditLogs } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function checkKnowledgePermission() {
  const user = await requireAuth();
  if (user.role === 'admin') return user;
  const canManage = await hasPermission(user, 'knowledge.manage');
  if (!canManage) {
    throw new Error('Akses ditolak: Anda tidak memiliki izin mengelola Knowledge Hub.');
  }
  return user;
}

export async function addKnowledgeItemAction(formData: FormData) {
  const user = await checkKnowledgePermission();
  const db = getDb();

  const title = (formData.get('title') as string || '').trim();
  const content = (formData.get('content') as string || '').trim();
  const category = (formData.get('category') as string || 'faq');
  const status = (formData.get('status') as string || 'published');

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
      status,
      createdBy: user.id,
    }).returning();

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'KNOWLEDGE_ITEM_ADDED',
      entityType: 'knowledge_items',
      entityId: inserted[0].id,
      newValues: { title, category, status, slug },
    });

    revalidatePath('/admin/knowledge');
    revalidatePath('/app/knowledge');
    revalidatePath('/app');

    return { success: true, item: inserted[0] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateKnowledgeItemAction(formData: FormData) {
  const user = await checkKnowledgePermission();
  const db = getDb();

  const id = formData.get('id') as string;
  const title = (formData.get('title') as string || '').trim();
  const content = (formData.get('content') as string || '').trim();
  const category = (formData.get('category') as string || 'faq');
  const status = (formData.get('status') as string || 'published');

  if (!id || !title || !content) {
    return { success: false, error: 'ID, judul, dan konten wajib diisi.' };
  }

  try {
    const updated = await db
      .update(knowledgeItems)
      .set({
        title,
        content,
        category,
        status,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeItems.id, id))
      .returning();

    if (updated.length === 0) {
      return { success: false, error: 'Artikel tidak ditemukan.' };
    }

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'KNOWLEDGE_ITEM_UPDATED',
      entityType: 'knowledge_items',
      entityId: id,
      newValues: { title, category, status },
    });

    revalidatePath('/admin/knowledge');
    revalidatePath('/app/knowledge');
    revalidatePath('/app');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function setKnowledgeItemStatusAction(id: string, status: 'draft' | 'published' | 'archived') {
  const user = await checkKnowledgePermission();
  const db = getDb();

  try {
    await db
      .update(knowledgeItems)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeItems.id, id));

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'KNOWLEDGE_ITEM_STATUS_CHANGED',
      entityType: 'knowledge_items',
      entityId: id,
      newValues: { status },
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
  const user = await checkKnowledgePermission();
  const db = getDb();

  try {
    await db.delete(knowledgeItems).where(eq(knowledgeItems.id, id));

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'KNOWLEDGE_ITEM_DELETED',
      entityType: 'knowledge_items',
      entityId: id,
      newValues: { deletedBy: user.fullName },
    });

    revalidatePath('/admin/knowledge');
    revalidatePath('/app/knowledge');
    revalidatePath('/app');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
