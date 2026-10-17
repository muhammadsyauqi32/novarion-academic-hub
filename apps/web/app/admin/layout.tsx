import React from 'react';
import { requireAdmin } from '@/lib/auth/guards';
import { AdminSidebar } from '@/components/AdminSidebar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop Admin Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Admin Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Indicator Banner */}
        <header className="h-14 bg-teal-deep text-white px-4 sm:px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span>ADMIN WORKSPACE — PENGELOLA ANGKATAN</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline opacity-80">
              Masuk sebagai: <strong className="text-white">{admin.fullName}</strong>
            </span>
            <Link
              href="/app"
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Lihat Tampilan Mahasiswa
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
