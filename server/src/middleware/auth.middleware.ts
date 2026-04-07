import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        name: string;
        email: string;
        role: string;
    };
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Authorization token missing" });
            return;
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: number;
            name: string;
            email: string;
            role: string;
        };

        req.user = decoded;
        next();
    } catch (_error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};