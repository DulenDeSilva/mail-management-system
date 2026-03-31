export interface AppUser {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "WORKER";
    isActive: boolean;
    createdAt: string;
}

export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "WORKER";
}