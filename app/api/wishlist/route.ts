import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ wishlist: [] });

    await connectDB();
    const userId = (session.user as { id?: string }).id;
    const user = await User.findById(userId).populate('wishlist').lean();
    return NextResponse.json({ wishlist: user?.wishlist ?? [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}
