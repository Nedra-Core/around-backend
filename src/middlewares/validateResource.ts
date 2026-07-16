import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod"; 
import { ValidationError } from "../exceptions/custom.errors"; 

export const validate = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errorMessage = result.error.issues
                .map(issue => `${issue.path.join(".")}: ${issue.message}`)
                .join(" | ");
                
            return next(new ValidationError(errorMessage));
        }

        req.body = result.data;
        next();
    };
};