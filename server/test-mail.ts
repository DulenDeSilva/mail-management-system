import "dotenv/config";
import nodemailer from "nodemailer";

async function main() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: "dulen.bsc.se02@edu.lnbti.lk",
        subject: "Campus SMTP test",
        text: "This is a test email from my Node.js SMTP setup.",
    });

    console.log("Sent successfully:", info.messageId);
}

main().catch((err) => {
    console.error("SMTP test failed:");
    console.error(err);
    process.exit(1);
});