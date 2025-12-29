import express from 'express';
import { Product } from '../models/Product';
import { authenticate, adminOnly } from '../middleware/auth';

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get product by ID (public)
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

// Create product (admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { name, price, image, images, category, description } = req.body;

        // Support both single image and multiple images
        let productImages = [];
        if (images && Array.isArray(images)) {
            productImages = images;
        } else if (image) {
            productImages = [{ url: image }];
        }

        const product = new Product({
            name,
            price,
            images: productImages,
            category: category || 'Main',
            description: description || '',
            countInStock: 10,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Update product price (admin only)
router.put('/:id/price', authenticate, adminOnly, async (req, res) => {
    try {
        const { price } = req.body;
        if (!price || price <= 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { price },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Price updated', product });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Update product details (name, description, etc) (admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const { name, description, price, category, countInStock } = req.body;
        const updates: any = {};

        if (name) updates.name = name;
        if (description) updates.description = description;
        if (price) updates.price = price;
        if (category) updates.category = category;
        if (countInStock !== undefined) updates.countInStock = countInStock;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated', product });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Add image to product (admin only)
router.post('/:id/images', authenticate, adminOnly, async (req, res) => {
    try {
        const { url, public_id } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.images.push({ url, public_id: public_id || '' });
        await product.save();

        res.status(201).json({ message: 'Image added', product });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Delete image from product (admin only)
router.delete('/:id/images/:imageIndex', authenticate, adminOnly, async (req, res) => {
    try {
        const { id, imageIndex } = req.params;
        const index = parseInt(imageIndex, 10);

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (index < 0 || index >= product.images.length) {
            return res.status(400).json({ message: 'Invalid image index' });
        }

        // Remove image from array
        product.images.splice(index, 1);
        await product.save();

        res.json({ message: 'Image removed', product });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Create product review
router.post('/:id/reviews', async (req, res) => {
    const { rating, comment, name, user } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            const review = {
                name: name || 'Anonymous User',
                rating: Number(rating),
                comment,
                user: user || '000000000000000000000000',
                createdAt: new Date(),
            };

            product.reviews.push(review as any);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added', product });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product review (admin only)
router.delete('/:id/reviews/:reviewId', authenticate, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            const reviewIndex = product.reviews.findIndex(
                (r: any) => r._id.toString() === req.params.reviewId
            );

            if (reviewIndex === -1) {
                return res.status(404).json({ message: 'Review not found' });
            }

            product.reviews.splice(reviewIndex, 1);
            product.numReviews = product.reviews.length;

            if (product.numReviews > 0) {
                product.rating =
                    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                    product.reviews.length;
            } else {
                product.rating = 0;
            }

            await product.save();
            res.json({ message: 'Review deleted', product });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product (admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
