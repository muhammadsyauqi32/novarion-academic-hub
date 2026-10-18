'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
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
  showSubtitle = true,
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

  const subtitleSizeClasses = {
    sm: 'text-[10px] sm:text-xs',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
  };

  const markSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const textColor = inverted ? 'text-[#FAF9F5]' : 'text-text-primary';
  const subtitleColor = inverted ? 'text-[#FFAE5D]' : 'text-teal-deep';
  const separatorColor = inverted ? 'text-[#FAF9F5]/40' : 'text-text-muted/40';

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

      {/* Brand Title: Novarion - Statistika dan Sains Data 62 */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-1 sm:gap-1.5 leading-tight">
          <span className={`font-heading font-black tracking-tight ${textColor} ${titleSizeClasses[size]}`}>
            Novarion
          </span>
          {showSubtitle && (
            <>
              <span className={`hidden sm:inline font-bold ${separatorColor}`}>-</span>
              <span className={`font-semibold tracking-tight ${subtitleColor} ${subtitleSizeClasses[size]} whitespace-nowrap`}>
                Statistika dan Sains Data 62
              </span>
            </>
          )}
        </div>
      </div>
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

