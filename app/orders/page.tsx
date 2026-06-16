'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { IOrder } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import { OrderRowSkeleton } from '@/components/ui/Skeleton';

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.data ?? [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container py-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      {loading ? (
        <div className="card overflow-hidden">
          {[...Array(3)].map((_, i) => <OrderRowSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBagIcon className="w-12 h-12" />}
          title="No orders yet"
          description="You haven't placed any orders. Start shopping!"
          action={{ label: 'Start Shopping', href: '/products' }}
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} href={`/orders/${order._id}`}>
              <div className="card p-5 hover:shadow-card-hover transition-shadow cursor-pointer">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-gray-400 font-mono mb-0.5">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)} · {order.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                    <span className={getStatusColor(order.orderStatus)}>{order.orderStatus}</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {order.items.slice(0, 3).map((item, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={item.image || '/placeholder.jpg'} alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
