import express, { Request, Response } from 'express';
import { Product } from '../models/Product';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';
import { handleError, throwError } from '../utils/errorHandler';
import { validateString, validatePrice, validateRating, validateMongoId, sanitizeString } from '../utils/validation';

const router = express.Router();

// Get all products (public) with pagination
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const skip = (page - 1) * limit;

        const products = await Product.find({})
            .limit(limit)
            .skip(skip)
            .lean(); // Use lean() for read-only queries for performance

        const total = await Product.countDocuments();

        res.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        handleError(error, res);
    }
});

// Get product by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error: any) {
        handleError(error, res);
    }
});

// Create product (admin only)
router.post('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { name, price, image, images, category, description } = req.body;

        // Validate inputs
        if (!validateString(name, 2, 150)) {
            return res.status(400).json({ message: 'Product name must be 2-150 characters' });
        }

        if (!validatePrice(price)) {
            return res.status(400).json({ message: 'Price must be a positive number less than $1,000,000' });
        }

        // Support both single image and multiple images
        let productImages = [];
        if (images && Array.isArray(images) && images.length > 0) {
            productImages = images.slice(0, 10).filter(img => typeof img.url === 'string' && img.url.length > 0);
        } else if (image && typeof image === 'string') {
            productImages = [{ url: image }];
        } else {
            return res.status(400).json({ message: 'At least one image URL is required' });
        }

        const product = new Product({
            name: sanitizeString(name, 150),
            price: parseFloat(price),
            images: productImages,
            category: category && validateString(category, 2, 50) ? sanitizeString(category, 50) : 'Main',
            description: description ? sanitizeString(description, 1000) : '',
            countInStock: 10,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

// Update product price (admin only)
router.put('/:id/price', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const { price } = req.body;
        if (!validatePrice(price)) {
            return res.status(400).json({ message: 'Price must be a positive number less than $1,000,000' });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { price: parseFloat(price) },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Price updated', product });
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

// Update product details (admin only)
router.put('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const { name, description, price, category, countInStock } = req.body;
        const updates: any = {};

        if (name !== undefined) {
            if (!validateString(name, 2, 150)) {
                return res.status(400).json({ message: 'Product name must be 2-150 characters' });
            }
            updates.name = sanitizeString(name, 150);
        }

        if (description !== undefined) {
            updates.description = description ? sanitizeString(description, 1000) : '';
        }

        if (price !== undefined) {
            if (!validatePrice(price)) {
                return res.status(400).json({ message: 'Price must be a positive number' });
            }
            updates.price = parseFloat(price);
        }

        if (category !== undefined) {
            if (!validateString(category, 2, 50)) {
                return res.status(400).json({ message: 'Category must be 2-50 characters' });
            }
            updates.category = sanitizeString(category, 50);
        }

        if (countInStock !== undefined) {
            const stock = parseInt(countInStock);
            if (isNaN(stock) || stock < 0 || stock > 10000) {
                return res.status(400).json({ message: 'Stock must be between 0 and 10000' });
            }
            updates.countInStock = stock;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated', product });
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

// Add image to product (admin only)
router.post('/:id/images', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const { url, public_id } = req.body;
        if (!url || typeof url !== 'string' || url.length === 0) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        if (url.length > 500) {
            return res.status(400).json({ message: 'Image URL is too long' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.images.length >= 10) {
            return res.status(400).json({ message: 'Maximum 10 images per product' });
        }

        product.images.push({ url, public_id: public_id ? sanitizeString(public_id, 100) : '' });
        await product.save();

        res.status(201).json({ message: 'Image added', product });
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

// Delete image from product (admin only)
router.delete('/:id/images/:imageIndex', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const { id, imageIndex } = req.params;
        const index = parseInt(imageIndex, 10);

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (isNaN(index) || index < 0 || index >= product.images.length) {
            return res.status(400).json({ message: 'Invalid image index' });
        }

        if (product.images.length <= 1) {
            return res.status(400).json({ message: 'Product must have at least one image' });
        }

        product.images.splice(index, 1);
        await product.save();

        res.json({ message: 'Image removed', product });
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

// Create product review
router.post('/:id/reviews', async (req: Request, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const { rating, comment, name, user } = req.body;

        // Validate review data
        if (!validateRating(rating)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (!validateString(comment, 5, 500)) {
            return res.status(400).json({ message: 'Review comment must be 5-500 characters' });
        }

        const reviewName = name && validateString(name, 2, 100) ? sanitizeString(name, 100) : 'Anonymous User';

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = {
            name: reviewName,
            rating: parseInt(rating),
            comment: sanitizeString(comment, 500),
            user: user && validateMongoId(user) ? user : '000000000000000000000000',
            createdAt: new Date(),
        };

        product.reviews.push(review as any);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added', product });
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

// Delete product review (admin only)
router.delete('/:id/reviews/:reviewId', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        if (!validateMongoId(req.params.reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID format' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

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
                product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        } else {
            product.rating = 0;
        }

        await product.save();
        res.json({ message: 'Review deleted', product });
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

// Delete product (admin only)
router.delete('/:id', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted' });
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

export default router;
