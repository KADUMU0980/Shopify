'use client';

import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'outline-accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variantClass = {
      primary:       'btn-primary',
      accent:        'btn-accent',
      outline:       'btn-outline',
      'outline-accent': 'btn-outline-accent',
      ghost:         'btn-ghost',
      danger:        'btn-danger',
    }[variant];

    const sizeClass = {
      sm:   'btn-sm',
      md:   'btn',
      lg:   'btn-lg',
      icon: 'btn-icon',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(sizeClass, variantClass, className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
