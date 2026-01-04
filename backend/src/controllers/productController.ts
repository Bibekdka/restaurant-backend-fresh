import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { sanitizeString } from '../middleware/validate';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const skip = (page - 1) * limit;

        const products = await Product.find({})
            .limit(limit)
            .skip(skip)
            .lean();

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
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { name, price, image, images, category, description } = req.body;

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
            category: category ? sanitizeString(category, 50) : 'Main',
            description: description ? sanitizeString(description, 1000) : '',
            countInStock: 10,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, price, category, countInStock } = req.body;
        const updates: any = {};

        if (name !== undefined) updates.name = sanitizeString(name, 150);
        if (description !== undefined) updates.description = description ? sanitizeString(description, 1000) : '';
        if (price !== undefined) updates.price = parseFloat(price);
        if (category !== undefined) updates.category = sanitizeString(category, 50);
        if (countInStock !== undefined) updates.countInStock = parseInt(countInStock);

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
        res.status(400).json({ message: error.message });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createReview = async (req: any, res: Response) => {
    try {
        const { rating, comment, name, user, image } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = {
            name: name || 'Anonymous User',
            rating: parseInt(rating),
            comment: sanitizeString(comment, 500),
            user: user || '000000000000000000000000',
            image: image || null,
            createdAt: new Date(),
        };

        product.reviews.push(review as any);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added', product });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
    try {
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
        res.status(400).json({ message: error.message });
    }
};

export const addMultipleImages = async (req: AuthRequest, res: Response) => {
    try {
        const { images } = req.body; // Array of {url, public_id}
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: 'Images array is required' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.images.length + images.length > 20) {
            return res.status(400).json({ message: 'Maximum 20 images per product allowed' });
        }

        const validImages = images.filter(img => img.url);
        product.images.push(...validImages);
        await product.save();

        res.status(201).json({ message: `${validImages.length} images added`, product });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addImage = async (req: AuthRequest, res: Response) => {
    try {
        const { url, public_id } = req.body;
        if (!url) return res.status(400).json({ message: 'Image URL is required' });

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.images.length >= 10) {
            return res.status(400).json({ message: 'Maximum 10 images per product' });
        }

        product.images.push({ url, public_id: public_id || '' });
        await product.save();

        res.status(201).json({ message: 'Image added', product });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteImage = async (req: AuthRequest, res: Response) => {
    try {
        const { id, imageIndex } = req.params;
        const index = parseInt(imageIndex, 10);

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (isNaN(index) || index < 0 || index >= product.images.length) {
            return res.status(400).json({ message: 'Invalid image index' });
        }

        product.images.splice(index, 1);
        await product.save();

        res.json({ message: 'Image removed', product });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
