import Link from 'next/link';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { name: 'Electronics',    href: '/products?category=Electronics',    emoji: '📱', color: 'from-blue-500 to-cyan-400' },
  { name: 'Fashion',        href: '/products?category=Fashion',        emoji: '👗', color: 'from-pink-500 to-rose-400' },
  { name: 'Home & Living',  href: '/products?category=Home',           emoji: '🏠', color: 'from-amber-500 to-yellow-400' },
  { name: 'Books',          href: '/products?category=Books',          emoji: '📚', color: 'from-green-500 to-emerald-400' },
  { name: 'Sports',         href: '/products?category=Sports',         emoji: '⚽', color: 'from-orange-500 to-amber-400' },
  { name: 'Beauty',         href: '/products?category=Beauty',         emoji: '💄', color: 'from-purple-500 to-pink-400' },
  { name: 'All Products',   href: '/products',                         emoji: '🛍️', color: 'from-navy to-slate-600' },
];

export default function CategoryStrip() {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Find exactly what you&apos;re looking for</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.name}
            href={cat.href}
            className="flex-shrink-0 flex flex-col items-center gap-3 group"
          >
            <div className={cn(
              'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl',
              'shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300',
              cat.color
            )}>
              {cat.emoji}
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-brand transition-colors text-center max-w-[70px]">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
