import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import type { JwtUserPayload } from "../utils/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
    user?: JwtUserPayload;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    let decoded: JwtUserPayload;

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Authorization token missing" });
            return;
        }

        const token = authHeader.split(" ")[1];

        decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    } catch (_error) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true
            }
        });

        if (!currentUser) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }

        if (!currentUser.isActive) {
            res.status(403).json({ message: "User account is inactive" });
            return;
        }

        req.user = {
            userId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
