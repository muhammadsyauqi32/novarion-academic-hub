import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-input transition-all duration-150 select-none focus-visible:outline-2 focus-visible:outline-teal-deep focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      // Primary: Mint background with dark text #112A24 (WCAG AA: 6.85:1 contrast)
      primary:
        'bg-brand-primary text-brand-foreground hover:brightness-95 active:brightness-90 shadow-xs font-bold border border-brand-primary/20',
      secondary:
        'bg-surface-soft text-text-primary border border-border hover:bg-surface-hover active:bg-border/60 font-semibold',
      dark:
        'bg-teal-deep text-white dark:text-[#0C1815] hover:brightness-110 active:brightness-95 shadow-xs font-semibold',
      danger:
        'bg-danger-surface text-danger-text border border-danger-border hover:brightness-95 active:brightness-90 font-semibold',
      ghost:
        'text-text-muted hover:text-text-primary hover:bg-surface-soft active:bg-surface-hover font-medium',
      outline:
        'border border-border text-text-primary bg-surface/50 hover:bg-surface-soft active:bg-border/40 font-semibold',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
      md: 'text-sm px-4 py-2 min-h-[42px] gap-2',
      lg: 'text-base px-6 py-2.5 min-h-[48px] gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
