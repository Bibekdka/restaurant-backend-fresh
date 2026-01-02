import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/User';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.DB_URI as string);
        console.log('Connected to MongoDB');

        const adminEmail = 'bibekdeka97@gmail.com';
        const adminPassword = '2345678'; // Wait, user said 12345678. I will use the user request.
        // User request: "password u ca keep 12345678"

        // Check if user exists
        const existingUser = await User.findOne({ email: adminEmail });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345678', salt);

        if (existingUser) {
            existingUser.password = hashedPassword;
            existingUser.role = 'admin';
            existingUser.name = 'Admin User';
            await existingUser.save();
            console.log('Admin user updated successfully');
        } else {
            const newUser = new User({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                preferences: { dietary: [], cuisines: [] }
            });
            await newUser.save();
            console.log('Admin user created successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
