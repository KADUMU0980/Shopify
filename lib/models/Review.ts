import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReviewDocument extends Document {
  productId: mongoose.Types.ObjectId;
  userId:    mongoose.Types.ObjectId;
  rating:    number;
  comment:   string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true, trim: true, minlength: 10 },
  },
  { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review: Model<IReviewDocument> =
  mongoose.models.Review ?? mongoose.model<IReviewDocument>('Review', ReviewSchema);

export default Review;
