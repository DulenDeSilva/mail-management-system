import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";
import {
    createCompany,
    getCompanies,
    updateCompany,
    deleteCompany
} from "./companies.controller";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createCompany
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    getCompanies
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    updateCompany
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deleteCompany
);

export default router;