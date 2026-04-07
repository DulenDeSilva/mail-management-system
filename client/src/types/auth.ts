export interface User {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "WORKER";
    isActive?: boolean;
    createdAt?: string;
}

export interface AuthSessionResponse {
    message: string;
    token: string;
    user: User;
}

export type LoginResponse = AuthSessionResponse;

export interface UpdateProfilePayload {
    name: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
}
