export interface User {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "WORKER";
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}