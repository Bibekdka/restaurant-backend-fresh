import express from 'express';
import { Order } from '../models/Order';

import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all orders (Admin only)
router.get('/', authenticate, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email');
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get logged in user orders
router.get('/myorders', authenticate, async (req: AuthRequest, res) => {
    try {
        const orders = await Order.find({ user: req.user!.id });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create new order
router.post('/', authenticate, async (req: AuthRequest, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        const order = new Order({
            orderItems,
            user: req.user!.id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        try {
            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
