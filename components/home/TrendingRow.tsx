'use client';

import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { IProduct } from '@/types';
import ProductCard from '@/components/product/ProductCard';

interface TrendingRowProps {
  title: string;
  subtitle?: string;
  products: IProduct[];
  viewAllHref?: string;
}

export default function TrendingRow({ title, subtitle, products, viewAllHref }: TrendingRowProps) {
  if (!products.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-600 transition-colors flex-shrink-0"
          >
            View All <ChevronRightIcon className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
        {products.map(product => (
          <div key={product._id} className="flex-shrink-0 w-52">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
