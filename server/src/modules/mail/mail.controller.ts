import { Response } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendMailViaSmtp } from "./mail.service";

export const sendMail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { draftId, companyEmailIds, cc, replyTo } = req.body;

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
        });

        if (!draft) {
            res.status(404).json({ message: "Draft not found" });
            return;
        }

        const recipients = await prisma.companyEmail.findMany({
            where: {
                id: { in: companyEmailIds.map(Number) },
            },
        });

        if (recipients.length === 0) {
            res.status(400).json({ message: "No valid recipients found" });
            return;
        }

        const attachments = await prisma.draftAttachment.findMany({
            where: { draftId: draft.id },
        });

        const htmlWithFooter = `
      ${draft.bodyHtml}
      <hr />
      <p>Handled by: ${req.user.email}</p>
    `;

        const mailResult = await sendMailViaSmtp({
            to: recipients.map((r) => r.email),
            cc: Array.isArray(cc) ? cc : [],
            replyTo: replyTo || undefined,
            subject: draft.subject,
            html: htmlWithFooter,
            attachments: attachments.map((item) => ({
                filename: item.fileName,
                path: item.filePath,
                contentType: item.mimeType,
            })),
        });

        await prisma.mailLog.create({
            data: {
                sentByUserId: req.user.userId,
                draftId: draft.id,
                fromEmail: process.env.SMTP_FROM_EMAIL || "",
                replyTo: replyTo || null,
                subjectSnapshot: draft.subject,
                bodySnapshot: htmlWithFooter,
                toEmailsJson: JSON.stringify(recipients.map((r) => r.email)),
                ccEmailsJson: JSON.stringify(Array.isArray(cc) ? cc : []),
                status: "SENT",
                providerMessageId: mailResult.messageId || null,
            },
        });

        res.status(200).json({
            message: "Mail sent successfully",
        });
    } catch (error: any) {
        console.error("Send mail error:", error);

        res.status(500).json({
            message: "Failed to send mail",
        });
    }
};