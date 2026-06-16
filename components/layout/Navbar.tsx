'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  ShoppingCartIcon, HeartIcon, MagnifyingGlassIcon,
  UserCircleIcon, ChevronDownIcon, Bars3Icon, XMarkIcon,
  ShieldCheckIcon, ArchiveBoxIcon, UserIcon, ArrowRightOnRectangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cartStore';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchResult { _id: string; name: string; slug: string; images: string[]; discountedPrice: number }

const NAV_CATEGORIES = [
  { label: '📱 Electronics', href: '/products?category=Electronics' },
  { label: '👗 Fashion',     href: '/products?category=Fashion' },
  { label: '🏠 Home',        href: '/products?category=Home' },
  { label: '📚 Books',       href: '/products?category=Books' },
  { label: '⚽ Sports',      href: '/products?category=Sports' },
  { label: '💄 Beauty',      href: '/products?category=Beauty' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const cartItems = useCartStore(s => s.totalItems)();
  const role = (session?.user as { role?: string })?.role;

  const [search,     setSearch]    = useState('');
  const [results,    setResults]   = useState<SearchResult[]>([]);
  const [showDrop,   setShowDrop]  = useState(false);
  const [showUser,   setShowUser]  = useState(false);
  const [mobileOpen, setMobile]    = useState(false);
  const [scrolled,   setScrolled]  = useState(false);
  const [searching,  setSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const searchRef = useRef<HTMLDivElement>(null);
  const userRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) { setResults([]); setShowDrop(false); return; }
    setSearching(true);
    fetch(`/api/products?search=${encodeURIComponent(debouncedSearch)}&limit=5`)
      .then(r => r.json())
      .then(d => { setResults(d.data ?? []); setShowDrop(true); })
      .finally(() => setSearching(false));
  }, [debouncedSearch]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setShowDrop(false);
      if (!userRef.current?.contains(e.target as Node))   setShowUser(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { router.push(`/products?search=${encodeURIComponent(search)}`); setShowDrop(false); }
  };

  return (
    <>
      <header className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-[#0a1020]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-white/5'
          : 'bg-gradient-to-b from-[#0F172A] to-[#0d1a2d]'
      )}>
        {/* Top strip */}
        <div className="hidden md:flex items-center justify-center gap-8 py-1.5 border-b border-white/5 text-[11px] text-white/50 font-medium">
          <span>🚚 Free delivery on orders above ₹499</span>
          <span>·</span>
          <span>🔄 30-day easy returns</span>
          <span>·</span>
          <span>🔒 100% secure payments</span>
        </div>

        <div className="page-container">
          <div className="flex items-center gap-4 h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-shadow"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                <SparklesIcon className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-white font-black text-xl tracking-tight">
                Shop<span className="gradient-text">Verse</span>
              </span>
            </Link>

            {/* Search bar (desktop) */}
            <div ref={searchRef} className="flex-1 max-w-2xl hidden md:block relative">
              <form onSubmit={handleSearch}>
                <div className="relative group">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => results.length > 0 && setShowDrop(true)}
                    placeholder="Search products, brands, categories..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-500
                               bg-white/8 border border-white/10 hover:border-white/20
                               focus:border-amber-400/60 focus:bg-white/12 focus:ring-0
                               transition-all duration-200 outline-none"
                    aria-label="Search products"
                  />
                  {searching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                  )}
                </div>
              </form>

              {/* Search dropdown */}
              {showDrop && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden z-50 animate-slide-down">
                  {results.map(r => (
                    <Link key={r._id} href={`/products/${r.slug}`}
                      onClick={() => { setShowDrop(false); setSearch(''); }}
                      className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      {r.images?.[0] && (
                        <Image src={r.images[0]} alt={r.name} width={40} height={40}
                          className="w-10 h-10 object-cover rounded-xl flex-shrink-0 bg-slate-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.name}</p>
                        <p className="text-xs font-bold mt-0.5" style={{ color: '#F59E0B' }}>
                          ₹{r.discountedPrice.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <Link href={`/products?search=${encodeURIComponent(search)}`} onClick={() => setShowDrop(false)}
                    className="block px-4 py-3 text-xs text-center font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
                    See all results for &quot;{search}&quot; →
                  </Link>
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Link href="/wishlist"
                className="hidden sm:flex btn-icon btn-ghost text-white/70 hover:text-white hover:bg-white/10"
                aria-label="Wishlist">
                <HeartIcon className="w-5 h-5" />
              </Link>

              <Link href="/cart"
                className="flex btn-icon btn-ghost text-white/70 hover:text-white hover:bg-white/10 relative"
                aria-label="Cart">
                <ShoppingCartIcon className="w-5 h-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center
                                   text-[10px] font-bold rounded-full px-1 text-[#0F172A]
                                   shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                    {cartItems > 99 ? '99+' : cartItems}
                  </span>
                )}
              </Link>

              {session ? (
                <div ref={userRef} className="relative">
                  <button onClick={() => setShowUser(!showUser)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                    aria-expanded={showUser}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-inner"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                      {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <span className="text-sm font-semibold hidden lg:block max-w-[80px] truncate">
                      {session.user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDownIcon className={cn('w-3.5 h-3.5 hidden lg:block transition-transform duration-200', showUser && 'rotate-180')} />
                  </button>

                  {showUser && (
                    <div className="absolute right-0 top-full mt-2.5 w-56 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-50 animate-slide-down overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 mb-1">
                        <p className="text-sm font-bold text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{session.user?.email}</p>
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                          {role}
                        </span>
                      </div>

                      {role === 'admin' ? (
                        <>
                          {[
                            { href: '/admin/dashboard', label: 'Dashboard', icon: <ShieldCheckIcon className="w-4 h-4 text-amber-500" /> },
                            { href: '/admin/products',  label: 'Products',  icon: <ArchiveBoxIcon className="w-4 h-4 text-blue-500" /> },
                            { href: '/admin/orders',    label: 'Orders',    icon: <ArchiveBoxIcon className="w-4 h-4 text-purple-500" /> },
                            { href: '/admin/users',     label: 'Users',     icon: <UserIcon className="w-4 h-4 text-green-500" /> },
                          ].map(l => (
                            <Link key={l.href} href={l.href} onClick={() => setShowUser(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors">
                              {l.icon} {l.label}
                            </Link>
                          ))}
                        </>
                      ) : (
                        <>
                          {[
                            { href: '/profile',  label: 'My Profile', icon: <UserIcon className="w-4 h-4 text-blue-500" /> },
                            { href: '/orders',   label: 'My Orders',  icon: <ArchiveBoxIcon className="w-4 h-4 text-purple-500" /> },
                            { href: '/wishlist', label: 'Wishlist',   icon: <HeartIcon className="w-4 h-4 text-red-400" /> },
                          ].map(l => (
                            <Link key={l.href} href={l.href} onClick={() => setShowUser(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors">
                              {l.icon} {l.label}
                            </Link>
                          ))}
                        </>
                      )}

                      <div className="border-t border-slate-100 mt-1">
                        <button onClick={() => { signOut({ callbackUrl: '/' }); setShowUser(false); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                          <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login"    className="btn btn-ghost text-white/80 hover:text-white hover:bg-white/10 text-sm">Login</Link>
                  <Link href="/register" className="btn btn-accent text-sm">Sign Up Free</Link>
                </div>
              )}

              <button onClick={() => setMobile(!mobileOpen)}
                className="md:hidden btn-icon btn-ghost text-white/80 hover:text-white hover:bg-white/10"
                aria-label="Toggle menu">
                {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Category nav */}
          <nav className="hidden md:flex items-center gap-1 pb-2.5">
            <Link href="/products" className="px-3 py-1.5 text-xs font-semibold text-white/90 hover:text-amber-400 hover:bg-white/8 rounded-lg transition-all duration-150">
              🛍️ All
            </Link>
            {NAV_CATEGORIES.map(c => (
              <Link key={c.href} href={c.href}
                className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/8 rounded-lg transition-all duration-150 whitespace-nowrap">
                {c.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-500 bg-white/10 border border-white/10 focus:border-amber-400/60 outline-none" />
            </div>
          </form>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setMobile(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl p-6 overflow-y-auto animate-slide-down" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-black text-xl text-[#0F172A]">Menu</span>
              <button onClick={() => setMobile(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1">
              {session ? (
                <>
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                    <p className="font-bold text-gray-900 text-sm">{session.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
                  </div>
                  {[
                    { href: '/profile',  label: 'My Profile' },
                    { href: '/orders',   label: 'My Orders' },
                    { href: '/cart',     label: `Cart (${cartItems})` },
                    { href: '/wishlist', label: 'Wishlist' },
                    ...(role === 'admin' ? [{ href: '/admin/dashboard', label: '⚡ Admin Panel' }] : []),
                  ].map(l => (
                    <Link key={l.href} href={l.href} onClick={() => setMobile(false)} className="admin-nav-link">{l.label}</Link>
                  ))}
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="admin-nav-link text-red-500 w-full text-left mt-2">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login"    onClick={() => setMobile(false)} className="btn-primary btn w-full mb-2">Login</Link>
                  <Link href="/register" onClick={() => setMobile(false)} className="btn-outline btn w-full">Create Account</Link>
                </>
              )}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Categories</p>
                {NAV_CATEGORIES.map(c => (
                  <Link key={c.href} href={c.href} onClick={() => setMobile(false)} className="admin-nav-link">{c.label}</Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
