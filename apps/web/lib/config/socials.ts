export interface SocialPlatformConfig {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
  url: string | null;
  handle?: string;
  description?: string;
}

/**
 * Konfigurasi Akun Media Sosial Resmi Novarion 62
 * Kebijakan integritas: Hanya cantumkan URL akun resmi yang telah diverifikasi.
 * Jika URL belum siap atau belum dibuka secara resmi, biarkan url bernilai null
 * agar tidak merender link rusak atau placeholder palsu pada antarmuka publik.
 */
export const OFFICIAL_SOCIALS: SocialPlatformConfig[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    platform: 'instagram',
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null,
    handle: '@novarion62',
    description: 'Dokumentasi visual & kabar kegiatan angkatan',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    platform: 'linkedin',
    url: process.env.NEXT_PUBLIC_LINKEDIN_URL || null,
    handle: 'Statistika 62 IPB',
    description: 'Jejaring akademik & rekam jejak profesional',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'youtube',
    url: process.env.NEXT_PUBLIC_YOUTUBE_URL || null,
    handle: 'Novarion 62',
    description: 'Arsip dokumentasi video & aftermovie kegiatan',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'tiktok',
    url: process.env.NEXT_PUBLIC_TIKTOK_URL || null,
    handle: '@novarion62',
    description: 'Momen kebersamaan & kreasi mahasiswa',
  },
];
