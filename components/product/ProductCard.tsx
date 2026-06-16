'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HeartIcon, ShoppingCartIcon, BoltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { IProduct } from '@/types';
import { calculateDiscount, formatPrice, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import StarRating from '@/components/ui/StarRating';

interface ProductCardProps {
  product: IProduct;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const addItem = useCartStore(s => s.addItem);
  const { toggle, isWishlisted, syncWithServer } = useWishlistStore();
  const [addingCart, setAddingCart] = useState(false);
  const [imgError, setImgError]     = useState(false);

  const discount   = calculateDiscount(product.price, product.discountedPrice);
  const wishlisted = isWishlisted(product._id);
  const inStock    = product.stock > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!inStock) return;
    setAddingCart(true);
    try {
      addItem({ productId: product._id, slug: product.slug, name: product.name, quantity: 1, price: product.discountedPrice, image: product.images[0] ?? '', stock: product.stock });
      if (session) {
        await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id, slug: product.slug, name: product.name, quantity: 1, price: product.discountedPrice, image: product.images[0] ?? '' }) });
      }
      toast.success('Added to cart!');
    } finally { setAddingCart(false); }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!inStock) return;
    handleAddToCart(e).then(() => router.push('/cart'));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!session) { toast.error('Please login to save items'); return; }
    toggle(product._id);
    syncWithServer(product._id);
    toast.success(wishlisted ? 'Removed from wishlist' : '❤️ Saved to wishlist!');
  };

  const imageUrl = !imgError && product.images?.[0] ? product.images[0] : '/placeholder.jpg';

  return (
    <Link href={`/products/${product.slug}`}>
      <div className={cn(
        'relative flex flex-col bg-white rounded-2xl border border-slate-200/70 overflow-hidden',
        'shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
        'hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group',
        className
      )}>
        {/* Image area */}
        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-108 transition-transform duration-500"
            onError={() => setImgError(true)}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Discount badge */}
          {discount > 0 && (
            <div className="discount-badge">{discount}% OFF</div>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist btn */}
          <button onClick={handleWishlist} className="wishlist-btn" aria-label="Toggle wishlist">
            {wishlisted
              ? <HeartSolid className="w-4 h-4 text-red-500" />
              : <HeartIcon   className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          {/* Brand */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{product.brand}</p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <StarRating value={product.ratings} size="sm" />
            <span className="text-xs text-slate-400 font-medium">({product.numReviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto pt-1">
            <span className="text-lg font-black text-gray-900">
              {formatPrice(product.discountedPrice)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingCart}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold',
                'border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white',
                'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95'
              )}
              aria-label="Add to cart"
            >
              <ShoppingCartIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{addingCart ? '...' : 'Add'}</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black text-[#0F172A]',
                'hover:brightness-110 hover:shadow-[0_4px_12px_rgba(245,158,11,0.4)]',
                'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95'
              )}
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
              aria-label="Buy now"
            >
              <BoltIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
