import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/lib/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params { params: { itemId: string } }

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userId = (session.user as { id?: string }).id;
    const { quantity } = await req.json();

    const cart = await Cart.findOne({ userId });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const item = cart.items.id(params.itemId);
    if (!item) return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });

    if (quantity <= 0) {
      cart.items.pull(params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    return NextResponse.json(cart);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userId = (session.user as { id?: string }).id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    cart.items.pull(params.itemId);
    await cart.save();
    return NextResponse.json(cart);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}
