import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export const productSchema = z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    category: z.string().optional(),
    description: z.string().optional(),
    countInStock: z.number().int().nonnegative().default(0),
    image: z.string().url().optional().or(z.literal('')),
    images: z.array(z.object({
        url: z.string().url(),
        public_id: z.string().optional()
    })).optional()
});

export const productUpdateSchema = productSchema.partial();

export const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(1),
    image: z.string().optional()
});
