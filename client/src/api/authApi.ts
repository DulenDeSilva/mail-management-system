import api from "./axios";
import type {
    AuthSessionResponse,
    LoginResponse,
    UpdateProfilePayload,
    User
} from "../types/auth";

export const loginRequest = async (email: string, password: string) => {
    const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
    });

    return response.data;
};

export const getMeRequest = async () => {
    const response = await api.get<User>("/auth/me");
    return response.data;
};

export const updateMeRequest = async (payload: UpdateProfilePayload) => {
    const response = await api.put<AuthSessionResponse>("/auth/me", payload);
    return response.data;
};
