"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeString = exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.errors
        });
    }
};
exports.validate = validate;
const sanitizeString = (str, maxLength = 1000) => {
    if (!str)
        return '';
    return String(str).substring(0, maxLength);
};
exports.sanitizeString = sanitizeString;
