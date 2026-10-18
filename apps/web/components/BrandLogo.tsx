'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
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
  showTagline = false,
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
    sm: 'h-8 max-h-8 w-auto',
    md: 'h-10 max-h-10 w-auto',
    lg: 'h-12 sm:h-14 max-h-14 w-auto',
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const markSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const textColor = inverted ? 'text-[#FAF9F5]' : 'text-text-primary';
  const taglineColor = inverted ? 'text-[#FAF9F5]/70' : 'text-text-muted';

  const content = (
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      {isLoaded && activeSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={activeSrc}
          alt="NOVARION Academic Hub"
          className={`${logoHeightClasses[size]} object-contain select-none transition-transform group-hover:scale-105`}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <div
            className={`${markSizes[size]} bg-gradient-to-br from-[#41C2A1] to-[#176C5B] text-white font-heading font-black rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 tracking-tighter`}
          >
            NV
          </div>
          <div className="flex flex-col">
            <span className={`font-heading font-black tracking-tight ${textColor} ${sizeClasses[size]}`}>
              NOVARION
            </span>
            {showTagline && (
              <span className={`text-[10px] font-semibold -mt-1 tracking-wider uppercase ${taglineColor}`}>
                Academic Hub
              </span>
            )}
          </div>
        </div>
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

