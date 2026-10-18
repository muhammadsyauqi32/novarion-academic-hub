'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import { ADMIN_NAV_SECTIONS } from './AdminSidebar';
import { Menu, X, Eye, LogOut, ShieldCheck } from 'lucide-react';

interface AdminMobileNavProps {
  adminName: string;
}

export function AdminMobileNav({ adminName }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Top Header (Visible on < md) */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-border text-text-primary sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-surface-soft hover:bg-border/60 text-text-primary transition-colors"
            aria-label={isOpen ? "Tutup Menu Admin" : "Buka Menu Admin"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight">Admin Workspace</span>
            <span className="text-[10px] text-text-muted truncate max-w-[140px]">{adminName}</span>
          </div>
        </div>

        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-deep/10 text-teal-deep text-xs font-semibold hover:bg-teal-deep/20 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Mode Mhs</span>
        </Link>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Administrator"
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
                  aria-label="Tutup Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-4">
                {ADMIN_NAV_SECTIONS.map((sec) => (
                  <div key={sec.title} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted/70 px-2">
                      {sec.title}
                    </span>
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.exact
                        ? pathname === item.href
                        : pathname === item.href || pathname.startsWith(item.href + '/');

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
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
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 font-bold">
                  Pratinjau
                </span>
              </Link>

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-danger-text bg-danger-surface border border-danger-border rounded-lg"
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
