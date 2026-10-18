'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  yOffset?: number;
  as?: React.ElementType;
}

/**
 * Lightweight scroll reveal animation component.
 * Uses native IntersectionObserver and smooth CSS transitions.
 * Respects prefers-reduced-motion: reduce.
 * Triggers gracefully when entering viewport with zero layout shift.
 */
export function Reveal({
  children,
  className = '',
  delayMs = 0,
  yOffset = 16,
  as: Component = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user prefers reduced motion, reveal immediately
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) {
      setIsVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Check if element is already in viewport on mount
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    // Positive bottom rootMargin triggers smooth reveal just before it scrolls into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '120px 0px -20px 0px',
        threshold: 0.05,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Component
      ref={ref}
      style={{
        transitionDuration: '500ms',
        transitionDelay: `${delayMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isVisible ? 'translateY(0)' : `translateY(${yOffset}px)`,
      }}
      className={`transition-all ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </Component>
  );
}
