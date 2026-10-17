'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Saat route selesai berubah, selesaikan progress bar
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intersep klik pada link internal untuk langsung menampilkan indikator loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        href &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        !target.getAttribute('target')
      ) {
        // Cek apakah URL sama persis
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          setLoading(true);
          setProgress(25);
          setTimeout(() => setProgress(65), 150);
          setTimeout(() => setProgress(85), 400);
        }
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
        background: 'linear-gradient(90deg, #176C5B 0%, #41C2A1 50%, #FFAE5D 100%)',
        boxShadow: '0 0 10px rgba(65, 194, 161, 0.7)',
      }}
    />
  );
}
