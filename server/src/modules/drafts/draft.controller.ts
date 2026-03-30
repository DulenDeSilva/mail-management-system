import { Response } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

export const createDraft = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { title, subject, bodyHtml, visibility } = req.body;

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!title || !subject || !bodyHtml || !visibility) {
            res.status(400).json({
                message: "Title, subject, bodyHtml and visibility are required"
            });
            return;
        }

        if (!["PERSONAL", "SHARED"].includes(visibility)) {
            res.status(400).json({ message: "Invalid visibility" });
            return;
        }

        const draft = await prisma.draft.create({
            data: {
                title: title.trim(),
                subject: subject.trim(),
                bodyHtml,
                visibility,
                createdById: req.user.userId
            }
        });

        res.status(201).json({
            message: "Draft created successfully",
            draft
        });
    } catch (error) {
        console.error("Create draft error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getDrafts = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const drafts = await prisma.draft.findMany({
            where: req.user.role === "ADMIN"
                ? {}
                : {
                    OR: [
                        { visibility: "SHARED" },
                        { createdById: req.user.userId }
                    ]
                },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json(drafts);
    } catch (error) {
        console.error("Get drafts error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getDraftById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const draftId = Number(req.params.id);

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (Number.isNaN(draftId)) {
            res.status(400).json({ message: "Invalid draft id" });
            return;
        }

        const draft = await prisma.draft.findUnique({
            where: { id: draftId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!draft) {
            res.status(404).json({ message: "Draft not found" });
            return;
        }

        const canView =
            req.user.role === "ADMIN" ||
            draft.visibility === "SHARED" ||
            draft.createdById === req.user.userId;

        if (!canView) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        res.status(200).json(draft);
    } catch (error) {
        console.error("Get draft by id error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateDraft = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const draftId = Number(req.params.id);
        const { title, subject, bodyHtml, visibility } = req.body;

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (Number.isNaN(draftId)) {
            res.status(400).json({ message: "Invalid draft id" });
            return;
        }

        const existingDraft = await prisma.draft.findUnique({
            where: { id: draftId }
        });

        if (!existingDraft) {
            res.status(404).json({ message: "Draft not found" });
            return;
        }

        if (existingDraft.createdById !== req.user.userId) {
            res.status(403).json({ message: "You can only edit your own drafts" });
            return;
        }

        const updatedDraft = await prisma.draft.update({
            where: { id: draftId },
            data: {
                title: title?.trim() ?? existingDraft.title,
                subject: subject?.trim() ?? existingDraft.subject,
                bodyHtml: bodyHtml ?? existingDraft.bodyHtml,
                visibility: visibility ?? existingDraft.visibility
            }
        });

        res.status(200).json({
            message: "Draft updated successfully",
            draft: updatedDraft
        });
    } catch (error) {
        console.error("Update draft error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteDraft = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const draftId = Number(req.params.id);

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (Number.isNaN(draftId)) {
            res.status(400).json({ message: "Invalid draft id" });
            return;
        }

        const existingDraft = await prisma.draft.findUnique({
            where: { id: draftId }
        });

        if (!existingDraft) {
            res.status(404).json({ message: "Draft not found" });
            return;
        }

        if (existingDraft.createdById !== req.user.userId) {
            res.status(403).json({ message: "You can only delete your own drafts" });
            return;
        }

        await prisma.draft.delete({
            where: { id: draftId }
        });

        res.status(200).json({ message: "Draft deleted successfully" });
    } catch (error) {
        console.error("Delete draft error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};