import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('🔍 Validating request:', {
            path: req.path,
            contentType: req.headers['content-type'],
            body: JSON.stringify(req.body),
            schemaDefined: !!schema,
            schemaKeys: (schema as any).shape ? Object.keys((schema as any).shape) : 'unknown'
        });

        console.log('--- SCHEMA KEYS START ---');
        console.log((schema as any).shape ? Object.keys((schema as any).shape) : 'unknown');
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
    } catch (error: any) {
        console.error('❌ Validation failed object:', error);
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.errors || error.message
        });
    }
};

export const sanitizeString = (str: any, maxLength: number = 1000): string => {
    if (!str) return '';
    return String(str).substring(0, maxLength);
};
