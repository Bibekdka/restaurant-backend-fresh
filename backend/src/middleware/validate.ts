import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error: any) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const sanitizeString = (str: any, maxLength: number = 1000): string => {
    if (!str) return '';
    return String(str).substring(0, maxLength);
};
