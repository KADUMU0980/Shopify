import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import { bulkProductSchema } from '@/lib/validations/bulkProductSchema';
import slugify from 'slugify';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    
    // Validate the incoming JSON
    const parsedData = bulkProductSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { category, items } = parsedData.data;

    // Prepare bulkWrite operations
    const bulkOps: any = items.map((item) => {
      // Create a base slug
      const baseSlug = slugify(`${item.name} ${item.brand}`, { lower: true, strict: true });
      // In a real-world scenario with massive concurrency, you might want to append a random string
      // or check for existing slugs. For this implementation, we assume name+brand is unique.
      const finalSlug = baseSlug;

      return {
        updateOne: {
          filter: { name: item.name, brand: item.brand },
          update: {
            $set: {
              ...item,
              category, // Force the category from the wrapper
              slug: finalSlug,
            },
          },
          upsert: true, // Insert if it doesn't exist, update if it does
        },
      };
    });

    // Execute bulkWrite
    // ordered: false allows parallel execution and doesn't stop on a single error
    const result = await Product.bulkWrite(bulkOps, { ordered: false });

    return NextResponse.json(
      {
        message: 'Bulk operation completed successfully',
        insertedCount: result.upsertedCount,
        updatedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Bulk API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    if (!category) {
       return NextResponse.json({ error: 'Category is required for bulk deletion' }, { status: 400 });
    }

    const result = await Product.deleteMany({ category });

    return NextResponse.json(
      { message: `Successfully deleted products in category: ${category}`, deletedCount: result.deletedCount },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Bulk Delete Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
