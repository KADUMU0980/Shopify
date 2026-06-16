import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  ratings: number;
  numReviews: number;
  specifications: Map<string, string>;
  tags: string[];
  recommended: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name:            { type: String, required: true, trim: true },
    slug:            { type: String, required: true, unique: true, lowercase: true },
    description:     { type: String, required: true },
    price:           { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, required: true, min: 0 },
    category:        { type: String, required: true, trim: true },
    brand:           { type: String, required: true, trim: true },
    stock:           { type: Number, required: true, min: 0, default: 0 },
    images:          [{ type: String }],
    ratings:         { type: Number, default: 0, min: 0, max: 5 },
    numReviews:      { type: Number, default: 0 },
    specifications:  { type: Map, of: String, default: {} },
    tags:            [{ type: String }],
    recommended:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index for full-text search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
// Compound unique index to prevent duplicate name+brand combinations
ProductSchema.index({ name: 1, brand: 1 }, { unique: true });

const Product: Model<IProductDocument> =
  mongoose.models.Product ?? mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
