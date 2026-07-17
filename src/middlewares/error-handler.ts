import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../exceptions/custom.errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof BaseError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
    }

    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            code: "INVALID_JSON",
            error: "Malformed JSON payload. Please check your request syntax."
        });
    }
    
    console.error(err);
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'An unexpected error occurred.' });

}