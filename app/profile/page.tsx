'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setForm({ name: session.user.name ?? '', email: session.user.email ?? '' });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In a real app, call PATCH /api/user/profile
    await new Promise(r => setTimeout(r, 800));
    toast.success('Profile updated!');
    setLoading(false);
  };

  const user = session?.user as { id?: string; role?: string } & typeof session.user;

  return (
    <div className="page-container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile header */}
      <div className="card p-6 mb-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-[0_8px_24px_rgba(245,158,11,0.4)]"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
          {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{session?.user?.name}</h2>
          <p className="text-slate-500 text-sm">{session?.user?.email}</p>
          <span className={`inline-block mt-2 badge ${user?.role === 'admin' ? 'badge-accent' : 'badge-blue'}`}>
            {user?.role ?? 'user'}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 text-base mb-5 border-b border-slate-100 pb-3">Edit Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input className="input bg-slate-50 text-slate-500 cursor-not-allowed" value={form.email} disabled />
            <p className="error-text mt-1 text-slate-400">Email cannot be changed after registration.</p>
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="Leave blank to keep current" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-accent">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
        {[
          { label: '📦 My Orders',  href: '/orders' },
          { label: '❤️ Wishlist',   href: '/wishlist' },
          { label: '🛒 Cart',       href: '/cart' },
        ].map(l => (
          <a key={l.label} href={l.href}
            className="card p-4 text-center text-sm font-semibold text-gray-700 hover:bg-slate-50 hover:shadow-md transition-all">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
