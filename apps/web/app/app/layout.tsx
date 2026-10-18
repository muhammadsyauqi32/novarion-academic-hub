import React from 'react';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/guards';
import { StudentSidebar } from '@/components/StudentSidebar';
import { StudentBottomNav } from '@/components/StudentBottomNav';
import { BrandLogo } from '@/components/BrandLogo';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Academic Hub',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop Sidebar */}
      <StudentSidebar
        userRole={user.role}
        userName={user.fullName}
        userNim={user.nim}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Banner Khusus Administrator dalam Mode Mahasiswa */}
        {user.role === 'admin' && (
          <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 sm:px-6 py-2 text-xs text-amber-950 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold">Mode Mahasiswa (Pratinjau)</span>
              <span className="hidden sm:inline text-amber-800">
                — Anda sedang melihat antarmuka mahasiswa
              </span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-deep text-white text-xs font-semibold hover:bg-teal-deep/90 transition-colors shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Kembali ke Admin</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        )}

        {/* Topbar Ringkas */}
        <header
          className={`h-14 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky ${
            user.role === 'admin' ? 'top-8' : 'top-0'
          } z-30`}
        >
          {/* Mobile: Logo Brand, Desktop: Workspace Context */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <BrandLogo href="/app" size="sm" showSubtitle={false} />
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs text-text-muted">
              <span className="font-bold text-text-primary">Novarion Academic Workspace</span>
              <span>/</span>
              <span className="text-[11px] font-mono bg-surface-soft px-1.5 py-0.5 rounded border border-border">
                Statistika 62
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-teal-deep hover:bg-surface-soft transition-colors"
              >
                <span>Panel Admin</span>
              </Link>
            )}
            <Link
              href="/app/account"
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-surface-soft border border-border text-xs font-medium text-text-primary hover:bg-border/40 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-brand-primary text-text-primary flex items-center justify-center font-bold text-[11px]">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[120px] font-semibold">{user.fullName.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <StudentBottomNav userRole={user.role} />
    </div>
  );
}
