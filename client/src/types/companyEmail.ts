export interface CompanyEmail {
    id: number;
    companyId: number;
    contactName: string | null;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCompanyEmailPayload {
    contactName?: string;
    email: string;
}