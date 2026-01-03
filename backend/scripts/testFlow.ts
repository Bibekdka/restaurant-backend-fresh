import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const DB_URI = process.env.DB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-app';

async function run() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(DB_URI);
    console.log('Connected');

    const User = (await import('../src/models/User')).User;
    const Product = (await import('../src/models/Product')).Product;
    const Order = (await import('../src/models/Order')).Order;

    // Cleanup test user if exists
    const testEmail = 'test+flow@example.com';
    await User.deleteOne({ email: testEmail });

    // Find a product
    const product = await Product.findOne();
    if (!product) {
      console.error('No products in DB to use for test');
      process.exit(1);
    }

    // Create user (register)
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('password123', salt);
    const user = await User.create({ name: 'Test Flow', email: testEmail, password: hashed, role: 'user' });
    console.log('Created user', user._id.toString());

    // Create order
    const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60';
    const orderData = {
      orderItems: [
        {
          name: product.name,
          qty: 2,
          image: product.image || (product.images && product.images[0]?.url) || fallbackImage,
          price: product.price,
          product: product._id,
        }
      ],
      user: user._id,
      shippingAddress: { address: '123 Test St', city: 'Testville', postalCode: '12345', country: 'Testland' },
      paymentMethod: 'Cash on Delivery',
      itemsPrice: product.price * 2,
      taxPrice: (product.price * 2) * 0.15,
      shippingPrice: 10,
      totalPrice: (product.price * 2) * 1.15 + 10,
    } as any;

    const createdOrder = await Order.create(orderData);
    console.log('Created order', createdOrder._id.toString());

    // Fetch my orders
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    console.log('Fetched orders for user:', orders.length);
    orders.forEach(o => {
      console.log('-', o._id.toString(), 'total:', o.totalPrice);
    });

    // Cleanup created test data (optional)
    // await Order.deleteOne({ _id: createdOrder._id });
    // await User.deleteOne({ _id: user._id });

    console.log('Test flow completed');
    process.exit(0);
  } catch (e: any) {
    console.error('Error in test flow:', e);
    process.exit(2);
  }
}

run();
