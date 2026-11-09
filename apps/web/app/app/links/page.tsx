import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, shortLinks } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { ShortLinksClient } from '@/components/hub/ShortLinksClient';

export const metadata = {
  title: 'Shortlink Kustom (nova.link) — Novarion Hub',
  description: 'Kelola dan buat tautan singkat kustom nova.link untuk kegiatan dan arsip angkatan.',
};

export default async function ShortLinksPage() {
  const user = await requireAuth();
  const db = getDb();

  // Ambil daftar tautan milik pengguna saat ini (atau semua jika role admin)
  const isSuperUser = user.role === 'admin';
  const query = db.select().from(shortLinks);

  const rows = isSuperUser
    ? await query.orderBy(desc(shortLinks.createdAt)).limit(100)
    : await query.where(eq(shortLinks.userId, user.id)).orderBy(desc(shortLinks.createdAt)).limit(100);

  const formattedLinks = rows.map((r) => ({
    id: r.id,
    originalUrl: r.originalUrl,
    slug: r.slug,
    title: r.title,
    description: r.description,
    clickCount: r.clickCount,
    userId: r.userId,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ShortLinksClient
        initialLinks={formattedLinks}
        userRole={user.role}
        currentUserId={user.id}
      />
    </div>
  );
}

