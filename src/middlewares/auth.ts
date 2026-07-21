// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../exceptions/custom.errors";

export interface AuthJwtPayload {
    id: number;
    email: string;
}

export interface AuthRequest extends Request {
    auth?: AuthJwtPayload;
}

export const authGuard = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            return next(new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables."));
        }
    
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Access denied. No token provided.");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, secretKey) as AuthJwtPayload;

        req.auth = decoded;

        next();
    } catch (error) {
        next(new UnauthorizedError("Invalid or expired token."));
    }
};