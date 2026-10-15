'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, CheckSquare, FolderDown, MoreHorizontal, BookOpen, Send, User, ShieldAlert } from 'lucide-react';
import { UserRole } from '@novarion/shared';

interface StudentBottomNavProps {
  userRole?: UserRole;
}

export function StudentBottomNav({ userRole }: StudentBottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainItems = [
    { label: 'Beranda', href: '/app', icon: Home },
    { label: 'Kalender', href: '/app/calendar', icon: Calendar },
    { label: 'Tugas', href: '/app/tasks', icon: CheckSquare },
    { label: 'Materi', href: '/app/materials', icon: FolderDown },
  ];

  return (
    <>
      {/* Drawer Menu Lainnya */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)}>
          <div
            className="absolute bottom-16 inset-x-0 bg-surface rounded-t-2xl p-5 border-t border-border shadow-xl flex flex-col gap-3 animate-in slide-in-from-bottom-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-2" />
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider px-2">Menu Lainnya</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/app/knowledge"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft text-text-primary text-xs font-semibold hover:bg-border/40"
              >
                <BookOpen className="w-4 h-4 text-teal-deep" />
                <span>Knowledge Hub</span>
              </Link>
              <Link
                href="/app/submissions"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft text-text-primary text-xs font-semibold hover:bg-border/40"
              >
                <Send className="w-4 h-4 text-teal-deep" />
                <span>Pengajuan Saya</span>
              </Link>
              <Link
                href="/app/account"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft text-text-primary text-xs font-semibold hover:bg-border/40"
              >
                <User className="w-4 h-4 text-teal-deep" />
                <span>Akun Saya</span>
              </Link>
              {userRole === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-deep/10 text-teal-deep text-xs font-semibold"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Hub</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4 Titik Prioritas Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around h-16 px-2 select-none safe-bottom">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
                isActive ? 'text-teal-deep font-bold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
            isMoreOpen ? 'text-teal-deep font-bold' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Lainnya</span>
        </button>
      </nav>
    </>
  );
}
