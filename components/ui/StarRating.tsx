'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: number;
}

export default function StarRating({
  value, onChange, size = 'md', showValue = false, showCount,
}: StarRatingProps) {
  const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }[size];
  const isInteractive = !!onChange;

  return (
    <div className="flex items-center gap-1">
      <div className={cn('flex items-center gap-0.5', isInteractive && 'cursor-pointer')}>
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= Math.round(value);
          return (
            <button
              key={star}
              type="button"
              disabled={!isInteractive}
              onClick={() => onChange?.(star)}
              className={cn(
                'transition-transform duration-100',
                isInteractive && 'hover:scale-110 focus:outline-none',
                !isInteractive && 'cursor-default'
              )}
              aria-label={`Rate ${star} stars`}
            >
              {filled ? (
                <StarIcon className={cn(sizeClass, 'text-accent')} />
              ) : (
                <StarOutlineIcon className={cn(sizeClass, 'text-gray-300')} />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700">{value.toFixed(1)}</span>
      )}
      {showCount !== undefined && (
        <span className="text-sm text-gray-400">({showCount.toLocaleString()})</span>
      )}
    </div>
  );
}
