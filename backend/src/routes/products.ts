import express from 'express';
import { Product } from '../models/Product';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create product
// Note: In real app, protect this route
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Create product review
router.post('/:id/reviews', async (req, res) => {
    const { rating, comment } = req.body;

    // In real app, get user from req.user
    // For demo, we might accept a user name in body or just anonymous
    // But strict TS might complain about optional User.
    // We'll require user in body for now or placeholder

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Simple logic: just add review
            const review = {
                name: 'User', // Placeholder or from auth token
                rating: Number(rating),
                comment,
                user: '654321098765432109876543', // Placeholder
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
