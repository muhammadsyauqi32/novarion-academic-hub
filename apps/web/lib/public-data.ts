import { getDb, cmsHero, cmsNews, cmsAlbums, cmsAlbumPhotos, cmsAchievements } from '@novarion/db';
import { eq, desc, asc } from 'drizzle-orm';
import { CMSHero, CMSNews, CMSAlbum, CMSAchievement } from '@novarion/shared';

/**
 * Mengambil data publik aktif dari database secara aman untuk landing page novarion.web.id
 */
export async function getPublicWebsiteData() {
  try {
    const db = getDb();

    // 1. Hero Image Aktif (Maks 1 yang berstatus 'published')
    const heroRows = await db
      .select()
      .from(cmsHero)
      .where(eq(cmsHero.status, 'published'))
      .orderBy(desc(cmsHero.publishedAt), desc(cmsHero.createdAt))
      .limit(1);

    const activeHero: CMSHero | null = heroRows.length > 0 ? (heroRows[0] as CMSHero) : null;

    // 2. Berita & Kegiatan Terpublikasi
    const newsRows = await db
      .select()
      .from(cmsNews)
      .where(eq(cmsNews.status, 'published'))
      .orderBy(desc(cmsNews.isFeatured), desc(cmsNews.publishedAt), desc(cmsNews.createdAt))
      .limit(12);

    // 3. Album & Foto Dokumentasi Terpublikasi
    const albumRows = await db
      .select()
      .from(cmsAlbums)
      .where(eq(cmsAlbums.status, 'published'))
      .orderBy(desc(cmsAlbums.isFeatured), desc(cmsAlbums.eventDate), desc(cmsAlbums.createdAt))
      .limit(8);

    const albumIds = albumRows.map((a) => a.id);
    let photoRows: any[] = [];
    if (albumIds.length > 0) {
      photoRows = await db
        .select()
        .from(cmsAlbumPhotos)
        .orderBy(asc(cmsAlbumPhotos.displayOrder), desc(cmsAlbumPhotos.createdAt));
    }

    const albumsWithPhotos: CMSAlbum[] = albumRows.map((album) => ({
      ...(album as CMSAlbum),
      photos: photoRows.filter((p) => p.albumId === album.id),
    }));

    // 4. Prestasi Terpublikasi
    const achievementRows = await db
      .select()
      .from(cmsAchievements)
      .where(eq(cmsAchievements.status, 'published'))
      .orderBy(desc(cmsAchievements.isFeatured), desc(cmsAchievements.eventDate), desc(cmsAchievements.createdAt))
      .limit(20);

    return {
      hero: activeHero,
      news: newsRows as CMSNews[],
      albums: albumsWithPhotos,
      achievements: achievementRows as CMSAchievement[],
    };
  } catch (err) {
    console.error('[getPublicWebsiteData] Error loading public data:', err);
    return {
      hero: null,
      news: [],
      albums: [],
      achievements: [],
    };
  }
}
