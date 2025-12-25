import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';

console.log('🚀 Starting Restaurant Backend Server...');
console.log('================================================');

dotenv.config();
console.log('✓ Environment variables loaded');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
console.log(`✓ Server will run on port: ${PORT}`);
console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || '*'}`);
console.log('================================================');

// Middleware
console.log('⚙️  Configuring middleware...');
app.use(helmet());
app.use(compression());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS
console.log('✓ CORS configured for origin:', process.env.FRONTEND_URL || '*');
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Routes
console.log('🛣️  Registering routes...');
app.use('/auth', authRoutes);
console.log('  ✓ /auth - Authentication routes');
app.use('/api/products', productRoutes);
console.log('  ✓ /api/products - Product routes');
app.use('/api/orders', orderRoutes);
console.log('  ✓ /api/orders - Order routes');
app.use('/api/upload', uploadRoutes);
console.log('  ✓ /api/upload - Upload routes');

// Database Connection
connectDB();

app.get('/', (req, res) => {
    console.log('✓ Health check endpoint accessed');
    res.json({
        status: 'running',
        message: 'Restaurant Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('================================================');
    console.log('✅ SERVER STARTED SUCCESSFULLY!');
    console.log(`🌐 Server is running on http://0.0.0.0:${PORT}`);
    console.log(`🔗 Production URL: https://bckend12345.onrender.com`);
    console.log('================================================');
    console.log('📋 Server ready to accept requests');
});
