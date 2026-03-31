import { FormEvent, useEffect, useState } from "react";
import { getCompaniesRequest } from "../api/companiesApi";
import {
    createCompanyEmailRequest,
    deleteCompanyEmailRequest,
    getCompanyEmailsRequest,
    updateCompanyEmailRequest,
} from "../api/companyEmailsApi";
import { useAuth } from "../context/AuthContext";
import type { Company } from "../types/company";
import type { CompanyEmail } from "../types/companyEmail";

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
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load companies");
        } finally {
            setLoadingCompanies(false);
        }
    };

    const loadCompanyEmails = async (companyId: number) => {
        try {
            setLoadingEmails(true);
            const data = await getCompanyEmailsRequest(companyId);
            setCompanyEmails(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load company emails");
        } finally {
            setLoadingEmails(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompanyId !== "") {
            loadCompanyEmails(Number(selectedCompanyId));
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
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create company email");
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
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update company email");
        }
    };

    const handleDelete = async (emailId: number) => {
        try {
            await deleteCompanyEmailRequest(emailId);

            if (selectedCompanyId !== "") {
                await loadCompanyEmails(Number(selectedCompanyId));
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to delete company email");
        }
    };

    if (user?.role !== "ADMIN") {
        return <p>You do not have permission to view this page.</p>;
    }

    return (
        <div>
            <h1>Company Emails</h1>

            {error && <p style={{ color: "#f87171" }}>{error}</p>}

            <div style={{ marginBottom: 20 }}>
                <label>Select Company</label>
                <select
                    style={{ display: "block", marginTop: 8, padding: 8, minWidth: 320 }}
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

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: 24,
                    alignItems: "start",
                }}
            >
                <div
                    style={{
                        border: "1px solid #334155",
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <h2>Add Email</h2>

                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: 12 }}>
                            <label>Contact Name</label>
                            <input
                                style={{ width: "100%", padding: 8 }}
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label>Email</label>
                            <input
                                type="email"
                                style={{ width: "100%", padding: 8 }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button type="submit" disabled={submitting || selectedCompanyId === ""}>
                            {submitting ? "Adding..." : "Add Email"}
                        </button>
                    </form>
                </div>

                <div
                    style={{
                        border: "1px solid #334155",
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <h2>Email List</h2>

                    {loadingCompanies ? (
                        <p>Loading companies...</p>
                    ) : selectedCompanyId === "" ? (
                        <p>Select a company to view emails.</p>
                    ) : loadingEmails ? (
                        <p>Loading company emails...</p>
                    ) : companyEmails.length === 0 ? (
                        <p>No emails found for this company.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left", padding: 8 }}>Contact Name</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Email</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companyEmails.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ padding: 8 }}>
                                            {editingId === item.id ? (
                                                <input
                                                    style={{ width: "100%", padding: 6 }}
                                                    value={editingContactName}
                                                    onChange={(e) => setEditingContactName(e.target.value)}
                                                />
                                            ) : (
                                                item.contactName || "-"
                                            )}
                                        </td>
                                        <td style={{ padding: 8 }}>
                                            {editingId === item.id ? (
                                                <input
                                                    style={{ width: "100%", padding: 6 }}
                                                    value={editingEmail}
                                                    onChange={(e) => setEditingEmail(e.target.value)}
                                                />
                                            ) : (
                                                item.email
                                            )}
                                        </td>
                                        <td style={{ padding: 8 }}>
                                            {editingId === item.id ? (
                                                <>
                                                    <button onClick={() => handleSaveEdit(item.id)}>Save</button>
                                                    <button onClick={handleCancelEdit} style={{ marginLeft: 8 }}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleStartEdit(item)}>Edit</button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyEmailsPage;