'use client';

import { useEffect, useState } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-6 right-6 z-50 p-3 rounded-full bg-brand text-white shadow-brand',
        'hover:bg-brand/90 hover:scale-110 transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      )}
    >
      <ChevronUpIcon className="w-5 h-5" />
    </button>
  );
}
