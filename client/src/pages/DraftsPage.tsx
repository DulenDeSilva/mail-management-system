import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    createDraftRequest,
    deleteDraftRequest,
    getDraftsRequest,
    updateDraftRequest,
} from "../api/draftsApi";
import { useAuth } from "../context/AuthContext";
import type { Draft, DraftVisibility } from "../types/draft";

const DraftsPage = () => {
    const { user } = useAuth();

    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [bodyHtml, setBodyHtml] = useState("");
    const [visibility, setVisibility] = useState<DraftVisibility>("SHARED");
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingSubject, setEditingSubject] = useState("");
    const [editingBodyHtml, setEditingBodyHtml] = useState("");
    const [editingVisibility, setEditingVisibility] =
        useState<DraftVisibility>("SHARED");

    const loadDrafts = async () => {
        try {
            setLoading(true);
            const data = await getDraftsRequest();
            setDrafts(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load drafts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrafts();
    }, []);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            await createDraftRequest({
                title,
                subject,
                bodyHtml,
                visibility,
            });

            setTitle("");
            setSubject("");
            setBodyHtml("");
            setVisibility("SHARED");

            await loadDrafts();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create draft");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEdit = (draft: Draft) => {
        setEditingId(draft.id);
        setEditingTitle(draft.title);
        setEditingSubject(draft.subject);
        setEditingBodyHtml(draft.bodyHtml);
        setEditingVisibility(draft.visibility);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingTitle("");
        setEditingSubject("");
        setEditingBodyHtml("");
        setEditingVisibility("SHARED");
    };

    const handleSaveEdit = async (draftId: number) => {
        try {
            await updateDraftRequest(draftId, {
                title: editingTitle,
                subject: editingSubject,
                bodyHtml: editingBodyHtml,
                visibility: editingVisibility,
            });

            handleCancelEdit();
            await loadDrafts();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update draft");
        }
    };

    const handleDelete = async (draftId: number) => {
        try {
            await deleteDraftRequest(draftId);
            await loadDrafts();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to delete draft");
        }
    };

    const canEditOrDelete = (draft: Draft) => {
        return draft.createdById === user?.id;
    };

    return (
        <div>
            <h1>Drafts</h1>

            {error && <p style={{ color: "#f87171" }}>{error}</p>}

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
                    <h2>Create Draft</h2>

                    <form onSubmit={handleCreate}>
                        <div style={{ marginBottom: 12 }}>
                            <label>Title</label>
                            <input
                                style={{ width: "100%", padding: 8 }}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label>Subject</label>
                            <input
                                style={{ width: "100%", padding: 8 }}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label>Body HTML</label>
                            <textarea
                                style={{ width: "100%", padding: 8, minHeight: 140 }}
                                value={bodyHtml}
                                onChange={(e) => setBodyHtml(e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label>Visibility</label>
                            <select
                                style={{ width: "100%", padding: 8 }}
                                value={visibility}
                                onChange={(e) =>
                                    setVisibility(e.target.value as DraftVisibility)
                                }
                            >
                                <option value="SHARED">SHARED</option>
                                <option value="PERSONAL">PERSONAL</option>
                            </select>
                        </div>

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Draft"}
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
                    <h2>Draft List</h2>

                    {loading ? (
                        <p>Loading drafts...</p>
                    ) : drafts.length === 0 ? (
                        <p>No drafts found.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 16 }}>
                            {drafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    style={{
                                        border: "1px solid #334155",
                                        borderRadius: 8,
                                        padding: 16,
                                    }}
                                >
                                    {editingId === draft.id ? (
                                        <>
                                            <div style={{ marginBottom: 12 }}>
                                                <label>Title</label>
                                                <input
                                                    style={{ width: "100%", padding: 8 }}
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                />
                                            </div>

                                            <div style={{ marginBottom: 12 }}>
                                                <label>Subject</label>
                                                <input
                                                    style={{ width: "100%", padding: 8 }}
                                                    value={editingSubject}
                                                    onChange={(e) => setEditingSubject(e.target.value)}
                                                />
                                            </div>

                                            <div style={{ marginBottom: 12 }}>
                                                <label>Body HTML</label>
                                                <textarea
                                                    style={{ width: "100%", padding: 8, minHeight: 120 }}
                                                    value={editingBodyHtml}
                                                    onChange={(e) => setEditingBodyHtml(e.target.value)}
                                                />
                                            </div>

                                            <div style={{ marginBottom: 12 }}>
                                                <label>Visibility</label>
                                                <select
                                                    style={{ width: "100%", padding: 8 }}
                                                    value={editingVisibility}
                                                    onChange={(e) =>
                                                        setEditingVisibility(
                                                            e.target.value as DraftVisibility
                                                        )
                                                    }
                                                >
                                                    <option value="SHARED">SHARED</option>
                                                    <option value="PERSONAL">PERSONAL</option>
                                                </select>
                                            </div>

                                            <button onClick={() => handleSaveEdit(draft.id)}>
                                                Save
                                            </button>
                                            <button onClick={handleCancelEdit} style={{ marginLeft: 8 }}>
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h3 style={{ marginBottom: 8 }}>{draft.title}</h3>
                                            <p>
                                                <strong>Subject:</strong> {draft.subject}
                                            </p>
                                            <p>
                                                <strong>Visibility:</strong> {draft.visibility}
                                            </p>
                                            <p>
                                                <strong>Created By:</strong>{" "}
                                                {draft.createdBy?.name || draft.createdById}
                                            </p>
                                            <div
                                                style={{
                                                    background: "#0f172a",
                                                    padding: 12,
                                                    borderRadius: 6,
                                                    marginTop: 12,
                                                }}
                                                dangerouslySetInnerHTML={{ __html: draft.bodyHtml }}
                                            />

                                            {canEditOrDelete(draft) && (
                                                <div style={{ marginTop: 12 }}>
                                                    <button onClick={() => handleStartEdit(draft)}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(draft.id)}
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DraftsPage;