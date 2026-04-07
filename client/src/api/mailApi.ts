import api from "./axios";
import type { MailLog } from "../types/mailLog";

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

export const getMailLogsRequest = async () => {
    const response = await api.get<MailLog[]>("/mail/logs");
    return response.data;
};
