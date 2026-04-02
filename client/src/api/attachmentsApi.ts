import api from "./axios";
import type { DraftAttachment } from "../types/attachment";

export const getDraftAttachmentsRequest = async (draftId: number) => {
    const response = await api.get<DraftAttachment[]>(`/attachments/draft/${draftId}`);
    return response.data;
};

export const uploadDraftAttachmentsRequest = async (
    draftId: number,
    files: File[]
) => {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("files", file);
    });

    const response = await api.post(`/attachments/draft/${draftId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const deleteDraftAttachmentRequest = async (attachmentId: number) => {
    const response = await api.delete(`/attachments/${attachmentId}`);
    return response.data;
};