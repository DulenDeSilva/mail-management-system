import { Response } from "express";
import fs from "fs";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { canAccessDraft } from "../drafts/draft-access";

export const uploadDraftAttachment = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const draftId = Number(req.params.draftId);

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (Number.isNaN(draftId)) {
            res.status(400).json({ message: "Invalid draft id" });
            return;
        }

        const draft = await prisma.draft.findUnique({
            where: { id: draftId }
        });

        if (!draft) {
            res.status(404).json({ message: "Draft not found" });
            return;
        }

        if (draft.createdById !== req.user.userId) {
            res.status(403).json({
                message: "You can only upload attachments to your own drafts"
            });
            return;
        }

        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({ message: "At least one file is required" });
            return;
        }

        const existingCount = await prisma.draftAttachment.count({
            where: { draftId }
        });

        if (existingCount + files.length > 3) {
            for (const file of files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }

            res.status(400).json({
                message: `Maximum 3 attachments allowed per draft. Current: ${existingCount}, uploading: ${files.length}`
            });
            return;
        }

        const attachments = await Promise.all(
            files.map((file) =>
                prisma.draftAttachment.create({
                    data: {
                        draftId,
                        fileName: file.originalname,
                        filePath: file.path,
                        mimeType: file.mimetype,
                        sizeBytes: file.size
                    }
                })
            )
        );

        res.status(201).json({
            message: "Attachments uploaded successfully",
            attachments
        });
    } catch (error) {
        console.error("Upload attachment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getDraftAttachments = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const draftId = Number(req.params.draftId);

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (Number.isNaN(draftId)) {
            res.status(400).json({ message: "Invalid draft id" });
            return;
        }

        const draft = await prisma.draft.findUnique({
            where: { id: draftId }
        });

        if (!draft) {
            res.status(404).json({ message: "Draft not found" });
            return;
        }

        const canView = canAccessDraft(req.user, draft);

        if (!canView) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const attachments = await prisma.draftAttachment.findMany({
            where: { draftId },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json(attachments);
    } catch (error) {
        console.error("Get attachments error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteDraftAttachment = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const attachmentId = Number(req.params.id);

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (Number.isNaN(attachmentId)) {
            res.status(400).json({ message: "Invalid attachment id" });
            return;
        }

        const attachment = await prisma.draftAttachment.findUnique({
            where: { id: attachmentId },
            include: { draft: true }
        });

        if (!attachment) {
            res.status(404).json({ message: "Attachment not found" });
            return;
        }

        if (attachment.draft.createdById !== req.user.userId) {
            res.status(403).json({
                message: "You can only delete attachments from your own drafts"
            });
            return;
        }

        if (fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
        }

        await prisma.draftAttachment.delete({
            where: { id: attachmentId }
        });

        res.status(200).json({
            message: "Attachment deleted successfully"
        });
    } catch (error) {
        console.error("Delete attachment error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
