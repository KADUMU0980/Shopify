'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm flex-wrap">
        <li>
          <Link href="/" className="text-gray-400 hover:text-accent transition-colors flex items-center gap-1">
            <HomeIcon className="w-3.5 h-3.5" />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300" />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="text-gray-500 hover:text-accent transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
