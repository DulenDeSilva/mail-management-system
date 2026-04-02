export interface DraftAttachment {
    id: number;
    draftId: number;
    fileName: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
}