"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = exports.reviewSchema = exports.productSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const objectIdSchema = zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.productSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(150),
        price: zod_1.z.number().positive(),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().min(2).max(50),
        countInStock: zod_1.z.number().int().min(0).optional(),
    }),
});
exports.reviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z.number().min(1).max(5),
        comment: zod_1.z.string().min(5).max(500),
        name: zod_1.z.string().optional(),
    }),
});
exports.orderSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderItems: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            qty: zod_1.z.number().positive().max(100),
            image: zod_1.z.string(),
            price: zod_1.z.number().positive(),
            product: objectIdSchema,
        })).min(1).max(50),
        shippingAddress: zod_1.z.object({
            address: zod_1.z.string().min(5),
            city: zod_1.z.string().min(2),
            postalCode: zod_1.z.string().min(2),
            country: zod_1.z.string().min(2),
        }),
        paymentMethod: zod_1.z.string().min(2),
        itemsPrice: zod_1.z.number().min(0),
        taxPrice: zod_1.z.number().min(0),
        shippingPrice: zod_1.z.number().min(0),
        totalPrice: zod_1.z.number().min(0),
    }),
});
