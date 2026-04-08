import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { hashPassword } from "../../utils/password";
import { validateAndNormalizeEmail } from "../../utils/email";

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            res.status(400).json({ message: "Name, email, password and role are required" });
            return;
        }

        if (!["ADMIN", "WORKER"].includes(role)) {
            res.status(400).json({ message: "Invalid role" });
            return;
        }

        const trimmedName = String(name).trim();
        const emailResult = validateAndNormalizeEmail(email);

        if (!trimmedName) {
            res.status(400).json({ message: "Name and email cannot be empty" });
            return;
        }

        if ("error" in emailResult) {
            res.status(400).json({ message: emailResult.error });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: emailResult.email }
        });

        if (existingUser) {
            res.status(409).json({ message: "User already exists" });
            return;
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name: trimmedName,
                email: emailResult.email,
                passwordHash,
                role
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

        res.status(201).json({
            message: "User created successfully",
            user
        });
    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number(req.params.id);
        const { name, email, role } = req.body;

        if (Number.isNaN(userId)) {
            res.status(400).json({ message: "Invalid user id" });
            return;
        }

        if (!name || !email || !role) {
            res.status(400).json({ message: "Name, email and role are required" });
            return;
        }

        if (!["ADMIN", "WORKER"].includes(role)) {
            res.status(400).json({ message: "Invalid role" });
            return;
        }

        const trimmedName = String(name).trim();
        const emailResult = validateAndNormalizeEmail(email);

        if (!trimmedName) {
            res.status(400).json({ message: "Name and email cannot be empty" });
            return;
        }

        if ("error" in emailResult) {
            res.status(400).json({ message: emailResult.error });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const duplicateUser = await prisma.user.findFirst({
            where: {
                email: emailResult.email,
                NOT: {
                    id: userId
                }
            }
        });

        if (duplicateUser) {
            res.status(409).json({ message: "Email is already in use" });
            return;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: trimmedName,
                email: emailResult.email,
                role
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

        res.status(200).json({
            message: "User updated successfully",
            user
        });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number(req.params.id);

        if (Number.isNaN(userId)) {
            res.status(400).json({ message: "Invalid user id" });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true
            }
        });

        res.status(200).json({
            message: "User deactivated successfully",
            user
        });
    } catch (error) {
        console.error("Deactivate user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
