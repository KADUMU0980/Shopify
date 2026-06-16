'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CurrencyRupeeIcon, ShoppingBagIcon, UserGroupIcon, ArchiveBoxIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { IOrder, IProduct, AdminStats } from '@/types';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

function StatCard({ title, value, icon, color, prefix = '' }: { title: string; value: number; icon: React.ReactNode; color: string; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="card p-6 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' && value > 999 ? display.toLocaleString() : display}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Store overview and analytics</p>
        </div>
        <Link href="/admin/products/new" className="btn-accent btn">+ Add Product</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={stats?.totalRevenue ?? 0} prefix="₹" icon={<CurrencyRupeeIcon className="w-7 h-7 text-white" />} color="bg-gradient-to-br from-green-500 to-emerald-400" />
        <StatCard title="Total Orders" value={stats?.totalOrders ?? 0} icon={<ShoppingBagIcon className="w-7 h-7 text-white" />} color="bg-gradient-to-br from-blue-500 to-cyan-400" />
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<UserGroupIcon className="w-7 h-7 text-white" />} color="bg-gradient-to-br from-purple-500 to-pink-400" />
        <StatCard title="Products" value={stats?.totalProducts ?? 0} icon={<ArchiveBoxIcon className="w-7 h-7 text-white" />} color="bg-gradient-to-br from-amber-500 to-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-accent font-medium hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr>
                <th className="th">Order ID</th>
                <th className="th">Customer</th>
                <th className="th">Amount</th>
                <th className="th">Status</th>
                <th className="th">Date</th>
              </tr></thead>
              <tbody>
                {(stats?.recentOrders ?? []).map((order: IOrder) => (
                  <tr key={order._id} className="tr-hover">
                    <td className="td font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="td">{(order.userId as { name?: string })?.name ?? 'User'}</td>
                    <td className="td font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td className="td"><span className={getStatusColor(order.orderStatus)}>{order.orderStatus}</span></td>
                    <td className="td text-xs">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
            <h2 className="font-bold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.lowStockProducts ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">All products well-stocked 🎉</p>
            ) : (stats?.lowStockProducts ?? []).map((p: IProduct) => (
              <div key={p._id} className="px-5 py-3 flex items-center justify-between">
                <p className="text-sm text-gray-700 font-medium line-clamp-1 flex-1 mr-2">{p.name}</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock === 0 ? 'bg-danger/10 text-danger' : 'bg-orange-100 text-orange-600'}`}>
                  {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Manage Products', href: '/admin/products', color: 'from-blue-600 to-blue-400' },
          { label: 'Manage Orders',  href: '/admin/orders',   color: 'from-purple-600 to-purple-400' },
          { label: 'Manage Users',   href: '/admin/users',    color: 'from-green-600 to-green-400' },
          { label: 'Add Product',    href: '/admin/products/new', color: 'from-amber-600 to-amber-400' },
        ].map(q => (
          <Link key={q.label} href={q.href}
            className={`card p-4 text-center text-white font-semibold text-sm bg-gradient-to-br ${q.color} hover:opacity-90 hover:shadow-card-hover transition-all`}>
            {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
