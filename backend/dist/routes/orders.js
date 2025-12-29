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
const Order_1 = require("../models/Order");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all orders (Admin only)
router.get('/', auth_1.authenticate, auth_1.adminOnly, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Order_1.Order.find({}).populate('user', 'id name email');
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get logged in user orders
router.get('/myorders', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Order_1.Order.find({ user: req.user.id });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Create new order
router.post('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, } = req.body;
    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }
    else {
        const order = new Order_1.Order({
            orderItems,
            user: req.user.id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });
        try {
            const createdOrder = yield order.save();
            res.status(201).json(createdOrder);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}));
// Get order by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json(order);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
