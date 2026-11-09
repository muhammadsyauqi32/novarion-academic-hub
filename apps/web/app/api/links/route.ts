import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/guards';
import { getDb, shortLinks } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import {
  createShortLinkSchema,
  RESERVED_SLUGS,
  shortLinkSlugRegex,
} from '@novarion/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/links
 * Mengambil daftar tautan yang dimiliki oleh pengguna yang sedang login.
 * Jika role admin, dapat melihat seluruh tautan dengan parameter ?all=true.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const showAll = user.role === 'admin' && searchParams.get('all') === 'true';

  try {
    const db = getDb();
    const query = db
      .select({
        id: shortLinks.id,
        originalUrl: shortLinks.originalUrl,
        slug: shortLinks.slug,
        title: shortLinks.title,
        description: shortLinks.description,
        clickCount: shortLinks.clickCount,
        userId: shortLinks.userId,
        isActive: shortLinks.isActive,
        createdAt: shortLinks.createdAt,
        updatedAt: shortLinks.updatedAt,
      })
      .from(shortLinks);

    const rows = showAll
      ? await query.orderBy(desc(shortLinks.createdAt)).limit(200)
      : await query.where(eq(shortLinks.userId, user.id)).orderBy(desc(shortLinks.createdAt)).limit(100);

    return NextResponse.json({
      links: rows.map((r) => ({
        ...r,
        shortUrl: `nova.link/${r.slug}`,
      })),
    });
  } catch (err: any) {
    console.error('[API /api/links GET] Error:', err);
    return NextResponse.json({ error: 'Gagal memuat data tautan' }, { status: 500 });
  }
}

/**
 * POST /api/links
 * Membuat shortlink baru
 * Body: { original_url: string, slug: string, title?: string, description?: string }
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload JSON tidak valid' }, { status: 400 });
  }

  // Normalisasi field snake_case vs camelCase
  const originalUrl = (body.original_url || body.originalUrl || '').trim();
  const slug = (body.slug || '').trim().toLowerCase();
  const title = body.title ? String(body.title).trim() : undefined;
  const description = body.description ? String(body.description).trim() : undefined;

  const validated = createShortLinkSchema.safeParse({
    originalUrl,
    slug,
    title,
    description,
  });

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

  // Cek keunikan slug di DB
  const existing = await db
    .select({ id: shortLinks.id })
    .from(shortLinks)
    .where(eq(shortLinks.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: `Slug "${slug}" sudah digunakan. Silakan gunakan slug lain.` },
      { status: 409 }
    );
  }

  try {
    const [inserted] = await db
      .insert(shortLinks)
      .values({
        originalUrl: validated.data.originalUrl,
        slug: validated.data.slug,
        title: validated.data.title || null,
        description: validated.data.description || null,
        userId: user.id,
        clickCount: 0,
        isActive: true,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        link: {
          id: inserted.id,
          slug: inserted.slug,
          shortUrl: `nova.link/${inserted.slug}`,
          originalUrl: inserted.originalUrl,
          title: inserted.title,
          description: inserted.description,
          clickCount: inserted.clickCount,
          createdAt: inserted.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API /api/links POST] Insert error:', err);
    if (err?.code === '23505') {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah digunakan.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Gagal membuat tautan' }, { status: 500 });
  }
}

