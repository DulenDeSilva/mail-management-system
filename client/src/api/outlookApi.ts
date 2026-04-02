import api from "./axios";
import type {
    OutlookConnectResponse,
    OutlookStatusResponse,
} from "../types/outlook";

export const getOutlookStatusRequest = async () => {
    const response = await api.get<OutlookStatusResponse>("/outlook/status");
    return response.data;
};

export const getOutlookConnectRequest = async () => {
    const response = await api.get<OutlookConnectResponse>("/outlook/connect");
    return response.data;
};

export const disconnectOutlookRequest = async () => {
    const response = await api.delete("/outlook/disconnect");
    return response.data;
};