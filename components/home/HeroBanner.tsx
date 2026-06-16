'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import Link from 'next/link';
import Image from 'next/image';

const SLIDES = [
  {
    id: 1,
    eyebrow: '🔥 LIMITED TIME DEAL',
    title: 'Next-Gen Tech at\nUnbeatable Prices',
    subtitle: 'Up to 40% off on latest electronics, laptops & gadgets.',
    cta: 'Shop Electronics',
    ctaSecondary: 'View Deals',
    href: '/products?category=Electronics',
    bg: 'from-[#060d1e] via-[#0c1f4a] to-[#060d1e]',
    accentColor: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&q=85',
    stat1: { val: '40%', label: 'Max Discount' },
    stat2: { val: '500+', label: 'Products' },
  },
  {
    id: 2,
    eyebrow: '✨ NEW ARRIVALS',
    title: 'Fashion Forward —\nYour Style Elevated',
    subtitle: 'Trending collections from top brands. Express yourself.',
    cta: 'Explore Fashion',
    ctaSecondary: 'View All',
    href: '/products?category=Fashion',
    bg: 'from-[#1a0035] via-[#3b0066] to-[#1a0035]',
    accentColor: '#a855f7',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&q=85',
    stat1: { val: '30%', label: 'Off Today' },
    stat2: { val: '200+', label: 'Brands' },
  },
  {
    id: 3,
    eyebrow: '🏡 BEST SELLERS',
    title: 'Transform Your Home,\nTransform Your Life',
    subtitle: 'Premium home & living at everyday prices. Free delivery.',
    cta: 'Shop Home & Living',
    ctaSecondary: 'Discover More',
    href: '/products?category=Home',
    bg: 'from-[#051a10] via-[#0a3320] to-[#051a10]',
    accentColor: '#10B981',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=85',
    stat1: { val: 'FREE', label: 'Delivery' },
    stat2: { val: '1000+', label: 'Items' },
  },
];

export default function HeroBanner() {
  return (
    <section className="w-full rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.2)]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="w-full"
      >
        {SLIDES.map(slide => (
          <SwiperSlide key={slide.id}>
            <div className={`relative bg-gradient-to-r ${slide.bg} min-h-[400px] sm:min-h-[480px]`}>
              {/* Background glow */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
                  style={{ background: slide.accentColor }} />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-15 blur-3xl"
                  style={{ background: slide.accentColor }} />
              </div>

              <div className="relative page-container h-full flex items-center py-12 lg:py-16">
                <div className="flex items-center justify-between gap-10 w-full">
                  {/* Text */}
                  <div className="flex-1 z-10 max-w-xl animate-slide-up">
                    <span className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 border"
                      style={{ borderColor: `${slide.accentColor}40`, background: `${slide.accentColor}15`, color: slide.accentColor }}>
                      {slide.eyebrow}
                    </span>

                    <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-white leading-[1.15] mb-4 whitespace-pre-line">
                      {slide.title}
                    </h1>
                    <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">{slide.subtitle}</p>

                    <div className="flex gap-3 flex-wrap">
                      <Link href={slide.href}>
                        <button className="btn btn-lg font-black shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform"
                          style={{ background: `linear-gradient(135deg, ${slide.accentColor}, ${slide.accentColor}CC)`, color: '#0F172A' }}>
                          {slide.cta} →
                        </button>
                      </Link>
                      <Link href="/products">
                        <button className="btn btn-lg text-white border border-white/25 hover:bg-white/10 transition-colors">
                          {slide.ctaSecondary}
                        </button>
                      </Link>
                    </div>

                    {/* Mini stats */}
                    <div className="flex items-center gap-6 mt-8">
                      {[slide.stat1, slide.stat2].map(s => (
                        <div key={s.label}>
                          <p className="text-2xl font-black" style={{ color: slide.accentColor }}>{s.val}</p>
                          <p className="text-xs text-white/50 font-medium">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="hidden lg:block flex-shrink-0 w-72 xl:w-80 relative animate-float">
                    <div className="relative h-72 xl:h-80 w-full">
                      <Image src={slide.image} alt={slide.title} fill
                        className="object-cover rounded-2xl"
                        priority={slide.id === 1}
                        style={{ filter: 'brightness(0.85) contrast(1.1)' }}
                      />
                      {/* Glow ring */}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset"
                        style={{ boxShadow: `0 0 60px ${slide.accentColor}50, inset 0 0 0 1px ${slide.accentColor}25` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
