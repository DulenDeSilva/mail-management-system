import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import { getMailLogs, sendMail } from "./mail.controller";

const router = Router();

router.get("/logs", authMiddleware, roleMiddleware(["ADMIN"]), getMailLogs);
router.post("/send", authMiddleware, sendMail);

export default router;
