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
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        // Debug: Log if MONGO_URI is set
        const mongoUri = process.env.MONGO_URI || process.env.DB_URI;
        if (!mongoUri) {
            console.error('❌ ERROR: MONGO_URI environment variable is not set!');
            console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('MONGO')));
        }
        else {
            // Mask the password for security
            const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
            console.log('✓ MONGO_URI is configured:', maskedUri);
        }
        const conn = yield mongoose_1.default.connect(mongoUri || 'mongodb://localhost:27017/restaurant-app');
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📍 Database Host: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Failed!');
        console.error('💥 Error Details:', error.message);
        if (error.code)
            console.error('Error Code:', error.code);
        console.error('⚠️  Please check:');
        console.error('   1. MongoDB Atlas IP whitelist (allow 0.0.0.0/0)');
        console.error('   2. Database credentials are correct');
        console.error('   3. Cluster is running and accessible');
        process.exit(1);
    }
});
exports.connectDB = connectDB;
