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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.addImage = exports.addMultipleImages = exports.deleteReview = exports.createReview = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = require("../models/Product");
const validate_1 = require("../middleware/validate");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const products = yield Product_1.Product.find({})
            .limit(limit)
            .skip(skip)
            .lean();
        const total = yield Product_1.Product.countDocuments();
        res.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findById(req.params.id).populate('reviews.user', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProductById = getProductById;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User authentication required' });
        }
        const { name, price, image, images, category, description } = req.body;
        // Support both single image and multiple images
        let productImages = [];
        if (images && Array.isArray(images) && images.length > 0) {
            productImages = images.slice(0, 10).filter(img => typeof img.url === 'string' && img.url.length > 0);
        }
        else if (image && typeof image === 'string') {
            productImages = [{ url: image }];
        }
        else {
            return res.status(400).json({ message: 'At least one image URL is required' });
        }
        const product = new Product_1.Product({
            user: req.user.id,
            name: (0, validate_1.sanitizeString)(name, 150),
            price: parseFloat(price),
            image: productImages.length > 0 ? productImages[0].url : '',
            images: productImages,
            category: category ? (0, validate_1.sanitizeString)(category, 50) : 'Main',
            description: description ? (0, validate_1.sanitizeString)(description, 1000) : '',
            countInStock: 10,
        });
        const createdProduct = yield product.save();
        res.status(201).json(createdProduct);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, category, countInStock } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = (0, validate_1.sanitizeString)(name, 150);
        if (description !== undefined)
            updates.description = description ? (0, validate_1.sanitizeString)(description, 1000) : '';
        if (price !== undefined)
            updates.price = parseFloat(price);
        if (category !== undefined)
            updates.category = (0, validate_1.sanitizeString)(category, 50);
        if (countInStock !== undefined)
            updates.countInStock = parseInt(countInStock);
        const product = yield Product_1.Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteProduct = deleteProduct;
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rating, comment, name, user, image } = req.body;
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const review = {
            name: name || 'Anonymous User',
            rating: parseInt(rating),
            comment: (0, validate_1.sanitizeString)(comment, 500),
            user: user || '000000000000000000000000',
            image: image || null,
            createdAt: new Date(),
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        yield product.save();
        res.status(201).json({ message: 'Review added', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createReview = createReview;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const reviewIndex = product.reviews.findIndex((r) => r._id.toString() === req.params.reviewId);
        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }
        product.reviews.splice(reviewIndex, 1);
        product.numReviews = product.reviews.length;
        if (product.numReviews > 0) {
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        }
        else {
            product.rating = 0;
        }
        yield product.save();
        res.json({ message: 'Review deleted', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.deleteReview = deleteReview;
const addMultipleImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { images } = req.body; // Array of {url, public_id}
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: 'Images array is required' });
        }
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        if (product.images.length + images.length > 20) {
            return res.status(400).json({ message: 'Maximum 20 images per product allowed' });
        }
        const validImages = images.filter(img => img.url);
        product.images.push(...validImages);
        // Sync main image
        if (product.images.length > 0) {
            product.image = product.images[0].url;
        }
        yield product.save();
        res.status(201).json({ message: `${validImages.length} images added`, product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.addMultipleImages = addMultipleImages;
const addImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url, public_id } = req.body;
        if (!url)
            return res.status(400).json({ message: 'Image URL is required' });
        const product = yield Product_1.Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        if (product.images.length >= 10) {
            return res.status(400).json({ message: 'Maximum 10 images per product' });
        }
        product.images.push({ url, public_id: public_id || '' });
        // Sync main image
        if (product.images.length > 0) {
            product.image = product.images[0].url;
        }
        yield product.save();
        res.status(201).json({ message: 'Image added', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.addImage = addImage;
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, imageIndex } = req.params;
        const index = parseInt(imageIndex, 10);
        const product = yield Product_1.Product.findById(id);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        if (isNaN(index) || index < 0 || index >= product.images.length) {
            return res.status(400).json({ message: 'Invalid image index' });
        }
        product.images.splice(index, 1);
        // Sync main image
        if (product.images.length > 0) {
            product.image = product.images[0].url;
        }
        else {
            // Check if schema requires image. If required, this save might fail or we need a placeholder?
            // User schema said image is required: true. 
            // So if they delete the last image, this will fail validation on save.
            // For now, let's leave it empty string if they delete all, and let mongoose validation handle it 
            // or (better) prevent deleting the last image if we want to be strict.
            // But usually admin should be able to delete and add new. 
            // Let's set it to empty string if array is empty.
            product.image = '';
        }
        yield product.save();
        res.json({ message: 'Image removed', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.deleteImage = deleteImage;
