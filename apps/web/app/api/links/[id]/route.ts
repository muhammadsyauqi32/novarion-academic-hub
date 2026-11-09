import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/guards';
import { getDb, shortLinks } from '@novarion/db';
import { eq } from 'drizzle-orm';
import { updateShortLinkSchema } from '@novarion/shared';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/links/:id
 * Menghapus atau menonaktifkan tautan
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  const linkId = params.id;
  if (!linkId) {
    return NextResponse.json({ error: 'ID tautan tidak valid' }, { status: 400 });
  }

  const db = getDb();
  try {
    const [existing] = await db
      .select({ id: shortLinks.id, userId: shortLinks.userId })
      .from(shortLinks)
      .where(eq(shortLinks.id, linkId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Tautan tidak ditemukan' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Anda tidak memiliki hak untuk menghapus tautan ini' },
        { status: 403 }
      );
    }

    await db.delete(shortLinks).where(eq(shortLinks.id, linkId));

    return NextResponse.json({ success: true, message: 'Tautan berhasil dihapus' });
  } catch (err: any) {
    console.error('[API /api/links/:id DELETE] Error:', err);
    return NextResponse.json({ error: 'Gagal menghapus tautan' }, { status: 500 });
  }
}

/**
 * PATCH /api/links/:id
 * Memperbarui title, originalUrl, atau status isActive tautan
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  const linkId = params.id;
  if (!linkId) {
    return NextResponse.json({ error: 'ID tautan tidak valid' }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload JSON tidak valid' }, { status: 400 });
  }

  const updateData: Record<string, any> = {};
  if (body.original_url || body.originalUrl) {
    updateData.originalUrl = (body.original_url || body.originalUrl).trim();
  }
  if (body.title !== undefined) updateData.title = String(body.title).trim();
  if (body.description !== undefined) updateData.description = String(body.description).trim();
  if (body.is_active !== undefined || body.isActive !== undefined) {
    updateData.isActive = Boolean(body.is_active ?? body.isActive);
  }

  const validated = updateShortLinkSchema.safeParse(updateData);
  if (!validated.success) {
    return NextResponse.json(
      {
        error: 'Validasi gagal',
        details: validated.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  const db = getDb();
  try {
    const [existing] = await db
      .select({ id: shortLinks.id, userId: shortLinks.userId })
      .from(shortLinks)
      .where(eq(shortLinks.id, linkId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Tautan tidak ditemukan' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Anda tidak memiliki hak untuk mengubah tautan ini' },
        { status: 403 }
      );
    }

    const [updated] = await db
      .update(shortLinks)
      .set({
        ...validated.data,
        updatedAt: new Date(),
      })
      .where(eq(shortLinks.id, linkId))
      .returning();

    return NextResponse.json({
      success: true,
      link: {
        id: updated.id,
        slug: updated.slug,
        shortUrl: `nova.link/${updated.slug}`,
        originalUrl: updated.originalUrl,
        title: updated.title,
        description: updated.description,
        isActive: updated.isActive,
        clickCount: updated.clickCount,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err: any) {
    console.error('[API /api/links/:id PATCH] Error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui tautan' }, { status: 500 });
  }
}

