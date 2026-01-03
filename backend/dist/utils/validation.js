"use strict";
/**
 * Input validation utilities to prevent injection attacks and invalid data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrderQuantity = exports.validateCountInStock = exports.validateMongoId = exports.sanitizeString = exports.validateString = exports.validateRating = exports.validatePrice = exports.validateEmail = void 0;
const validateEmail = (email) => {
    if (!email || typeof email !== 'string')
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && email.length <= 254;
};
exports.validateEmail = validateEmail;
const validatePrice = (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0 && num < 1000000; // Max $1M per item
};
exports.validatePrice = validatePrice;
const validateRating = (rating) => {
    const num = parseInt(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
};
exports.validateRating = validateRating;
const validateString = (value, minLen = 1, maxLen = 1000) => {
    return typeof value === 'string' &&
        value.trim().length >= minLen &&
        value.trim().length <= maxLen;
};
exports.validateString = validateString;
const sanitizeString = (value, maxLen = 1000) => {
    if (typeof value !== 'string')
        return '';
    return value.trim().substring(0, maxLen);
};
exports.sanitizeString = sanitizeString;
const validateMongoId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
exports.validateMongoId = validateMongoId;
const validateCountInStock = (qty) => {
    const num = parseInt(qty);
    return !isNaN(num) && num >= 0 && num <= 10000;
};
exports.validateCountInStock = validateCountInStock;
const validateOrderQuantity = (qty) => {
    const num = parseInt(qty);
    return !isNaN(num) && num >= 1 && num <= 100; // Max 100 items per order item
};
exports.validateOrderQuantity = validateOrderQuantity;
