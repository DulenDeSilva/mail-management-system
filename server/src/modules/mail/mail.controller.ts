import { Response } from "express";
import {
    Prisma,
    RecipientSourceType,
    RecipientType,
    SenderType,
    UserRole
} from "@prisma/client";
import prisma from "../../config/prisma";
import { smtpConfig } from "../../config/smtp";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendMailViaSmtp } from "./mail.service";

export const sendMail = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { draftId, companyEmailIds, cc } = req.body as {
            draftId?: unknown;
            companyEmailIds?: unknown;
            cc?: unknown;
        };

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!draftId || !Array.isArray(companyEmailIds) || companyEmailIds.length === 0) {
            res.status(400).json({ message: "Draft and recipients are required" });
            return;
        }

        const parsedDraftId = Number(draftId);

        if (Number.isNaN(parsedDraftId)) {
            res.status(400).json({ message: "Invalid draft id provided" });
            return;
        }

        const draft = await prisma.draft.findUnique({
            where: { id: parsedDraftId },
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

        const recipientIds = Array.from(
            new Set(
                companyEmailIds
                    .map((id: unknown) => Number(id))
                    .filter((id: number) => !Number.isNaN(id))
            )
        );

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
            ? Array.from(
                  new Set(
                      cc
                          .map((item: unknown) => String(item).trim())
                          .filter((item: string) => item.length > 0)
                  )
              )
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

        const recipientCreates: Prisma.MailLogRecipientCreateWithoutMailLogInput[] = [
            ...recipients.map((recipient) => ({
                recipientEmail: recipient.email,
                recipientType: RecipientType.TO,
                sourceType: RecipientSourceType.SYSTEM,
                company: {
                    connect: { id: recipient.companyId }
                },
                companyEmail: {
                    connect: { id: recipient.id }
                }
            })),
            ...cleanedCc.map((email) => ({
                recipientEmail: email,
                recipientType: RecipientType.CC,
                sourceType: RecipientSourceType.MANUAL_CC
            }))
        ];

        const mailLogData: Prisma.MailLogCreateInput = {
            workerName: req.user.name,
            workerEmail: req.user.email,
            senderEmail: smtpConfig.fromEmail,
            senderType:
                req.user.role === UserRole.ADMIN
                    ? SenderType.ADMIN_COMPANY
                    : SenderType.WORKER_PERSONAL,
            subjectSnapshot: draft.subject,
            bodySnapshot: htmlWithFooter,
            sentByUser: {
                connect: { id: req.user.userId }
            },
            draft: {
                connect: { id: draft.id }
            },
            recipients: {
                create: recipientCreates
            }
        };

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

export const getMailLogs = async (
    _req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const mailLogs = await prisma.mailLog.findMany({
            orderBy: {
                sentAt: "desc"
            },
            select: {
                id: true,
                workerName: true,
                workerEmail: true,
                senderEmail: true,
                senderType: true,
                subjectSnapshot: true,
                bodySnapshot: true,
                sentAt: true,
                sentByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                draft: {
                    select: {
                        id: true,
                        title: true,
                        subject: true
                    }
                },
                recipients: {
                    orderBy: [
                        {
                            recipientType: "asc"
                        },
                        {
                            id: "asc"
                        }
                    ],
                    select: {
                        id: true,
                        recipientEmail: true,
                        recipientType: true,
                        sourceType: true,
                        company: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        companyEmail: {
                            select: {
                                id: true,
                                contactName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json(mailLogs);
    } catch (error) {
        console.error("Get mail logs error:", error);
        res.status(500).json({
            message: "Failed to load mail logs"
        });
    }
};
