import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params { params: { productId: string } }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userId = (session.user as { id?: string }).id;
    const user   = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const idx = user.wishlist.findIndex((id: { toString(): string }) => id.toString() === params.productId);
    let action: string;

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      action = 'removed';
    } else {
      user.wishlist.push(params.productId);
      action = 'added';
    }

    await user.save();
    return NextResponse.json({ action, wishlist: user.wishlist });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
