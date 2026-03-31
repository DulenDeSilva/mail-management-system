import { Response } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
    getMicrosoftAuthUrl,
    exchangeCodeForToken
} from "./outlook.service";

export const connectOutlook = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const state = String(req.user.userId);
        const authUrl = getMicrosoftAuthUrl(state);

        res.status(200).json({ authUrl });
    } catch (error) {
        console.error("Connect Outlook error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const outlookCallback = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            res.status(400).json({ message: "Code and state are required" });
            return;
        }

        const tokenData = await exchangeCodeForToken(String(code));

        const userId = Number(state);

        const appUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!appUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const senderType =
            appUser.role === "ADMIN" ? "ADMIN_COMPANY" : "WORKER_PERSONAL";

        await prisma.outlookConnection.upsert({
            where: { userId },
            update: {
                outlookEmail: tokenData.id_token || appUser.email,
                connectionType: senderType,
                refreshTokenEnc: tokenData.refresh_token || "",
                accessTokenEnc: tokenData.access_token || "",
                tokenExpiresAt: tokenData.expires_in
                    ? new Date(Date.now() + tokenData.expires_in * 1000)
                    : null,
                isActive: true
            },
            create: {
                userId,
                outlookEmail: appUser.email,
                connectionType: senderType,
                refreshTokenEnc: tokenData.refresh_token || "",
                accessTokenEnc: tokenData.access_token || "",
                tokenExpiresAt: tokenData.expires_in
                    ? new Date(Date.now() + tokenData.expires_in * 1000)
                    : null,
                isActive: true
            }
        });

        res.status(200).json({
            message: "Outlook connected successfully"
        });
    } catch (error) {
        console.error("Outlook callback error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getOutlookStatus = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const connection = await prisma.outlookConnection.findUnique({
            where: { userId: req.user.userId },
            select: {
                id: true,
                outlookEmail: true,
                connectionType: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.status(200).json({
            connected: !!connection,
            connection
        });
    } catch (error) {
        console.error("Get Outlook status error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const disconnectOutlook = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const connection = await prisma.outlookConnection.findUnique({
            where: { userId: req.user.userId }
        });

        if (!connection) {
            res.status(404).json({ message: "Outlook connection not found" });
            return;
        }

        await prisma.outlookConnection.delete({
            where: { userId: req.user.userId }
        });

        res.status(200).json({
            message: "Outlook disconnected successfully"
        });
    } catch (error) {
        console.error("Disconnect Outlook error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};