import mongoose, { Document, Model, Schema } from 'mongoose';

const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  slug:      { type: String, required: true },
  name:      { type: String, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  price:     { type: Number, required: true },
  image:     { type: String, required: true },
}, { _id: true });

export interface ICartDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items:  typeof CartItemSchema[];
}

const CartSchema = new Schema<ICartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items:  [CartItemSchema],
  },
  { timestamps: true }
);

const Cart: Model<ICartDocument> =
  mongoose.models.Cart ?? mongoose.model<ICartDocument>('Cart', CartSchema);

export default Cart;
