import { describe, it, expect } from 'vitest';
import {
  createShortLinkSchema,
  updateShortLinkSchema,
  shortLinkSlugRegex,
  RESERVED_SLUGS,
} from '../packages/shared/src/schemas.js';

describe('ShortLink Slug Validation & Regex', () => {
  it('menerima format slug yang valid', () => {
    const validSlugs = [
      'pendaftaran-makrab',
      'acara-2026',
      'modul1',
      'modul-statistika-dasar',
      'link-a',
      'tugas-akhir-kelompok-3',
      '12345',
      'a-b-c',
    ];

    for (const slug of validSlugs) {
      expect(shortLinkSlugRegex.test(slug), `Slug "${slug}" harus valid`).toBe(true);
    }
  });

  it('menolak format slug yang tidak valid', () => {
    const invalidSlugs = [
      'Pendaftaran', // Huruf besar
      'pendaftaran makrab', // Spasi
      'acara_2026', // Underscore
      'acara--2026', // Double hyphen
      '-pendaftaran', // Diawali hyphen
      'pendaftaran-', // Diakhiri hyphen
      'acara@statistika', // Karakter spesial
      'acara/kegiatan', // Slash
      'pendaftaran#1', // Hash
    ];

    for (const slug of invalidSlugs) {
      expect(shortLinkSlugRegex.test(slug), `Slug "${slug}" harus ditolak`).toBe(false);
    }
  });

  it('memiliki daftar reserved paths yang lengkap dan melarang penggunaannya', () => {
    const criticalReserved = ['api', 'app', 'admin', 'auth', 'login', 'dashboard'];
    for (const reserved of criticalReserved) {
      expect(RESERVED_SLUGS).toContain(reserved);

      const res = createShortLinkSchema.safeParse({
        originalUrl: 'https://google.com',
        slug: reserved,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0]?.message).toContain('telah dicadangkan untuk sistem internal');
      }
    }
    expect(RESERVED_SLUGS).toContain('s');
  });
});

describe('ShortLink Schema Validation', () => {
  it('berhasil memvalidasi payload pembuatan shortlink yang benar', () => {
    const result = createShortLinkSchema.safeParse({
      originalUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScxyz/viewform',
      slug: 'pendaftaran-makrab-2026',
      title: 'Formulir Pendaftaran Makrab',
      description: 'Link pendaftaran terbuka untuk angkatan',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('pendaftaran-makrab-2026');
      expect(result.data.title).toBe('Formulir Pendaftaran Makrab');
    }
  });

  it('menolak jika destination URL tidak valid atau tanpa protokol http/https', () => {
    const invalidUrls = ['bukan-url', 'ftp://server.com', 'javascript:alert(1)'];

    for (const url of invalidUrls) {
      const res = createShortLinkSchema.safeParse({
        originalUrl: url,
        slug: 'valid-slug',
      });
      expect(res.success, `URL "${url}" harus ditolak`).toBe(false);
    }
  });

  it('memvalidasi skema update dengan benar', () => {
    const updateResult = updateShortLinkSchema.safeParse({
      title: 'Judul Baru',
      originalUrl: 'https://drive.google.com/file/d/xyz',
      isActive: false,
    });

    expect(updateResult.success).toBe(true);
    if (updateResult.success) {
      expect(updateResult.data.isActive).toBe(false);
      expect(updateResult.data.title).toBe('Judul Baru');
    }
  });
});
