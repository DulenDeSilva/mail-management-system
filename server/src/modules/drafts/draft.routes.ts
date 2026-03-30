import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
    createDraft,
    getDrafts,
    getDraftById,
    updateDraft,
    deleteDraft
} from "./draft.controller";

const router = Router();

router.post("/", authMiddleware, createDraft);
router.get("/", authMiddleware, getDrafts);
router.get("/:id", authMiddleware, getDraftById);
router.put("/:id", authMiddleware, updateDraft);
router.delete("/:id", authMiddleware, deleteDraft);

export default router;