'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { ICartItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

export default function CartPage() {
  const { data: session } = useSession();
  const { items, setItems, removeItem, updateQty, clearCart, totalPrice } = useCartStore();
  const [syncing, setSyncing] = useState(false);

  // Sync DB cart on mount for logged-in users
  useEffect(() => {
    if (!session) return;
    setSyncing(true);
    fetch('/api/cart').then(r => r.json()).then(data => {
      if (data.items?.length) setItems(data.items.map((i: ICartItem & { _id?: string }) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      })));
    }).finally(() => setSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleQtyChange = async (item: ICartItem, qty: number) => {
    updateQty(item.productId, qty);
    if (session) {
      // Find the DB item ID — for simplicity, re-sync after update
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, quantity: qty }),
      });
    }
  };

  const handleRemove = async (item: ICartItem) => {
    removeItem(item.productId);
    toast.success('Item removed');
    if (session) {
      fetch('/api/cart', { method: 'DELETE' });
    }
  };

  const subtotal  = totalPrice();
  const shipping  = subtotal >= 499 ? 0 : 49;
  const tax       = Math.round(subtotal * 0.18);
  const total     = subtotal + shipping + tax;

  if (syncing) {
    return (
      <div className="page-container py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({items.length} items)</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBagIcon className="w-12 h-12" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our products and find something you love!"
          action={{ label: 'Continue Shopping', href: '/products' }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.productId} className="card p-4 flex items-start gap-4">
                <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="w-24 h-24 object-cover rounded-xl bg-gray-50"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="text-sm font-semibold text-gray-800 hover:text-brand line-clamp-2">{item.name}</h3>
                  </Link>
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => handleQtyChange(item, item.quantity - 1)} disabled={item.quantity <= 1}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors" aria-label="Decrease">
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-semibold border-x border-gray-200 min-w-[40px] text-center">{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item, item.quantity + 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Increase">
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item)}
                      className="text-gray-400 hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-red-50" aria-label="Remove item">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <Link href="/products" className="text-sm text-accent font-medium hover:underline">← Continue Shopping</Link>
              <button onClick={() => { clearCart(); toast.success('Cart cleared'); }} className="text-sm text-danger hover:underline font-medium">
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-success font-semibold' : 'font-semibold text-gray-900'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-success bg-success/10 px-3 py-1.5 rounded-lg">🎉 Free shipping applied!</p>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href={session ? '/checkout' : '/login?callbackUrl=/checkout'} className="mt-5 block">
                <Button variant="accent" size="lg" className="w-full">
                  Proceed to Checkout →
                </Button>
              </Link>
              {!session && (
                <p className="text-center text-xs text-gray-400 mt-2">You&apos;ll be asked to sign in</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
