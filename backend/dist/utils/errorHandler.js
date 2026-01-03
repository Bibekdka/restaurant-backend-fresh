"use strict";
/**
 * Centralized error handling utility for consistent API responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwError = exports.handleError = void 0;
const handleError = (error, res, defaultStatusCode = 500) => {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
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
        return res.status(error.statusCode).json(Object.assign({ message: error.message }, (error.details && { details: error.details })));
    }
    // Generic error
    console.error('Unhandled error:', error);
    return res.status(defaultStatusCode).json(Object.assign({ message: 'Internal server error' }, (process.env.NODE_ENV === 'development' && { details: error.message })));
};
exports.handleError = handleError;
// Helper to throw API errors
const throwError = (message, statusCode = 400, details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    throw error;
};
exports.throwError = throwError;
