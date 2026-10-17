'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import { ADMIN_NAV_SECTIONS } from './AdminSidebar';
import { Menu, X, Eye, LogOut } from 'lucide-react';

interface AdminMobileNavProps {
  adminName: string;
}

export function AdminMobileNav({ adminName }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Header (Visible on < md) */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-teal-deep text-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Buka Menu Admin"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wide leading-tight">ADMIN WORKSPACE</span>
            <span className="text-[10px] text-white/70 truncate max-w-[150px]">{adminName}</span>
          </div>
        </div>

        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Mode Mhs</span>
        </Link>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] bg-surface h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <BrandLogo href="/admin" size="sm" />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-4">
                {ADMIN_NAV_SECTIONS.map((sec) => (
                  <div key={sec.title} className="flex flex-col gap-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted/70 px-2 mb-1">
                      {sec.title}
                    </span>
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-deep text-white font-semibold'
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

            <div className="pt-4 border-t border-border mt-4 flex flex-col gap-3">
              <Link
                href="/app"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-soft text-text-primary text-xs font-semibold border border-border"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-deep" />
                  <span>Mode Mahasiswa</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 font-bold">
                  Pratinjau
                </span>
              </Link>

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-danger-text bg-danger-surface border border-danger-border rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Akun Admin</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
