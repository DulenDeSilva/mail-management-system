import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { AuthRequest } from "../../middleware/auth.middleware";

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isPasswordValid = await comparePassword(password, user.passwordHash);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }

        const token = generateToken({
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};