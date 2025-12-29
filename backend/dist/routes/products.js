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
const express_1 = __importDefault(require("express"));
const Product_1 = require("../models/Product");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all products (public)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Product_1.Product.find({});
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get product by ID (public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findById(req.params.id);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Create product (admin only)
router.post('/', auth_1.authenticate, auth_1.adminOnly, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, image, images, category, description } = req.body;
        // Support both single image and multiple images
        let productImages = [];
        if (images && Array.isArray(images)) {
            productImages = images;
        }
        else if (image) {
            productImages = [{ url: image }];
        }
        const product = new Product_1.Product({
            name,
            price,
            images: productImages,
            category: category || 'Main',
            description: description || '',
            countInStock: 10,
        });
        const createdProduct = yield product.save();
        res.status(201).json(createdProduct);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Update product price (admin only)
router.put('/:id/price', auth_1.authenticate, auth_1.adminOnly, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { price } = req.body;
        if (!price || price <= 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }
        const product = yield Product_1.Product.findByIdAndUpdate(req.params.id, { price }, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Price updated', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Update product details (name, description, etc) (admin only)
router.put('/:id', auth_1.authenticate, auth_1.adminOnly, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, category, countInStock } = req.body;
        const updates = {};
        if (name)
            updates.name = name;
        if (description)
            updates.description = description;
        if (price)
            updates.price = price;
        if (category)
            updates.category = category;
        if (countInStock !== undefined)
            updates.countInStock = countInStock;
        const product = yield Product_1.Product.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Add image to product (admin only)
router.post('/:id/images', auth_1.authenticate, auth_1.adminOnly, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url, public_id } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'Image URL is required' });
        }
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.images.push({ url, public_id: public_id || '' });
        yield product.save();
        res.status(201).json({ message: 'Image added', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete image from product (admin only)
router.delete('/:id/images/:imageIndex', auth_1.authenticate, auth_1.adminOnly, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, imageIndex } = req.params;
        const index = parseInt(imageIndex, 10);
        const product = yield Product_1.Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (index < 0 || index >= product.images.length) {
            return res.status(400).json({ message: 'Invalid image index' });
        }
        // Remove image from array
        product.images.splice(index, 1);
        yield product.save();
        res.json({ message: 'Image removed', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Create product review
router.post('/:id/reviews', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rating, comment, name, user } = req.body;
    try {
        const product = yield Product_1.Product.findById(req.params.id);
        if (product) {
            const review = {
                name: name || 'Anonymous User',
                rating: Number(rating),
                comment,
                user: user || '000000000000000000000000',
                createdAt: new Date(),
            };
            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                    product.reviews.length;
            yield product.save();
            res.status(201).json({ message: 'Review added', product });
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete product review (admin only)
router.delete('/:id/reviews/:reviewId', auth_1.authenticate, auth_1.adminOnly, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findById(req.params.id);
        if (product) {
            const reviewIndex = product.reviews.findIndex((r) => r._id.toString() === req.params.reviewId);
            if (reviewIndex === -1) {
                return res.status(404).json({ message: 'Review not found' });
            }
            product.reviews.splice(reviewIndex, 1);
            product.numReviews = product.reviews.length;
            if (product.numReviews > 0) {
                product.rating =
                    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                        product.reviews.length;
            }
            else {
                product.rating = 0;
            }
            yield product.save();
            res.json({ message: 'Review deleted', product });
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete product (admin only)
router.delete('/:id', auth_1.authenticate, auth_1.adminOnly, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
exports.default = router;
