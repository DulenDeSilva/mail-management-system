import { ChangeEvent, useEffect, useState } from "react";
import { getDraftsRequest } from "../api/draftsApi";
import {
    deleteDraftAttachmentRequest,
    getDraftAttachmentsRequest,
    uploadDraftAttachmentsRequest,
} from "../api/attachmentsApi";
import { useAuth } from "../context/AuthContext";
import type { Draft } from "../types/draft";
import type { DraftAttachment } from "../types/attachment";

const AttachmentsPage = () => {
    const { user } = useAuth();

    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [selectedDraftId, setSelectedDraftId] = useState<number | "">("");
    const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
        <div>
            <h1>Draft Attachments</h1>

            {error && <p style={{ color: "#f87171" }}>{error}</p>}

            <div style={{ marginBottom: 20 }}>
                <label>Select Draft</label>
                <select
                    style={{ display: "block", marginTop: 8, padding: 8, minWidth: 320 }}
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
                    <h2>Upload Attachments</h2>

                    <input type="file" multiple onChange={handleFileChange} />

                    {selectedFiles.length > 0 && (
                        <ul style={{ marginTop: 12 }}>
                            {selectedFiles.map((file, index) => (
                                <li key={`${file.name}-${index}`}>{file.name}</li>
                            ))}
                        </ul>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={uploading || selectedDraftId === ""}
                        style={{ marginTop: 12 }}
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>

                <div
                    style={{
                        border: "1px solid #334155",
                        padding: 16,
                        borderRadius: 8,
                    }}
                >
                    <h2>Attachment List</h2>

                    {loadingDrafts ? (
                        <p>Loading drafts...</p>
                    ) : selectedDraftId === "" ? (
                        <p>Select a draft to view attachments.</p>
                    ) : loadingAttachments ? (
                        <p>Loading attachments...</p>
                    ) : attachments.length === 0 ? (
                        <p>No attachments found for this draft.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left", padding: 8 }}>File Name</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Type</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Size</th>
                                    <th style={{ textAlign: "left", padding: 8 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attachments.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ padding: 8 }}>{item.fileName}</td>
                                        <td style={{ padding: 8 }}>{item.mimeType}</td>
                                        <td style={{ padding: 8 }}>
                                            {(item.sizeBytes / 1024).toFixed(2)} KB
                                        </td>
                                        <td style={{ padding: 8 }}>
                                            <button onClick={() => handleDelete(item.id)}>Delete</button>
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

export default AttachmentsPage;