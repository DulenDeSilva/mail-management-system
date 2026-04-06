import nodemailer from "nodemailer";
import { smtpConfig } from "../../config/smtp";

export const transporter = nodemailer.createTransport({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  auth: {
    user: smtpConfig.user,
    pass: smtpConfig.pass,
  },
});

export const sendMailViaSmtp = async (options: {
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}) => {
  return transporter.sendMail({
    from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
    to: options.to.join(", "),
    cc: options.cc?.length ? options.cc.join(", ") : undefined,
    replyTo: options.replyTo,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });
};