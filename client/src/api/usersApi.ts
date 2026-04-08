import api from "./axios";
import type { AppUser, CreateUserPayload, UpdateUserPayload } from "../types/user";

export const getUsersRequest = async () => {
    const response = await api.get<AppUser[]>("/users");
    return response.data;
};

export const createUserRequest = async (payload: CreateUserPayload) => {
    const response = await api.post("/users", payload);
    return response.data;
};

export const updateUserRequest = async (userId: number, payload: UpdateUserPayload) => {
    const response = await api.put(`/users/${userId}`, payload);
    return response.data;
};

export const deactivateUserRequest = async (userId: number) => {
    const response = await api.patch(`/users/${userId}/deactivate`);
    return response.data;
};

export const activateUserRequest = async (userId: number) => {
    const response = await api.patch(`/users/${userId}/activate`);
    return response.data;
};
