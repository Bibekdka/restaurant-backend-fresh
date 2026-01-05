import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Product } from './models/Product';
import { User } from './models/User';

// Load env vars
dotenv.config();

const DB_URI = process.env.DB_URI || "mongodb+srv://restaurantapp:Restaurant2025@cluster0.nb8v4kn.mongodb.net/restaurant-app?retryWrites=true&w=majority&appName=Cluster0";

const SAMPLE_FOODS = [
    {
        name: 'Truffle Mushroom Burger',
        description: 'Juicy beef patty topped with truffle oil, sautéed mushrooms, and swiss cheese.',
        price: 18.99,
        category: 'Main',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        numReviews: 12,
        countInStock: 20
    },
    {
        name: 'Lobster Ravioli',
        description: 'Handmade ravioli stuffed with fresh lobster meat in a creamy tomato sauce.',
        price: 24.50,
        category: 'Main',
        image: 'https://images.unsplash.com/photo-1551183053-bf91b1d3116c?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        numReviews: 8,
        countInStock: 15
    },
    {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce, parmesan cheese, croutons, and our signature Caesar dressing.',
        price: 12.99,
        category: 'Starter',
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        numReviews: 25,
        countInStock: 50
    },
    {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
        price: 9.99,
        category: 'Dessert',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        numReviews: 40,
        countInStock: 30
    },
    {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon grilled to perfection, served with asparagus and lemon butter source.',
        price: 22.99,
        category: 'Main',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        numReviews: 18,
        countInStock: 10
    }
];

const seedFoods = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');

        // Find admin user to assign ownership
        const adminEmail = 'bibekdeka97@gmail.com';
        let adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            console.log(`Admin user ${adminEmail} not found. Searching for any admin...`);
            adminUser = await User.findOne({ role: 'admin' });
        }

        if (!adminUser) {
            console.error('No admin user found. Please run seed-admin.ts first.');
            process.exit(1);
        }

        console.log(`Using Admin Author: ${adminUser.name}`);

        // Check if products exist
        const count = await Product.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} products. Skipping seed.`);
            process.exit(0);
        }

        console.log('Seeding products...');

        const productsWithUser = SAMPLE_FOODS.map(food => ({
            ...food,
            user: adminUser?._id,
            images: [{ url: food.image }] // Populate images array too
        }));

        await Product.insertMany(productsWithUser);
        console.log(`Successfully seeded ${productsWithUser.length} sample food items.`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding foods:', error);
        process.exit(1);
    }
};

seedFoods();
