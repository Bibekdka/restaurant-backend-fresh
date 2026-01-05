import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { orderSchema } from '../schemas';
import * as orderController from '../controllers/orderController';

const router = express.Router();

router.post('/', authenticate, validate(orderSchema), orderController.createOrder);
router.get('/myorders', authenticate, orderController.getMyOrders);
router.get('/stats', authenticate, adminOnly, orderController.getDashboardStats); // Place before /:id to prevent conflict
router.get('/:id', authenticate, orderController.getOrderById);
router.get('/', authenticate, adminOnly, orderController.getOrders);
router.put('/:id/pay', authenticate, adminOnly, orderController.updateOrderToPaid);
router.put('/:id/deliver', authenticate, adminOnly, orderController.updateOrderToDelivered);
router.put('/:id/status', authenticate, adminOnly, orderController.updateOrderStatus);

export default router;
