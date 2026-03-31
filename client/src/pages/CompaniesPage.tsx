import { FormEvent, useEffect, useState } from "react";
import {
    createCompanyRequest,
    deleteCompanyRequest,
    getCompaniesRequest,
    updateCompanyRequest,
} from "../api/companiesApi";
import { useAuth } from "../context/AuthContext";
import type { Company } from "../types/company";

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
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            await createCompanyRequest({ name });
            setName("");
            await loadCompanies();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create company");
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
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update company");
        }
    };

    const handleDelete = async (companyId: number) => {
        try {
            await deleteCompanyRequest(companyId);
            await loadCompanies();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to delete company");
        }
    };

    if (user?.role !== "ADMIN") {
        return <p>You do not have permission to view this page.</p>;
    }

    return (
        <div>
            <h1>Companies</h1>

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
                    <h2>Create Company</h2>

                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: 12 }}>
                            <label>Company Name</label>
                            <input
                                style={{ width: "100%", padding: 8 }}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Company"}
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
                    <h2>Company List</h2>

                    {error && <p style={{ color: "#f87171" }}>{error}</p>}

                    {loading ? (
                        <p>Loading companies...</p>
                    ) : companies.length === 0 ? (
                        <p>No companies found.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Created</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company) => (
                                    <tr key={company.id}>
                                        <td style={{ padding: 8 }}>
                                            {editingId === company.id ? (
                                                <input
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    style={{ width: "100%", padding: 6 }}
                                                />
                                            ) : (
                                                company.name
                                            )}
                                        </td>
                                        <td style={{ padding: 8 }}>
                                            {new Date(company.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: 8 }}>
                                            {editingId === company.id ? (
                                                <>
                                                    <button onClick={() => handleSaveEdit(company.id)}>
                                                        Save
                                                    </button>
                                                    <button onClick={handleCancelEdit} style={{ marginLeft: 8 }}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleStartEdit(company)}>Edit</button>
                                                    <button
                                                        onClick={() => handleDelete(company.id)}
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

export default CompaniesPage;