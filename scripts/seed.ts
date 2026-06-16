import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

// ── Updated MongoDB URI ───────────────────────────────────────────────────────
const MONGODB_URI =
  'mongodb+srv://teja:teja_384@cluster0.w4mqvbj.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

// ── Typed shape of inserted products ─────────────────────────────────────────
interface InsertedProduct {
  _id:             mongoose.Types.ObjectId;
  name:            string;
  slug:            string;
  discountedPrice: number;
  images:          string[];
  recommended:     boolean;
}

// ── Inline schemas (avoid Next.js module-cache conflicts) ─────────────────────
const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, default: 'user' },
    wishlist: { type: [mongoose.Schema.Types.Mixed], default: [] }, // ← default prevents "missing" TS error
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true },
    slug:            { type: String, required: true, unique: true },
    description:     String,
    price:           Number,
    discountedPrice: Number,
    category:        String,
    brand:           String,
    stock:           { type: Number, default: 0 },
    images:          [String],
    ratings:         { type: Number, default: 0 },
    numReviews:      { type: Number, default: 0 },
    specifications:  { type: Map, of: String },
    tags:            [String],
    recommended:     { type: Boolean, default: false },
  },
  { timestamps: true }
);
ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

const OrderSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    items: [{
      productId: mongoose.Schema.Types.ObjectId,
      slug: String, name: String, quantity: Number, price: Number, image: String,
    }],
    shippingAddress: {
      fullName: String, phone: String, address: String,
      city: String, state: String, pincode: String, country: String,
    },
    paymentMethod:  String,
    paymentStatus:  { type: String, default: 'pending' },
    orderStatus:    { type: String, default: 'pending' },
    totalAmount:    Number,
  },
  { timestamps: true }
);

const CartSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, unique: true }, items: [] },
  { timestamps: true }
);

// Re-register models fresh each run to avoid cached-schema conflicts
function freshModel(name: string, schema: mongoose.Schema) {
  if (mongoose.modelNames().includes(name)) mongoose.deleteModel(name);
  return mongoose.model(name, schema);
}

// ── Seed Data ─────────────────────────────────────────────────────────────────
const slug = (name: string) => slugify(name, { lower: true, strict: true });

interface ProductSeed {
  name: string; category: string; brand: string;
  price: number; disc: number; stock: number;
  img: string; desc: string;
  specs: Record<string, string>;
  tags: string[];
  recommended?: boolean;
}

const PRODUCTS: ProductSeed[] = [
  // ── Electronics ──
  { name: 'Apple iPhone 15 Pro', category: 'Electronics', brand: 'Apple', price: 134900, disc: 119900, stock: 45, recommended: true,
    img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=600&q=80',
    desc: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and revolutionary camera system.',
    specs: { Display: '6.1" Super Retina XDR', Chip: 'A17 Pro', Camera: '48MP Main', Battery: 'All-day battery', Storage: '256GB' },
    tags: ['iphone', 'smartphone', '5g', 'apple'] },
  { name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', brand: 'Samsung', price: 129999, disc: 109999, stock: 30, recommended: true,
    img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
    desc: 'The ultimate Galaxy experience with built-in S Pen, 200MP camera, and Galaxy AI.',
    specs: { Display: '6.8" Dynamic AMOLED 2X', RAM: '12GB', Camera: '200MP', Battery: '5000mAh' },
    tags: ['samsung', 'android', 'spen', 'flagship'] },
  { name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', brand: 'Sony', price: 34990, disc: 27990, stock: 60, recommended: true,
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    desc: 'Industry-leading noise canceling with auto NC optimizer. Up to 30 hours battery.',
    specs: { 'Driver Unit': '30mm', 'Battery Life': '30 hours', Connection: 'Bluetooth 5.2', Weight: '250g' },
    tags: ['headphones', 'sony', 'noise-canceling', 'wireless'] },
  { name: 'Apple MacBook Air M2', category: 'Electronics', brand: 'Apple', price: 119900, disc: 109900, stock: 25, recommended: true,
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    desc: 'Supercharged by the next-generation M2 chip with redesigned MagSafe charging.',
    specs: { Chip: 'Apple M2', RAM: '8GB Unified', Storage: '256GB SSD', Display: '13.6" Liquid Retina' },
    tags: ['macbook', 'laptop', 'apple', 'm2'] },
  { name: 'OnePlus 12 5G', category: 'Electronics', brand: 'OnePlus', price: 64999, disc: 59999, stock: 40,
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    desc: 'Snapdragon 8 Gen 3, 50W wireless charging, Hasselblad camera system.',
    specs: { Chip: 'Snapdragon 8 Gen 3', RAM: '12GB', Camera: '50MP Hasselblad', Battery: '5400mAh' },
    tags: ['oneplus', 'android', '5g', 'flagship'] },
  { name: 'iPad Pro 12.9 M2', category: 'Electronics', brand: 'Apple', price: 112900, disc: 104900, stock: 20,
    img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',
    desc: 'The ultimate iPad experience with M2 chip and Liquid Retina XDR display.',
    specs: { Display: '12.9" Liquid Retina XDR', Chip: 'Apple M2', Storage: '256GB', Connectivity: 'Wi-Fi 6E' },
    tags: ['ipad', 'tablet', 'apple', 'm2'] },
  { name: 'LG OLED 55 Smart TV', category: 'Electronics', brand: 'LG', price: 109990, disc: 89990, stock: 15,
    img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80',
    desc: 'Perfect blacks. Infinite contrast. Brilliant color. The ultimate OLED TV.',
    specs: { Display: '55" OLED evo', Resolution: '4K UHD', 'Refresh Rate': '120Hz', OS: 'webOS 23' },
    tags: ['tv', 'oled', 'lg', '4k', 'smart-tv'] },
  { name: 'Bose QuietComfort 45', category: 'Electronics', brand: 'Bose', price: 29900, disc: 22900, stock: 55,
    img: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
    desc: 'Award-winning noise cancellation. 24 hours battery. Lightweight and comfortable.',
    specs: { 'Battery Life': '24 hours', Connection: 'Bluetooth 5.1', Weight: '238g', Colors: 'Black, White' },
    tags: ['headphones', 'bose', 'anc', 'wireless'] },
  // ── Fashion ──
  { name: "Levis 501 Original Jeans", category: 'Fashion', brand: "Levi's", price: 5999, disc: 4499, stock: 150, recommended: true,
    img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    desc: 'The original jean since 1873. Iconic straight fit, button fly.',
    specs: { Fit: 'Straight', Rise: 'Regular', Closure: 'Button Fly', Material: '100% Cotton' },
    tags: ['jeans', 'denim', 'casual'] },
  { name: 'Nike Air Max 270', category: 'Fashion', brand: 'Nike', price: 12995, disc: 9995, stock: 80, recommended: true,
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    desc: 'Inspired by the Air Max icons of the past, delivers visible cushioning underfoot.',
    specs: { Type: 'Lifestyle Running', Sole: 'Rubber', Closure: 'Lace-Up', Upper: 'Mesh and Synthetic' },
    tags: ['nike', 'sneakers', 'shoes', 'airmax'] },
  { name: 'Adidas Ultraboost 23', category: 'Fashion', brand: 'Adidas', price: 17999, disc: 14399, stock: 60,
    img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
    desc: 'Responsive Boost cushioning returns energy with every stride.',
    specs: { Midsole: 'Boost', Upper: 'Primeknit+', Drop: '10mm', Weight: '310g' },
    tags: ['adidas', 'sneakers', 'running', 'ultraboost'] },
  { name: 'H&M Oversized Hoodie', category: 'Fashion', brand: 'H&M', price: 2999, disc: 1999, stock: 200,
    img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
    desc: 'Relaxed, oversized fit. Soft cotton blend. Perfect for casual everyday wear.',
    specs: { Fit: 'Oversized', Material: '70% Cotton, 30% Polyester', Care: 'Machine washable' },
    tags: ['hoodie', 'casual', 'cotton', 'streetwear'] },
  { name: 'Zara Blazer', category: 'Fashion', brand: 'Zara', price: 8999, disc: 6499, stock: 45,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    desc: 'Slim-fit single-breasted blazer in wool-blend fabric.',
    specs: { Fit: 'Slim', Material: 'Wool Blend', Buttons: '2-button', Lining: 'Fully lined' },
    tags: ['blazer', 'formal', 'zara', 'office'] },
  // ── Home ──
  { name: 'Dyson V15 Detect Vacuum', category: 'Home', brand: 'Dyson', price: 59900, disc: 49900, stock: 20, recommended: true,
    img: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80',
    desc: 'Laser detects hidden dust. HEPA filtration captures allergens and bacteria.',
    specs: { Suction: '230AW', 'Run Time': '60 min', Weight: '3.1kg', Filter: 'HEPA' },
    tags: ['vacuum', 'dyson', 'cordless', 'cleaning'] },
  { name: 'Instant Pot Duo 7-in-1', category: 'Home', brand: 'Instant Pot', price: 10999, disc: 7999, stock: 75,
    img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
    desc: 'Pressure cooker, slow cooker, rice cooker, steamer, yogurt maker and warmer.',
    specs: { Capacity: '6 Quart', Functions: '7-in-1', Voltage: '110-120V', Material: 'Stainless Steel' },
    tags: ['pressure-cooker', 'kitchen', 'instant-pot'] },
  { name: 'IKEA KALLAX Shelving Unit', category: 'Home', brand: 'IKEA', price: 8999, disc: 7499, stock: 35,
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    desc: 'Versatile shelving unit. Use as room divider or store books, games, and more.',
    specs: { Dimensions: '77x77cm', Material: 'Particleboard', 'Max Load': '13kg per compartment', Color: 'White' },
    tags: ['furniture', 'ikea', 'shelf', 'storage'] },
  { name: 'Philips Hue Smart Bulb Starter Kit', category: 'Home', brand: 'Philips', price: 12990, disc: 9990, stock: 50,
    img: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&q=80',
    desc: 'Smart lighting. 16 million colors. Voice control. App control.',
    specs: { Bulbs: '4x E27', Colors: '16 million', Connectivity: 'Zigbee', Compatibility: 'Alexa, Google, Apple' },
    tags: ['smart-home', 'philips-hue', 'lighting', 'iot'] },
  // ── Books ──
  { name: 'Atomic Habits by James Clear', category: 'Books', brand: 'Penguin', price: 799, disc: 499, stock: 500, recommended: true,
    img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
    desc: '#1 New York Times bestseller. A proven framework for improving every day.',
    specs: { Pages: '320', Publisher: 'Penguin', Language: 'English', Format: 'Paperback' },
    tags: ['self-help', 'productivity', 'habits', 'bestseller'] },
  { name: 'The Psychology of Money', category: 'Books', brand: 'Jaico', price: 599, disc: 399, stock: 350, recommended: true,
    img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80',
    desc: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.',
    specs: { Pages: '256', Publisher: 'Jaico', Language: 'English', Format: 'Paperback' },
    tags: ['finance', 'money', 'investing', 'personal-finance'] },
  { name: 'Rich Dad Poor Dad', category: 'Books', brand: 'Plata Publishing', price: 599, disc: 350, stock: 400,
    img: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&q=80',
    desc: 'What the rich teach their kids about money that the poor and middle class do not.',
    specs: { Pages: '336', Language: 'English', Format: 'Paperback', Author: 'Robert Kiyosaki' },
    tags: ['finance', 'wealth', 'investing', 'classic'] },
  // ── Sports ──
  { name: 'Yonex Badminton Racket', category: 'Sports', brand: 'Yonex', price: 6499, disc: 4999, stock: 80,
    img: 'https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=600&q=80',
    desc: 'Professional grade. Isometric frame. High modulus graphite shaft.',
    specs: { Weight: '85g', Balance: 'Head Light', Shaft: 'Flexible', Frame: 'Isometric' },
    tags: ['badminton', 'yonex', 'racket', 'sports'] },
  { name: 'Decathlon Yoga Mat', category: 'Sports', brand: 'Decathlon', price: 1999, disc: 1299, stock: 150, recommended: true,
    img: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80',
    desc: 'Anti-slip, comfortable yoga mat. 5mm thickness. Ideal for all yoga types.',
    specs: { Thickness: '5mm', Dimensions: '180x60cm', Material: 'PVC', Weight: '1kg' },
    tags: ['yoga', 'fitness', 'mat', 'exercise'] },
  { name: 'Nivia Storm Football', category: 'Sports', brand: 'Nivia', price: 1499, disc: 999, stock: 120,
    img: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=600&q=80',
    desc: 'Official match football. Machine stitched. Durable rubber bladder.',
    specs: { Size: '5', Material: 'PU', Bladder: 'Rubber', Panel: '32' },
    tags: ['football', 'soccer', 'nivia', 'sports'] },
  // ── Beauty ──
  { name: "LOreal Paris Serum Foundation", category: 'Beauty', brand: "L'Oreal", price: 1499, disc: 1099, stock: 100, recommended: true,
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    desc: '24HR Foundation. SPF 25. Hyaluronic Acid. Luminous finish.',
    specs: { SPF: '25', Finish: 'Luminous', 'Skin Type': 'All Skin Types', Size: '30ml' },
    tags: ['foundation', 'makeup', 'skincare'] },
  { name: 'Lakme Eyeconic Kajal', category: 'Beauty', brand: 'Lakme', price: 299, disc: 199, stock: 300,
    img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    desc: 'Intense black. Smudge-proof. Long-lasting kohl kajal for eyes.',
    specs: { Finish: 'Matte', Duration: '12 hours', Type: 'Kohl Kajal', Size: '0.35g' },
    tags: ['kajal', 'eyes', 'makeup', 'lakme'] },
  { name: 'Forest Essentials Moisturizer', category: 'Beauty', brand: 'Forest Essentials', price: 2500, disc: 2100, stock: 60,
    img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
    desc: 'Ayurvedic lightweight moisturizer with saffron and turmeric. Daily nourishment.',
    specs: { 'Skin Type': 'All Types', Volume: '50ml', Fragrance: 'Natural', Origin: 'India' },
    tags: ['moisturizer', 'ayurvedic', 'skincare', 'natural'] },
  { name: 'WOW Vitamin C Face Wash', category: 'Beauty', brand: 'WOW', price: 599, disc: 399, stock: 200,
    img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    desc: 'Brightening face wash with Vitamin C. Removes dark spots. Glowing skin.',
    specs: { Volume: '100ml', 'Key Ingredient': 'Vitamin C', Type: 'Face Wash', 'Skin Type': 'Normal to Oily' },
    tags: ['face-wash', 'vitamin-c', 'wow', 'skincare'] },
  { name: 'Mamaearth Onion Hair Oil', category: 'Beauty', brand: 'Mamaearth', price: 399, disc: 279, stock: 250,
    img: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600&q=80',
    desc: 'With onion oil and redensyl. Reduces hair fall. Promotes hair growth.',
    specs: { Volume: '250ml', 'Key Ingredient': 'Onion Oil Redensyl', Type: 'Hair Oil' },
    tags: ['hair-oil', 'onion', 'mamaearth', 'hair-care'] },
];

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected\n');

  const User    = freshModel('User',    UserSchema);
  const Product = freshModel('Product', ProductSchema);
  const Order   = freshModel('Order',   OrderSchema);
  const Cart    = freshModel('Cart',    CartSchema);

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass  = await bcrypt.hash('user123',  12);

  // 'wishlist' gets its default [] from the schema; adding it explicitly
  // here silences the TS error about the field being "missing"
  const users = await User.insertMany([
    { name: 'Admin ShopVerse', email: 'admin@shopverse.com',      password: adminPass, role: 'admin', wishlist: [] },
    { name: 'Super Admin',     email: 'superadmin@shopverse.com', password: adminPass, role: 'admin', wishlist: [] },
    { name: 'John Doe',        email: 'john@example.com',         password: userPass,  role: 'user',  wishlist: [] },
    { name: 'Priya Sharma',    email: 'priya@example.com',        password: userPass,  role: 'user',  wishlist: [] },
    { name: 'Rahul Kumar',     email: 'rahul@example.com',        password: userPass,  role: 'user',  wishlist: [] },
    { name: 'Ananya Singh',    email: 'ananya@example.com',       password: userPass,  role: 'user',  wishlist: [] },
    { name: 'Karan Mehta',     email: 'karan@example.com',        password: userPass,  role: 'user',  wishlist: [] },
  ]);
  console.log(`👥 Created ${users.length} users`);

  // ── Products ───────────────────────────────────────────────────────────────
  // Cast to InsertedProduct[] so downstream arithmetic on .discountedPrice
  // is typed as 'number', not 'unknown'  (fixes "'+' on unknown" TS error)
  const products = (await Product.insertMany(
    PRODUCTS.map(p => ({
      name:            p.name,
      slug:            slug(p.name),
      description:     p.desc,
      price:           p.price,
      discountedPrice: p.disc,
      category:        p.category,
      brand:           p.brand,
      stock:           p.stock,
      images:          [p.img],
      ratings:         parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      numReviews:      Math.floor(10 + Math.random() * 200),
      specifications:  new Map(Object.entries(p.specs)),
      tags:            p.tags,
      recommended:     p.recommended ?? false,
    }))
  )) as unknown as InsertedProduct[];

  const recCount = products.filter(p => p.recommended).length;
  console.log(`📦 Created ${products.length} products (${recCount} recommended)`);

  // ── Carts ──────────────────────────────────────────────────────────────────
  interface UserDoc { _id: mongoose.Types.ObjectId; role: string }
  const normalUsers = (users as unknown as UserDoc[]).filter(u => u.role === 'user');

  await Cart.insertMany(
    normalUsers.map(u => ({
      userId: u._id,
      items: [
        { productId: products[0]._id, slug: products[0].slug, name: products[0].name, quantity: 1, price: products[0].discountedPrice, image: products[0].images[0] },
        { productId: products[8]._id, slug: products[8].slug, name: products[8].name, quantity: 2, price: products[8].discountedPrice, image: products[8].images[0] },
      ],
    }))
  );
  console.log(`🛒 Created ${normalUsers.length} carts`);

  // ── Orders ─────────────────────────────────────────────────────────────────
  const sampleAddress = {
    fullName: 'John Doe', phone: '9876543210', address: '123 Main Street',
    city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India',
  };

  const orders = [];
  for (let i = 0; i < 10; i++) {
    const user  = normalUsers[i % normalUsers.length];
    const prod1 = products[i % products.length];
    const prod2 = products[(i + 3) % products.length];
    // Both .discountedPrice are now typed as number ✓
    const total: number = prod1.discountedPrice + prod2.discountedPrice * 2;

    orders.push({
      userId: user._id,
      items: [
        { productId: prod1._id, slug: prod1.slug, name: prod1.name, quantity: 1, price: prod1.discountedPrice, image: prod1.images[0] },
        { productId: prod2._id, slug: prod2.slug, name: prod2.name, quantity: 2, price: prod2.discountedPrice, image: prod2.images[0] },
      ],
      shippingAddress: sampleAddress,
      paymentMethod:   ['cod', 'upi', 'card'][i % 3],
      paymentStatus:   i < 7 ? 'paid' : 'pending',
      orderStatus:     ORDER_STATUSES[i % ORDER_STATUSES.length],
      totalAmount:     total,
    });
  }
  await Order.insertMany(orders);
  console.log(`📋 Created ${orders.length} orders`);

  console.log('\n🎉 Seed complete!');
  console.log('─'.repeat(48));
  console.log('  DB:    ecommerce (new URI)');
  console.log('  Admin: admin@shopverse.com / admin123');
  console.log('  User:  john@example.com   / user123');
  console.log('─'.repeat(48));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err?.message ?? err);
  process.exit(1);
});
