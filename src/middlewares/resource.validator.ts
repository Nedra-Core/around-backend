import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../exceptions/custom.errors";

export type ValidationSource = 'body' | 'query' | 'params';

export const validate = (schema: ZodType, source: ValidationSource = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
        const result = schema.safeParse(data);

        if (!result.success) {
            const errorMessage = result.error.issues
                .map(issue => `${issue.path.join(".")}: ${issue.message}`)
                .join(" | ");

            return next(new ValidationError(errorMessage));
        }

        if (source === 'query') {
            Object.defineProperty(req, 'query', {
                value: result.data,
                writable: true,
                configurable: true,
            });
        } else if (source === 'params') {
            req.params = result.data as any;
        } else {
            req.body = result.data;
        }

        next();
    };
};