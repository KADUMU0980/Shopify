'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CloudArrowUpIcon, CheckCircleIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ImportResult {
  name: string;
  status: 'created' | 'error';
  error?: string;
}

const EXAMPLE_JSON = `[
  {
    "name": "Sony Alpha A7 IV Camera",
    "description": "Full-frame mirrorless camera with 33MP sensor.",
    "category": "Electronics",
    "brand": "Sony",
    "price": 249990,
    "discountedPrice": 219990,
    "stock": 10,
    "images": ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600"],
    "tags": ["camera", "mirrorless", "sony"],
    "recommended": true
  },
  {
    "name": "Canon EOS R6 Mark II",
    "description": "Advanced full-frame mirrorless with 40fps burst shooting.",
    "category": "Electronics",
    "brand": "Canon",
    "price": 279990,
    "discountedPrice": 249990,
    "stock": 8,
    "images": ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600"],
    "tags": ["camera", "mirrorless", "canon"],
    "recommended": false
  }
]`;

export default function BatchUploadPage() {
  const router = useRouter();
  const [json,        setJson]        = useState('');
  const [recommended, setRecommended] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [results,     setResults]     = useState<ImportResult[] | null>(null);
  const [parseError,  setParseError]  = useState('');

  const validateJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) return 'Input must be a JSON array [ ... ]';
      if (parsed.length === 0)   return 'Array is empty — add at least one product';
      setParseError('');
      return null;
    } catch (e) {
      return `Invalid JSON: ${(e as Error).message}`;
    }
  };

  const handleChange = (val: string) => {
    setJson(val);
    if (val.trim()) setParseError(validateJSON(val) ?? '');
    else setParseError('');
  };

  const handleSubmit = async () => {
    const err = validateJSON(json);
    if (err) { setParseError(err); return; }

    setLoading(true);
    setResults(null);

    try {
      const products = JSON.parse(json);
      const res = await fetch('/api/admin/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, recommended }),
      });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error ?? 'Upload failed'); return; }

      setResults(data.results);
      const created = data.results.filter((r: ImportResult) => r.status === 'created').length;
      const failed  = data.results.filter((r: ImportResult) => r.status === 'error').length;

      if (created > 0) toast.success(`✅ ${created} product${created !== 1 ? 's' : ''} imported!`);
      if (failed  > 0) toast.error(`⚠️ ${failed} product${failed !== 1 ? 's' : ''} failed`);
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const allCreated  = results?.every(r => r.status === 'created');
  const parsePreview = (() => { try { return JSON.parse(json); } catch { return null; } })();

  return (
    <div className="page-container py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CloudArrowUpIcon className="w-7 h-7 text-accent" />
            Batch Product Import
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Paste a JSON array of products — each object is saved individually
          </p>
        </div>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm">← Back</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">JSON Input</h2>
              <button
                onClick={() => { setJson(EXAMPLE_JSON); setParseError(''); }}
                className="btn btn-ghost btn-sm text-accent">
                Load Example
              </button>
            </div>

            <textarea
              value={json}
              onChange={e => handleChange(e.target.value)}
              className={`w-full h-80 rounded-xl border font-mono text-xs p-4 resize-none focus:outline-none transition-all ${
                parseError
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-200 bg-slate-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
              }`}
              placeholder={`Paste your JSON array here...\n\nExample:\n[\n  {\n    "name": "Product Name",\n    "category": "Electronics",\n    "brand": "Brand",\n    "price": 9999,\n    "discountedPrice": 8999,\n    "stock": 50,\n    "images": ["https://..."],\n    "tags": ["tag1", "tag2"],\n    "recommended": true\n  }\n]`}
              spellCheck={false}
            />

            {parseError && (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 font-medium">
                <XCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {parseError}
              </div>
            )}

            {!parseError && parsePreview && Array.isArray(parsePreview) && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 font-semibold">
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                Valid JSON — {parsePreview.length} product{parsePreview.length !== 1 ? 's' : ''} detected
              </div>
            )}
          </div>

          {/* Preview table */}
          {parsePreview && Array.isArray(parsePreview) && parsePreview.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Preview ({parsePreview.length} items)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table text-xs">
                  <thead>
                    <tr>
                      <th className="th">#</th>
                      <th className="th">Name</th>
                      <th className="th">Category</th>
                      <th className="th">Brand</th>
                      <th className="th">Price</th>
                      <th className="th">Stock</th>
                      <th className="th">Recommended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsePreview.map((p: Record<string, unknown>, i: number) => (
                      <tr key={i} className="tr-hover">
                        <td className="td text-slate-400 font-mono">{i + 1}</td>
                        <td className="td font-semibold text-gray-800 max-w-[160px] truncate">{String(p.name ?? '—')}</td>
                        <td className="td">{String(p.category ?? '—')}</td>
                        <td className="td">{String(p.brand ?? '—')}</td>
                        <td className="td font-semibold">
                          {p.discountedPrice || p.price
                            ? `₹${Number(p.discountedPrice ?? p.price).toLocaleString('en-IN')}`
                            : '—'}
                        </td>
                        <td className="td">{String(p.stock ?? '—')}</td>
                        <td className="td">
                          {(p.recommended ?? recommended)
                            ? <span className="badge badge-accent">⭐ Yes</span>
                            : <span className="badge badge-brand">No</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right — options + results */}
        <div className="space-y-4">
          {/* Upload Options */}
          <div className="card p-5 space-y-5">
            <h2 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-3">Upload Options</h2>

            {/* Batch Recommended toggle */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4 text-amber-500" />
                    Batch Recommended
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mark all items as recommended if they don&apos;t have their own flag
                  </p>
                </div>
                <button
                  onClick={() => setRecommended(!recommended)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    recommended ? 'bg-amber-400' : 'bg-slate-200'
                  }`}
                  aria-label="Toggle recommended"
                  role="switch"
                  aria-checked={recommended}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    recommended ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <p className={`text-xs font-bold mt-2 ${recommended ? 'text-amber-600' : 'text-slate-400'}`}>
                {recommended ? '⭐ ON — items will appear in Recommended section' : 'OFF — use per-item "recommended" field'}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !json.trim() || !!parseError}
              className="btn btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Importing...
                </span>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4" />
                  Import {parsePreview && Array.isArray(parsePreview) ? `${parsePreview.length} Products` : 'Products'}
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="card p-5">
              <h3 className={`font-bold text-sm mb-4 flex items-center gap-2 ${allCreated ? 'text-emerald-700' : 'text-orange-600'}`}>
                {allCreated
                  ? <><CheckCircleIcon className="w-4 h-4" /> All Imported Successfully</>
                  : <><XCircleIcon className="w-4 h-4" /> Import Complete with Errors</>
                }
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {results.map((r, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs ${
                    r.status === 'created'
                      ? 'bg-emerald-50 border border-emerald-100'
                      : 'bg-red-50 border border-red-100'
                  }`}>
                    {r.status === 'created'
                      ? <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      : <XCircleIcon    className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    }
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${r.status === 'created' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {r.name}
                      </p>
                      {r.error && <p className="text-red-500 mt-0.5 break-words">{r.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {allCreated && (
                <button onClick={() => router.push('/admin/products')}
                  className="btn btn-primary w-full mt-4 text-sm">
                  View Products →
                </button>
              )}
            </div>
          )}

          {/* Help card */}
          <div className="card p-5 bg-slate-50 border-slate-200">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Supported Fields</h3>
            <div className="space-y-1.5 text-xs text-slate-500">
              {[
                { field: 'name',             req: true  },
                { field: 'category',         req: true  },
                { field: 'brand',            req: true  },
                { field: 'price',            req: true  },
                { field: 'discountedPrice',  req: false },
                { field: 'stock',            req: false },
                { field: 'description',      req: false },
                { field: 'images[]',         req: false },
                { field: 'tags[]',           req: false },
                { field: 'specifications{}', req: false },
                { field: 'recommended',      req: false },
              ].map(f => (
                <div key={f.field} className="flex items-center justify-between">
                  <span className="font-mono text-slate-700">{f.field}</span>
                  <span className={`badge text-[10px] ${f.req ? 'badge-danger' : 'badge-brand'}`}>
                    {f.req ? 'required' : 'optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
