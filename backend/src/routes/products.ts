import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { productSchema, productUpdateSchema, reviewSchema } from '../schemas';
import * as productController from '../controllers/productController';

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', authenticate, adminOnly, validate(productSchema), productController.createProduct);
router.put('/:id', authenticate, adminOnly, validate(productUpdateSchema), productController.updateProduct);
router.delete('/:id', authenticate, adminOnly, productController.deleteProduct);

// Image management
router.post('/:id/images/bulk', authenticate, adminOnly, productController.addMultipleImages);
router.post('/:id/images', authenticate, adminOnly, productController.addImage);
router.delete('/:id/images/:imageIndex', authenticate, adminOnly, productController.deleteImage);

// Reviews
router.post('/:id/reviews', validate(reviewSchema), productController.createReview);
router.delete('/:id/reviews/:reviewId', authenticate, adminOnly, productController.deleteReview);

export default router;
