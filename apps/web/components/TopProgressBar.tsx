'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // Selesaikan dan sembunyikan progress bar ketika route selesai berganti
  useEffect(() => {
    clearTimers();
    if (loading || progress > 0) {
      setProgress(100);
      const doneTimer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      timersRef.current.push(doneTimer);
    }

    return () => clearTimers();
  }, [pathname, searchParams]);

  // Intersep klik link internal untuk langsung menampilkan responsivitas visual instan
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Abaikan jika modifier key ditekan (buka tab baru)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = (e.target as Element)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');
      const isDownload = target.hasAttribute('download');

      if (
        href &&
        !isDownload &&
        (!targetAttr || targetAttr === '_self') &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        !href.startsWith('javascript:')
      ) {
        try {
          const targetUrl = new URL(href, window.location.href);
          const currentUrl = new URL(window.location.href);

          // Abaikan jika URL persis sama (hash only atau sama)
          if (
            targetUrl.origin === currentUrl.origin &&
            targetUrl.pathname === currentUrl.pathname &&
            targetUrl.search === currentUrl.search
          ) {
            return;
          }

          if (targetUrl.origin === currentUrl.origin) {
            clearTimers();
            setLoading(true);
            setProgress(25);

            // Smooth dynamic easing that continually creeps forward instead of freezing at 88%
            const interval = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 95) return prev;
                // Asymptotically approach 95%
                const remaining = 95 - prev;
                const increment = Math.max(0.5, remaining * 0.12);
                return Math.min(95, prev + increment);
              });
            }, 120);

            // Safety recovery timer: If navigation hangs or is cancelled by browser for >8s, reset bar
            const safetyTimer = setTimeout(() => {
              clearTimers();
              setProgress(100);
              setTimeout(() => {
                setLoading(false);
                setProgress(0);
              }, 200);
            }, 8000);

            timersRef.current.push(interval as any, safetyTimer);
          }
        } catch {
          // Abaikan URL invalid
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimers();
        setProgress(0);
        setLoading(false);
      }
    };

    window.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('keydown', handleKeyDown);
      clearTimers();
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Memuat halaman"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-all duration-300 ease-out motion-reduce:transition-none"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
        background: 'linear-gradient(90deg, #176C5B 0%, #41C2A1 60%, #FFAE5D 100%)',
        boxShadow: '0 0 10px rgba(65, 194, 161, 0.75)',
      }}
    />
  );
}
