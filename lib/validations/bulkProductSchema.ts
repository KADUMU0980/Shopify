import { z } from 'zod';

export const productItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
  discountedPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  specifications: z.record(z.string(), z.string()).optional().default({}),
  tags: z.array(z.string()).optional().default([]),
  recommended: z.boolean().optional().default(false),
});

export const bulkProductSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  items: z.array(productItemSchema).min(1, 'At least one item is required'),
});

export type ProductItemInput = z.infer<typeof productItemSchema>;
export type BulkProductInput = z.infer<typeof bulkProductSchema>;
