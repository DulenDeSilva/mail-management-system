import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
    connectOutlook,
    outlookCallback,
    getOutlookStatus,
    disconnectOutlook
} from "./outlook.controller";

const router = Router();

router.get("/connect", authMiddleware, connectOutlook);
router.get("/callback", outlookCallback);
router.get("/status", authMiddleware, getOutlookStatus);
router.delete("/disconnect", authMiddleware, disconnectOutlook);

export default router;