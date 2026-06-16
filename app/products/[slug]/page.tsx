'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { MinusIcon, PlusIcon, ShoppingCartIcon, BoltIcon, TruckIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { IProduct, IReview } from '@/types';
import { formatPrice, calculateDiscount, formatDate, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import StarRating from '@/components/ui/StarRating';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { DetailPageSkeleton } from '@/components/ui/Skeleton';
import ProductCard from '@/components/product/ProductCard';

type Tab = 'description' | 'specifications' | 'reviews';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();
  const { data: session } = useSession();
  const addItem  = useCartStore(s => s.addItem);
  const { toggle, isWishlisted, syncWithServer } = useWishlistStore();

  const [product,  setProduct]  = useState<IProduct | null>(null);
  const [similar,  setSimilar]  = useState<IProduct[]>([]);
  const [reviews,  setReviews]  = useState<IReview[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [mainImg,  setMainImg]  = useState(0);
  const [tab,      setTab]      = useState<Tab>('description');
  const [myRating, setMyRating] = useState(0);
  const [myComment,setMyComment]= useState('');
  const [submitting,setSubmit]  = useState(false);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/api/products/${slug}`).then(r => r.json()),
      fetch(`/api/products/${slug}/reviews`).then(r => r.json()),
    ]).then(([prod, revs]) => {
      if (prod.error) { router.push('/products'); return; }
      setProduct(prod);
      setReviews(Array.isArray(revs) ? revs : []);
      // Fetch similar
      fetch(`/api/products?category=${encodeURIComponent(prod.category)}&limit=6`)
        .then(r => r.json())
        .then(d => setSimilar((d.data ?? []).filter((p: IProduct) => p.slug !== slug)));
    }).finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) return <div className="page-container py-8"><DetailPageSkeleton /></div>;
  if (!product) return null;

  const discount = calculateDiscount(product.price, product.discountedPrice);
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async () => {
    addItem({ productId: product._id, slug: product.slug, name: product.name, quantity: qty, price: product.discountedPrice, image: product.images[0] ?? '', stock: product.stock });
    if (session) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, slug: product.slug, name: product.name, quantity: qty, price: product.discountedPrice, image: product.images[0] ?? '' }),
      });
    }
    toast.success('Added to cart!');
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  const handleWishlist = () => {
    if (!session) { toast.error('Please login to add to wishlist'); return; }
    toggle(product._id);
    syncWithServer(product._id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast.error('Please login to review'); return; }
    if (!myRating) { toast.error('Select a rating'); return; }
    setSubmit(true);
    const res = await fetch(`/api/products/${slug}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: myRating, comment: myComment }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); } else {
      toast.success('Review submitted!');
      setMyRating(0); setMyComment('');
      fetch(`/api/products/${slug}/reviews`).then(r => r.json()).then(revs => setReviews(Array.isArray(revs) ? revs : []));
    }
    setSubmit(false);
  };

  const stockStatus = product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? `Only ${product.stock} left` : 'In Stock';
  const stockColor  = product.stock === 0 ? 'text-danger' : product.stock < 10 ? 'text-orange-500' : 'text-success';

  return (
    <div className="page-container py-6 space-y-10">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Products', href: '/products' },
        { label: product.category, href: `/products?category=${product.category}` },
        { label: product.name },
      ]} />

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 group">
            <Image
              src={product.images[mainImg] ?? '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
            {discount > 0 && (
              <div className="absolute top-4 left-4 discount-badge text-sm px-3 py-1.5">
                {discount}% OFF
              </div>
            )}
            <button onClick={handleWishlist} className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-md" aria-label="Toggle wishlist">
              {wishlisted ? <HeartSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setMainImg(i)}
                  className={cn('flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                    i === mainImg ? 'border-accent shadow-accent' : 'border-gray-200 hover:border-gray-400')}>
                  <Image src={img} alt={`${product.name} ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{product.brand} · {product.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-snug">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <StarRating value={product.ratings} showValue showCount={product.numReviews} />
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.discountedPrice)}</span>
            {discount > 0 && (
              <>
                <span className="text-gray-400 line-through text-lg">{formatPrice(product.price)}</span>
                <span className="badge-success badge text-sm px-3">Save {formatPrice(product.price - product.discountedPrice)}</span>
              </>
            )}
          </div>

          <div className={cn('flex items-center gap-2 text-sm font-semibold', stockColor)}>
            <span className={cn('w-2 h-2 rounded-full', product.stock > 0 ? (product.stock < 10 ? 'bg-orange-500' : 'bg-success') : 'bg-danger')} />
            {stockStatus}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Decrease quantity">
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="px-5 py-2.5 text-sm font-semibold text-gray-900 border-x border-gray-200 min-w-[50px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Increase quantity">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-brand text-brand font-semibold hover:bg-brand hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              <ShoppingCartIcon className="w-5 h-5" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-brand font-semibold hover:bg-accent-600 hover:text-white transition-all duration-200 disabled:opacity-50 shadow-accent"
            >
              <BoltIcon className="w-5 h-5" /> Buy Now
            </button>
          </div>

          {/* Delivery info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <TruckIcon className="w-4 h-4" />, text: 'Free delivery on orders above ₹499' },
              { icon: <ArrowPathIcon className="w-4 h-4" />, text: '30-day easy returns' },
              { icon: <ShieldCheckIcon className="w-4 h-4" />, text: '1 year warranty' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                <span className="text-success flex-shrink-0">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(t => (
                <span key={t} className="badge badge-accent">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(['description', 'specifications', 'reviews'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-4 text-sm font-semibold capitalize transition-all duration-200',
                tab === t
                  ? 'text-brand border-b-2 border-brand bg-brand/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}>
              {t} {t === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'description' && (
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          )}

          {tab === 'specifications' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {Object.entries(product.specifications ?? {}).map(([k, v]) => (
                    <tr key={k} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 font-semibold text-gray-700 w-1/3">{k}</td>
                      <td className="py-3 text-gray-600">{v as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {Object.keys(product.specifications ?? {}).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">No specifications available</p>
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-6">
              {/* Review form */}
              {session && (
                <form onSubmit={handleReview} className="bg-gray-50 rounded-xl p-5 space-y-4">
                  <h4 className="font-semibold text-gray-800">Write a Review</h4>
                  <div>
                    <label className="label">Your Rating</label>
                    <StarRating value={myRating} onChange={setMyRating} size="lg" />
                  </div>
                  <div>
                    <label className="label">Your Review</label>
                    <textarea
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="input h-24 resize-none"
                      minLength={10}
                    />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="btn-accent btn">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Review list */}
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.map((r) => (
                    <div key={r._id} className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-brand">
                            {((r.userId as { name?: string })?.name?.[0] ?? 'U').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800">
                              {(r.userId as { name?: string })?.name ?? 'User'}
                            </span>
                            <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                          </div>
                          <StarRating value={r.rating} size="sm" />
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <section>
          <h2 className="section-title mb-5">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {similar.slice(0, 6).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
