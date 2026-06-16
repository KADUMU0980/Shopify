import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params { params: { slug: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug: params.slug }).select('_id');
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const reviews = await Review.find({ productId: product._id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Please login to submit a review' }, { status: 401 });

    await connectDB();
    const { rating, comment } = await req.json();

    if (!rating || !comment?.trim()) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
    }

    const product = await Product.findOne({ slug: params.slug });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const userId = (session.user as { id?: string }).id;

    // Upsert review (one per user per product)
    const existing = await Review.findOne({ productId: product._id, userId });
    if (existing) {
      existing.rating  = rating;
      existing.comment = comment.trim();
      await existing.save();
    } else {
      await Review.create({ productId: product._id, userId, rating, comment: comment.trim() });
    }

    // Recalculate product ratings
    const stats = await Review.aggregate([
      { $match: { productId: product._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      product.ratings    = Math.round(stats[0].avgRating * 10) / 10;
      product.numReviews = stats[0].count;
      await product.save();
    }

    return NextResponse.json({ message: 'Review submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
