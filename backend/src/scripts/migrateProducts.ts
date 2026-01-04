import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Product } from '../models/Product';
import { User } from '../models/User';

// Load env vars
// const envPath = path.resolve(__dirname, '../../.env');
// console.log(`Loading .env from: ${envPath}`);
// dotenv.config({ path: envPath });

const DB_URI = "mongodb+srv://restaurantapp:Restaurant2025@cluster0.nb8v4kn.mongodb.net/restaurant-app?retryWrites=true&w=majority&appName=Cluster0";

const migrate = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('Connected to MongoDB');

        // Get Admin User
        const adminEmail = 'bibekdeka97@gmail.com';
        let adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            console.log(`Admin user ${adminEmail} not found. Searching for any admin...`);
            adminUser = await User.findOne({ role: 'admin' });
        }

        if (!adminUser) {
            console.error('No admin user found. Cannot migrate products without a user owner.');
            process.exit(1);
        }

        console.log(`Using Admin User: ${adminUser.name} (${adminUser._id})`);

        const products = await Product.find({});
        console.log(`Found ${products.length} products to check.`);

        let updatedCount = 0;

        for (const product of products) {
            let needsSave = false;

            // 1. Set User
            if (!product.user) {
                product.user = adminUser._id;
                needsSave = true;
                console.log(`- Product "${product.name}": Set user to admin.`);
            }

            // 2. Set Image (string) from Images array
            if (!product.image) {
                if (product.images && product.images.length > 0) {
                    product.image = product.images[0].url;
                    needsSave = true;
                    console.log(`- Product "${product.name}": Set image from images[0].`);
                } else {
                    // Placeholder if absolutely no image
                    product.image = 'https://placehold.co/600x400';
                    needsSave = true;
                    console.log(`- Product "${product.name}": Set placeholder image.`);
                }
            }

            // 3. Ensure Category
            if (!product.category) {
                product.category = 'Main';
                needsSave = true;
                console.log(`- Product "${product.name}": Set default category.`);
            }

            // 4. Ensure Description
            if (!product.description) {
                product.description = 'Delicious food item.';
                needsSave = true;
                console.log(`- Product "${product.name}": Set default description.`);
            }

            if (needsSave) {
                await product.save();
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
