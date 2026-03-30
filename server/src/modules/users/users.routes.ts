import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

import {
    createUser,
    getUsers,
    deactivateUser
} from "./users.controller";

const router = Router();

router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    (_req, res) => {
        res.json({ message: "Admin route accessed successfully" });
    }
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createUser
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    getUsers
);

router.patch(
    "/:id/deactivate",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deactivateUser
);

export default router;