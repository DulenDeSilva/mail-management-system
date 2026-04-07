import nodemailer from "nodemailer";
import { smtpConfig } from "../../config/smtp";

export const transporter = nodemailer.createTransport({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  auth: {
    user: smtpConfig.user,
    pass: smtpConfig.pass
  }
});

type SendMailOptions = {
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  workerName: string;
  workerEmail: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
};

export const sendMailViaSmtp = async (options: SendMailOptions) => {
  const fromDisplay = `${options.workerName} via ${smtpConfig.fromName}`;

  return transporter.sendMail({
    from: `"${fromDisplay}" <${smtpConfig.fromEmail}>`,
    to: options.to.join(", "),
    cc: options.cc?.length ? options.cc.join(", ") : undefined,
    replyTo: options.workerEmail,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
    headers: {
      "X-Worker-Name": options.workerName,
      "X-Worker-Email": options.workerEmail
    }
  });
};