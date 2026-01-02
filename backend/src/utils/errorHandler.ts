/**
 * Centralized error handling utility for consistent API responses
 */

import { Response } from 'express';

export interface ApiError {
    message: string;
    statusCode: number;
    details?: any;
}

export const handleError = (error: any, res: Response, defaultStatusCode: number = 500) => {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e: any) => e.message);
        return res.status(400).json({
            message: 'Validation failed',
            details: messages,
        });
    }

    // Mongoose cast error
    if (error.name === 'CastError') {
        return res.status(400).json({
            message: 'Invalid ID format',
        });
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
            message: `${field} already exists`,
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token',
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired',
        });
    }

    // Custom error
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            message: error.message,
            ...(error.details && { details: error.details }),
        });
    }

    // Generic error
    console.error('Unhandled error:', error);
    return res.status(defaultStatusCode).json({
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
};

// Helper to throw API errors
export const throwError = (message: string, statusCode: number = 400, details?: any): never => {
    const error: any = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    throw error;
};
