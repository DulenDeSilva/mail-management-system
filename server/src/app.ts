import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);

export default app;