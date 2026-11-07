'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark =
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    try {
      localStorage.setItem('novarion_theme', nextTheme);
      // Set cookie for shared root domain to sync across subdomains
      const isNovarionDomain = window.location.hostname.includes('novarion.web.id');
      const domainAttr = isNovarionDomain ? '; domain=.novarion.web.id' : '';
      document.cookie = `novarion_theme=${nextTheme}; path=/; max-age=31536000${domainAttr}; SameSite=Lax`;
    } catch {}
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Ganti tema tampilan"
        className={`p-2 rounded-input transition-colors text-text-muted hover:text-text-primary ${className}`}
      >
        <span className="w-4 h-4 block" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
      className={`p-2 rounded-input transition-colors text-text-muted hover:text-text-primary hover:bg-surface-soft active:scale-95 focus-visible:outline-2 focus-visible:outline-teal-deep ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-brand-orange" />
      ) : (
        <Moon className="w-4 h-4 text-teal-deep" />
      )}
    </button>
  );
}

