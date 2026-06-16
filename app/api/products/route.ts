import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page     = parseInt(searchParams.get('page') ?? '1');
    const limit    = parseInt(searchParams.get('limit') ?? '12');
    const search   = searchParams.get('search') ?? '';
    const category = searchParams.get('category') ?? '';
    const brand    = searchParams.get('brand') ?? '';
    const minPrice = parseFloat(searchParams.get('minPrice') ?? '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') ?? '999999');
    const minRating= parseFloat(searchParams.get('minRating') ?? '0');
    const inStock  = searchParams.get('inStock') === 'true';
    const sort     = searchParams.get('sort') ?? 'newest';

    // Build query
    const query: Record<string, unknown> = {
      discountedPrice: { $gte: minPrice, $lte: maxPrice },
    };

    if (search)   query.$text = { $search: search };
    if (category) query.category = category;
    if (brand)    query.brand = brand;
    if (minRating > 0) query.ratings = { $gte: minRating };
    if (inStock)  query.stock = { $gt: 0 };

    // Sort
    let sortQuery: Record<string, unknown> = { createdAt: -1 };
    if (sort === 'price-asc')  sortQuery = { discountedPrice: 1 };
    if (sort === 'price-desc') sortQuery = { discountedPrice: -1 };
    if (sort === 'rating')     sortQuery = { ratings: -1 };
    if (search)                sortQuery = { score: { $meta: 'textScore' }, ...sortQuery };

    const skip  = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get unique categories and brands for filter UI
    const categories = await Product.distinct('category');
    const brands     = await Product.distinct('brand');

    return NextResponse.json({
      data: products,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      categories,
      brands,
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Auto-generate slug if not provided
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    }

    // Check uniqueness
    const exists = await Product.findOne({
      $or: [{ slug: body.slug }, { name: body.name, brand: body.brand }],
    });
    if (exists) {
      return NextResponse.json({ error: 'A product with this name/brand or slug already exists' }, { status: 409 });
    }

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
