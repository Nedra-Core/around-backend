import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err.message.includes("Validation failed") || err.message.includes("Authentication failed")|| err.message.includes("Conflict error")) {
        res.status(400).json({ error: err.message });
        }
    else {
        res.status(500).json({ error: 'Internal Server Error'});
    }
}