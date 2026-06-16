import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Cart from '@/lib/models/Cart';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).lean();

    // Get cart snapshots for all users
    const carts  = await Cart.find({ userId: { $in: users.map(u => u._id) } })
      .populate('items.productId', 'name images price')
      .lean();

    // Get last order per user
    const orders = await Order.find({ userId: { $in: users.map(u => u._id) } })
      .sort({ createdAt: -1 })
      .lean();

    const cartMap:  Record<string, unknown>   = {};
    const orderMap: Record<string, unknown[]> = {};

    carts.forEach(c  => { cartMap[c.userId.toString()]  = c.items; });
    orders.forEach(o => {
      const uid = o.userId.toString();
      if (!orderMap[uid]) orderMap[uid] = [];
      if ((orderMap[uid] as unknown[]).length < 3) (orderMap[uid] as unknown[]).push(o);
    });

    const enriched = users.map(u => ({
      ...u,
      cartItems:   cartMap[u._id.toString()]  ?? [],
      recentOrders: orderMap[u._id.toString()] ?? [],
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
