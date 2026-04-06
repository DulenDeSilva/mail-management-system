import api from "./axios";

export const sendMailRequest = async (payload: {
    draftId: number;
    companyEmailIds: number[];
    cc?: string[];
    replyTo?: string;
}) => {
    const response = await api.post("/mail/send", payload);
    return response.data;
};