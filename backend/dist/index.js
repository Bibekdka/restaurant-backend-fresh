"use strict";
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
console.log(`✓ Server will run on port: ${PORT}`);
console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || '*'}`);
console.log('================================================');
// Middleware
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
console.log('✓ CORS configured for origin:', process.env.FRONTEND_URL || '*');
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
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
app.listen(PORT, '0.0.0.0', () => {
    console.log('================================================');
    console.log('✅ SERVER STARTED SUCCESSFULLY!');
    console.log(`🌐 Server is running on http://0.0.0.0:${PORT}`);
    console.log(`🔗 Production URL: https://bckend12345.onrender.com`);
    console.log('================================================');
    console.log('📋 Server ready to accept requests');
});
