import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { connectDB } from './db';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';
import { getMetrics, getContentType, httpRequestDurationMicroseconds, httpRequestsTotal } from './utils/monitoring';

console.log('🚀 Starting Restaurant Backend Server...');
console.log('================================================');

dotenv.config();
console.log('✓ Environment variables loaded');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Initialize Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN || "", // User needs to provide this
    integrations: [
        nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
});

console.log(`✓ Server will run on port: ${PORT}`);
console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || '*'}`);
console.log('================================================');

// Middleware configuration
console.log('⚙️  Configuring middleware...');

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(helmet());
app.use(compression());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Prometheus Middleware
app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    const route = req.path;

    res.on('finish', () => {
        end({ route, code: res.statusCode, method: req.method });
        httpRequestsTotal.inc({ route, code: res.statusCode, method: req.method });
    });
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
const getAllowedOrigins = () => {
    const origins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://freshsun.netlify.app'
    ];

    if (process.env.FRONTEND_URL) {
        // Remove trailing slash if present
        const url = process.env.FRONTEND_URL.replace(/\/$/, '');
        if (!origins.includes(url)) {
            origins.push(url);
        }
    }

    return origins;
};

const allowedOrigins = getAllowedOrigins();
console.log('✓ CORS configured for origins:', allowedOrigins);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.log('❌ CORS Blocked Origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'sentry-trace', 'baggage']
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

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', getContentType());
        res.end(await getMetrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

// Debug Sentry
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

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

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional: Custom error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('================================================');
    console.log('✅ SERVER STARTED SUCCESSFULLY!');
    console.log(`🌐 Server is running on http://0.0.0.0:${PORT}`);
    console.log(`🔗 Production URL: https://bckend12345.onrender.com`);
    console.log('================================================');
    console.log('📋 Server ready to accept requests');
});
