import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
    createCompanyEmail,
    getCompanyEmails,
    updateCompanyEmail,
    deleteCompanyEmail
} from "./companyEmails.controller";

const router = Router();

router.post(
    "/company/:companyId",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createCompanyEmail
);

router.get(
    "/company/:companyId",
    authMiddleware,
    roleMiddleware(["ADMIN", "WORKER"]),
    getCompanyEmails
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    updateCompanyEmail
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deleteCompanyEmail
);

export default router;
