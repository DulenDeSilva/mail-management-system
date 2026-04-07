import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    createDraftRequest,
    deleteDraftRequest,
    getDraftsRequest,
    updateDraftRequest,
} from "../api/draftsApi";
import { useAuth } from "../context/useAuth";
import type { Draft, DraftVisibility } from "../types/draft";

type ApiErrorResponse = { message?: string };

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

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
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to load drafts"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadDrafts();
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
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to create draft"));
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
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to update draft"));
        }
    };

    const handleDelete = async (draftId: number) => {
        try {
            await deleteDraftRequest(draftId);
            await loadDrafts();
        } catch (error: unknown) {
            setError(getErrorMessage(error, "Failed to delete draft"));
        }
    };

    const canEditOrDelete = (draft: Draft) => {
        return draft.createdById === user?.id;
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header__copy">
                    <span className="eyebrow">Content Studio</span>
                    <h1 className="page-title">Drafts</h1>
                    <p className="page-subtitle">
                        Build reusable email templates, review visibility settings, and keep
                        subject lines and body content ready for sending.
                    </p>
                </div>

                <div className="page-actions">
                    <span className="badge">{drafts.length} drafts</span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}

            <div className="split-layout">
                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Create Draft</span>
                            <h2>New message template</h2>
                        </div>
                    </div>

                    <form className="form-grid" onSubmit={handleCreate}>
                        <div className="field">
                            <label htmlFor="draft-title">Title</label>
                            <input
                                id="draft-title"
                                className="input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="draft-subject">Subject</label>
                            <input
                                id="draft-subject"
                                className="input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="draft-body">Body HTML</label>
                            <textarea
                                id="draft-body"
                                className="textarea"
                                value={bodyHtml}
                                onChange={(e) => setBodyHtml(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="draft-visibility">Visibility</label>
                            <select
                                id="draft-visibility"
                                className="select"
                                value={visibility}
                                onChange={(e) =>
                                    setVisibility(e.target.value as DraftVisibility)
                                }
                            >
                                <option value="SHARED">SHARED</option>
                                <option value="PERSONAL">PERSONAL</option>
                            </select>
                        </div>

                        <button type="submit" className="button" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Draft"}
                        </button>
                    </form>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Draft Library</span>
                            <h2>Saved drafts</h2>
                        </div>
                        <span className="badge badge--warm">Reusable content</span>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading drafts...</div>
                    ) : drafts.length === 0 ? (
                        <div className="empty-state">No drafts found.</div>
                    ) : (
                        <div className="item-list">
                            {drafts.map((draft) => (
                                <article key={draft.id} className="item-card">
                                    {editingId === draft.id ? (
                                        <div className="form-grid">
                                            <div className="field">
                                                <label htmlFor={`edit-title-${draft.id}`}>Title</label>
                                                <input
                                                    id={`edit-title-${draft.id}`}
                                                    className="input"
                                                    value={editingTitle}
                                                    onChange={(e) =>
                                                        setEditingTitle(e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="field">
                                                <label htmlFor={`edit-subject-${draft.id}`}>
                                                    Subject
                                                </label>
                                                <input
                                                    id={`edit-subject-${draft.id}`}
                                                    className="input"
                                                    value={editingSubject}
                                                    onChange={(e) =>
                                                        setEditingSubject(e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="field">
                                                <label htmlFor={`edit-body-${draft.id}`}>
                                                    Body HTML
                                                </label>
                                                <textarea
                                                    id={`edit-body-${draft.id}`}
                                                    className="textarea"
                                                    value={editingBodyHtml}
                                                    onChange={(e) =>
                                                        setEditingBodyHtml(e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="field">
                                                <label htmlFor={`edit-visibility-${draft.id}`}>
                                                    Visibility
                                                </label>
                                                <select
                                                    id={`edit-visibility-${draft.id}`}
                                                    className="select"
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

                                            <div className="button-group">
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => handleSaveEdit(draft.id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button button--ghost"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="panel__header">
                                                <div>
                                                    <h3>{draft.title}</h3>
                                                    <div className="item-card__meta">
                                                        <span>
                                                            Created by{" "}
                                                            {draft.createdBy?.name || draft.createdById}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`badge ${
                                                        draft.visibility === "PERSONAL"
                                                            ? "badge--warm"
                                                            : ""
                                                    }`}
                                                >
                                                    {draft.visibility}
                                                </span>
                                            </div>

                                            <div className="summary-row">
                                                <span>Subject</span>
                                                <strong>{draft.subject}</strong>
                                            </div>

                                            <div
                                                className="rich-preview"
                                                dangerouslySetInnerHTML={{ __html: draft.bodyHtml }}
                                            />

                                            {canEditOrDelete(draft) && (
                                                <div className="button-group item-card__actions">
                                                    <button
                                                        type="button"
                                                        className="button button--secondary"
                                                        onClick={() => handleStartEdit(draft)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="button button--danger"
                                                        onClick={() => handleDelete(draft.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default DraftsPage;
