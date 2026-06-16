import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params { params: { orderId: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const order = await Order.findById(params.orderId).populate('userId', 'name email').lean();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const userId  = (session.user as { id?: string }).id;
    const isAdmin = (session.user as { role?: string }).role === 'admin';

    // Users can only see their own orders
    if (!isAdmin && order.userId?.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
