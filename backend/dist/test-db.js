"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.DB_URI || '';
console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs
mongoose_1.default.connect(uri)
    .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
})
    .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
});
