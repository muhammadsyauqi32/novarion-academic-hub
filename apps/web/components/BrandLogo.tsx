import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function BrandLogo({ href = '/', size = 'md', showTagline = false }: BrandLogoProps) {
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

  const content = (
    <div className="flex items-center gap-2.5 group">
      <div
        className={`${markSizes[size]} bg-gradient-to-br from-[#41C2A1] to-[#176C5B] text-white font-heading font-black rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 tracking-tighter`}
      >
        NV
      </div>
      <div className="flex flex-col">
        <span className={`font-heading font-black tracking-tight text-text-primary ${sizeClasses[size]}`}>
          NOVARION
        </span>
        {showTagline && (
          <span className="text-[10px] font-semibold text-text-muted -mt-1 tracking-wider uppercase">
            Academic Hub
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
