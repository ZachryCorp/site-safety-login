"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailTransport = verifyEmailTransport;
exports.sendEmailHandler = sendEmailHandler;
const nodemailer_1 = __importDefault(require("nodemailer"));
const smtpHost = process.env.SMTP_HOST || "smtp.office365.com"; // Microsoft 365 default
const smtpPort = Number(process.env.SMTP_PORT || 587); // TLS
const smtpUser = process.env.EMAIL_USER; // your mailbox (e.g. no-reply@company.com)
const smtpPass = process.env.EMAIL_PASS; // its password (or app password)
if (!smtpUser || !smtpPass) {
    console.warn(" EMAIL_USER or EMAIL_PASS is missing from environment.");
}
const transporter = nodemailer_1.default.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false, // STARTTLS on port 587
    auth: { user: smtpUser, pass: smtpPass },
});
// optional: quick health check for startup
async function verifyEmailTransport() {
    try {
        await transporter.verify();
        console.log("Email transport verified");
    }
    catch (err) {
        console.error("Email transport failed:", err);
    }
}
// POST /api/email
async function sendEmailHandler(req, res) {
    try {
        const { to, subject, text, html, fromName } = req.body;
        if (!to || !subject || (!text && !html)) {
            return res.status(400).json({
                error: "Missing required fields: to, subject, and text or html",
            });
        }
        const fromAddress = smtpUser;
        const fromHeader = fromName ? `"${fromName}" <${fromAddress}>` : fromAddress;
        const info = await transporter.sendMail({
            from: fromHeader,
            to, // string or array
            subject,
            text: text || undefined,
            html: html || undefined,
            // cc, bcc, replyTo, attachments, etc. can be added here
        });
        return res.json({ ok: true, messageId: info.messageId });
    }
    catch (err) {
        console.error("Email send error:", err);
        return res.status(500).json({ ok: false, error: err.message || "Send failed" });
    }
}
