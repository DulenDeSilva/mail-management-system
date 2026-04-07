import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { getMailLogsRequest } from "../api/mailApi";
import { useAuth } from "../context/useAuth";
import type { MailLog, MailLogRecipient } from "../types/mailLog";

type ApiErrorResponse = { message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });

const MailLogsPage = () => {
    const { user } = useAuth();

    const [mailLogs, setMailLogs] = useState<MailLog[]>([]);
    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadMailLogs = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMailLogsRequest();
            setMailLogs(data);
            setSelectedLogId((currentSelectedLogId) => {
                if (data.length === 0) {
                    return null;
                }

                const hasCurrentSelection = data.some((log) => log.id === currentSelectedLogId);
                return hasCurrentSelection ? currentSelectedLogId : data[0].id;
            });
        } catch (loadError: unknown) {
            setError(getErrorMessage(loadError, "Failed to load mail logs"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadMailLogs();
    }, []);

    const selectedLog = useMemo(
        () => mailLogs.find((log) => log.id === selectedLogId) ?? null,
        [mailLogs, selectedLogId]
    );

    const totalRecipients = useMemo(
        () => mailLogs.reduce((total, log) => total + log.recipients.length, 0),
        [mailLogs]
    );

    const totalManualCc = useMemo(
        () =>
            mailLogs.reduce(
                (total, log) =>
                    total +
                    log.recipients.filter((recipient) => recipient.sourceType === "MANUAL_CC")
                        .length,
                0
            ),
        [mailLogs]
    );

    const uniqueWorkers = useMemo(
        () => new Set(mailLogs.map((log) => log.workerEmail)).size,
        [mailLogs]
    );

    const toRecipients = useMemo(
        () =>
            selectedLog?.recipients.filter((recipient) => recipient.recipientType === "TO") ?? [],
        [selectedLog]
    );

    const ccRecipients = useMemo(
        () =>
            selectedLog?.recipients.filter((recipient) => recipient.recipientType === "CC") ?? [],
        [selectedLog]
    );

    if (user?.role !== "ADMIN") {
        return (
            <div className="page-shell">
                <div className="message message--info">
                    You do not have permission to view this page.
                </div>
            </div>
        );
    }

    const renderRecipientList = (recipients: MailLogRecipient[], emptyMessage: string) => {
        if (recipients.length === 0) {
            return <div className="empty-state">{emptyMessage}</div>;
        }

        return (
            <ul className="clean-list">
                {recipients.map((recipient) => (
                    <li key={recipient.id}>
                        <strong>{recipient.recipientEmail}</strong>
                        <div className="muted">
                            {recipient.company?.name || "Manual recipient"}
                            {recipient.companyEmail?.contactName
                                ? ` | ${recipient.companyEmail.contactName}`
                                : ""}
                            {recipient.sourceType === "MANUAL_CC" ? " | Manual CC" : ""}
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header__copy">
                    <span className="eyebrow">Administration</span>
                    <h1 className="page-title">Mail Logs</h1>
                    <p className="page-subtitle">
                        Review outbound email history, see who sent each draft, inspect
                        recipients, and verify which shared mailbox delivery details were used.
                    </p>
                </div>

                <div className="page-actions">
                    <span className="badge">{mailLogs.length} messages</span>
                    <span className="badge badge--success">{uniqueWorkers} workers</span>
                    <span className="badge badge--warm">{totalRecipients} recipients</span>
                    <span className="badge badge--warm">{totalManualCc} manual CC</span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}

            {loading ? (
                <div className="panel">
                    <div className="empty-state">Loading mail logs...</div>
                </div>
            ) : mailLogs.length === 0 ? (
                <div className="panel">
                    <div className="empty-state">No mail logs found yet.</div>
                </div>
            ) : (
                <div className="split-layout split-layout--balanced">
                    <section className="panel">
                        <div className="panel__header">
                            <div>
                                <span className="eyebrow">Delivery History</span>
                                <h2>Sent messages</h2>
                            </div>
                            <button
                                type="button"
                                className="button button--ghost button--small"
                                onClick={() => void loadMailLogs()}
                                disabled={loading}
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Sent</th>
                                        <th>Worker</th>
                                        <th>Subject</th>
                                        <th>Recipients</th>
                                        <th>Draft</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mailLogs.map((log) => {
                                        const toCount = log.recipients.filter(
                                            (recipient) => recipient.recipientType === "TO"
                                        ).length;
                                        const ccCount = log.recipients.length - toCount;

                                        return (
                                            <tr key={log.id}>
                                                <td>{formatDateTime(log.sentAt)}</td>
                                                <td>
                                                    <strong>{log.workerName}</strong>
                                                    <div className="muted">{log.workerEmail}</div>
                                                </td>
                                                <td>{log.subjectSnapshot}</td>
                                                <td>{`${toCount} TO / ${ccCount} CC`}</td>
                                                <td>{log.draft?.title || "Draft removed"}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={
                                                            log.id === selectedLogId
                                                                ? "button button--small"
                                                                : "button button--secondary button--small"
                                                        }
                                                        onClick={() => setSelectedLogId(log.id)}
                                                    >
                                                        {log.id === selectedLogId ? "Viewing" : "View"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <aside className="panel preview-summary">
                        {selectedLog ? (
                            <>
                                <div className="panel__header">
                                    <div>
                                        <span className="eyebrow">Selected Log</span>
                                        <h2>{selectedLog.subjectSnapshot}</h2>
                                    </div>
                                    <span className="badge">{selectedLog.senderType}</span>
                                </div>

                                <div className="summary-stack">
                                    <div className="summary-row">
                                        <span>Sent At</span>
                                        <strong>{formatDateTime(selectedLog.sentAt)}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Worker</span>
                                        <strong>{selectedLog.workerName}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Reply-To</span>
                                        <strong>{selectedLog.workerEmail}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shared Mailbox</span>
                                        <strong>{selectedLog.senderEmail}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Triggered By</span>
                                        <strong>{selectedLog.sentByUser.email}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Draft</span>
                                        <strong>{selectedLog.draft?.title || "Draft removed"}</strong>
                                    </div>
                                </div>

                                <div className="panel__header section-heading">
                                    <div>
                                        <h3>To Recipients</h3>
                                    </div>
                                </div>

                                {renderRecipientList(toRecipients, "No TO recipients found.")}

                                <div className="panel__header section-heading">
                                    <div>
                                        <h3>CC Recipients</h3>
                                    </div>
                                </div>

                                {renderRecipientList(ccRecipients, "No CC recipients found.")}

                                <div className="panel__header section-heading">
                                    <div>
                                        <h3>Body Snapshot</h3>
                                    </div>
                                </div>

                                <div
                                    className="rich-preview"
                                    dangerouslySetInnerHTML={{
                                        __html: selectedLog.bodySnapshot,
                                    }}
                                />
                            </>
                        ) : (
                            <div className="empty-state">Select a mail log to inspect it.</div>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
};

export default MailLogsPage;
