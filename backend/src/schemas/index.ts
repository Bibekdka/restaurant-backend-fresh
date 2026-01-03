import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').max(100),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const productSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(150),
        price: z.number().positive(),
        description: z.string().optional(),
        category: z.string().min(2).max(50),
        countInStock: z.number().int().min(0).optional(),
    }),
});

export const reviewSchema = z.object({
    body: z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().min(5).max(500),
        name: z.string().optional(),
    }),
});

export const orderSchema = z.object({
    body: z.object({
        orderItems: z.array(z.object({
            name: z.string(),
            qty: z.number().positive().max(100),
            image: z.string(),
            price: z.number().positive(),
            product: objectIdSchema,
        })).min(1).max(50),
        shippingAddress: z.object({
            address: z.string().min(5),
            city: z.string().min(2),
            postalCode: z.string().min(2),
            country: z.string().min(2),
        }),
        paymentMethod: z.string().min(2),
        itemsPrice: z.number().min(0),
        taxPrice: z.number().min(0),
        shippingPrice: z.number().min(0),
        totalPrice: z.number().min(0),
    }),
});
