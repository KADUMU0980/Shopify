'use client';

import Link from 'next/link';

const LINKS = {
  Company: [{ l: 'About Us', h: '#' }, { l: 'Careers', h: '#' }, { l: 'Blog', h: '#' }, { l: 'Press', h: '#' }],
  Support: [{ l: 'Help Center', h: '#' }, { l: 'Contact Us', h: '#' }, { l: 'Returns & Refunds', h: '#' }, { l: 'Track Order', h: '#' }],
  Legal:   [{ l: 'Privacy Policy', h: '#' }, { l: 'Terms of Service', h: '#' }, { l: 'Cookie Policy', h: '#' }],
  Shop:    [{ l: 'All Products', h: '/products' }, { l: 'Electronics', h: '/products?category=Electronics' }, { l: 'Fashion', h: '/products?category=Fashion' }, { l: 'Home & Living', h: '/products?category=Home' }],
};

const PAYMENTS = ['💳 Visa', '💳 Mastercard', '📱 UPI', '💵 COD'];

export default function Footer() {
  return (
    <footer className="bg-[#070e1c] text-white mt-16 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 blur-3xl bg-amber-500/5 rounded-full -translate-y-1/2" />

      <div className="page-container pt-12 pb-8 relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                <span className="font-black text-white text-sm">S</span>
              </div>
              <span className="font-black text-xl">Shop<span className="text-amber-400">Verse</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-[220px]">
              Your one-stop premium shopping destination. Quality products, real deals.
            </p>

            {/* Social */}
            <div className="flex gap-2.5">
              {[
                { label: 'Twitter',   icon: '𝕏' },
                { label: 'Instagram', icon: '📸' },
                { label: 'Facebook',  icon: 'f' },
                { label: 'YouTube',   icon: '▶' },
              ].map(s => (
                <a key={s.label} href="#" aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center text-slate-500 transition-all duration-200 text-sm border border-white/5 hover:border-amber-500/30">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.l}>
                    <Link href={link.h} className="text-slate-500 text-sm hover:text-amber-400 transition-colors duration-150 font-medium">
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-white/3 rounded-2xl border border-white/5">
            <div>
              <h4 className="font-bold text-white mb-1">Get exclusive deals in your inbox</h4>
              <p className="text-sm text-slate-500">Join 50,000+ savvy shoppers. Unsubscribe any time.</p>
            </div>
            <form className="flex gap-2 w-full sm:w-auto" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="your@email.com" aria-label="Email"
                className="flex-1 sm:w-56 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:border-amber-400/50 focus:outline-none transition-colors" />
              <button type="submit" className="btn btn-accent whitespace-nowrap text-sm">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} ShopVerse Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {PAYMENTS.map(p => (
              <span key={p} className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 text-slate-500 text-[10px] font-medium">{p}</span>
            ))}
          </div>
          <p>Made with ❤️ in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
