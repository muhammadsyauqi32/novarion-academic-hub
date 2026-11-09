import { NextRequest, NextResponse } from 'next/server';
import { getDb, shortLinks } from '@novarion/db';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Route handler untuk resolver shortlink kustom:
 * - Menangani resolusi nova.link/[slug] (melalui rewrite middleware)
 * - Menangani resolusi langsung domain-apa-saja/s/[slug]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const rawSlug = params?.slug || '';
  const slug = decodeURIComponent(rawSlug).trim().toLowerCase();

  if (!slug) {
    const notFoundUrl = new URL('/s/not-found', request.url);
    return NextResponse.redirect(notFoundUrl, { status: 307 });
  }

  try {
    const db = getDb();

    // Cari tautan aktif di database
    const [link] = await db
      .select({
        id: shortLinks.id,
        originalUrl: shortLinks.originalUrl,
        isActive: shortLinks.isActive,
      })
      .from(shortLinks)
      .where(and(eq(shortLinks.slug, slug), eq(shortLinks.isActive, true)))
      .limit(1);

    if (!link || !link.originalUrl) {
      const notFoundUrl = new URL('/s/not-found', request.url);
      notFoundUrl.searchParams.set('slug', slug);
      return NextResponse.redirect(notFoundUrl, { status: 307 });
    }

    // Inkremen click_count secara asinkron di background tanpa menghambat respon redirect
    // (Gunakan void / Promise tidak di-await agar redirect super cepat)
    db.update(shortLinks)
      .set({
        clickCount: sql`${shortLinks.clickCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(shortLinks.id, link.id))
      .catch((err) => {
        console.error(`[ShortLink Redirect] Gagal memperbarui click count slug="${slug}":`, err);
      });

    // Validasi URL tujuan sebelum redirect
    let targetUrl: URL;
    try {
      targetUrl = new URL(link.originalUrl);
    } catch {
      // Jika string URL tersimpan tanpa protokol (misal: "google.com")
      targetUrl = new URL(`https://${link.originalUrl}`);
    }

    // 307 Temporary Redirect: Memastikan client tidak meng-cache secara permanen
    // sehingga setiap klik tetap terhitung akurat di analitik
    return NextResponse.redirect(targetUrl.toString(), {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (err) {
    console.error(`[ShortLink Resolver Error] Slug "${slug}":`, err);
    const notFoundUrl = new URL('/s/not-found', request.url);
    notFoundUrl.searchParams.set('slug', slug);
    return NextResponse.redirect(notFoundUrl, { status: 307 });
  }
}

