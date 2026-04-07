import { Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { smtpConfig } from "../../config/smtp";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendMailViaSmtp } from "./mail.service";

export const sendMail = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { draftId, companyEmailIds, cc } = req.body;

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!draftId || !Array.isArray(companyEmailIds) || companyEmailIds.length === 0) {
            res.status(400).json({ message: "Draft and recipients are required" });
            return;
        }

        const draft = await prisma.draft.findUnique({
            where: { id: Number(draftId) },
            include: { attachments: true }
        });

        if (!draft) {
            res.status(404).json({ message: "Draft not found" });
            return;
        }

        const canSend =
            req.user.role === "ADMIN" ||
            draft.visibility === "SHARED" ||
            draft.createdById === req.user.userId;

        if (!canSend) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        const recipientIds = companyEmailIds
            .map((id: unknown) => Number(id))
            .filter((id: number) => !Number.isNaN(id));

        if (recipientIds.length === 0) {
            res.status(400).json({ message: "No valid recipient ids provided" });
            return;
        }

        const recipients = await prisma.companyEmail.findMany({
            where: {
                id: { in: recipientIds }
            }
        });

        if (recipients.length === 0) {
            res.status(400).json({ message: "No valid recipients found" });
            return;
        }

        const cleanedCc = Array.isArray(cc)
            ? cc.map((item: unknown) => String(item).trim()).filter((item: string) => item.length > 0)
            : [];

        const htmlWithFooter = `
            ${draft.bodyHtml}
            <hr />
            <p><strong>Sent by:</strong> ${req.user.name}</p>
            <p><strong>Contact:</strong> ${req.user.email}</p>
        `;

        await sendMailViaSmtp({
            to: recipients.map((r) => r.email),
            cc: cleanedCc,
            subject: draft.subject,
            html: htmlWithFooter,
            workerName: req.user.name,
            workerEmail: req.user.email,
            attachments: draft.attachments.map((item) => ({
                filename: item.fileName,
                path: item.filePath,
                contentType: item.mimeType
            }))
        });

        const mailLogData = {
            sentByUserId: req.user.userId,
            workerName: req.user.name,
            workerEmail: req.user.email,
            senderEmail: smtpConfig.fromEmail,
            senderType:
                req.user.role === "ADMIN"
                    ? "ADMIN_COMPANY"
                    : "WORKER_PERSONAL",
            draftId: draft.id,
            subjectSnapshot: draft.subject,
            bodySnapshot: htmlWithFooter,
            recipients: {
                create: [
                    ...recipients.map((r) => ({
                        companyId: r.companyId,
                        companyEmailId: r.id,
                        recipientEmail: r.email,
                        recipientType: "TO" as const,
                        sourceType: "SYSTEM" as const
                    })),
                    ...cleanedCc.map((email) => ({
                        companyId: null,
                        companyEmailId: null,
                        recipientEmail: email,
                        recipientType: "CC" as const,
                        sourceType: "MANUAL_CC" as const
                    }))
                ]
            }
        } satisfies Prisma.MailLogUncheckedCreateInput;

        await prisma.mailLog.create({
            data: mailLogData
        });

        res.status(200).json({
            message: "Mail sent successfully"
        });
    } catch (error) {
        console.error("Send mail error:", error);
        res.status(500).json({
            message: "Failed to send mail"
        });
    }
};
