import React from 'react';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/guards';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminMobileNav } from '@/components/AdminMobileNav';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Workspace | Novarion Academic Hub',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop Admin Sidebar (>= md) */}
      <div className="hidden md:block shrink-0">
        <div className="h-screen sticky top-0">
          <AdminSidebar />
        </div>
      </div>

      {/* Main Admin Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Navigation Bar (< md) */}
        <AdminMobileNav adminName={admin.fullName} />

        {/* Desktop Top Indicator Banner (>= md) */}
        <header className="hidden md:flex h-14 bg-teal-deep text-white px-4 sm:px-6 items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span>ADMIN WORKSPACE — PENGELOLA ANGKATAN</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="opacity-80">
              Masuk sebagai: <strong className="text-white">{admin.fullName}</strong>
            </span>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              title="Beralih ke mode tampilan mahasiswa"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Mode Mahasiswa (Pratinjau)</span>
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
