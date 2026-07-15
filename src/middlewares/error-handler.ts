import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../exceptions/base.error';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof BaseError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', error: 'An unexpected error occurred.' });

}