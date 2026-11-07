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
  LogOut,
} from 'lucide-react';
import { UserRole } from '@novarion/shared';

interface StudentSidebarProps {
  userRole?: UserRole;
  userName?: string;
  userNim?: string;
}

interface NavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Utama',
    items: [
      { label: 'Beranda', href: '/app', icon: Home, exact: true },
      { label: 'Kalender', href: '/app/calendar', icon: Calendar },
      { label: 'Agenda', href: '/app/agendas', icon: ListTodo },
      { label: 'Tugas', href: '/app/tasks', icon: CheckSquare },
    ],
  },
  {
    title: 'Sumber Belajar',
    items: [
      { label: 'Materi', href: '/app/materials', icon: FolderDown },
      { label: 'Knowledge Hub', href: '/app/knowledge', icon: BookOpen },
    ],
  },
  {
    title: 'Akun',
    items: [
      { label: 'Pengajuan', href: '/app/submissions', icon: Send },
      { label: 'Profil', href: '/app/account', icon: User },
    ],
  },
];

export function StudentSidebar({ userRole, userName, userNim }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-surface border-r border-border h-screen sticky top-0 px-3.5 py-5 justify-between select-none">
      <div className="flex flex-col gap-6 overflow-y-auto">
        <div className="px-2.5">
          <BrandLogo href="/app" size="md" />
        </div>

        <nav className="flex flex-col gap-5" aria-label="Navigasi Utama Mahasiswa">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-1">
              <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-text-muted/80">
                {group.title}
              </span>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-input text-xs transition-colors relative ${
                        isActive
                          ? 'bg-teal-deep/10 text-teal-deep font-bold'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-soft font-medium'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-teal-deep" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-deep' : 'text-text-muted'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-3.5 border-t border-border mt-4">
        {userRole === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center justify-between px-2.5 py-2 rounded-input bg-teal-deep text-white dark:text-[#0C1815] text-xs font-semibold hover:brightness-110 transition-all shadow-xs"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-current" />
              <span>Workspace Admin</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-80" />
          </Link>
        )}

        <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface-soft rounded-input border border-border">
          <div className="flex flex-col truncate min-w-0 pr-2">
            <span className="text-xs font-bold text-text-primary truncate">{userName || 'Mahasiswa'}</span>
            <span className="text-[10px] text-text-muted font-mono">{userNim || 'NIM'}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Keluar dari akun"
              aria-label="Keluar dari akun"
              className="p-1.5 rounded-input hover:bg-danger-surface text-text-muted hover:text-danger-text transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
