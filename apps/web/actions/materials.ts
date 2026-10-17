'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, knowledgeAssets, auditLogs } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addMaterialAction(formData: FormData) {
  const admin = await requireAdmin();
  const db = getDb();

  const title = (formData.get('title') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const assetType = (formData.get('asset_type') as string || 'external_link');
  const externalUrl = (formData.get('external_url') as string || '').trim();
  const courseId = (formData.get('course_id') as string) || null;

  if (!title) {
    return { success: false, error: 'Judul materi wajib diisi.' };
  }

  try {
    const inserted = await db.insert(knowledgeAssets).values({
      title,
      description: description || null,
      assetType,
      externalUrl: externalUrl || null,
      courseId: courseId || null,
      status: 'published',
      createdBy: admin.id,
    }).returning();

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'MATERIAL_ADDED',
      entityType: 'knowledge_assets',
      entityId: inserted[0].id,
      newValues: { title, assetType, courseId },
    });

    revalidatePath('/admin/materials');
    revalidatePath('/app/materials');
    revalidatePath('/app');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteMaterialAction(id: string) {
  const admin = await requireAdmin();
  const db = getDb();

  try {
    await db.delete(knowledgeAssets).where(eq(knowledgeAssets.id, id));

    await db.insert(auditLogs).values({
      actorId: admin.id,
      action: 'MATERIAL_DELETED',
      entityType: 'knowledge_assets',
      entityId: id,
      newValues: { deletedBy: admin.fullName },
    });

    revalidatePath('/admin/materials');
    revalidatePath('/app/materials');
    revalidatePath('/app');

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
