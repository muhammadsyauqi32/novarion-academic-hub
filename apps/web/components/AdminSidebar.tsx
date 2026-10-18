'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard,
  CheckCircle,
  CalendarCheck,
  GraduationCap,
  Users,
  FolderOpen,
  HelpCircle,
  MessageSquare,
  History,
  Eye,
  LogOut,
  ShieldCheck,
  Globe,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: 'Ikhtisar',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Akademik',
    items: [
      { label: 'Kelola Agenda', href: '/admin/agendas', icon: CalendarCheck },
      { label: 'Pengajuan Agenda', href: '/admin/submissions', icon: CheckCircle },
      { label: 'Struktur Akademik', href: '/admin/academics', icon: GraduationCap },
      { label: 'File Materi', href: '/admin/materials', icon: FolderOpen },
      { label: 'Knowledge Hub', href: '/admin/knowledge', icon: HelpCircle },
    ],
  },
  {
    title: 'Angkatan',
    items: [
      { label: 'Data Mahasiswa', href: '/admin/students', icon: Users },
      { label: 'Role & Izin', href: '/admin/permissions', icon: ShieldCheck },
    ],
  },
  {
    title: 'Website',
    items: [
      { label: 'Kelola Website', href: '/admin/website', icon: Globe },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { label: 'WhatsApp & Reminder', href: '/admin/whatsapp', icon: MessageSquare },
      { label: 'Log & Audit', href: '/admin/audit', icon: History },
    ],
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-surface border-r border-border h-full flex flex-col justify-between py-5 px-3.5 select-none overflow-y-auto">
      <div className="flex flex-col gap-5">
        <div className="px-2.5 flex flex-col gap-2">
          <BrandLogo href="/admin" size="md" />
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-deep/10 text-teal-deep text-[10px] font-bold tracking-wider uppercase w-fit">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Workspace</span>
          </div>
        </div>

        <nav className="flex flex-col gap-4">
          {ADMIN_NAV_SECTIONS.map((sec) => (
            <div key={sec.title} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted/70 px-2.5">
                {sec.title}
              </span>
              <div className="flex flex-col gap-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors relative ${
                        isActive
                          ? 'bg-teal-deep text-white font-semibold shadow-xs'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-soft font-medium'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-3.5 border-t border-border mt-5">
        {/* Mode Mahasiswa Switcher */}
        <div className="flex flex-col gap-1 px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted/70">
            Mode Tampilan
          </span>
          <Link
            href="/app"
            onClick={onNavigate}
            className="flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-soft rounded-lg transition-colors border border-border group"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-teal-deep group-hover:scale-105 transition-transform" />
              <span>Mode Mahasiswa</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 font-bold">
              Pratinjau
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-between px-2 pt-2 border-t border-border/50 text-[11px] text-text-muted">
          <span className="font-mono text-[10px]">Novarion v4.0</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Keluar dari akun admin"
              className="flex items-center gap-1 text-[11px] text-text-muted hover:text-danger-text transition-colors p-1 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
