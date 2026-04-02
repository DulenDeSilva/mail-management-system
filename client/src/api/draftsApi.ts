import api from "./axios";
import type { CreateDraftPayload, Draft } from "../types/draft";

export const getDraftsRequest = async () => {
    const response = await api.get<Draft[]>("/drafts");
    return response.data;
};

export const getDraftByIdRequest = async (draftId: number) => {
    const response = await api.get<Draft>(`/drafts/${draftId}`);
    return response.data;
};

export const createDraftRequest = async (payload: CreateDraftPayload) => {
    const response = await api.post("/drafts", payload);
    return response.data;
};

export const updateDraftRequest = async (
    draftId: number,
    payload: Partial<CreateDraftPayload>
) => {
    const response = await api.put(`/drafts/${draftId}`, payload);
    return response.data;
};

export const deleteDraftRequest = async (draftId: number) => {
    const response = await api.delete(`/drafts/${draftId}`);
    return response.data;
};