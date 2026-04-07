import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import companiesRoutes from "./modules/companies/companies.routes";
import companyEmailsRoutes from "./modules/companyEmails/companyEmails.routes";
import draftsRoutes from "./modules/drafts/draft.routes";
import attachmentsRoutes from "./modules/attachments/attachments.routes";
import mailRoutes from "./modules/mail/mail.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/company-emails", companyEmailsRoutes);
app.use("/api/drafts", draftsRoutes);
app.use("/api/attachments", attachmentsRoutes);
app.use("/api/mail", mailRoutes);

export default app;