import { getDb, cmsHero, cmsNews, cmsAlbums, cmsAlbumPhotos, cmsAchievements } from '@novarion/db';
import { eq, desc, asc } from 'drizzle-orm';
import { CMSHero, CMSNews, CMSAlbum, CMSAchievement } from '@novarion/shared';

/**
 * Mengambil data publik aktif dari database secara aman untuk landing page novarion.web.id
 */
const DEFAULT_SAMPLE_NEWS: CMSNews[] = [
  {
    id: 'sample-1',
    type: 'article',
    title: 'Pelaksanaan Workshop Analisis Data Eksploratif Statistika 62',
    slug: 'workshop-eda-statistika-62',
    category: 'Akademik',
    excerpt: 'Workshop pengenalan library visualisasi data dan metodologi komputasi statistika modern bersama mentor angkatan.',
    content: 'Seluruh mahasiswa Angkatan 62 mengikuti workshop intensif analisis data eksploratif untuk memperkuat fondasi komputasi dan metodologi pemodelan data berbasis Python dan R.',
    coverImageUrl: '/foto_angkatan.jpeg',
    status: 'published',
    isFeatured: true,
    publishedAt: new Date('2026-10-10'),
    createdAt: new Date('2026-10-10'),
    updatedAt: new Date('2026-10-10'),
    createdBy: 'system',
  },
  {
    id: 'sample-2',
    type: 'article',
    title: 'Kunjungan Lapangan dan Diskusi Industri Sains Data',
    slug: 'kunjungan-industri-sains-data',
    category: 'Kegiatan',
    excerpt: 'Memperluas wawasan karir dan aplikasi algoritma prediktif di industri teknologi nasional.',
    content: 'Agenda kunjungan lapangan memberikan gambaran langsung implementasi arsitektur data pipeline dan machine learning di industri teknologi terkemuka.',
    coverImageUrl: null,
    status: 'published',
    isFeatured: false,
    publishedAt: new Date('2026-10-12'),
    createdAt: new Date('2026-10-12'),
    updatedAt: new Date('2026-10-12'),
    createdBy: 'system',
  },
  {
    id: 'sample-3',
    type: 'article',
    title: 'Rapat Kerja Pengurus Angkatan: Pemantapan Kalender Akademik Terpadu',
    slug: 'raker-pengurus-angkatan',
    category: 'Kepengurusan',
    excerpt: 'Koordinasi lintas divisi untuk sinkronisasi jadwal evaluasi tengah semester dan agenda keakraban.',
    content: 'Pengurus Angkatan Novarion menyelaraskan program kerja divisi akademik, komunikasi informasi, dan kekeluargaan.',
    coverImageUrl: '/foto_angkatan.jpeg',
    status: 'published',
    isFeatured: false,
    publishedAt: new Date('2026-10-14'),
    createdAt: new Date('2026-10-14'),
    updatedAt: new Date('2026-10-14'),
    createdBy: 'system',
  },
  {
    id: 'sample-4',
    type: 'article',
    title: 'Delegasi Novarion Raih Juara Kompetisi Sains Data Nasional 2026',
    slug: 'juara-kompetisi-sains-data',
    category: 'Prestasi',
    excerpt: 'Karya inovatif pemodelan statistika spasial berhasil membawa pulang penghargaan utama tingkat nasional.',
    content: 'Prestasi membanggakan diraih oleh mahasiswa Statistika 62 dalam ajang kompetisi pemodelan sains data tingkat nasional.',
    coverImageUrl: '/foto_angkatan.jpeg',
    status: 'published',
    isFeatured: true,
    publishedAt: new Date('2026-10-15'),
    createdAt: new Date('2026-10-15'),
    updatedAt: new Date('2026-10-15'),
    createdBy: 'system',
  },
];

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
      news: newsRows.length > 0 ? (newsRows as CMSNews[]) : DEFAULT_SAMPLE_NEWS,
      albums: albumsWithPhotos,
      achievements: achievementRows as CMSAchievement[],
    };
  } catch (err) {
    console.error('[getPublicWebsiteData] Error loading public data:', err);
    return {
      hero: null,
      news: DEFAULT_SAMPLE_NEWS,
      albums: [],
      achievements: [],
    };
  }
}
