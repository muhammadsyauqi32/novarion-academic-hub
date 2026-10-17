'use server';

import { getDb, cmsHero, cmsNews, cmsAlbums, cmsAlbumPhotos, cmsAchievements, cmsMedia, auditLogs } from '@novarion/db';
import { eq, desc, asc, and, ilike, or, not } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/guards';
import { hasPermission, isSuperAdmin } from '@/lib/auth/permissions';
import { CMSContentType, PublishStatus } from '@novarion/shared';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@novarion/db/src/auth-provisioning';

async function checkCmsPermission() {
  const user = await requireAuth();
  const superAdmin = await isSuperAdmin(user);
  const canManageWebsite = await hasPermission(user, 'website.manage');
  if (!superAdmin && !canManageWebsite) {
    throw new Error('Akses ditolak: Anda tidak memiliki wewenang mengelola konten website publik.');
  }
  return user;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

/* ========================================================================= */
/* A. HERO MANAGER                                                           */
/* ========================================================================= */

export async function getHeroListAction() {
  await checkCmsPermission();
  const db = getDb();
  const rows = await db
    .select()
    .from(cmsHero)
    .orderBy(desc(cmsHero.createdAt));
  return { success: true, data: rows };
}

export async function saveHeroAction(params: {
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  focalPointX?: string;
  focalPointY?: string;
  status?: PublishStatus;
}) {
  const actor = await checkCmsPermission();
  const db = getDb();
  const status = params.status || 'draft';

  try {
    // Jika status diset ke 'published', unpublish hero lainnya (hanya tepat satu hero aktif)
    if (status === 'published') {
      await db
        .update(cmsHero)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(eq(cmsHero.status, 'published'));
    }

    let savedItem;
    if (params.id) {
      const updated = await db
        .update(cmsHero)
        .set({
          title: params.title || null,
          subtitle: params.subtitle || null,
          imageUrl: params.imageUrl,
          focalPointX: params.focalPointX || '50%',
          focalPointY: params.focalPointY || '50%',
          status,
          publishedAt: status === 'published' ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(cmsHero.id, params.id))
        .returning();
      savedItem = updated[0];
    } else {
      const inserted = await db
        .insert(cmsHero)
        .values({
          title: params.title || null,
          subtitle: params.subtitle || null,
          imageUrl: params.imageUrl,
          focalPointX: params.focalPointX || '50%',
          focalPointY: params.focalPointY || '50%',
          status,
          publishedAt: status === 'published' ? new Date() : null,
          createdBy: actor.id,
        })
        .returning();
      savedItem = inserted[0];
    }

    await db.insert(auditLogs).values({
      actorId: actor.id,
      action: 'SAVE_CMS_HERO',
      entityType: 'cms_hero',
      entityId: savedItem.id,
      newValues: { status, title: params.title },
    });

    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true, data: savedItem };
  } catch (err: any) {
    console.error('[saveHeroAction] Error:', err);
    return { success: false, error: err.message || 'Gagal menyimpan foto hero.' };
  }
}

export async function publishHeroAction(id: string) {
  const actor = await checkCmsPermission();
  const db = getDb();

  try {
    // Unpublish hero yang sedang aktif
    await db
      .update(cmsHero)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(cmsHero.status, 'published'));

    const published = await db
      .update(cmsHero)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(cmsHero.id, id))
      .returning();

    await db.insert(auditLogs).values({
      actorId: actor.id,
      action: 'PUBLISH_CMS_HERO',
      entityType: 'cms_hero',
      entityId: id,
    });

    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true, data: published[0] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mempublikasikan foto hero.' };
  }
}

/* ========================================================================= */
/* B. NEWS MANAGER (Short updates & long articles)                           */
/* ========================================================================= */

export async function getNewsListAction(searchQuery?: string, category?: string) {
  await checkCmsPermission();
  const db = getDb();
  let query = db.select().from(cmsNews).orderBy(desc(cmsNews.createdAt));

  const rows = await query;
  let filtered = rows;
  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }
  if (category && category !== 'Semua') {
    filtered = filtered.filter((n) => n.category === category);
  }

  return { success: true, data: filtered };
}

export async function saveNewsAction(params: {
  id?: string;
  type: CMSContentType;
  title: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  category: string;
  isFeatured?: boolean;
  status?: PublishStatus;
}) {
  const actor = await checkCmsPermission();
  const db = getDb();
  const status = params.status || 'draft';
  const baseSlug = generateSlug(params.title);

  try {
    let savedItem;
    if (params.id) {
      const updated = await db
        .update(cmsNews)
        .set({
          type: params.type,
          title: params.title,
          excerpt: params.excerpt || null,
          content: params.content,
          coverImageUrl: params.coverImageUrl || null,
          category: params.category || 'Umum',
          isFeatured: params.isFeatured ?? false,
          status,
          publishedAt: status === 'published' ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(cmsNews.id, params.id))
        .returning();
      savedItem = updated[0];
    } else {
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      const inserted = await db
        .insert(cmsNews)
        .values({
          type: params.type,
          title: params.title,
          slug,
          excerpt: params.excerpt || null,
          content: params.content,
          coverImageUrl: params.coverImageUrl || null,
          category: params.category || 'Umum',
          isFeatured: params.isFeatured ?? false,
          status,
          publishedAt: status === 'published' ? new Date() : null,
          createdBy: actor.id,
        })
        .returning();
      savedItem = inserted[0];
    }

    await db.insert(auditLogs).values({
      actorId: actor.id,
      action: 'SAVE_CMS_NEWS',
      entityType: 'cms_news',
      entityId: savedItem.id,
      newValues: { title: params.title, status },
    });

    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true, data: savedItem };
  } catch (err: any) {
    console.error('[saveNewsAction] Error:', err);
    return { success: false, error: err.message || 'Gagal menyimpan warta.' };
  }
}

export async function deleteNewsAction(id: string) {
  const actor = await checkCmsPermission();
  const db = getDb();

  try {
    const deleted = await db.delete(cmsNews).where(eq(cmsNews.id, id)).returning();
    if (deleted.length > 0) {
      await db.insert(auditLogs).values({
        actorId: actor.id,
        action: 'DELETE_CMS_NEWS',
        entityType: 'cms_news',
        entityId: id,
        oldValues: deleted[0],
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus warta.' };
  }
}

/* ========================================================================= */
/* C. GALLERY & ALBUM MANAGER                                                */
/* ========================================================================= */

export async function getAlbumsListAction() {
  await checkCmsPermission();
  const db = getDb();
  const albumRows = await db.select().from(cmsAlbums).orderBy(desc(cmsAlbums.createdAt));
  const photoRows = await db.select().from(cmsAlbumPhotos).orderBy(asc(cmsAlbumPhotos.displayOrder));

  const result = albumRows.map((a) => ({
    ...a,
    photos: photoRows.filter((p) => p.albumId === a.id),
  }));

  return { success: true, data: result };
}

export async function saveAlbumAction(params: {
  id?: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  eventDate?: string;
  isFeatured?: boolean;
  status?: PublishStatus;
}) {
  const actor = await checkCmsPermission();
  const db = getDb();
  const status = params.status || 'draft';

  try {
    let savedItem;
    if (params.id) {
      const updated = await db
        .update(cmsAlbums)
        .set({
          title: params.title,
          description: params.description || null,
          coverImageUrl: params.coverImageUrl || null,
          eventDate: params.eventDate || null,
          isFeatured: params.isFeatured ?? false,
          status,
          updatedAt: new Date(),
        })
        .where(eq(cmsAlbums.id, params.id))
        .returning();
      savedItem = updated[0];
    } else {
      const slug = `${generateSlug(params.title)}-${Date.now().toString().slice(-4)}`;
      const inserted = await db
        .insert(cmsAlbums)
        .values({
          title: params.title,
          slug,
          description: params.description || null,
          coverImageUrl: params.coverImageUrl || null,
          eventDate: params.eventDate || null,
          isFeatured: params.isFeatured ?? false,
          status,
          createdBy: actor.id,
        })
        .returning();
      savedItem = inserted[0];
    }

    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true, data: savedItem };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan album.' };
  }
}

export async function addPhotoToAlbumAction(params: {
  albumId: string;
  imageUrl: string;
  caption?: string;
  isFeatured?: boolean;
}) {
  await checkCmsPermission();
  const db = getDb();

  try {
    const inserted = await db
      .insert(cmsAlbumPhotos)
      .values({
        albumId: params.albumId,
        imageUrl: params.imageUrl,
        caption: params.caption || null,
        isFeatured: params.isFeatured ?? false,
      })
      .returning();

    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true, data: inserted[0] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menambahkan foto.' };
  }
}

export async function deletePhotoAction(photoId: string) {
  await checkCmsPermission();
  const db = getDb();
  try {
    await db.delete(cmsAlbumPhotos).where(eq(cmsAlbumPhotos.id, photoId));
    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus foto.' };
  }
}

export async function deleteAlbumAction(albumId: string) {
  await checkCmsPermission();
  const db = getDb();
  try {
    await db.delete(cmsAlbums).where(eq(cmsAlbums.id, albumId));
    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus album.' };
  }
}

/* ========================================================================= */
/* D. ACHIEVEMENT MANAGER                                                    */
/* ========================================================================= */

export async function getAchievementsListAction() {
  await checkCmsPermission();
  const db = getDb();
  const rows = await db.select().from(cmsAchievements).orderBy(desc(cmsAchievements.createdAt));
  return { success: true, data: rows };
}

export async function saveAchievementAction(params: {
  id?: string;
  title: string;
  recipient: string;
  competition: string;
  rank: string;
  category: string;
  level: string;
  eventDate?: string;
  description?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  status?: PublishStatus;
}) {
  const actor = await checkCmsPermission();
  const db = getDb();
  const status = params.status || 'published';

  try {
    let savedItem;
    if (params.id) {
      const updated = await db
        .update(cmsAchievements)
        .set({
          title: params.title,
          recipient: params.recipient,
          competition: params.competition,
          rank: params.rank,
          category: params.category,
          level: params.level,
          eventDate: params.eventDate || null,
          description: params.description || null,
          imageUrl: params.imageUrl || null,
          isFeatured: params.isFeatured ?? false,
          status,
          updatedAt: new Date(),
        })
        .where(eq(cmsAchievements.id, params.id))
        .returning();
      savedItem = updated[0];
    } else {
      const inserted = await db
        .insert(cmsAchievements)
        .values({
          title: params.title,
          recipient: params.recipient,
          competition: params.competition,
          rank: params.rank,
          category: params.category,
          level: params.level,
          eventDate: params.eventDate || null,
          description: params.description || null,
          imageUrl: params.imageUrl || null,
          isFeatured: params.isFeatured ?? false,
          status,
          createdBy: actor.id,
        })
        .returning();
      savedItem = inserted[0];
    }

    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true, data: savedItem };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan data prestasi.' };
  }
}

export async function deleteAchievementAction(id: string) {
  const actor = await checkCmsPermission();
  const db = getDb();
  try {
    await db.delete(cmsAchievements).where(eq(cmsAchievements.id, id));
    revalidatePath('/');
    revalidatePath('/admin/website');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus prestasi.' };
  }
}

/* ========================================================================= */
/* E. MEDIA LIBRARY (Upload & Storage Management)                           */
/* ========================================================================= */

export async function getMediaListAction() {
  await checkCmsPermission();
  const db = getDb();
  const rows = await db.select().from(cmsMedia).orderBy(desc(cmsMedia.createdAt)).limit(50);
  return { success: true, data: rows };
}

export async function uploadMediaAction(formData: FormData) {
  const actor = await checkCmsPermission();
  const file = formData.get('file') as File | null;
  const altText = (formData.get('altText') as string) || '';

  if (!file || file.size === 0) {
    return { success: false, error: 'Silakan pilih berkas gambar yang valid.' };
  }

  // Validasi MIME
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMime.includes(file.type)) {
    return { success: false, error: 'Format berkas tidak didukung. Harap unggah gambar JPG, PNG, WEBP, atau GIF.' };
  }

  // Validasi Ukuran (Maks 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Ukuran berkas melebihi batas 5MB.' };
  }

  try {
    const supabase = getSupabaseAdmin();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `cms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `public-media/${cleanFileName}`;

    // Pastikan bucket materials atau cms-media dapat menampung
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Coba upload ke Supabase Storage bucket 'materials' (yang sudah ada dalam skema RLS)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    let publicUrl = '';
    if (uploadError) {
      console.warn('[uploadMediaAction] Supabase storage upload warning:', uploadError.message);
      // Fallback data URL jika bucket belum dibuat
      const base64 = buffer.toString('base64');
      publicUrl = `data:${file.type};base64,${base64}`;
    } else {
      const { data: urlData } = supabase.storage.from('materials').getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    const db = getDb();
    const inserted = await db
      .insert(cmsMedia)
      .values({
        fileName: file.name,
        fileUrl: publicUrl,
        filePath: filePath,
        mimeType: file.type,
        fileSize: file.size,
        altText: altText || file.name,
        createdBy: actor.id,
      })
      .returning();

    return { success: true, data: inserted[0] };
  } catch (err: any) {
    console.error('[uploadMediaAction] Error uploading:', err);
    return { success: false, error: err.message || 'Gagal mengunggah media.' };
  }
}
