'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { Menu, X, ArrowRight } from 'lucide-react';
import { getHubLoginUrl } from '@/lib/links';

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'tentang', label: 'Tentang' },
  { id: 'pengurus', label: 'Pengurus' },
  { id: 'berita', label: 'Berita' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'prestasi', label: 'Prestasi' },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const trackedIds = ['hero', ...NAV_ITEMS.map((item) => item.id)];
    const ratios: Record<string, number> = {};

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });

      // If hero is in view or user is near the top of the page, no nav link should be active
      if (window.scrollY < 180 || (ratios['hero'] && ratios['hero'] > 0.35)) {
        setActiveSection(null);
        return;
      }

      // Pick the section currently most visible in viewport
      let maxRatio = 0;
      let winningSection: string | null = null;
      for (const item of NAV_ITEMS) {
        const r = ratios[item.id] || 0;
        if (r > maxRatio && r > 0.15) {
          maxRatio = r;
          winningSection = item.id;
        }
      }

      if (winningSection) {
        setActiveSection(winningSection);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-70px 0px -40% 0px',
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
    });

    trackedIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const hubLoginUrl = getHubLoginUrl();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="shrink-0">
          <BrandLogo size="md" />
        </div>

        {/* Desktop Navigation - 1-word labels */}
        <nav
          className="hidden lg:flex items-center gap-1.5 xl:gap-3 text-xs xl:text-sm font-sans shrink-0"
          aria-label="Navigasi Utama"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#EAEAB7] text-[#112A24] font-bold'
                    : 'text-[#112A24]/80 font-medium hover:text-[#112A24] hover:bg-[#EAEAB7]/60'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Desktop CTA - Native <a> tag for cross-origin navigation */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a
            href={hubLoginUrl}
            className="px-3.5 py-1.5 rounded-xs bg-[#112A24] text-[#EAEAB7] hover:bg-[#FFAE5D] hover:text-[#112A24] font-sans text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>Masuk Academic Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile & Tablet Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href={hubLoginUrl}
            className="px-3 py-1.5 rounded-xs bg-[#112A24] text-[#EAEAB7] hover:bg-[#FFAE5D] hover:text-[#112A24] font-sans text-xs font-bold transition-colors"
          >
            Masuk
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xs text-[#112A24] hover:bg-[#EAEAB7] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F5] px-4 py-4 flex flex-col gap-1.5 shadow-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`py-2 px-3 rounded-xs text-sm font-sans transition-colors ${
                  isActive
                    ? 'bg-[#EAEAB7] text-[#112A24] font-bold'
                    : 'text-[#112A24]/85 font-medium hover:bg-[#EAEAB7]/60'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <div className="pt-2 mt-1">
            <a
              href={hubLoginUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block py-2.5 rounded-xs bg-[#112A24] text-[#EAEAB7] hover:bg-[#FFAE5D] hover:text-[#112A24] font-sans text-xs font-bold transition-colors text-center"
            >
              Masuk ke Academic Hub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
