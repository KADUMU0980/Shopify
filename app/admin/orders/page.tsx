'use client';

import { useEffect, useState, useCallback } from 'react';
import { IOrder } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [updating,setUpdating]= useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/orders?limit=50');
    const data = await res.json();
    setOrders(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: status }),
    });
    if (res.ok) { toast.success('Order updated'); fetchOrders(); }
    else { toast.error('Failed to update'); }
    setUpdating(null);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  return (
    <div className="page-container py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-slate-400">{filtered.length} orders</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 border',
              filter === s
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            )}>
            {s}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead><tr>
            <th className="th">Order ID</th>
            <th className="th">Customer</th>
            <th className="th">Items</th>
            <th className="th">Total</th>
            <th className="th">Payment</th>
            <th className="th">Date</th>
            <th className="th">Status</th>
            <th className="th">Update</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="td text-center py-10 text-slate-400">Loading orders...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="td text-center py-10 text-slate-400">No orders found</td></tr>
            ) : filtered.map(order => (
              <tr key={order._id} className="tr-hover">
                <td className="td font-mono text-xs font-bold text-slate-700">#{order._id.slice(-8).toUpperCase()}</td>
                <td className="td text-sm font-medium">{(order.userId as { name?: string })?.name ?? 'User'}</td>
                <td className="td text-sm">{order.items.length} items</td>
                <td className="td font-bold text-sm">{formatPrice(order.totalAmount)}</td>
                <td className="td"><span className={cn('text-xs font-bold uppercase', order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600')}>{order.paymentMethod}</span></td>
                <td className="td text-xs text-slate-400">{formatDate(order.createdAt)}</td>
                <td className="td"><span className={getStatusColor(order.orderStatus)}>{order.orderStatus}</span></td>
                <td className="td">
                  <select
                    value={order.orderStatus}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    disabled={updating === order._id || order.orderStatus === 'cancelled' || order.orderStatus === 'delivered'}
                    className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white focus:outline-none focus:border-amber-400 disabled:opacity-50 font-medium">
                    {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
