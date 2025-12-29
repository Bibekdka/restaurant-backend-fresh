"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerOrAdmin = exports.adminOnly = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Verify JWT token and attach user to request
const authenticate = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = { id: decoded.id, role: decoded.role || 'user' };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};
exports.authenticate = authenticate;
// Check if user is admin
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required. Only administrators can perform this action.' });
    }
    next();
};
exports.adminOnly = adminOnly;
// Optional: Check if user is owner or admin
const ownerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    // For now, we'll require admin. You can extend this to check if user is product owner
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
};
exports.ownerOrAdmin = ownerOrAdmin;
