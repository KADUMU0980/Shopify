'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function LoginForm() {
  const router      = useRouter();
  const searchParams= useSearchParams();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const error       = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      toast.error('Invalid email or password');
    } else {
      toast.success('Welcome back! 🎉');
      router.push(callbackUrl);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.08), transparent)' }}>
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8 shadow-[0_20px_80px_rgba(0,0,0,0.1)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.4)]"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl text-[#0F172A]">Shop<span className="gradient-text">Verse</span></span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {error === 'unauthorized' && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200 font-medium">
              ⚠️ You don&apos;t have permission to access that page.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password" className="input pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Toggle password visibility">
                  {showPass ? <EyeSlashIcon className="w-4.5 h-4.5" /> : <EyeIcon className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn btn-accent w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg> Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-amber-700 flex items-center gap-1.5 mb-2">🧪 Demo Accounts</p>
            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
              <span className="font-semibold text-slate-600">Admin:</span>
              <button onClick={() => { setEmail('admin@shopverse.com'); setPassword('admin123'); }}
                className="text-amber-600 font-bold hover:underline">Use Admin</button>
            </div>
            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
              <span className="font-semibold text-slate-600">User:</span>
              <button onClick={() => { setEmail('john@example.com'); setPassword('user123'); }}
                className="text-amber-600 font-bold hover:underline">Use User</button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-amber-500 font-bold hover:underline">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><LoginForm /></Suspense>;
}
