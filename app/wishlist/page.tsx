'use client';

import { useEffect, useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { IProduct } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function WishlistPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    fetch('/api/wishlist')
      .then(r => r.json())
      .then(d => setProducts(d.wishlist ?? []))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({products.length})</h1>
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<HeartIcon className="w-12 h-12" />}
          title="Your wishlist is empty"
          description="Save items you love by clicking the heart icon on any product card."
          action={{ label: 'Discover Products', href: '/products' }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
