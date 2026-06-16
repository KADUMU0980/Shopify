'use client';

import { useEffect, useState } from 'react';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { IProduct } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty'];

export default function RecommendedSection() {
  const [products,    setProducts]    = useState<IProduct[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState('All');

  useEffect(() => {
    fetch('/api/products/recommended')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const visible = products.filter(p =>
    activeTab === 'All' || p.category === activeTab
  );

  // Don't render the section if there are no recommended products
  if (!loading && products.length === 0) return null;

  return (
    <section className="py-10">
      {/* Section Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Recommended for You
            </h2>
          </div>
          <p className="text-sm text-slate-500 ml-10">
            Curated picks, selected by our team
          </p>
        </div>
        <Link
          href="/products?recommended=true"
          className="flex items-center gap-1.5 text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors group"
        >
          View All
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const count = cat === 'All'
            ? products.length
            : products.filter(p => p.category === cat).length;
          if (count === 0 && cat !== 'All') return null;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap',
                activeTab === cat
                  ? 'text-white border-transparent shadow-[0_4px_12px_rgba(245,158,11,0.35)]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600',
              )}
              style={activeTab === cat ? { background: 'linear-gradient(135deg,#F59E0B,#F97316)' } : {}}
            >
              {cat} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-slate-100">
              <div className="skeleton aspect-[4/3]" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-3 w-2/3 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
                <div className="skeleton h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          No recommended products in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visible.map(product => (
            <div key={product._id} className="relative">
              {/* Recommended badge */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
                <SparklesIcon className="w-2.5 h-2.5" /> PICK
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
