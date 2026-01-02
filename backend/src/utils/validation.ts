/**
 * Input validation utilities to prevent injection attacks and invalid data
 */

export const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && email.length <= 254;
};

export const validatePrice = (price: any): boolean => {
    const num = parseFloat(price);
    return !isNaN(num) && num > 0 && num < 1000000; // Max $1M per item
};

export const validateRating = (rating: any): boolean => {
    const num = parseInt(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
};

export const validateString = (value: any, minLen: number = 1, maxLen: number = 1000): boolean => {
    return typeof value === 'string' && 
           value.trim().length >= minLen && 
           value.trim().length <= maxLen;
};

export const sanitizeString = (value: string, maxLen: number = 1000): string => {
    if (typeof value !== 'string') return '';
    return value.trim().substring(0, maxLen);
};

export const validateMongoId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export const validateCountInStock = (qty: any): boolean => {
    const num = parseInt(qty);
    return !isNaN(num) && num >= 0 && num <= 10000;
};

export const validateOrderQuantity = (qty: any): boolean => {
    const num = parseInt(qty);
    return !isNaN(num) && num >= 1 && num <= 100; // Max 100 items per order item
};
