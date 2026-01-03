import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

// Verify JWT token and attach user to request
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is not set' });
        }

        const decoded: any = jwt.verify(token, secret);
        req.user = { id: decoded.id, role: decoded.role || 'user' };
        next();
    } catch (error: any) {
        res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};

// Check if user is admin
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required. Only administrators can perform this action.' });
    }

    next();
};

// Optional: Check if user is owner or admin
export const ownerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // For now, we'll require admin. You can extend this to check if user is product owner
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    next();
};
