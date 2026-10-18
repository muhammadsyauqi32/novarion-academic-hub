'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  FolderDown, 
  MoreHorizontal, 
  ListTodo,
  BookOpen, 
  Send, 
  User, 
  ShieldAlert,
  X,
  LogOut
} from 'lucide-react';
import { UserRole } from '@novarion/shared';

interface StudentBottomNavProps {
  userRole?: UserRole;
}

export function StudentBottomNav({ userRole }: StudentBottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const mainItems = [
    { label: 'Beranda', href: '/app', icon: Home, exact: true },
    { label: 'Kalender', href: '/app/calendar', icon: Calendar },
    { label: 'Tugas', href: '/app/tasks', icon: CheckSquare },
    { label: 'Materi', href: '/app/materials', icon: FolderDown },
  ];

  // Close sheet on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isMoreOpen) {
        setIsMoreOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoreOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMoreOpen]);

  return (
    <>
      {/* Drawer Menu Lainnya (Accessible Sheet) */}
      {isMoreOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end transition-opacity"
          onClick={() => setIsMoreOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Tambahan"
        >
          <div
            ref={sheetRef}
            className="w-full bg-surface rounded-t-2xl p-5 border-t border-border shadow-xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="w-8 h-1 bg-border rounded-full" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Navigasi Lainnya</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-soft"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/app/agendas"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft text-text-primary text-xs font-medium hover:bg-border/40 transition-colors"
              >
                <ListTodo className="w-4 h-4 text-teal-deep shrink-0" />
                <span className="truncate">Semua Agenda</span>
              </Link>
              <Link
                href="/app/knowledge"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft text-text-primary text-xs font-medium hover:bg-border/40 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-teal-deep shrink-0" />
                <span className="truncate">Knowledge Hub</span>
              </Link>
              <Link
                href="/app/submissions"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft text-text-primary text-xs font-medium hover:bg-border/40 transition-colors"
              >
                <Send className="w-4 h-4 text-teal-deep shrink-0" />
                <span className="truncate">Pengajuan Saya</span>
              </Link>
              <Link
                href="/app/account"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-soft text-text-primary text-xs font-medium hover:bg-border/40 transition-colors"
              >
                <User className="w-4 h-4 text-teal-deep shrink-0" />
                <span className="truncate">Akun & Profil</span>
              </Link>
              {userRole === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMoreOpen(false)}
                  className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-teal-deep text-white text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Workspace Admin</span>
                  </div>
                  <span className="text-[10px] opacity-80 font-mono">/admin</span>
                </Link>
              )}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <form action="/auth/signout" method="post" className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-danger-text hover:bg-danger-surface rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4 Titik Prioritas Bottom Navigation */}
      <nav 
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around h-16 px-1 select-none pb-[env(safe-area-inset-bottom)]"
        aria-label="Navigasi Bawah Mahasiswa"
      >
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] h-12 rounded-lg transition-colors ${
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
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 rounded-lg transition-colors ${
            isMoreOpen ? 'text-teal-deep font-bold' : 'text-text-muted hover:text-text-primary'
          }`}
          aria-expanded={isMoreOpen}
          aria-label="Buka menu navigasi lainnya"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Lainnya</span>
        </button>
      </nav>
    </>
  );
}
