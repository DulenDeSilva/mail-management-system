import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { getDraftsRequest } from "../api/draftsApi";
import {
    deleteDraftAttachmentRequest,
    getDraftAttachmentsRequest,
    uploadDraftAttachmentsRequest,
} from "../api/attachmentsApi";
import type { Draft } from "../types/draft";
import type { DraftAttachment } from "../types/attachment";

const AttachmentsPage = () => {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [selectedDraftId, setSelectedDraftId] = useState<number | "">("");
    const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [fileInputKey, setFileInputKey] = useState(0);

    const [loadingDrafts, setLoadingDrafts] = useState(true);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const loadDrafts = async () => {
        try {
            setLoadingDrafts(true);
            const data = await getDraftsRequest();
            setDrafts(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load drafts");
        } finally {
            setLoadingDrafts(false);
        }
    };

    const loadAttachments = async (draftId: number) => {
        try {
            setLoadingAttachments(true);
            const data = await getDraftAttachmentsRequest(draftId);
            setAttachments(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load attachments");
        } finally {
            setLoadingAttachments(false);
        }
    };

    useEffect(() => {
        loadDrafts();
    }, []);

    useEffect(() => {
        if (selectedDraftId !== "") {
            loadAttachments(Number(selectedDraftId));
        } else {
            setAttachments([]);
        }
    }, [selectedDraftId]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleUpload = async () => {
        setError("");

        if (selectedDraftId === "") {
            setError("Please select a draft");
            return;
        }

        if (selectedFiles.length === 0) {
            setError("Please select at least one file");
            return;
        }

        try {
            setUploading(true);
            await uploadDraftAttachmentsRequest(Number(selectedDraftId), selectedFiles);
            setSelectedFiles([]);
            setFileInputKey((prev) => prev + 1);
            await loadAttachments(Number(selectedDraftId));
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to upload attachments");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attachmentId: number) => {
        try {
            await deleteDraftAttachmentRequest(attachmentId);

            if (selectedDraftId !== "") {
                await loadAttachments(Number(selectedDraftId));
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to delete attachment");
        }
    };

    return (
        <div className="page-shell">
            <div className="page-header">
                <div className="page-header__copy">
                    <span className="eyebrow">Asset Library</span>
                    <h1 className="page-title">Draft Attachments</h1>
                    <p className="page-subtitle">
                        Choose a draft, attach the supporting files, and keep each message
                        package ready for delivery.
                    </p>
                </div>

                <div className="page-actions">
                    <span className="badge">{attachments.length} files shown</span>
                </div>
            </div>

            {error && <div className="message message--error">{error}</div>}

            <section className="panel">
                <div className="panel__header">
                    <div>
                        <span className="eyebrow">Step 1</span>
                        <h2>Select a draft</h2>
                    </div>
                    <span className="badge badge--warm">{drafts.length} drafts</span>
                </div>

                <div className="field">
                    <label htmlFor="attachment-draft">Draft</label>
                    <select
                        id="attachment-draft"
                        className="select"
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
                </div>
            </section>

            <div className="split-layout">
                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Step 2</span>
                            <h2>Upload attachments</h2>
                        </div>
                    </div>

                    <div className="form-grid">
                        <input
                            key={fileInputKey}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />

                        {selectedFiles.length > 0 && (
                            <ul className="clean-list">
                                {selectedFiles.map((file, index) => (
                                    <li key={`${file.name}-${index}`}>{file.name}</li>
                                ))}
                            </ul>
                        )}

                        <button
                            type="button"
                            className="button"
                            onClick={handleUpload}
                            disabled={uploading || selectedDraftId === ""}
                        >
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </section>

                <section className="panel">
                    <div className="panel__header">
                        <div>
                            <span className="eyebrow">Step 3</span>
                            <h2>Attachment list</h2>
                        </div>
                    </div>

                    {loadingDrafts ? (
                        <div className="empty-state">Loading drafts...</div>
                    ) : selectedDraftId === "" ? (
                        <div className="empty-state">Select a draft to view attachments.</div>
                    ) : loadingAttachments ? (
                        <div className="empty-state">Loading attachments...</div>
                    ) : attachments.length === 0 ? (
                        <div className="empty-state">
                            No attachments found for this draft.
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Type</th>
                                        <th>Size</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attachments.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.fileName}</td>
                                            <td>{item.mimeType}</td>
                                            <td>{(item.sizeBytes / 1024).toFixed(2)} KB</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="button button--danger button--small"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Delete
                                                </button>
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

export default AttachmentsPage;
