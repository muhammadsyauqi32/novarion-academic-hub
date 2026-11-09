import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, shortLinks } from '@novarion/db';
import { desc } from 'drizzle-orm';
import { ShortLinksClient } from '@/components/hub/ShortLinksClient';

export const metadata = {
  title: 'Kelola Shortlink (nova.link) — Admin Novarion',
  description: 'Kelola seluruh tautan singkat kustom nova.link di lingkungan angkatan Novarion.',
};

export default async function AdminShortLinksPage() {
  const user = await requireAuth();
  const db = getDb();

  // Admin melihat seluruh tautan kustom di platform
  const rows = await db
    .select()
    .from(shortLinks)
    .orderBy(desc(shortLinks.createdAt))
    .limit(200);

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

