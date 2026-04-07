import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { getCompaniesRequest } from "../api/companiesApi";
import { getCompanyEmailsRequest } from "../api/companyEmailsApi";
import { getDraftsRequest } from "../api/draftsApi";
import { sendMailRequest } from "../api/mailApi";
import type { Company } from "../types/company";
import type { CompanyEmail } from "../types/companyEmail";
import type { Draft } from "../types/draft";

type CompanyEmailMap = Record<number, CompanyEmail[]>;
type SelectedEmailMap = Record<number, boolean>;
type ApiErrorResponse = { message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const SendMailPage = () => {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companyEmailsMap, setCompanyEmailsMap] = useState<CompanyEmailMap>({});
    const [expandedCompanies, setExpandedCompanies] = useState<Record<number, boolean>>({});
    const [selectedEmails, setSelectedEmails] = useState<SelectedEmailMap>({});
    const [selectedDraftId, setSelectedDraftId] = useState<number | "">("");
    const [manualCc, setManualCc] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError("");
            const loadErrors: string[] = [];
            const [draftsResult, companiesResult] = await Promise.allSettled([
                getDraftsRequest(),
                getCompaniesRequest(),
            ]);

            if (draftsResult.status === "fulfilled") {
                setDrafts(draftsResult.value);
            } else {
                setDrafts([]);
                loadErrors.push(getErrorMessage(draftsResult.reason, "Failed to load drafts"));
            }

            if (companiesResult.status === "fulfilled") {
                setCompanies(companiesResult.value);
            } else {
                setCompanies([]);
                setCompanyEmailsMap({});
                setExpandedCompanies({});
                loadErrors.push(
                    getErrorMessage(companiesResult.reason, "Failed to load companies")
                );
            }

            if (companiesResult.status !== "fulfilled") {
                if (loadErrors.length > 0) {
                    setError(loadErrors.join(" "));
                }
                return;
            }

            const emailResults = await Promise.allSettled(
                companiesResult.value.map(async (company) => {
                    const emails = await getCompanyEmailsRequest(company.id);
                    return { companyId: company.id, emails };
                })
            );

            const emailMap: CompanyEmailMap = {};
            const expandedMap: Record<number, boolean> = {};

            emailResults.forEach((result) => {
                if (result.status === "fulfilled") {
                    const { companyId, emails } = result.value;
                    emailMap[companyId] = emails;
                    expandedMap[companyId] = emails.length > 0;
                    return;
                }

                loadErrors.push(
                    getErrorMessage(result.reason, "Failed to load some company emails")
                );
            });

            setCompanyEmailsMap(emailMap);
            setExpandedCompanies(expandedMap);

            if (loadErrors.length > 0) {
                setError(loadErrors.join(" "));
            }
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to load send mail data"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadInitialData();
    }, []);

    const selectedDraft = useMemo(
        () => drafts.find((draft) => draft.id === selectedDraftId),
        [drafts, selectedDraftId]
    );

    const selectedRecipientList = useMemo(() => {
        const result: CompanyEmail[] = [];

        Object.entries(companyEmailsMap).forEach(([, emails]) => {
            emails.forEach((email) => {
                if (selectedEmails[email.id]) {
                    result.push(email);
                }
            });
        });

        return result;
    }, [companyEmailsMap, selectedEmails]);

    const totalEmails = useMemo(() => {
        return Object.values(companyEmailsMap).flat().length;
    }, [companyEmailsMap]);

    const totalSelected = selectedRecipientList.length;
    const isAllSelected = totalEmails > 0 && totalSelected === totalEmails;

    const toggleExpandCompany = (companyId: number) => {
        setExpandedCompanies((prev) => ({
            ...prev,
            [companyId]: !prev[companyId],
        }));
    };

    const handleToggleEmail = (emailId: number) => {
        setSelectedEmails((prev) => ({
            ...prev,
            [emailId]: !prev[emailId],
        }));
    };

    const handleToggleCompany = (companyId: number) => {
        const companyEmails = companyEmailsMap[companyId] || [];
        const allSelected = companyEmails.every((email) => selectedEmails[email.id]);

        setSelectedEmails((prev) => {
            const updated = { ...prev };

            companyEmails.forEach((email) => {
                updated[email.id] = !allSelected;
            });

            return updated;
        });
    };

    const handleToggleSelectAll = () => {
        const allEmails = Object.values(companyEmailsMap).flat();

        setSelectedEmails(() => {
            const updated: SelectedEmailMap = {};

            allEmails.forEach((email) => {
                updated[email.id] = !isAllSelected;
            });

            return updated;
        });
    };

    const isCompanySelected = (companyId: number) => {
        const emails = companyEmailsMap[companyId] || [];
        return emails.length > 0 && emails.every((email) => selectedEmails[email.id]);
    };

    const isCompanyPartiallySelected = (companyId: number) => {
        const emails = companyEmailsMap[companyId] || [];
        const selectedCount = emails.filter((email) => selectedEmails[email.id]).length;
        return selectedCount > 0 && selectedCount < emails.length;
    };

    const manualCcList = useMemo(
        () =>
            Array.from(
                new Set(
                    manualCc
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                )
            ),
        [manualCc]
    );

    const handleSend = async () => {
        setError("");
        setStatusMessage("");

        if (!selectedDraftId) {
            setError("Please select a draft");
            return;
        }

        if (selectedRecipientList.length === 0) {
            setError("Please select at least one recipient");
            return;
        }

        try {
            setSending(true);

            await sendMailRequest({
                draftId: selectedDraftId,
                companyEmailIds: selectedRecipientList.map((recipient) => recipient.id),
                cc: manualCcList.length > 0 ? manualCcList : undefined,
            });

            setStatusMessage("Mail sent successfully through the shared mailbox.");
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to send mail"));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header__copy">
                    <span className="eyebrow">Delivery Planner</span>
                    <h1 className="page-title">Send Mail</h1>
                    <p className="page-subtitle">
                        Select a shared draft or one you created, choose company recipients,
                        add any manual CC list, and send through the shared SMTP mailbox with
                        your identity preserved in the sender display and reply-to headers.
                    </p>
                </div>

                <div className="page-actions">
                    <span className="badge">{drafts.length} drafts</span>
                    <span className="badge badge--warm">{companies.length} companies</span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}
            {statusMessage && <div className="message message--info">{statusMessage}</div>}

            {loading ? (
                <div className="panel">
                    <div className="empty-state">Loading send-mail data...</div>
                </div>
            ) : (
                <div className="send-mail-grid">
                    <div className="panel-stack">
                        <section className="panel">
                            <div className="panel__header">
                                <div>
                                    <span className="eyebrow">Step 1</span>
                                    <h2>Select a draft</h2>
                                </div>
                                <span className="badge badge--warm">
                                    {selectedDraft ? selectedDraft.visibility : "Not selected"}
                                </span>
                            </div>

                            <div className="field">
                                <label htmlFor="sendmail-draft">Choose draft</label>
                                <select
                                    id="sendmail-draft"
                                    className="select"
                                    value={selectedDraftId}
                                    onChange={(e) =>
                                        setSelectedDraftId(
                                            e.target.value ? Number(e.target.value) : ""
                                        )
                                    }
                                >
                                    <option value="">-- Select Draft --</option>
                                    {drafts.map((draft) => (
                                        <option key={draft.id} value={draft.id}>
                                            {draft.title} ({draft.visibility})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedDraft ? (
                                <article className="item-card">
                                    <div className="summary-row">
                                        <span>Subject</span>
                                        <strong>{selectedDraft.subject}</strong>
                                    </div>

                                    <div
                                        className="rich-preview"
                                        dangerouslySetInnerHTML={{
                                            __html: selectedDraft.bodyHtml,
                                        }}
                                    />
                                </article>
                            ) : (
                                <div className="empty-state">
                                    Pick a draft to preview its subject and email body.
                                </div>
                            )}
                        </section>

                        <section className="panel">
                            <div className="panel__header">
                                <div>
                                    <span className="eyebrow">Step 2</span>
                                    <h2>Select recipients</h2>
                                </div>
                                <span className="badge">
                                    {totalSelected}/{totalEmails || 0} selected
                                </span>
                            </div>

                            <label className="check-row">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleToggleSelectAll}
                                />
                                <span className="check-row__text">
                                    <strong>Select all recipients</strong>
                                    <span className="muted">
                                        Apply selection across every company contact.
                                    </span>
                                </span>
                            </label>

                            <div className="selection-cluster">
                                {companies.map((company) => {
                                    const emails = companyEmailsMap[company.id] || [];
                                    const expanded = expandedCompanies[company.id];

                                    return (
                                        <article key={company.id} className="company-card">
                                            <div className="company-card__header">
                                                <label className="check-row">
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompanySelected(company.id)}
                                                        onChange={() =>
                                                            handleToggleCompany(company.id)
                                                        }
                                                    />
                                                    <span className="check-row__text">
                                                        <strong>{company.name}</strong>
                                                        <span className="muted">
                                                            {emails.length} contacts
                                                            {isCompanyPartiallySelected(company.id)
                                                                ? " selected partially"
                                                                : ""}
                                                        </span>
                                                    </span>
                                                </label>

                                                <div className="button-group">
                                                    <button
                                                        type="button"
                                                        className="button button--ghost button--small"
                                                        onClick={() =>
                                                            toggleExpandCompany(company.id)
                                                        }
                                                    >
                                                        {expanded ? "Hide" : "Show"}
                                                    </button>
                                                </div>
                                            </div>

                                            {expanded && (
                                                <div className="company-card__emails">
                                                    {emails.length === 0 ? (
                                                        <div className="empty-state">
                                                            No emails under this company.
                                                        </div>
                                                    ) : (
                                                        emails.map((email) => (
                                                            <label
                                                                key={email.id}
                                                                className="check-row"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        !!selectedEmails[email.id]
                                                                    }
                                                                    onChange={() =>
                                                                        handleToggleEmail(email.id)
                                                                    }
                                                                />
                                                                <span className="check-row__text">
                                                                    <strong>
                                                                        {email.contactName ||
                                                                            "No Name"}
                                                                    </strong>
                                                                    <span className="muted">
                                                                        {email.email}
                                                                    </span>
                                                                </span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="panel">
                            <div className="panel__header">
                                <div>
                                    <span className="eyebrow">Step 3</span>
                                    <h2>Manual CC</h2>
                                </div>
                                <span className="badge badge--warm">
                                    {manualCcList.length} addresses
                                </span>
                            </div>

                            <div className="field">
                                <label htmlFor="sendmail-cc">Comma-separated CC addresses</label>
                                <textarea
                                    id="sendmail-cc"
                                    className="textarea"
                                    value={manualCc}
                                    onChange={(e) => setManualCc(e.target.value)}
                                    placeholder="cc1@example.com, cc2@example.com"
                                />
                            </div>
                        </section>
                    </div>

                    <aside className="panel preview-summary">
                        <div className="panel__header">
                            <div>
                                <span className="eyebrow">Preview Summary</span>
                                <h2>Ready to review</h2>
                            </div>
                            <span className="badge badge--success">{totalSelected} to send</span>
                        </div>

                        <div className="summary-stack">
                            <div className="summary-row">
                                <span>Selected Draft</span>
                                <strong>{selectedDraft ? selectedDraft.title : "None"}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Total Recipients</span>
                                <strong>{totalSelected}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Manual CC</span>
                                <strong>{manualCcList.length}</strong>
                            </div>
                        </div>

                        <div className="panel__header section-heading">
                            <div>
                                <h3>To Recipients</h3>
                            </div>
                        </div>

                        {selectedRecipientList.length === 0 ? (
                            <div className="empty-state">No recipients selected.</div>
                        ) : (
                            <ul className="clean-list">
                                {selectedRecipientList.map((recipient) => (
                                    <li key={recipient.id}>
                                        <strong>{recipient.contactName || "No Name"}</strong>
                                        <div className="muted">{recipient.email}</div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="panel__header section-heading">
                            <div>
                                <h3>CC Recipients</h3>
                            </div>
                        </div>

                        {manualCcList.length === 0 ? (
                            <div className="empty-state">No CC recipients.</div>
                        ) : (
                            <ul className="clean-list">
                                {manualCcList.map((item, index) => (
                                    <li key={`${item}-${index}`}>{item}</li>
                                ))}
                            </ul>
                        )}

                        <div className="form-grid form-grid--spaced">
                            <button
                                type="button"
                                className="button"
                                onClick={handleSend}
                                disabled={sending}
                            >
                                {sending ? "Sending..." : "Send Mail"}
                            </button>

                            <div className="message message--info">
                                Outbound mail is sent from the shared mailbox. Replies go to
                                the currently signed-in worker.
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default SendMailPage;
