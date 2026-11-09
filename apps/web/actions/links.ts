'use server';

import { requireAuth, getCurrentUser } from '@/lib/auth/guards';
import { getDb, shortLinks, profiles } from '@novarion/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import {
  createShortLinkSchema,
  updateShortLinkSchema,
  RESERVED_SLUGS,
  shortLinkSlugRegex,
} from '@novarion/shared';

export interface CreateLinkResult {
  success: boolean;
  error?: string;
  link?: {
    id: string;
    slug: string;
    originalUrl: string;
    title: string | null;
  };
}

export interface CheckSlugResult {
  available: boolean;
  reason?: string;
}

/**
 * Validasi ketersediaan slug kustom secara cepat untuk feedback instan di UI
 */
export async function checkSlugAvailabilityAction(rawSlug: string): Promise<CheckSlugResult> {
  const slug = rawSlug.trim().toLowerCase();

  if (!slug) {
    return { available: false, reason: 'Slug tidak boleh kosong' };
  }

  if (slug.length < 2) {
    return { available: false, reason: 'Slug minimal 2 karakter' };
  }

  if (slug.length > 64) {
    return { available: false, reason: 'Slug maksimal 64 karakter' };
  }

  if (!shortLinkSlugRegex.test(slug)) {
    return {
      available: false,
      reason: 'Hanya boleh huruf kecil, angka, dan strip (-). Tanpa spasi atau simbol lain.',
    };
  }

  if (RESERVED_SLUGS.includes(slug as any)) {
    return {
      available: false,
      reason: 'Slug ini telah dicadangkan untuk rute internal sistem',
    };
  }

  try {
    const db = getDb();
    const existing = await db
      .select({ id: shortLinks.id })
      .from(shortLinks)
      .where(eq(shortLinks.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return { available: false, reason: 'Slug ini sudah dipakai. Silakan coba yang lain.' };
    }

    return { available: true };
  } catch (err) {
    console.error('[checkSlugAvailabilityAction] DB error:', err);
    return { available: false, reason: 'Gagal memeriksa ketersediaan database' };
  }
}

/**
 * Membuat tautan pendek kustom baru (nova.link/[slug])
 */
export async function createShortLinkAction(formData: {
  originalUrl: string;
  slug: string;
  title?: string;
  description?: string;
}): Promise<CreateLinkResult> {
  const user = await requireAuth();
  const db = getDb();

  const validated = createShortLinkSchema.safeParse(formData);
  if (!validated.success) {
    const firstError = validated.error.errors[0]?.message || 'Data yang dikirimkan tidak valid';
    return { success: false, error: firstError };
  }

  const { originalUrl, slug, title, description } = validated.data;

  // Verifikasi keunikan slug di DB
  const existing = await db
    .select({ id: shortLinks.id })
    .from(shortLinks)
    .where(eq(shortLinks.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return {
      success: false,
      error: `Slug "${slug}" sudah digunakan. Silakan tentukan slug kustom lain.`,
    };
  }

  try {
    const [inserted] = await db
      .insert(shortLinks)
      .values({
        originalUrl,
        slug,
        title: title || null,
        description: description || null,
        userId: user.id,
        clickCount: 0,
        isActive: true,
      })
      .returning();

    revalidatePath('/app/links');
    revalidatePath('/admin/links');
    return {
      success: true,
      link: {
        id: inserted.id,
        slug: inserted.slug,
        originalUrl: inserted.originalUrl,
        title: inserted.title,
      },
    };
  } catch (err: any) {
    console.error('[createShortLinkAction] Insert error:', err);
    if (err?.code === '23505') {
      return {
        success: false,
        error: `Slug "${slug}" sudah digunakan. Silakan tentukan slug kustom lain.`,
      };
    }
    return { success: false, error: 'Gagal menyimpan tautan baru ke database' };
  }
}

/**
 * Menghapus tautan pendek dengan verifikasi kepemilikan (ownership) atau hak akses admin
 */
export async function deleteShortLinkAction(linkId: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const db = getDb();

  try {
    const [existing] = await db
      .select({ id: shortLinks.id, userId: shortLinks.userId })
      .from(shortLinks)
      .where(eq(shortLinks.id, linkId))
      .limit(1);

    if (!existing) {
      return { success: false, error: 'Tautan tidak ditemukan.' };
    }

    // Hanya pembuat link atau admin yang diizinkan menghapus
    if (existing.userId !== user.id && user.role !== 'admin') {
      return { success: false, error: 'Anda tidak memiliki izin untuk menghapus tautan ini.' };
    }

    await db.delete(shortLinks).where(eq(shortLinks.id, linkId));

    revalidatePath('/app/links');
    revalidatePath('/admin/links');
    return { success: true };
  } catch (err) {
    console.error('[deleteShortLinkAction] Error:', err);
    return { success: false, error: 'Gagal menghapus tautan.' };
  }
}

/**
 * Memperbarui data tautan pendek (judul, URL tujuan, atau status aktif)
 */
export async function updateShortLinkAction(
  linkId: string,
  data: {
    title?: string;
    originalUrl?: string;
    description?: string;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const db = getDb();

  const validated = updateShortLinkSchema.safeParse(data);
  if (!validated.success) {
    const firstError = validated.error.errors[0]?.message || 'Data pembaharuan tidak valid';
    return { success: false, error: firstError };
  }

  try {
    const [existing] = await db
      .select({ id: shortLinks.id, userId: shortLinks.userId })
      .from(shortLinks)
      .where(eq(shortLinks.id, linkId))
      .limit(1);

    if (!existing) {
      return { success: false, error: 'Tautan tidak ditemukan.' };
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      return { success: false, error: 'Anda tidak memiliki hak untuk mengubah tautan ini.' };
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (validated.data.title !== undefined) updatePayload.title = validated.data.title || null;
    if (validated.data.description !== undefined) updatePayload.description = validated.data.description || null;
    if (validated.data.originalUrl !== undefined) updatePayload.originalUrl = validated.data.originalUrl;
    if (validated.data.isActive !== undefined) updatePayload.isActive = validated.data.isActive;

    await db.update(shortLinks).set(updatePayload).where(eq(shortLinks.id, linkId));

    revalidatePath('/app/links');
    revalidatePath('/admin/links');
    return { success: true };
  } catch (err) {
    console.error('[updateShortLinkAction] Error:', err);
    return { success: false, error: 'Gagal memperbarui data tautan.' };
  }
}

