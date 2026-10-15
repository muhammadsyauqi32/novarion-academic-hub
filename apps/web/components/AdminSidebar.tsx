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
  Upload,
  FolderOpen,
  HelpCircle,
  MessageSquare,
  Network,
  Clock,
  History,
  ArrowLeft
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const sections = [
    {
      title: 'Operasional',
      items: [
        { label: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
        { label: 'Review Pengajuan', href: '/admin/submissions', icon: CheckCircle },
        { label: 'Kelola Agenda', href: '/admin/agendas', icon: CalendarCheck },
      ],
    },
    {
      title: 'Data Angkatan',
      items: [
        { label: 'Struktur Akademik', href: '/admin/academics', icon: GraduationCap },
        { label: 'Mahasiswa & Whitelist', href: '/admin/students', icon: Users },
        { label: 'Impor Data CSV', href: '/admin/imports', icon: Upload },
      ],
    },
    {
      title: 'Konten',
      items: [
        { label: 'File Materi', href: '/admin/materials', icon: FolderOpen },
        { label: 'Knowledge Hub', href: '/admin/knowledge', icon: HelpCircle },
      ],
    },
    {
      title: 'WhatsApp & Reminder',
      items: [
        { label: 'WhatsApp Gateway', href: '/admin/whatsapp', icon: MessageSquare },
        { label: 'Mapping Grup', href: '/admin/whatsapp/groups', icon: Network },
        { label: 'Log Reminder', href: '/admin/reminders', icon: Clock },
      ],
    },
    {
      title: 'Keamanan',
      items: [
        { label: 'Audit Trail', href: '/admin/audit', icon: History },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen sticky top-0 flex flex-col justify-between py-5 px-3 select-none overflow-y-auto">
      <div className="flex flex-col gap-5">
        <div className="px-3 flex flex-col gap-2">
          <BrandLogo size="md" />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-deep/10 text-teal-deep text-[11px] font-bold tracking-wider uppercase">
            <span>Admin Workspace</span>
          </div>
        </div>

        <Link
          href="/app"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-surface-soft rounded-lg transition-colors border border-border/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke App Mahasiswa</span>
        </Link>

        <nav className="flex flex-col gap-5">
          {sections.map((sec) => (
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
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-teal-deep text-white font-semibold shadow-sm'
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

      <div className="pt-4 border-t border-border px-3 text-[11px] text-text-muted">
        Novarion Hub v3.0 • Admin Panel
      </div>
    </aside>
  );
}
