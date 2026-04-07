import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    createCompanyRequest,
    deleteCompanyRequest,
    getCompaniesRequest,
    updateCompanyRequest,
} from "../api/companiesApi";
import { useAuth } from "../context/useAuth";
import type { Company } from "../types/company";

type ApiErrorResponse = { message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const CompaniesPage = () => {
    const { user } = useAuth();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await getCompaniesRequest();
            setCompanies(data);
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to load companies"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadCompanies();
    }, []);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            await createCompanyRequest({ name });
            setName("");
            await loadCompanies();
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to create company"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEdit = (company: Company) => {
        setEditingId(company.id);
        setEditingName(company.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleSaveEdit = async (companyId: number) => {
        try {
            await updateCompanyRequest(companyId, { name: editingName });
            setEditingId(null);
            setEditingName("");
            await loadCompanies();
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to update company"));
        }
    };

    const handleDelete = async (companyId: number) => {
        try {
            await deleteCompanyRequest(companyId);
            await loadCompanies();
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to delete company"));
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
                    <span className="eyebrow">Administration</span>
                    <h1 className="page-title">Companies</h1>
                    <p className="page-subtitle">
                        Maintain the company list that powers your contact records and mailing
                        workflows.
                    </p>
                </div>

                <div className="page-actions">
                    <span className="badge">{companies.length} companies</span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}

            <div className="split-layout">
                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Create Company</span>
                            <h2>Add an organization</h2>
                        </div>
                    </div>

                    <form className="form-grid" onSubmit={handleCreate}>
                        <div className="field">
                            <label htmlFor="company-name">Company Name</label>
                            <input
                                id="company-name"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="button" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Company"}
                        </button>
                    </form>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Directory</span>
                            <h2>Company list</h2>
                        </div>
                        <span className="badge badge--warm">Editable records</span>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading companies...</div>
                    ) : companies.length === 0 ? (
                        <div className="empty-state">No companies found.</div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((company) => (
                                        <tr key={company.id}>
                                            <td>
                                                {editingId === company.id ? (
                                                    <input
                                                        className="input"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                    />
                                                ) : (
                                                    company.name
                                                )}
                                            </td>
                                            <td>
                                                {new Date(company.createdAt).toLocaleString()}
                                            </td>
                                            <td>
                                                {editingId === company.id ? (
                                                    <div className="table-actions">
                                                        <button
                                                            type="button"
                                                            className="button button--small"
                                                            onClick={() => handleSaveEdit(company.id)}
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
                                                            onClick={() => handleStartEdit(company)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="button button--danger button--small"
                                                            onClick={() => handleDelete(company.id)}
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

export default CompaniesPage;
