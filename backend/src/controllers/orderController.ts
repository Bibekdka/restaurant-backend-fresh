import { Response } from 'express';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';

export const getOrders = async (req: AuthRequest, res: Response) => {
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
        res.status(500).json({ message: error.message });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
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
        res.status(500).json({ message: error.message });
    }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
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

        const createdOrder = await order.save();
        const populated = await createdOrder.populate('user', 'name email');
        res.status(201).json(populated);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
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
        res.status(500).json({ message: error.message });
    }
};
