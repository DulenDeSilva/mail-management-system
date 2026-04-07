export type MailSenderType = "WORKER_PERSONAL" | "ADMIN_COMPANY";
export type MailRecipientType = "TO" | "CC";
export type MailRecipientSourceType = "SYSTEM" | "MANUAL_CC";

export interface MailLogUser {
    id: number;
    name: string;
    email: string;
}

export interface MailLogDraft {
    id: number;
    title: string;
    subject: string;
}

export interface MailLogRecipientCompany {
    id: number;
    name: string;
}

export interface MailLogRecipientCompanyEmail {
    id: number;
    contactName: string | null;
    email: string;
}

export interface MailLogRecipient {
    id: number;
    recipientEmail: string;
    recipientType: MailRecipientType;
    sourceType: MailRecipientSourceType;
    company: MailLogRecipientCompany | null;
    companyEmail: MailLogRecipientCompanyEmail | null;
}

export interface MailLog {
    id: number;
    workerName: string;
    workerEmail: string;
    senderEmail: string;
    senderType: MailSenderType;
    subjectSnapshot: string;
    bodySnapshot: string;
    sentAt: string;
    sentByUser: MailLogUser;
    draft: MailLogDraft | null;
    recipients: MailLogRecipient[];
}
