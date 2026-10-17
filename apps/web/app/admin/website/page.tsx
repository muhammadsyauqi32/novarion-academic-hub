import React from 'react';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/guards';
import { isSuperAdmin, hasPermission } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import { 
  getHeroListAction, 
  getNewsListAction, 
  getAlbumsListAction, 
  getAchievementsListAction, 
  getMediaListAction 
} from '@/actions/cms';
import { CmsClient } from './CmsClient';

export const metadata: Metadata = {
  title: 'Kelola Website Publik — Novarion Admin',
};

export default async function WebsiteCmsPage() {
  const user = await requireAuth();
  const superAdmin = await isSuperAdmin(user);
  const canManageWebsite = await hasPermission(user, 'website.manage');

  if (!superAdmin && !canManageWebsite) {
    redirect('/admin');
  }

  const [heroesRes, newsRes, albumsRes, achievementsRes, mediaRes] = await Promise.all([
    getHeroListAction(),
    getNewsListAction(),
    getAlbumsListAction(),
    getAchievementsListAction(),
    getMediaListAction(),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-deep uppercase tracking-wider">
          <span>Website Publik</span>
          <span>•</span>
          <span>novarion.web.id</span>
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
          Kelola Website & Konten Angkatan
        </h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Pusat kendali konten landing page publik: foto hero, warta kegiatan, galeri album momen, prestasi mahasiswa, dan repositori media.
        </p>
      </div>

      <CmsClient
        initialHeroes={heroesRes.data || []}
        initialNews={newsRes.data || []}
        initialAlbums={albumsRes.data || []}
        initialAchievements={achievementsRes.data || []}
        initialMedia={mediaRes.data || []}
      />
    </div>
  );
}
