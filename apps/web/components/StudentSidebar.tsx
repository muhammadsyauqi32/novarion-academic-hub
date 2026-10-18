'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import { 
  Home, 
  Calendar, 
  ListTodo, 
  CheckSquare, 
  FolderDown, 
  BookOpen, 
  Send, 
  User, 
  ShieldAlert,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { UserRole } from '@novarion/shared';

interface StudentSidebarProps {
  userRole?: UserRole;
  userName?: string;
  userNim?: string;
}

export function StudentSidebar({ userRole, userName, userNim }: StudentSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/app', icon: Home },
    { label: 'Kalender', href: '/app/calendar', icon: Calendar },
    { label: 'Daftar Agenda', href: '/app/agendas', icon: ListTodo },
    { label: 'Tugas Saya', href: '/app/tasks', icon: CheckSquare },
    { label: 'File Materi', href: '/app/materials', icon: FolderDown },
    { label: 'Knowledge Hub', href: '/app/knowledge', icon: BookOpen },
    { label: 'Pengajuan Saya', href: '/app/submissions', icon: Send },
    { label: 'Akun & Profil', href: '/app/account', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-border h-screen sticky top-0 px-4 py-5 justify-between select-none">
      <div className="flex flex-col gap-6">
        <div className="px-2">
          <BrandLogo href="/app" size="md" showSubtitle={true} />
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-mint-soft text-text-primary font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-soft'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-deep' : 'text-text-muted'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        {userRole === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-teal-deep text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Workspace Admin</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-text-primary truncate">{userName || 'Mahasiswa'}</span>
            <span className="text-[11px] text-text-muted">{userNim || 'NIM'}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Keluar"
              className="p-1.5 rounded-md hover:bg-danger-surface text-text-muted hover:text-danger-text transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
