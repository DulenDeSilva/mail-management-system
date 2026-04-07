import { DraftVisibility, Prisma } from "@prisma/client";
import type { JwtUserPayload } from "../../utils/jwt";

type DraftAccessTarget = {
    visibility: DraftVisibility;
    createdById: number;
};

export const getAccessibleDraftWhere = (
    user: JwtUserPayload
): Prisma.DraftWhereInput => ({
    OR: [
        { visibility: DraftVisibility.SHARED },
        { createdById: user.userId }
    ]
});

export const canAccessDraft = (
    user: JwtUserPayload,
    draft: DraftAccessTarget
): boolean =>
    draft.visibility === DraftVisibility.SHARED ||
    draft.createdById === user.userId;
