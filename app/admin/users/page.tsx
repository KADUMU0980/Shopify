'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { formatDate, formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface UserRow {
  _id: string; name: string; email: string; role: string; createdAt: string;
  cartItems: { name: string; quantity: number }[];
  recentOrders: { _id: string; totalAmount: number; orderStatus: string; createdAt: string }[];
}

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<UserRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(setUsers).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-slate-400">{users.length} registered users</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead><tr>
            <th className="th">User</th>
            <th className="th">Email</th>
            <th className="th">Role</th>
            <th className="th">Joined</th>
            <th className="th">Cart</th>
            <th className="th">Details</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="td text-center py-10 text-slate-400">Loading users...</td></tr>
            ) : users.map(user => (
              <>
                <tr key={user._id} className="tr-hover">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="td text-sm text-slate-500">{user.email}</td>
                  <td className="td">
                    <span className={cn('badge text-xs', user.role === 'admin' ? 'badge-accent' : 'badge-blue')}>
                      {user.role}
                    </span>
                  </td>
                  <td className="td text-xs text-slate-400">{formatDate(user.createdAt)}</td>
                  <td className="td text-sm font-semibold text-slate-700">{user.cartItems.length} items</td>
                  <td className="td">
                    <button onClick={() => setExpanded(expanded === user._id ? null : user._id)}
                      className="btn-ghost btn-sm flex items-center gap-1">
                      {expanded === user._id ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                      {expanded === user._id ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
                {expanded === user._id && (
                  <tr key={`${user._id}-expand`}>
                    <td colSpan={6} className="bg-slate-50 px-5 py-4 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Cart Items ({user.cartItems.length})</p>
                          {user.cartItems.length === 0
                            ? <p className="text-xs text-slate-400">Empty cart</p>
                            : <ul className="space-y-1.5">
                                {user.cartItems.map((item, i) => (
                                  <li key={i} className="text-sm flex justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
                                    <span className="text-gray-700 line-clamp-1">{item.name}</span>
                                    <span className="font-bold text-slate-700 flex-shrink-0 ml-2">×{item.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                          }
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Orders ({user.recentOrders.length})</p>
                          {user.recentOrders.length === 0
                            ? <p className="text-xs text-slate-400">No orders yet</p>
                            : <ul className="space-y-1.5">
                                {user.recentOrders.map(order => (
                                  <li key={order._id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100 text-sm">
                                    <span className="font-mono text-xs text-slate-500">#{order._id.slice(-6).toUpperCase()}</span>
                                    <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                                    <span className={cn('badge text-[10px]',
                                      order.orderStatus === 'delivered' ? 'badge-success' :
                                      order.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-blue'
                                    )}>{order.orderStatus}</span>
                                  </li>
                                ))}
                              </ul>
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
