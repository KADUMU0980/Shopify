import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params { params: { orderId: string } }

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { orderStatus } = await req.json();

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      params.orderId,
      {
        orderStatus,
        ...(orderStatus === 'delivered' ? { paymentStatus: 'paid' } : {}),
      },
      { new: true }
    );

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
