import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'soft' | 'mint' | 'cream' | 'flat';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-surface border border-border shadow-sm',
    soft: 'bg-surface-soft border border-border',
    mint: 'bg-brand-mint-soft/30 border border-brand-primary/20',
    cream: 'bg-brand-cream/30 border border-[#E2E2A8]',
    flat: 'bg-surface',
  };

  return (
    <div className={twMerge(clsx('rounded-card p-5 sm:p-6 transition-all', variants[variant], className))} {...props}>
      {children}
    </div>
  );
}
