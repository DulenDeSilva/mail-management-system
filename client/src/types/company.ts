export interface Company {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCompanyPayload {
    name: string;
}