import { Router } from "express";
import { login, getMe, updateMe } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

export default router;
