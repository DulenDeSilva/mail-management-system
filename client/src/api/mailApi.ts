import api from "./axios";

export interface SendMailPayload {
    draftId: number;
    companyEmailIds: number[];
    cc?: string[];
}

export interface SendMailResponse {
    message: string;
}

export const sendMailRequest = async (payload: SendMailPayload) => {
    const response = await api.post<SendMailResponse>("/mail/send", payload);
    return response.data;
};
