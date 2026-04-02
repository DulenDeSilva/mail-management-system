import { useEffect, useState } from "react";
import {
    disconnectOutlookRequest,
    getOutlookConnectRequest,
    getOutlookStatusRequest,
} from "../api/outlookApi";
import { useAuth } from "../context/AuthContext";
import type { OutlookStatusResponse } from "../types/outlook";

const OutlookPage = () => {
    const { user } = useAuth();

    const [status, setStatus] = useState<OutlookStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [error, setError] = useState("");

    const loadStatus = async () => {
        try {
            setLoading(true);
            const data = await getOutlookStatusRequest();
            setStatus(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load Outlook status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const handleConnect = async () => {
        try {
            setConnecting(true);
            setError("");

            const data = await getOutlookConnectRequest();

            if (data.authUrl) {
                window.location.href = data.authUrl;
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to start Outlook connection");
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            setDisconnecting(true);
            setError("");
            await disconnectOutlookRequest();
            await loadStatus();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to disconnect Outlook");
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div>
            <h1>Outlook Connection</h1>

            <p>
                Connect your Outlook account so the system can send emails using your
                mailbox.
            </p>

            {error && <p style={{ color: "#f87171" }}>{error}</p>}

            <div
                style={{
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: 16,
                    maxWidth: 700,
                }}
            >
                {loading ? (
                    <p>Loading Outlook status...</p>
                ) : status?.connected && status.connection ? (
                    <>
                        <h2>Connected</h2>
                        <p>
                            <strong>Email:</strong> {status.connection.outlookEmail}
                        </p>
                        <p>
                            <strong>Connection Type:</strong> {status.connection.connectionType}
                        </p>
                        <p>
                            <strong>Status:</strong>{" "}
                            {status.connection.isActive ? "Active" : "Inactive"}
                        </p>

                        <button onClick={handleDisconnect} disabled={disconnecting}>
                            {disconnecting ? "Disconnecting..." : "Disconnect Outlook"}
                        </button>
                    </>
                ) : (
                    <>
                        <h2>Not Connected</h2>
                        <p>
                            {user?.role === "ADMIN"
                                ? "Admin should connect the company mailbox."
                                : "Workers should connect their personal company Outlook mailbox."}
                        </p>

                        <button onClick={handleConnect} disabled={connecting}>
                            {connecting ? "Connecting..." : "Connect Outlook"}
                        </button>
                    </>
                )}
            </div>

            <div
                style={{
                    marginTop: 20,
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: 16,
                    maxWidth: 700,
                }}
            >
                <h3>Note</h3>
                <p>
                    If Microsoft approval or tenant configuration is still pending, the
                    connection flow may not complete yet. The page and integration are
                    ready, and you can retry once approval is available.
                </p>
            </div>
        </div>
    );
};

export default OutlookPage;