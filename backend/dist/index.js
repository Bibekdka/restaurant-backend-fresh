"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Sentry = __importStar(require("@sentry/node"));
const profiling_node_1 = require("@sentry/profiling-node");
const db_1 = require("./db");
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const upload_1 = __importDefault(require("./routes/upload"));
console.log('🚀 Starting Restaurant Backend Server...');
console.log('================================================');
dotenv_1.default.config();
console.log('✓ Environment variables loaded');
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// Initialize Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN || "", // User needs to provide this
    integrations: [
        (0, profiling_node_1.nodeProfilingIntegration)(),
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
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        }
        else {
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
app.use('/auth', auth_1.default);
console.log('  ✓ /auth - Authentication routes');
app.use('/api/products', products_1.default);
console.log('  ✓ /api/products - Product routes');
app.use('/api/orders', orders_1.default);
console.log('  ✓ /api/orders - Order routes');
app.use('/api/upload', upload_1.default);
console.log('  ✓ /api/upload - Upload routes');
// Debug Sentry
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});
// Database Connection
(0, db_1.connectDB)();
app.get('/', (req, res) => {
    console.log('✓ Health check endpoint accessed');
    res.json({
        status: 'running',
        message: 'Restaurant Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Optional: Custom error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    Sentry.captureException(err); // Explicitly capture
    res.statusCode = 500;
    // Fix type error by casting
    res.json({ message: "Internal Server Error", sentry: res.sentry });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log('================================================');
    console.log('✅ SERVER STARTED SUCCESSFULLY!');
    console.log(`🌐 Server is running on http://0.0.0.0:${PORT}`);
    console.log(`🔗 Production URL: https://bckend12345.onrender.com`);
    console.log('================================================');
    console.log('📋 Server ready to accept requests');
});
