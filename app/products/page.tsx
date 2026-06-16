'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { IProduct } from '@/types';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc',label: 'Price: High → Low' },
  { value: 'rating',    label: 'Top Rated' },
];

const RATING_OPTIONS = [4, 3, 2, 1];

function ProductsContent() {
  const router      = useRouter();
  const searchParams= useSearchParams();

  const [products,   setProducts]   = useState<IProduct[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands,     setBrands]     = useState<string[]>([]);
  const [sidebarOpen,setSidebar]    = useState(false);

  // Filter state from URL
  const search   = searchParams.get('search')   ?? '';
  const category = searchParams.get('category') ?? '';
  const brand    = searchParams.get('brand')    ?? '';
  const sort     = searchParams.get('sort')     ?? 'newest';
  const page     = parseInt(searchParams.get('page') ?? '1');
  const minRating= parseFloat(searchParams.get('minRating') ?? '0');
  const inStock  = searchParams.get('inStock')  === 'true';

  const updateParam = (key: string, val: string | null) => {
    const p = new URLSearchParams(searchParams.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    router.push(`/products?${p.toString()}`);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({
      ...(search    && { search }),
      ...(category  && { category }),
      ...(brand     && { brand }),
      ...(minRating && { minRating: String(minRating) }),
      ...(inStock   && { inStock: 'true' }),
      sort, page: String(page), limit: '12',
    });
    try {
      const res  = await fetch(`/api/products?${q}`);
      const data = await res.json();
      setProducts(data.data ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setCategories(data.categories ?? []);
      setBrands(data.brands ?? []);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, sort, page, minRating, inStock]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const activeFilters = [
    category && { label: category, clear: () => updateParam('category', null) },
    brand    && { label: brand,    clear: () => updateParam('brand',    null) },
    minRating > 0 && { label: `${minRating}★+`, clear: () => updateParam('minRating', null) },
    inStock  && { label: 'In Stock', clear: () => updateParam('inStock', null) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="page-container py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : category || 'All Products'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} products found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={e => updateParam('sort', e.target.value)}
            className="input text-sm !w-auto pr-8"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setSidebar(!sidebarOpen)}
            className="sm:hidden btn btn-outline flex items-center gap-2"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeFilters.map(f => (
            <span key={f.label}
              className="flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-medium px-3 py-1.5 rounded-full">
              {f.label}
              <button onClick={f.clear} aria-label={`Remove ${f.label} filter`}>
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button
            onClick={() => router.push('/products')}
            className="text-xs text-danger font-medium hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={cn(
          'w-64 flex-shrink-0 space-y-6',
          'hidden sm:block',
          sidebarOpen && 'fixed inset-y-0 left-0 z-50 bg-white p-6 shadow-2xl overflow-y-auto sm:static sm:shadow-none sm:p-0 sm:bg-transparent sm:block'
        )}>
          {sidebarOpen && (
            <div className="flex items-center justify-between sm:hidden mb-4">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={() => setSidebar(false)}><XMarkIcon className="w-5 h-5" /></button>
            </div>
          )}

          {/* Category */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Category</h4>
            <div className="space-y-2">
              {categories.map(c => (
                <label key={c} className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="category" checked={category === c}
                    onChange={() => updateParam('category', c === category ? null : c)}
                    className="accent-accent w-4 h-4" />
                  <span className={cn('text-sm transition-colors', category === c ? 'text-brand font-semibold' : 'text-gray-600 group-hover:text-brand')}>
                    {c}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Brand</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {brands.map(b => (
                <label key={b} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={brand === b}
                    onChange={() => updateParam('brand', b === brand ? null : b)}
                    className="accent-accent w-4 h-4 rounded" />
                  <span className={cn('text-sm', brand === b ? 'text-brand font-semibold' : 'text-gray-600 group-hover:text-brand')}>
                    {b}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Min Rating */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Min. Rating</h4>
            <div className="space-y-2">
              {RATING_OPTIONS.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="rating" checked={minRating === r}
                    onChange={() => updateParam('minRating', minRating === r ? null : String(r))}
                    className="accent-accent w-4 h-4" />
                  <span className="text-sm text-gray-600">{'⭐'.repeat(r)} & above</span>
                </label>
              ))}
            </div>
          </div>

          {/* In Stock */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStock}
                onChange={() => updateParam('inStock', inStock ? null : 'true')}
                className="accent-accent w-4 h-4 rounded" />
              <span className="text-sm font-medium text-gray-700">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<MagnifyingGlassIcon className="w-10 h-10" />}
              title="No products found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={{ label: 'Clear Filters', href: '/products' }}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} pages={pages}
                onPageChange={p => updateParam('page', String(p))} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="page-container py-6"><ProductGridSkeleton count={12} /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
