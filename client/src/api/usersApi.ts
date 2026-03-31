import api from "./axios";
import type { AppUser, CreateUserPayload } from "../types/user";

export const getUsersRequest = async () => {
    const response = await api.get<AppUser[]>("/users");
    return response.data;
};

export const createUserRequest = async (payload: CreateUserPayload) => {
    const response = await api.post("/users", payload);
    return response.data;
};

export const deactivateUserRequest = async (userId: number) => {
    const response = await api.patch(`/users/${userId}/deactivate`);
    return response.data;
};