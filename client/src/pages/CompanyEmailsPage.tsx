import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getCompaniesRequest } from "../api/companiesApi";
import {
    createCompanyEmailRequest,
    deleteCompanyEmailRequest,
    getCompanyEmailsRequest,
    updateCompanyEmailRequest,
} from "../api/companyEmailsApi";
import { useAuth } from "../context/useAuth";
import type { Company } from "../types/company";
import type { CompanyEmail } from "../types/companyEmail";

type ApiErrorResponse = { message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const CompanyEmailsPage = () => {
    const { user } = useAuth();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
    const [companyEmails, setCompanyEmails] = useState<CompanyEmail[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [loadingEmails, setLoadingEmails] = useState(false);
    const [error, setError] = useState("");

    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingContactName, setEditingContactName] = useState("");
    const [editingEmail, setEditingEmail] = useState("");

    const loadCompanies = async () => {
        try {
            setLoadingCompanies(true);
            const data = await getCompaniesRequest();
            setCompanies(data);
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to load companies"));
        } finally {
            setLoadingCompanies(false);
        }
    };

    const loadCompanyEmails = async (companyId: number) => {
        try {
            setLoadingEmails(true);
            const data = await getCompanyEmailsRequest(companyId);
            setCompanyEmails(data);
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to load company emails"));
        } finally {
            setLoadingEmails(false);
        }
    };

    useEffect(() => {
        void loadCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompanyId !== "") {
            void loadCompanyEmails(Number(selectedCompanyId));
        } else {
            setCompanyEmails([]);
        }
    }, [selectedCompanyId]);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (selectedCompanyId === "") {
            setError("Please select a company");
            return;
        }

        try {
            setSubmitting(true);
            await createCompanyEmailRequest(Number(selectedCompanyId), {
                contactName,
                email,
            });

            setContactName("");
            setEmail("");
            await loadCompanyEmails(Number(selectedCompanyId));
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to create company email"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEdit = (item: CompanyEmail) => {
        setEditingId(item.id);
        setEditingContactName(item.contactName || "");
        setEditingEmail(item.email);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingContactName("");
        setEditingEmail("");
    };

    const handleSaveEdit = async (emailId: number) => {
        try {
            await updateCompanyEmailRequest(emailId, {
                contactName: editingContactName,
                email: editingEmail,
            });

            setEditingId(null);
            setEditingContactName("");
            setEditingEmail("");

            if (selectedCompanyId !== "") {
                await loadCompanyEmails(Number(selectedCompanyId));
            }
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to update company email"));
        }
    };

    const handleDelete = async (emailId: number) => {
        try {
            await deleteCompanyEmailRequest(emailId);

            if (selectedCompanyId !== "") {
                await loadCompanyEmails(Number(selectedCompanyId));
            }
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to delete company email"));
        }
    };

    if (user?.role !== "ADMIN") {
        return (
            <div className="page-shell">
                <div className="message message--info">
                    You do not have permission to view this page.
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header__copy">
                    <span className="eyebrow">Contacts</span>
                    <h1 className="page-title">Company Emails</h1>
                    <p className="page-subtitle">
                        Choose a company, then maintain the contact emails used when building
                        recipient lists.
                    </p>
                </div>

                <div className="page-actions">
                    <span className="badge">{companyEmails.length} contacts shown</span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <div>
                        <span className="eyebrow">Step 1</span>
                        <h2>Select a company</h2>
                    </div>
                    <span className="badge badge--warm">{companies.length} available</span>
                </div>

                <div className="field">
                    <label htmlFor="company-email-company">Company</label>
                    <select
                        id="company-email-company"
                        className="select"
                        value={selectedCompanyId}
                        onChange={(e) =>
                            setSelectedCompanyId(e.target.value ? Number(e.target.value) : "")
                        }
                    >
                        <option value="">-- Select Company --</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <div className="split-layout">
                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Step 2</span>
                            <h2>Add email contact</h2>
                        </div>
                    </div>

                    <form className="form-grid" onSubmit={handleCreate}>
                        <div className="field">
                            <label htmlFor="contact-name">Contact Name</label>
                            <input
                                id="contact-name"
                                className="input"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="contact-email">Email</label>
                            <input
                                id="contact-email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="button"
                            disabled={submitting || selectedCompanyId === ""}
                        >
                            {submitting ? "Adding..." : "Add Email"}
                        </button>
                    </form>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Step 3</span>
                            <h2>Email list</h2>
                        </div>
                    </div>

                    {loadingCompanies ? (
                        <div className="empty-state">Loading companies...</div>
                    ) : selectedCompanyId === "" ? (
                        <div className="empty-state">Select a company to view emails.</div>
                    ) : loadingEmails ? (
                        <div className="empty-state">Loading company emails...</div>
                    ) : companyEmails.length === 0 ? (
                        <div className="empty-state">No emails found for this company.</div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Contact Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyEmails.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {editingId === item.id ? (
                                                    <input
                                                        className="input"
                                                        value={editingContactName}
                                                        onChange={(e) =>
                                                            setEditingContactName(e.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    item.contactName || "-"
                                                )}
                                            </td>
                                            <td>
                                                {editingId === item.id ? (
                                                    <input
                                                        className="input"
                                                        value={editingEmail}
                                                        onChange={(e) =>
                                                            setEditingEmail(e.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    item.email
                                                )}
                                            </td>
                                            <td>
                                                {editingId === item.id ? (
                                                    <div className="table-actions">
                                                        <button
                                                            type="button"
                                                            className="button button--small"
                                                            onClick={() => handleSaveEdit(item.id)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="button button--ghost button--small"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="table-actions">
                                                        <button
                                                            type="button"
                                                            className="button button--secondary button--small"
                                                            onClick={() => handleStartEdit(item)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="button button--danger button--small"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CompanyEmailsPage;
