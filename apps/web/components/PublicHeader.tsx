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
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  // Scroll listener for hero threshold
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolledPastHero(scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const trackedIds = ['hero', ...NAV_ITEMS.map((item) => item.id)];
    const ratios: Record<string, number> = {};

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });

      // If hero is in view or user is near the top of the page, no nav link should be active
      if (window.scrollY < 200 || (ratios['hero'] && ratios['hero'] > 0.35)) {
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
    <>
      {/* 1. TOP NAVBAR (Initially transparent over Full-Bleed Hero) */}
      <header
        className={`absolute top-0 left-0 right-0 z-40 w-full transition-opacity duration-300 ${
          isScrolledPastHero ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <BrandLogo size="md" inverted={true} />
          </div>

          {/* Desktop Navigation - 1-word clean labels */}
          <nav
            className="hidden lg:flex items-center gap-2 xl:gap-4 text-xs xl:text-sm font-sans shrink-0"
            aria-label="Navigasi Utama"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className="px-3 py-1.5 rounded-xs text-[#FAF9F5]/90 font-medium hover:text-[#FFAE5D] hover:bg-[#FAF9F5]/10 transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a
              href={hubLoginUrl}
              className="px-4 py-2 rounded-xs bg-[#FAF9F5] text-[#112A24] hover:bg-[#FFAE5D] hover:text-[#112A24] font-sans text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Masuk Academic Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile & Tablet Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={hubLoginUrl}
              className="px-3 py-1.5 rounded-xs bg-[#FAF9F5] text-[#112A24] hover:bg-[#FFAE5D] hover:text-[#112A24] font-sans text-xs font-bold transition-colors"
            >
              Masuk
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xs text-[#FAF9F5] hover:bg-[#FAF9F5]/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. FIXED COMPACT FLOATING NAVBAR (Centered horizontally after scrolling past hero) */}
      <nav
        aria-label="Navigasi Mengambang"
        className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out flex items-center justify-between gap-3 sm:gap-6 px-3.5 sm:px-5 py-2 rounded-xs bg-[#FAF9F5]/95 backdrop-blur-md shadow-md ${
          isScrolledPastHero
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        } max-w-4xl w-[94%] sm:w-auto`}
      >
        <div className="shrink-0">
          <BrandLogo size="sm" inverted={false} />
        </div>

        {/* 1-Word Links with Active Tracking */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2 text-xs font-sans">
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
        </div>

        {/* Floating CTA */}
        <div className="flex items-center gap-2">
          <a
            href={hubLoginUrl}
            className="px-3.5 py-1.5 rounded-xs bg-[#112A24] text-[#EAEAB7] hover:bg-[#FFAE5D] hover:text-[#112A24] font-sans text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span className="hidden sm:inline">Academic Hub</span>
            <span className="sm:hidden">Masuk</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xs md:hidden text-[#112A24] hover:bg-[#EAEAB7] transition-colors"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Accessible anytime menu is opened) */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-50 lg:hidden bg-[#FAF9F5] px-4 py-4 flex flex-col gap-1.5 shadow-lg">
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
    </>
  );
}
