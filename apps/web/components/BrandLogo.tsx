'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  showSubtitle?: boolean; // kept for backwards compatibility
  className?: string;
  inverted?: boolean;
  customSrc?: string;
}

const CANDIDATE_SOURCES = [
  '/logo.png',
  '/logo.PNG',
  '/novarion-logo.png',
  '/images/logo.png',
];

export function BrandLogo({
  href = '/',
  size = 'md',
  showTitle = true,
  className = '',
  inverted = false,
  customSrc,
}: BrandLogoProps) {
  const [activeSrc, setActiveSrc] = useState<string | null>(customSrc || null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (customSrc) {
      const img = new window.Image();
      img.src = customSrc;
      img.onload = () => {
        setActiveSrc(customSrc);
        setIsLoaded(true);
      };
      return;
    }

    let isMounted = true;

    const tryLoad = (index: number) => {
      if (index >= CANDIDATE_SOURCES.length) {
        if (isMounted) setIsLoaded(false);
        return;
      }

      const candidate = CANDIDATE_SOURCES[index];
      const img = new window.Image();
      img.src = candidate;
      img.onload = () => {
        if (isMounted) {
          setActiveSrc(candidate);
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        if (isMounted) {
          tryLoad(index + 1);
        }
      };
    };

    tryLoad(0);

    return () => {
      isMounted = false;
    };
  }, [customSrc]);

  const logoHeightClasses = {
    sm: 'h-7 sm:h-8 max-h-8 w-auto',
    md: 'h-8 sm:h-9 max-h-10 w-auto',
    lg: 'h-10 sm:h-12 max-h-12 w-auto',
  };

  const titleSizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  const markSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const textColor = inverted ? 'text-[#FAF9F5]' : 'text-text-primary';

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Logo Image or Fallback Gradient Badge */}
      {isLoaded && activeSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={activeSrc}
          alt="Novarion"
          className={`${logoHeightClasses[size]} object-contain select-none transition-transform group-hover:scale-105 shrink-0`}
        />
      ) : (
        <div
          className={`${markSizes[size]} bg-gradient-to-br from-[#41C2A1] to-[#176C5B] text-white font-heading font-black rounded-lg flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 tracking-tighter shrink-0`}
        >
          NV
        </div>
      )}

      {/* Brand Title: Novarion */}
      {showTitle && (
        <span className={`font-heading font-black tracking-tight ${textColor} ${titleSizeClasses[size]}`}>
          Novarion
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

