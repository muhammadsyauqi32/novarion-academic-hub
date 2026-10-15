import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'mint' | 'cream' | 'orange' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'md', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    primary: 'bg-brand-primary/20 text-teal-deep border border-brand-primary/40',
    mint: 'bg-brand-mint-soft text-text-primary border border-brand-primary/30',
    cream: 'bg-brand-cream text-text-primary border border-[#D5D59A]',
    orange: 'bg-brand-orange/20 text-[#9E5507] border border-brand-orange/50',
    success: 'bg-success-surface text-success-text border border-success-border',
    warning: 'bg-warning-surface text-warning-text border border-warning-border',
    danger: 'bg-danger-surface text-danger-text border border-danger-border',
    neutral: 'bg-surface-soft text-text-muted border border-border',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
}
