import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { validateAndNormalizeEmail } from "../../utils/email";

export const createCompanyEmail = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const companyId = Number(req.params.companyId);
        const { contactName, email } = req.body;

        if (Number.isNaN(companyId)) {
            res.status(400).json({ message: "Invalid company id" });
            return;
        }

        const emailResult = validateAndNormalizeEmail(email);

        if ("error" in emailResult) {
            res.status(400).json({ message: emailResult.error });
            return;
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!company) {
            res.status(404).json({ message: "Company not found" });
            return;
        }

        const companyEmail = await prisma.companyEmail.create({
            data: {
                companyId,
                contactName: typeof contactName === "string" ? contactName.trim() || null : null,
                email: emailResult.email
            }
        });

        res.status(201).json({
            message: "Company email created successfully",
            companyEmail
        });
    } catch (error) {
        console.error("Create company email error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCompanyEmails = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const companyId = Number(req.params.companyId);

        if (Number.isNaN(companyId)) {
            res.status(400).json({ message: "Invalid company id" });
            return;
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!company) {
            res.status(404).json({ message: "Company not found" });
            return;
        }

        const companyEmails = await prisma.companyEmail.findMany({
            where: { companyId },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json(companyEmails);
    } catch (error) {
        console.error("Get company emails error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCompanyEmail = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const emailId = Number(req.params.id);
        const { contactName, email } = req.body;

        if (Number.isNaN(emailId)) {
            res.status(400).json({ message: "Invalid company email id" });
            return;
        }

        const emailResult = validateAndNormalizeEmail(email);

        if ("error" in emailResult) {
            res.status(400).json({ message: emailResult.error });
            return;
        }

        const existingEmail = await prisma.companyEmail.findUnique({
            where: { id: emailId }
        });

        if (!existingEmail) {
            res.status(404).json({ message: "Company email not found" });
            return;
        }

        const updatedEmail = await prisma.companyEmail.update({
            where: { id: emailId },
            data: {
                contactName: typeof contactName === "string" ? contactName.trim() || null : null,
                email: emailResult.email
            }
        });

        res.status(200).json({
            message: "Company email updated successfully",
            companyEmail: updatedEmail
        });
    } catch (error) {
        console.error("Update company email error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteCompanyEmail = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const emailId = Number(req.params.id);

        if (Number.isNaN(emailId)) {
            res.status(400).json({ message: "Invalid company email id" });
            return;
        }

        const existingEmail = await prisma.companyEmail.findUnique({
            where: { id: emailId }
        });

        if (!existingEmail) {
            res.status(404).json({ message: "Company email not found" });
            return;
        }

        await prisma.companyEmail.delete({
            where: { id: emailId }
        });

        res.status(200).json({
            message: "Company email deleted successfully"
        });
    } catch (error) {
        console.error("Delete company email error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
