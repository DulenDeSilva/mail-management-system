import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import upload from "../../config/multer";
import {
    uploadDraftAttachment,
    getDraftAttachments,
    deleteDraftAttachment
} from "./attachments.controller";

const router = Router();

router.post(
    "/draft/:draftId",
    authMiddleware,
    upload.array("files", 3),
    uploadDraftAttachment
);

router.get(
    "/draft/:draftId",
    authMiddleware,
    getDraftAttachments
);

router.delete(
    "/:id",
    authMiddleware,
    deleteDraftAttachment
);

export default router;