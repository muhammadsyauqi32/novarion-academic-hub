import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { StudentSidebar } from '@/components/StudentSidebar';
import { StudentBottomNav } from '@/components/StudentBottomNav';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
        {/* Topbar Ringkas */}
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-deep">
              Novarion Academic Hub
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/account"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface-soft border border-border text-xs font-medium text-text-primary hover:bg-border/40 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-brand-primary text-text-primary flex items-center justify-center font-bold text-[11px]">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-semibold">{user.fullName.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <StudentBottomNav userRole={user.role} />
    </div>
  );
}
