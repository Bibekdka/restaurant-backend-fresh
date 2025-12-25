import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');

        // Debug: Log if MONGO_URI is set
        const mongoUri = process.env.MONGO_URI || process.env.DB_URI;
        
        if (!mongoUri) {
            console.error('❌ ERROR: MONGO_URI environment variable is not set!');
            console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('MONGO')));
        } else {
            // Mask the password for security
            const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
            console.log('✓ MONGO_URI is configured:', maskedUri);
        }

        const conn = await mongoose.connect(mongoUri || 'mongodb://localhost:27017/restaurant-app');
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📍 Database Host: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
    } catch (error: any) {
        console.error('❌ MongoDB Connection Failed!');
        console.error('💥 Error Details:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        console.error('⚠️  Please check:');
        console.error('   1. MongoDB Atlas IP whitelist (allow 0.0.0.0/0)');
        console.error('   2. Database credentials are correct');
        console.error('   3. Cluster is running and accessible');
        process.exit(1);
    }
};
