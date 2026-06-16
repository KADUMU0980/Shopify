import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import slugify from 'slugify';

// POST /api/admin/products/batch
// Body: { products: ProductSeed[], recommended?: boolean }
// Splits a JSON array of product objects and inserts each individually
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }

  const body = await req.json();
  const items: Record<string, unknown>[] = body.products;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Provide a non-empty "products" array' }, { status: 400 });
  }

  await connectDB();

  const results: { name: string; status: 'created' | 'error'; error?: string }[] = [];

  // Insert each product individually so one failure doesn't block others
  for (const item of items) {
    try {
      const name = String(item.name ?? '').trim();
      if (!name) throw new Error('name is required');

      const slug = slugify(name, { lower: true, strict: true });
      const price           = Number(item.price ?? item.originalPrice ?? 0);
      const discountedPrice = Number(item.discountedPrice ?? item.salePrice ?? price);

      await Product.create({
        name,
        slug,
        description:     String(item.description ?? item.desc ?? name),
        price,
        discountedPrice,
        category:        String(item.category ?? ''),
        brand:           String(item.brand ?? ''),
        stock:           Number(item.stock ?? 0),
        images:          Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
        specifications:  item.specifications ?? item.specs ?? {},
        tags:            Array.isArray(item.tags) ? item.tags : [],
        // Use item-level flag OR fall back to the batch-level flag
        recommended:     Boolean(item.recommended ?? body.recommended ?? false),
      });

      results.push({ name, status: 'created' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ name: String(item.name ?? 'unknown'), status: 'error', error: message });
    }
  }

  const created = results.filter(r => r.status === 'created').length;
  const failed  = results.filter(r => r.status === 'error').length;

  return NextResponse.json({ message: `${created} created, ${failed} failed`, results }, { status: 201 });
}
