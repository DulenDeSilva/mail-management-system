import axios from "axios";
import { useEffect, useState } from "react";
import {
    disconnectOutlookRequest,
    getOutlookConnectRequest,
    getOutlookStatusRequest,
} from "../api/outlookApi";
import { useAuth } from "../context/useAuth";
import type { OutlookStatusResponse } from "../types/outlook";

type ApiErrorResponse = { message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

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
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to load Outlook status"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadStatus();
    }, []);

    const handleConnect = async () => {
        try {
            setConnecting(true);
            setError("");

            const data = await getOutlookConnectRequest();

            if (data.authUrl) {
                window.location.href = data.authUrl;
            }
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to start Outlook connection"));
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
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to disconnect Outlook"));
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header__copy">
                    <span className="eyebrow">Delivery Setup</span>
                    <h1 className="page-title">Outlook Connection</h1>
                    <p className="page-subtitle">
                        Connect the correct mailbox so the mail workflow can move from
                        preview mode to live sending.
                    </p>
                </div>

                <div className="page-actions">
                    <span
                        className={`badge ${
                            status?.connected ? "badge--success" : "badge--warm"
                        }`}
                    >
                        {status?.connected ? "Connected" : "Pending"}
                    </span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}

            <div className="split-layout split-layout--balanced">
                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Mailbox Status</span>
                            <h2>Connection details</h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading Outlook status...</div>
                    ) : status?.connected && status.connection ? (
                        <div className="summary-stack">
                            <div className="summary-row">
                                <span>Email</span>
                                <strong>{status.connection.outlookEmail}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Connection Type</span>
                                <strong>{status.connection.connectionType}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Status</span>
                                <span
                                    className={`badge ${
                                        status.connection.isActive
                                            ? "badge--success"
                                            : "badge--danger"
                                    }`}
                                >
                                    {status.connection.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="button button--danger"
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                            >
                                {disconnecting ? "Disconnecting..." : "Disconnect Outlook"}
                            </button>
                        </div>
                    ) : (
                        <div className="form-grid">
                            <div className="message message--info">
                                {user?.role === "ADMIN"
                                    ? "Admins should connect the company mailbox used for team sending."
                                    : "Workers should connect their personal company Outlook mailbox."}
                            </div>

                            <button
                                type="button"
                                className="button"
                                onClick={handleConnect}
                                disabled={connecting}
                            >
                                {connecting ? "Connecting..." : "Connect Outlook"}
                            </button>
                        </div>
                    )}
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Readiness Note</span>
                            <h2>What to expect</h2>
                        </div>
                    </div>

                    <div className="summary-stack">
                        <div className="summary-row">
                            <span>Approval Flow</span>
                            <strong>Microsoft tenant approval may still be required.</strong>
                        </div>
                        <div className="summary-row">
                            <span>Retry Behavior</span>
                            <strong>You can reconnect later without changing the UI setup.</strong>
                        </div>
                        <div className="summary-row">
                            <span>Target Mailbox</span>
                            <strong>
                                {user?.role === "ADMIN"
                                    ? "Company shared mailbox"
                                    : "Personal company mailbox"}
                            </strong>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OutlookPage;
