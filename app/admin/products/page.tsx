'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  PlusIcon, CloudArrowUpIcon, TrashIcon,
  PencilSquareIcon, MagnifyingGlassIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import { IProduct } from '@/types';
import { formatPrice, cn } from '@/lib/utils';

export default function AdminProductsPage() {
  const router   = useRouter();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<'all' | 'recommended' | 'out-of-stock'>('all');
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/products?limit=100');
    const data = await res.json();
    setProducts(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleRecommended = async (product: IProduct) => {
    setToggling(product._id);
    const next = !product.recommended;
    const res  = await fetch('/api/products/recommended', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product._id, recommended: next }),
    });
    if (res.ok) {
      setProducts(ps => ps.map(p => p._id === product._id ? { ...p, recommended: next } : p));
      toast.success(next ? '⭐ Marked as Recommended' : 'Removed from Recommended');
    } else {
      toast.error('Failed to update');
    }
    setToggling(null);
  };

  const handleDelete = async (product: IProduct) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/products/${product.slug}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(ps => ps.filter(p => p._id !== product._id));
      toast.success('Product deleted');
    } else {
      toast.error('Delete failed');
    }
  };

  const filtered = products
    .filter(p => {
      if (filter === 'recommended')  return p.recommended;
      if (filter === 'out-of-stock') return p.stock === 0;
      return true;
    })
    .filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );

  const recCount = products.filter(p => p.recommended).length;
  const ooCount  = products.filter(p => p.stock === 0).length;

  return (
    <div className="page-container py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-slate-400">{products.length} total · {recCount} recommended · {ooCount} out of stock</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/batch" className="btn btn-outline btn-sm flex items-center gap-1.5">
            <CloudArrowUpIcon className="w-4 h-4" /> Batch Import
          </Link>
          <Link href="/admin/products/new" className="btn btn-accent btn-sm flex items-center gap-1.5">
            <PlusIcon className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9 py-2 text-sm"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'all',           label: `All (${products.length})` },
            { key: 'recommended',   label: `⭐ Recommended (${recCount})` },
            { key: 'out-of-stock',  label: `🚫 Out of Stock (${ooCount})` },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                filter === tab.key
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Product</th>
              <th className="th">Category</th>
              <th className="th">Price</th>
              <th className="th">Stock</th>
              <th className="th">Ratings</th>
              <th className="th text-center">Recommended</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="td">
                      <div className="skeleton h-4 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="td text-center py-12 text-slate-400">
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map(product => (
                <tr key={product._id} className="tr-hover">
                  {/* Product */}
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} width={48} height={48}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">📦</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{product.brand}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="td">
                    <span className="badge badge-blue text-xs">{product.category}</span>
                  </td>

                  {/* Price */}
                  <td className="td">
                    <p className="font-bold text-sm text-gray-900">{formatPrice(product.discountedPrice)}</p>
                    {product.price !== product.discountedPrice && (
                      <p className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="td">
                    <span className={cn('text-sm font-bold',
                      product.stock === 0   ? 'text-red-500'
                      : product.stock < 10  ? 'text-amber-500'
                      : 'text-emerald-600'
                    )}>
                      {product.stock === 0 ? 'Out of stock' : product.stock}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="td text-sm font-medium">
                    ⭐ {product.ratings?.toFixed(1)} <span className="text-slate-400 font-normal">({product.numReviews})</span>
                  </td>

                  {/* Recommended toggle */}
                  <td className="td text-center">
                    <button
                      onClick={() => toggleRecommended(product)}
                      disabled={toggling === product._id}
                      title={product.recommended ? 'Click to remove from Recommended' : 'Click to mark as Recommended'}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50',
                        product.recommended ? 'bg-amber-400' : 'bg-slate-200'
                      )}
                      role="switch"
                      aria-checked={product.recommended}
                    >
                      <span className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200',
                        product.recommended ? 'translate-x-6' : 'translate-x-1'
                      )} />
                    </button>
                    {product.recommended && (
                      <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center justify-center gap-0.5">
                        <SparklesIcon className="w-3 h-3" /> Featured
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="td">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => router.push(`/admin/products/${product.slug}/edit`)}
                        className="btn-icon btn-ghost text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit product">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="btn-icon btn-ghost text-slate-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete product">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
