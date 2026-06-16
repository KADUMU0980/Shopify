import type { Metadata } from 'next';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryStrip from '@/components/home/CategoryStrip';
import TrendingRow from '@/components/home/TrendingRow';
import DealCountdown from '@/components/home/DealCountdown';
import { IProduct } from '@/types';

export const metadata: Metadata = {
  title: 'ShopVerse — Premium E-Commerce Store',
  description: 'Discover amazing deals on Electronics, Fashion, Home & more.',
};

async function getProducts(params: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/products?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [trending, topRated, electronics, fashion] = await Promise.all([
    getProducts('sort=newest&limit=10'),
    getProducts('sort=rating&limit=10'),
    getProducts('category=Electronics&limit=10'),
    getProducts('category=Fashion&limit=10'),
  ]);

  const dealProduct = topRated[0] ?? null;
  const dealEnd     = new Date(Date.now() + 8 * 3_600_000); // 8 hours from now

  return (
    <div className="page-container py-6 space-y-12">
      {/* Hero */}
      <HeroBanner />

      {/* Category Strip */}
      <CategoryStrip />

      {/* Featured deal */}
      {dealProduct && (
        <section>
          <DealCountdown product={dealProduct} endsAt={dealEnd} />
        </section>
      )}

      {/* New Arrivals */}
      <TrendingRow
        title="New Arrivals"
        subtitle="Fresh products just landed"
        products={trending}
        viewAllHref="/products?sort=newest"
      />

      {/* Top Rated */}
      <TrendingRow
        title="Top Rated Products"
        subtitle="Loved by thousands of customers"
        products={topRated}
        viewAllHref="/products?sort=rating"
      />

      {/* Electronics */}
      {electronics.length > 0 && (
        <TrendingRow
          title="Electronics"
          subtitle="Gadgets & tech at great prices"
          products={electronics}
          viewAllHref="/products?category=Electronics"
        />
      )}

      {/* Fashion */}
      {fashion.length > 0 && (
        <TrendingRow
          title="Fashion Picks"
          subtitle="Style that speaks for itself"
          products={fashion}
          viewAllHref="/products?category=Fashion"
        />
      )}

      {/* Trust badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🚚', title: 'Free Delivery',    desc: 'On orders above ₹499' },
          { icon: '🔄', title: 'Easy Returns',     desc: '30-day hassle-free returns' },
          { icon: '🔒', title: 'Secure Payments',  desc: '100% safe & encrypted' },
          { icon: '⭐', title: '5-Star Support',   desc: '24/7 customer service' },
        ].map(b => (
          <div key={b.title} className="card p-5 text-center hover:shadow-card-hover transition-shadow duration-300">
            <div className="text-3xl mb-2">{b.icon}</div>
            <h3 className="text-sm font-semibold text-gray-900">{b.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
