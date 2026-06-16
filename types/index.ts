export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  wishlist: string[];
  createdAt: string;
}

export interface IProduct {
  _id: string;
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
  specifications: Record<string, string>;
  tags: string[];
  recommended: boolean;
  createdAt: string;
}

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrder {
  _id: string;
  userId: string | IUser;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'cod' | 'upi' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
}

export interface IReview {
  _id: string;
  productId: string;
  userId: string | IUser;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ICartItem {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  stock?: number;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: IOrder[];
  lowStockProducts: IProduct[];
}
