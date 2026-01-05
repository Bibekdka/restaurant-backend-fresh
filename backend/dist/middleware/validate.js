"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeString = exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    try {
        console.log('🔍 Validating request:', {
            path: req.path,
            contentType: req.headers['content-type'],
            body: JSON.stringify(req.body),
            schemaDefined: !!schema,
            schemaKeys: schema.shape ? Object.keys(schema.shape) : 'unknown'
        });
        console.log('--- SCHEMA KEYS START ---');
        console.log(schema.shape ? Object.keys(schema.shape) : 'unknown');
        console.log('--- SCHEMA KEYS END ---');
        if (!schema) {
            throw new Error('Schema is undefined');
        }
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        console.log('✅ Validation passed');
        next();
    }
    catch (error) {
        console.error('❌ Validation failed object:', error);
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.errors || error.message
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
