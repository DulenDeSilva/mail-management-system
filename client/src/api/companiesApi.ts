import api from "./axios";
import type { Company, CreateCompanyPayload } from "../types/company";

export const getCompaniesRequest = async () => {
    const response = await api.get<Company[]>("/companies");
    return response.data;
};

export const createCompanyRequest = async (payload: CreateCompanyPayload) => {
    const response = await api.post("/companies", payload);
    return response.data;
};

export const updateCompanyRequest = async (companyId: number, payload: CreateCompanyPayload) => {
    const response = await api.put(`/companies/${companyId}`, payload);
    return response.data;
};

export const deleteCompanyRequest = async (companyId: number) => {
    const response = await api.delete(`/companies/${companyId}`);
    return response.data;
};