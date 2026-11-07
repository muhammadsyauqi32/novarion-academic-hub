'use client';

import React from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  yOffset?: number;
  as?: React.ElementType;
}

export function Reveal({
  children,
  className = '',
  as: Component = 'div',
}: RevealProps) {
  return <Component className={className}>{children}</Component>;
}
