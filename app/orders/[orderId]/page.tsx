'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { IOrder } from '@/types';
import { formatPrice, formatDateTime, getStatusColor } from '@/lib/utils';

const STATUS_STEPS = [
  { key: 'pending',   label: 'Order Placed',   icon: ClockIcon },
  { key: 'confirmed', label: 'Confirmed',       icon: CheckCircleIcon },
  { key: 'shipped',   label: 'Shipped',         icon: TruckIcon },
  { key: 'delivered', label: 'Delivered',       icon: CheckCircleIcon },
];

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`).then(r => r.json()).then(setOrder).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="page-container py-8 text-center text-gray-400">Loading order...</div>;
  if (!order)  return <div className="page-container py-8 text-center text-gray-400">Order not found.</div>;

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="page-container py-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-400 font-mono mt-0.5">#{order._id.slice(-12).toUpperCase()}</p>
        </div>
        <span className={getStatusColor(order.orderStatus)}>{order.orderStatus}</span>
      </div>

      {/* Status timeline */}
      {!isCancelled ? (
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-6">Order Progress</h2>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done ? 'bg-success border-success text-white' :
                    active ? 'bg-brand border-brand text-white' : 'border-gray-300 text-gray-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 font-medium text-center ${done ? 'text-success' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className="absolute" style={{ display: 'none' }} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Connecting line */}
          <div className="relative mt-[-28px] mb-4 mx-5">
            <div className="h-0.5 bg-gray-200 w-full absolute top-0" />
            <div className="h-0.5 bg-success absolute top-0 transition-all duration-500"
              style={{ width: `${Math.max(0, currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
          </div>
        </div>
      ) : (
        <div className="card p-5 flex items-center gap-3 bg-red-50 border border-red-100">
          <XCircleIcon className="w-6 h-6 text-danger flex-shrink-0" />
          <p className="text-sm font-medium text-danger">This order was cancelled.</p>
        </div>
      )}

      {/* Items */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4">
              <Image src={item.image || '/placeholder.jpg'} alt={item.name} width={64} height={64}
                className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="text-sm font-semibold text-gray-800 hover:text-brand line-clamp-2">{item.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">📦 Shipping To</h2>
          <p className="text-sm font-medium text-gray-700">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
          <p className="text-sm text-gray-500 mt-1">
            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
        </div>

        {/* Payment & Summary */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-3">💳 Payment</h2>
          <p className="text-sm text-gray-600 capitalize">Method: <span className="font-semibold text-gray-900 uppercase">{order.paymentMethod}</span></p>
          <p className="text-sm text-gray-600">Status: <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-success' : 'text-orange-500'}`}>{order.paymentStatus}</span></p>
          <div className="border-t mt-3 pt-3">
            <div className="flex justify-between text-sm font-bold text-gray-900">
              <span>Total Paid</span><span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
