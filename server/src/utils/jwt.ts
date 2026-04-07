import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const generateToken = (payload: {
    userId: number;
    name: string;
    email: string;
    role: string;
}) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};