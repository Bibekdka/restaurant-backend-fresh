"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = exports.reviewSchema = exports.productSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    price: zod_1.z.number().positive(),
    category: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    countInStock: zod_1.z.number().int().nonnegative().default(0),
    image: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    images: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().url(),
        public_id: zod_1.z.string().optional()
    })).optional()
});
exports.reviewSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().min(1),
    image: zod_1.z.string().optional()
});
exports.orderSchema = zod_1.z.object({
    orderItems: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        qty: zod_1.z.number(),
        image: zod_1.z.string().optional().or(zod_1.z.literal('')),
        price: zod_1.z.number(),
        product: zod_1.z.string(),
    })),
    shippingAddress: zod_1.z.object({
        address: zod_1.z.string(),
        city: zod_1.z.string(),
        postalCode: zod_1.z.string(),
        country: zod_1.z.string(),
    }),
    paymentMethod: zod_1.z.string(),
    itemsPrice: zod_1.z.number(),
    taxPrice: zod_1.z.number(),
    shippingPrice: zod_1.z.number(),
    totalPrice: zod_1.z.number(),
});
