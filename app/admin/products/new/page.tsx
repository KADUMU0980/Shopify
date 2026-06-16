'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { generateSlug } from '@/lib/utils';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive'];

interface Spec { key: string; value: string }

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category: '', brand: '',
    price: '', discountedPrice: '', stock: '', images: '', tags: '',
  });
  const [specs, setSpecs] = useState<Spec[]>([{ key: '', value: '' }]);

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: generateSlug(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price:           parseFloat(form.price),
        discountedPrice: parseFloat(form.discountedPrice),
        stock:           parseInt(form.stock),
        images:          form.images.split('\n').map(s => s.trim()).filter(Boolean),
        tags:            form.tags.split(',').map(s => s.trim()).filter(Boolean),
        specifications:  Object.fromEntries(specs.filter(s => s.key).map(s => [s.key, s.value])),
      };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); }
      else { toast.success('Product created!'); router.push('/admin/products'); }
    } finally { setLoading(false); }
  };

  const addSpec  = () => setSpecs(s => [...s, { key: '', value: '' }]);
  const removeSpec = (i: number) => setSpecs(s => s.filter((_, j) => j !== i));
  const updateSpec = (i: number, field: 'key' | 'value', val: string) =>
    setSpecs(s => s.map((sp, j) => j === i ? { ...sp, [field]: val } : sp));

  return (
    <div className="page-container py-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn-ghost btn-sm">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-slate-100 pb-3">Basic Information</h2>
          <div>
            <label className="label">Product Name *</label>
            <input className="input" value={form.name} onChange={e => handleNameChange(e.target.value)} required placeholder="e.g. Apple iPhone 15 Pro" />
          </div>
          <div>
            <label className="label">Slug (auto-generated)</label>
            <input className="input bg-slate-50 text-slate-500" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="apple-iphone-15-pro" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Brand *</label>
              <input className="input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required placeholder="Apple" />
            </div>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input h-28 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Detailed product description..." />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-slate-100 pb-3">Pricing & Inventory</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Original Price (₹) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="29999" />
            </div>
            <div>
              <label className="label">Discounted Price (₹) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.discountedPrice} onChange={e => setForm(f => ({ ...f, discountedPrice: e.target.value }))} required placeholder="24999" />
            </div>
            <div>
              <label className="label">Stock *</label>
              <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required placeholder="50" />
            </div>
          </div>
          {form.price && form.discountedPrice && parseFloat(form.price) > parseFloat(form.discountedPrice) && (
            <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-2 rounded-lg">
              ✅ Discount: {Math.round(((parseFloat(form.price) - parseFloat(form.discountedPrice)) / parseFloat(form.price)) * 100)}% off
            </p>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-slate-100 pb-3">Images & Tags</h2>
          <div>
            <label className="label">Image URLs (one per line)</label>
            <textarea className="input h-24 resize-none font-mono text-xs" value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://images.unsplash.com/..." />
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input className="input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="smartphone, apple, 5g" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-gray-900 text-base">Specifications</h2>
            <button type="button" onClick={addSpec} className="btn-ghost btn-sm flex items-center gap-1">
              <PlusIcon className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input className="input flex-1" placeholder="e.g. RAM" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} />
              <input className="input flex-1" placeholder="e.g. 8GB" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
              <button type="button" onClick={() => removeSpec(i)} className="btn-icon btn-ghost text-red-400 hover:bg-red-50 flex-shrink-0">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-accent flex-1">
            {loading ? 'Creating...' : '✓ Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
