'use client';

import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift(-1); // ellipsis
    if (page + delta < pages - 1) range.push(-1); // ellipsis
    range.unshift(1);
    if (pages > 1) range.push(pages);
    return range;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn-icon btn-ghost border border-gray-200 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {getPageNumbers().map((num, i) =>
        num === -1 ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={cn(
              'min-w-[38px] h-[38px] rounded-lg text-sm font-medium transition-all duration-200 border',
              num === page
                ? 'bg-brand text-white border-brand shadow-brand'
                : 'border-gray-200 text-gray-600 hover:border-accent hover:text-accent'
            )}
          >
            {num}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="btn-icon btn-ghost border border-gray-200 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </nav>
  );
}
