export type DraftVisibility = "PERSONAL" | "SHARED";

export interface DraftCreator {
    id: number;
    name: string;
    email: string;
}

export interface Draft {
    id: number;
    title: string;
    subject: string;
    bodyHtml: string;
    visibility: DraftVisibility;
    createdById: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: DraftCreator;
}

export interface CreateDraftPayload {
    title: string;
    subject: string;
    bodyHtml: string;
    visibility: DraftVisibility;
}