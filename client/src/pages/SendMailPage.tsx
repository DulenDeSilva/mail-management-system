import { useEffect, useMemo, useState } from "react";
import { getCompaniesRequest } from "../api/companiesApi";
import { getCompanyEmailsRequest } from "../api/companyEmailsApi";
import { getDraftsRequest } from "../api/draftsApi";
import type { Company } from "../types/company";
import type { CompanyEmail } from "../types/companyEmail";
import type { Draft } from "../types/draft";

type CompanyEmailMap = Record<number, CompanyEmail[]>;
type SelectedEmailMap = Record<number, boolean>;

const SendMailPage = () => {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companyEmailsMap, setCompanyEmailsMap] = useState<CompanyEmailMap>({});
    const [expandedCompanies, setExpandedCompanies] = useState<Record<number, boolean>>({});
    const [selectedEmails, setSelectedEmails] = useState<SelectedEmailMap>({});
    const [selectedDraftId, setSelectedDraftId] = useState<number | "">("");
    const [manualCc, setManualCc] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadInitialData = async () => {
        try {
            setLoading(true);

            const [draftsData, companiesData] = await Promise.all([
                getDraftsRequest(),
                getCompaniesRequest(),
            ]);

            setDrafts(draftsData);
            setCompanies(companiesData);

            const emailResults = await Promise.all(
                companiesData.map(async (company) => {
                    const emails = await getCompanyEmailsRequest(company.id);
                    return { companyId: company.id, emails };
                })
            );

            const emailMap: CompanyEmailMap = {};
            emailResults.forEach(({ companyId, emails }) => {
                emailMap[companyId] = emails;
            });

            setCompanyEmailsMap(emailMap);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load send mail data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
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

    const manualCcList = manualCc
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const handleMockSend = () => {
        if (!selectedDraftId) {
            setError("Please select a draft");
            return;
        }

        if (selectedRecipientList.length === 0) {
            setError("Please select at least one recipient");
            return;
        }

        alert("UI flow ready. Real Outlook send will be connected after approval.");
    };

    return (
        <div>
            <h1>Send Mail</h1>

            {error && <p style={{ color: "#f87171" }}>{error}</p>}

            {loading ? (
                <p>Loading send-mail data...</p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr",
                        gap: 24,
                        alignItems: "start",
                    }}
                >
                    <div style={{ display: "grid", gap: 24 }}>
                        <div style={{ border: "1px solid #334155", borderRadius: 8, padding: 16 }}>
                            <h2>Select Draft</h2>
                            <select
                                style={{ width: "100%", padding: 8 }}
                                value={selectedDraftId}
                                onChange={(e) =>
                                    setSelectedDraftId(e.target.value ? Number(e.target.value) : "")
                                }
                            >
                                <option value="">-- Select Draft --</option>
                                {drafts.map((draft) => (
                                    <option key={draft.id} value={draft.id}>
                                        {draft.title} ({draft.visibility})
                                    </option>
                                ))}
                            </select>

                            {selectedDraft && (
                                <div style={{ marginTop: 16 }}>
                                    <p>
                                        <strong>Subject:</strong> {selectedDraft.subject}
                                    </p>
                                    <div
                                        style={{
                                            marginTop: 12,
                                            padding: 12,
                                            borderRadius: 6,
                                            background: "#0f172a",
                                        }}
                                        dangerouslySetInnerHTML={{ __html: selectedDraft.bodyHtml }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ border: "1px solid #334155", borderRadius: 8, padding: 16 }}>
                            <h2>Select Recipients</h2>

                            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleToggleSelectAll}
                                />
                                Select All
                            </label>

                            <div style={{ display: "grid", gap: 12 }}>
                                {companies.map((company) => {
                                    const emails = companyEmailsMap[company.id] || [];
                                    const expanded = expandedCompanies[company.id];

                                    return (
                                        <div
                                            key={company.id}
                                            style={{
                                                border: "1px solid #334155",
                                                borderRadius: 8,
                                                padding: 12,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: expanded ? 12 : 0,
                                                }}
                                            >
                                                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompanySelected(company.id)}
                                                        onChange={() => handleToggleCompany(company.id)}
                                                    />
                                                    <span>
                                                        {company.name}
                                                        {isCompanyPartiallySelected(company.id) ? " (partial)" : ""}
                                                    </span>
                                                </label>

                                                <button onClick={() => toggleExpandCompany(company.id)}>
                                                    {expanded ? "Hide" : "Show"}
                                                </button>
                                            </div>

                                            {expanded && (
                                                <div style={{ display: "grid", gap: 8 }}>
                                                    {emails.length === 0 ? (
                                                        <p>No emails under this company.</p>
                                                    ) : (
                                                        emails.map((email) => (
                                                            <label
                                                                key={email.id}
                                                                style={{ display: "flex", alignItems: "center", gap: 8 }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!selectedEmails[email.id]}
                                                                    onChange={() => handleToggleEmail(email.id)}
                                                                />
                                                                <span>
                                                                    {email.contactName || "No Name"} - {email.email}
                                                                </span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ border: "1px solid #334155", borderRadius: 8, padding: 16 }}>
                            <h2>Manual CC</h2>
                            <p>Enter comma-separated email addresses.</p>
                            <textarea
                                style={{ width: "100%", minHeight: 100, padding: 8 }}
                                value={manualCc}
                                onChange={(e) => setManualCc(e.target.value)}
                                placeholder="cc1@example.com, cc2@example.com"
                            />
                        </div>
                    </div>

                    <div style={{ border: "1px solid #334155", borderRadius: 8, padding: 16 }}>
                        <h2>Preview Summary</h2>

                        <p>
                            <strong>Selected Draft:</strong>{" "}
                            {selectedDraft ? selectedDraft.title : "None"}
                        </p>

                        <p>
                            <strong>Total Selected Recipients:</strong> {totalSelected}
                        </p>

                        <div style={{ marginTop: 16 }}>
                            <h3>To Recipients</h3>
                            {selectedRecipientList.length === 0 ? (
                                <p>No recipients selected.</p>
                            ) : (
                                <ul>
                                    {selectedRecipientList.map((recipient) => (
                                        <li key={recipient.id}>
                                            {recipient.contactName || "No Name"} - {recipient.email}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <h3>CC Recipients</h3>
                            {manualCcList.length === 0 ? (
                                <p>No CC recipients.</p>
                            ) : (
                                <ul>
                                    {manualCcList.map((item, index) => (
                                        <li key={`${item}-${index}`}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <button onClick={handleMockSend} style={{ marginTop: 20 }}>
                            Send Mail
                        </button>

                        <p style={{ marginTop: 12, color: "#94a3b8" }}>
                            Real email sending will be connected once Outlook permission/testing is ready.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SendMailPage;