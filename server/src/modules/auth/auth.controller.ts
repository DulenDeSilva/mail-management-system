import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { comparePassword } from "../../utils/password";
import { hashPassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { AuthRequest } from "../../middleware/auth.middleware";
import { validateAndNormalizeEmail } from "../../utils/email";

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }

        const emailResult = validateAndNormalizeEmail(email);

        if ("error" in emailResult) {
            res.status(400).json({ message: emailResult.error });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: emailResult.email }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({ message: "User account is inactive" });
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
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
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

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { name, email, currentPassword, newPassword } = req.body as {
            name?: unknown;
            email?: unknown;
            currentPassword?: unknown;
            newPassword?: unknown;
        };

        const trimmedName = String(name ?? "").trim();
        const emailResult = validateAndNormalizeEmail(email);
        const currentPasswordValue = String(currentPassword ?? "");
        const newPasswordValue = String(newPassword ?? "");

        if (!trimmedName) {
            res.status(400).json({ message: "Name and email are required" });
            return;
        }

        if ("error" in emailResult) {
            res.status(400).json({ message: emailResult.error });
            return;
        }

        if ((currentPasswordValue && !newPasswordValue) || (!currentPasswordValue && newPasswordValue)) {
            res.status(400).json({
                message: "Current password and new password must be provided together"
            });
            return;
        }

        if (newPasswordValue && newPasswordValue.length < 6) {
            res.status(400).json({
                message: "New password must be at least 6 characters long"
            });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const duplicateUser = await prisma.user.findFirst({
            where: {
                email: emailResult.email,
                NOT: {
                    id: req.user.userId
                }
            }
        });

        if (duplicateUser) {
            res.status(409).json({ message: "Email is already in use" });
            return;
        }

        let passwordHash = existingUser.passwordHash;

        if (currentPasswordValue && newPasswordValue) {
            const isCurrentPasswordValid = await comparePassword(
                currentPasswordValue,
                existingUser.passwordHash
            );

            if (!isCurrentPasswordValid) {
                res.status(401).json({ message: "Current password is incorrect" });
                return;
            }

            passwordHash = await hashPassword(newPasswordValue);
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                name: trimmedName,
                email: emailResult.email,
                passwordHash
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });

        const token = generateToken({
            userId: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });

        res.status(200).json({
            message: "Profile updated successfully",
            token,
            user: updatedUser
        });
    } catch (error) {
        console.error("Update me error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
