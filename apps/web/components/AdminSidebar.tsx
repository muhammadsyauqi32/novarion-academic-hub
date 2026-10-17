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

export const ADMIN_NAV_SECTIONS = [
  {
    title: 'Beranda',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Akademik',
    items: [
      { label: 'Kelola Agenda', href: '/admin/agendas', icon: CalendarCheck },
      { label: 'Pengajuan Agenda', href: '/admin/submissions', icon: CheckCircle },
      { label: 'Struktur Akademik', href: '/admin/academics', icon: GraduationCap },
      { label: 'File Materi', href: '/admin/materials', icon: FolderOpen },
      { label: 'Knowledge Hub & FAQ', href: '/admin/knowledge', icon: HelpCircle },
    ],
  },
  {
    title: 'Angkatan',
    items: [
      { label: 'Data Mahasiswa', href: '/admin/students', icon: Users },
      { label: 'Role & Permission', href: '/admin/permissions', icon: ShieldCheck },
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
      { label: 'Pengaturan & Audit', href: '/admin/audit', icon: History },
    ],
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-border h-full flex flex-col justify-between py-5 px-3 select-none overflow-y-auto">
      <div className="flex flex-col gap-5">
        <div className="px-3 flex flex-col gap-2">
          <BrandLogo size="md" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-deep/10 text-teal-deep text-[11px] font-bold tracking-wider uppercase">
            <span>Admin Workspace</span>
          </div>
        </div>

        <nav className="flex flex-col gap-5">
          {ADMIN_NAV_SECTIONS.map((sec) => (
            <div key={sec.title} className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted/70 px-3 mb-1">
                {sec.title}
              </span>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-teal-deep text-white font-semibold shadow-xs'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-soft'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-border mt-6">
        {/* Mode Mahasiswa Switcher */}
        <div className="flex flex-col gap-1.5 px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted/70">
            Mode Tampilan
          </span>
          <Link
            href="/app"
            onClick={onNavigate}
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-soft rounded-lg transition-colors border border-border/70 group"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-teal-deep group-hover:scale-110 transition-transform" />
              <span>Mode Mahasiswa</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
              Pratinjau
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-between px-2 pt-2 border-t border-border/50 text-[11px] text-text-muted">
          <span>Novarion v3.0</span>
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
