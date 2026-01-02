import express, { Request, Response } from 'express';
import { Order } from '../models/Order';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';
import { handleError } from '../utils/errorHandler';
import { validateString, validateMongoId, validatePrice, validateOrderQuantity } from '../utils/validation';

const router = express.Router();

// Get all orders (Admin only) with pagination
router.get('/', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const skip = (page - 1) * limit;

        const orders = await Order.find({})
            .populate('user', 'id name email')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments();

        res.json({
            orders,
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

// Get logged in user orders with pagination
router.get('/myorders', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user!.id })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments({ user: req.user!.id });

        res.json({
            orders,
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

// Create new order (auth required)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        // Validate order items
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (orderItems.length > 50) {
            return res.status(400).json({ message: 'Order cannot exceed 50 items' });
        }

        // Validate each order item
        for (const item of orderItems) {
            if (!validateMongoId(item.product)) {
                return res.status(400).json({ message: 'Invalid product ID in order items' });
            }

            if (!validateString(item.name, 1, 150)) {
                return res.status(400).json({ message: 'Invalid product name in order' });
            }

            if (!validateOrderQuantity(item.qty)) {
                return res.status(400).json({ message: 'Invalid quantity (must be 1-100 per item)' });
            }

            if (!validatePrice(item.price)) {
                return res.status(400).json({ message: 'Invalid price in order items' });
            }
        }

        // Validate shipping address
        if (!shippingAddress || typeof shippingAddress !== 'object') {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        const { address, city, postalCode, country } = shippingAddress;
        if (!validateString(address, 5, 200) || !validateString(city, 2, 100) ||
            !validateString(postalCode, 2, 20) || !validateString(country, 2, 100)) {
            return res.status(400).json({ message: 'Invalid shipping address format' });
        }

        // Validate payment method
        if (!validateString(paymentMethod, 2, 50)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // Validate prices
        if (!validatePrice(itemsPrice) || !validatePrice(taxPrice) || !validatePrice(shippingPrice) || !validatePrice(totalPrice)) {
            return res.status(400).json({ message: 'Invalid pricing information' });
        }

        // Verify price calculation (within $1 tolerance for rounding)
        const expectedTotal = itemsPrice + taxPrice + shippingPrice;
        if (Math.abs(expectedTotal - totalPrice) > 1) {
            return res.status(400).json({ message: 'Price calculation mismatch' });
        }

        const order = new Order({
            orderItems,
            user: req.user!.id,
            shippingAddress: {
                address,
                city,
                postalCode,
                country,
            },
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();
        const populated = await createdOrder.populate('user', 'name email');
        res.status(201).json(populated);
    } catch (error: any) {
        handleError(error, res, 400);
    }
});

// Get order by ID (auth required, user sees own orders, admin sees all)
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!validateMongoId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid order ID format' });
        }

        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Users can only see their own orders, admins see all
        if (req.user!.role !== 'admin' && order.user._id.toString() !== req.user!.id) {
            return res.status(403).json({ message: 'You do not have permission to view this order' });
        }

        res.json(order);
    } catch (error: any) {
        handleError(error, res);
    }
});

export default router;
