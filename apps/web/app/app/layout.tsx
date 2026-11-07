import React from 'react';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth/guards';
import { StudentSidebar } from '@/components/StudentSidebar';
import { StudentBottomNav } from '@/components/StudentBottomNav';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    <div className="flex min-h-screen bg-canvas text-text-primary">
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
          <div className="bg-warning-surface border-b border-warning-border px-4 sm:px-6 py-2 text-xs text-text-primary flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
              <span className="font-bold">Mode Mahasiswa (Pratinjau)</span>
              <span className="hidden sm:inline text-warning-text font-medium">
                · Anda sedang melihat antarmuka mahasiswa
              </span>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-input bg-teal-deep text-white dark:text-[#0C1815] text-xs font-semibold hover:brightness-110 transition-all shadow-xs"
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
            user.role === 'admin' ? 'top-9' : 'top-0'
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
              <span className="text-[11px] font-mono bg-surface-soft px-1.5 py-0.5 rounded-xs border border-border">
                Statistika 62
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-input text-xs font-semibold text-teal-deep hover:bg-surface-soft transition-colors"
              >
                <span>Panel Admin</span>
              </Link>
            )}
            <ThemeToggle />
            <Link
              href="/app/account"
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-surface-soft border border-border text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-brand-primary text-brand-foreground flex items-center justify-center font-bold text-[11px]">
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
