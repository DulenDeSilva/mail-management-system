export interface OutlookConnection {
    id: number;
    outlookEmail: string;
    connectionType: "WORKER_PERSONAL" | "ADMIN_COMPANY";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OutlookStatusResponse {
    connected: boolean;
    connection: OutlookConnection | null;
}

export interface OutlookConnectResponse {
    authUrl: string;
}