'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { getHubLoginUrl } from '@/lib/links';

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'tentang', label: 'Tentang' },
  { id: 'pengurus', label: 'Pengurus' },
  { id: 'berita', label: 'Kabar' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'prestasi', label: 'Prestasi' },
];

export function PublicHeader() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(!isLandingPage);

  useEffect(() => {
    if (!isLandingPage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && y > 64) return true;
        if (prev && y < 32) return false;
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isLandingPage]);

  useEffect(() => {
    if (!isLandingPage) return;

    const trackedIds = ['hero', ...NAV_ITEMS.map((item) => item.id)];
    const ratios: Record<string, number> = {};

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });

      if (window.scrollY < 200 || (ratios['hero'] && ratios['hero'] > 0.35)) {
        setActiveSection(null);
        return;
      }

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
  }, [isLandingPage]);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const hubLoginUrl = getHubLoginUrl();
  const isCompact = isScrolled;

  return (
    <header
      aria-label="Navigasi Utama"
      data-navbar-state={isCompact ? 'compact' : 'hero-full'}
      className={`fixed z-50 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out motion-reduce:transition-none ${
        isCompact
          ? 'top-3 w-[94%] sm:w-[90%] md:w-[780px] lg:w-[840px] max-w-4xl rounded-card px-4 sm:px-5 py-2.5 bg-surface text-text-primary border border-border shadow-md'
          : 'top-0 w-full max-w-none rounded-none px-4 sm:px-6 lg:px-8 py-4 bg-[#0A1311] text-[#FAF9F5] border-b border-white/10'
      }`}
    >
      <div
        className={`w-full flex items-center justify-between gap-3 transition-all duration-300 ${
          isCompact ? 'max-w-none' : 'max-w-7xl mx-auto'
        }`}
      >
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo size="sm" inverted={!isCompact} />
          <div
            className={`hidden lg:flex items-center pl-3 border-l border-white/15 transition-all duration-200 ${
              isCompact ? 'opacity-0 w-0 overflow-hidden pl-0 border-l-0' : 'opacity-100'
            }`}
          >
            <span className="text-xs font-sans text-[#FAF9F5]/75">
              Statistika dan Sains Data
            </span>
          </div>
        </div>

        <nav
          className="hidden md:flex items-center gap-1 text-xs font-sans shrink-0"
          aria-label="Tautan Bagian"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`/#${item.id}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`px-3 py-1.5 rounded-input transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-teal-deep ${
                  isCompact
                    ? isActive
                      ? 'bg-surface-soft text-teal-deep dark:text-brand-primary font-bold'
                      : 'text-text-muted font-medium hover:text-text-primary hover:bg-surface-soft'
                    : isActive
                    ? 'bg-white/10 text-[#FAF9F5] font-bold'
                    : 'text-[#FAF9F5]/80 font-medium hover:text-[#FAF9F5] hover:bg-white/[0.06]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle
            className={
              isCompact
                ? 'text-text-muted hover:text-text-primary hover:bg-surface-soft'
                : 'text-[#FAF9F5]/85 hover:text-[#FAF9F5] hover:bg-white/10'
            }
          />

          <a
            href={hubLoginUrl}
            className={`px-3.5 sm:px-4 py-1.5 rounded-input font-sans text-xs font-bold transition-colors duration-150 inline-flex items-center justify-center shrink-0 focus-visible:outline-2 focus-visible:outline-teal-deep ${
              isCompact
                ? 'bg-teal-deep text-white dark:bg-brand-primary dark:text-brand-foreground hover:opacity-95'
                : 'bg-brand-primary text-brand-foreground hover:bg-[#C9FBD4]'
            }`}
          >
            <span className="hidden sm:inline">Masuk ke Hub</span>
            <span className="sm:hidden">Masuk</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-input md:hidden transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-teal-deep ${
              isCompact
                ? 'text-text-primary hover:bg-surface-soft'
                : 'text-[#FAF9F5] hover:bg-white/10'
            }`}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={`md:hidden bg-surface rounded-card p-4 flex flex-col gap-1 shadow-lg border border-border text-text-primary ${
            isCompact ? 'mt-3' : 'mt-4 mx-auto max-w-lg'
          }`}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`/#${item.id}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`px-3.5 py-2.5 rounded-input text-sm font-sans transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-surface-soft text-teal-deep dark:text-brand-primary font-bold'
                    : 'text-text-primary hover:bg-surface-soft font-medium'
                }`}
              >
                <span>{item.label}</span>
              </a>
            );
          })}
          <div className="pt-2.5 mt-1 border-t border-border">
            <a
              href={hubLoginUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-input bg-brand-primary text-brand-foreground font-sans text-xs font-bold flex items-center justify-center"
            >
              Masuk ke Academic Hub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
