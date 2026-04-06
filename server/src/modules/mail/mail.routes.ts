import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { sendMail } from "./mail.controller";

const router = Router();

router.post("/send", authMiddleware, sendMail);

export default router;