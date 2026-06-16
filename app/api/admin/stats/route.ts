import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [totalUsers, totalProducts, ordersData, lowStock, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } },
      ]),
      Product.find({ stock: { $lt: 10 } }).select('name slug stock images').limit(10).lean(),
      Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders:  ordersData[0]?.totalOrders  ?? 0,
      totalRevenue: ordersData[0]?.totalRevenue ?? 0,
      lowStockProducts: lowStock,
      recentOrders,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
