import React from 'react';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/guards';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminMobileNav } from '@/components/AdminMobileNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Workspace',
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
    <div className="flex min-h-screen bg-canvas text-text-primary">
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
        <header className="hidden md:flex h-14 bg-surface/90 backdrop-blur-md border-b border-border text-text-primary px-4 sm:px-6 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
            <span>ADMIN WORKSPACE · PENGELOLA ANGKATAN</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-text-muted">
              Masuk sebagai: <strong className="text-text-primary">{admin.fullName}</strong>
            </span>
            <ThemeToggle />
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-surface-soft hover:bg-surface-hover border border-border text-text-primary font-semibold transition-colors"
              title="Beralih ke mode tampilan mahasiswa"
            >
              <Eye className="w-3.5 h-3.5 text-teal-deep" />
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
