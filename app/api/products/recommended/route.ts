import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';

// GET /api/products/recommended — returns all recommended products
export async function GET() {
  await connectDB();
  const products = await Product.find({ recommended: true })
    .sort({ ratings: -1 })
    .limit(20)
    .lean();
  return NextResponse.json(products);
}

// PATCH /api/products/recommended — toggle recommended flag (admin only)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, recommended } = await req.json();
  if (!productId || typeof recommended !== 'boolean') {
    return NextResponse.json({ error: 'productId and recommended (boolean) required' }, { status: 400 });
  }

  await connectDB();
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: { recommended } },
    { new: true }
  ).lean();

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ success: true, product });
}
