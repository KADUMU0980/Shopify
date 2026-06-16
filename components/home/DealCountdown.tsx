'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/outline';
import { IProduct } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface DealCountdownProps {
  product: IProduct;
  endsAt: Date;
}

function useCountdown(endsAt: Date) {
  const calcTime = () => {
    const diff = Math.max(0, endsAt.getTime() - Date.now());
    return {
      h:  Math.floor(diff / 3_600_000),
      m:  Math.floor((diff % 3_600_000) / 60_000),
      s:  Math.floor((diff % 60_000) / 1000),
    };
  };
  const [time, setTime] = useState(calcTime);
  useEffect(() => {
    const t = setInterval(() => setTime(calcTime()), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);
  return time;
}

export default function DealCountdown({ product, endsAt }: DealCountdownProps) {
  const { h, m, s } = useCountdown(endsAt);
  const discount     = calculateDiscount(product.price, product.discountedPrice);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <ClockIcon className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wide">Deal of the Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[pad(h), pad(m), pad(s)].map((unit, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="bg-white text-red-600 font-mono font-bold text-lg px-2 py-1 rounded-lg min-w-[40px] text-center shadow">
                {unit}
              </span>
              {i < 2 && <span className="text-white font-bold text-xl">:</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-40 h-40 flex-shrink-0">
          <Image
            src={product.images[0] ?? '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover rounded-xl shadow-md"
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-danger text-white text-xs font-bold px-2 py-1 rounded-lg">
              {discount}% OFF
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="text-xs text-gray-400 font-medium uppercase">{product.brand}</span>
          <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2 line-clamp-2">{product.name}</h3>

          <div className="flex items-baseline gap-3 justify-center sm:justify-start mb-1">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.discountedPrice)}</span>
            <span className="text-gray-400 line-through text-sm">{formatPrice(product.price)}</span>
          </div>
          <p className="text-success text-sm font-semibold mb-5">
            You save {formatPrice(product.price - product.discountedPrice)}
          </p>

          <div className="flex gap-3 justify-center sm:justify-start">
            <Link href={`/products/${product.slug}`}>
              <Button variant="accent" size="lg">Grab the Deal</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
