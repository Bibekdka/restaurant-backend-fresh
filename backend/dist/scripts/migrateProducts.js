"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
// Load env vars
// const envPath = path.resolve(__dirname, '../../.env');
// console.log(`Loading .env from: ${envPath}`);
// dotenv.config({ path: envPath });
const DB_URI = "mongodb+srv://restaurantapp:Restaurant2025@cluster0.nb8v4kn.mongodb.net/restaurant-app?retryWrites=true&w=majority&appName=Cluster0";
const migrate = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(DB_URI);
        console.log('Connected to MongoDB');
        // Get Admin User
        const adminEmail = 'bibekdeka97@gmail.com';
        let adminUser = yield User_1.User.findOne({ email: adminEmail });
        if (!adminUser) {
            console.log(`Admin user ${adminEmail} not found. Searching for any admin...`);
            adminUser = yield User_1.User.findOne({ role: 'admin' });
        }
        if (!adminUser) {
            console.error('No admin user found. Cannot migrate products without a user owner.');
            process.exit(1);
        }
        console.log(`Using Admin User: ${adminUser.name} (${adminUser._id})`);
        const products = yield Product_1.Product.find({});
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
                }
                else {
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
                yield product.save();
                updatedCount++;
            }
        }
        console.log(`Migration complete. Updated ${updatedCount} products.`);
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
});
migrate();
