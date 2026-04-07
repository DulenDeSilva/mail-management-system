import { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface JwtUserPayload {
    userId: number;
    name: string;
    email: string;
    role: UserRole;
}

export const generateToken = (payload: JwtUserPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};
