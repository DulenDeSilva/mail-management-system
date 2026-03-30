import { Request, Response } from "express";
import prisma from "../../config/prisma";

export const createCompany = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            res.status(400).json({ message: "Company name is required" });
            return;
        }

        const company = await prisma.company.create({
            data: {
                name: name.trim()
            }
        });

        res.status(201).json({
            message: "Company created successfully",
            company
        });
    } catch (error) {
        console.error("Create company error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCompanies = async (_req: Request, res: Response): Promise<void> => {
    try {
        const companies = await prisma.company.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json(companies);
    } catch (error) {
        console.error("Get companies error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCompany = async (req: Request, res: Response): Promise<void> => {
    try {
        const companyId = Number(req.params.id);
        const { name } = req.body;

        if (Number.isNaN(companyId)) {
            res.status(400).json({ message: "Invalid company id" });
            return;
        }

        if (!name || !name.trim()) {
            res.status(400).json({ message: "Company name is required" });
            return;
        }

        const existingCompany = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!existingCompany) {
            res.status(404).json({ message: "Company not found" });
            return;
        }

        const company = await prisma.company.update({
            where: { id: companyId },
            data: {
                name: name.trim()
            }
        });

        res.status(200).json({
            message: "Company updated successfully",
            company
        });
    } catch (error) {
        console.error("Update company error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
    try {
        const companyId = Number(req.params.id);

        if (Number.isNaN(companyId)) {
            res.status(400).json({ message: "Invalid company id" });
            return;
        }

        const existingCompany = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!existingCompany) {
            res.status(404).json({ message: "Company not found" });
            return;
        }

        await prisma.company.delete({
            where: { id: companyId }
        });

        res.status(200).json({
            message: "Company deleted successfully"
        });
    } catch (error) {
        console.error("Delete company error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};