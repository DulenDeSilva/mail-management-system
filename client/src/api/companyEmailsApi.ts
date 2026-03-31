import api from "./axios";
import type { CompanyEmail, CreateCompanyEmailPayload } from "../types/companyEmail";

export const getCompanyEmailsRequest = async (companyId: number) => {
    const response = await api.get<CompanyEmail[]>(`/company-emails/company/${companyId}`);
    return response.data;
};

export const createCompanyEmailRequest = async (
    companyId: number,
    payload: CreateCompanyEmailPayload
) => {
    const response = await api.post(`/company-emails/company/${companyId}`, payload);
    return response.data;
};

export const updateCompanyEmailRequest = async (
    emailId: number,
    payload: CreateCompanyEmailPayload
) => {
    const response = await api.put(`/company-emails/${emailId}`, payload);
    return response.data;
};

export const deleteCompanyEmailRequest = async (emailId: number) => {
    const response = await api.delete(`/company-emails/${emailId}`);
    return response.data;
};