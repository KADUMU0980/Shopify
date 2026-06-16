import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'danger' | 'brand' | 'outline';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    accent:  'bg-accent/10 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger:  'bg-red-100 text-red-700',
    brand:   'bg-navy/10 text-navy',
    outline: 'border border-gray-300 text-gray-600',
  };

  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
