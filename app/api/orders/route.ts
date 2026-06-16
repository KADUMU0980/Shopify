import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userId = (session.user as { id?: string }).id;
    const isAdmin = (session.user as { role?: string }).role === 'admin';

    const page  = parseInt(new URL(req.url).searchParams.get('page') ?? '1');
    const limit = 10;
    const query = isAdmin ? {} : { userId };

    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ data: orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userId = (session.user as { id?: string }).id;
    const body   = await req.json();

    const { items, shippingAddress, paymentMethod, totalAmount } = body;

    if (!items?.length || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    const order = await Order.create({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'pending',
    });

    // Clear cart after order placed
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
