import mongoose, { Document, Model, Schema } from 'mongoose';

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  slug:      { type: String, required: true },
  name:      { type: String, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  price:     { type: Number, required: true },
  image:     { type: String, required: true },
}, { _id: false });

const ShippingAddressSchema = new Schema({
  fullName: { type: String, required: true },
  phone:    { type: String, required: true },
  address:  { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  country:  { type: String, default: 'India' },
}, { _id: false });

export interface IOrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: typeof OrderItemSchema[];
  shippingAddress: typeof ShippingAddressSchema;
  paymentMethod: 'cod' | 'upi' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items:           [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentMethod:   { type: String, enum: ['cod', 'upi', 'card'], required: true },
    paymentStatus:   { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus:     {
      type:    String,
      enum:    ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Order: Model<IOrderDocument> =
  mongoose.models.Order ?? mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
