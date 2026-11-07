import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'soft' | 'mint' | 'cream' | 'flat';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-surface border border-border shadow-2xs',
    soft: 'bg-surface-soft border border-border',
    mint: 'bg-brand-mint-soft/20 border border-brand-primary/30',
    cream: 'bg-brand-cream/20 dark:bg-surface-soft border border-[#D5D59A]/40 dark:border-border',
    flat: 'bg-surface border border-border',
  };

  return (
    <div className={twMerge(clsx('rounded-card p-5 sm:p-6 transition-all', variants[variant], className))} {...props}>
      {children}
    </div>
  );
}
