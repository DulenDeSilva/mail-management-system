import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { roleMiddleware } from "../../middleware/role.middleware";

import {
    createUser,
    getUsers,
    updateUser,
    deactivateUser,
    activateUser
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

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    updateUser
);

router.patch(
    "/:id/deactivate",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deactivateUser
);

router.patch(
    "/:id/activate",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    activateUser
);

export default router;
