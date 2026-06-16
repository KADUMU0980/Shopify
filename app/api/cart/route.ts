import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/lib/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ items: [] });

    await connectDB();
    const userId = (session.user as { id?: string }).id;
    let cart = await Cart.findOne({ userId }).lean();
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    return NextResponse.json(cart);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userId = (session.user as { id?: string }).id;
    const item   = await req.json();

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = cart.items as any[];
    const existing = items.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (i: any) => i.productId.toString() === item.productId
    );
    if (existing) {
      existing.quantity += item.quantity ?? 1;
    } else {
      cart.items.push(item);
    }

    await cart.save();
    return NextResponse.json(cart);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userId = (session.user as { id?: string }).id;
    await Cart.findOneAndUpdate({ userId }, { items: [] });
    return NextResponse.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
