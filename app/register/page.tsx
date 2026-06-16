'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); }
    else {
      toast.success('Account created! Please sign in.');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-card-hover">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
                <span className="text-accent font-black text-lg">S</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join millions of happy shoppers</p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-danger/10 text-danger text-sm rounded-lg border border-danger/20">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                placeholder="John Doe" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange} placeholder="Min 6 characters"
                  required className="input pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password">
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" name="confirm" type="password" value={form.confirm} onChange={handleChange}
                placeholder="Re-enter password" required className="input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
