import type { Request, Response } from "express";
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.office365.com"; // Microsoft 365 default
const smtpPort = Number(process.env.SMTP_PORT || 587);          // TLS
const smtpUser = process.env.EMAIL_USER;                        // your mailbox (e.g. no-reply@company.com)
const smtpPass = process.env.EMAIL_PASS;                        // its password (or app password)

if (!smtpUser || !smtpPass) {
  console.warn(" EMAIL_USER or EMAIL_PASS is missing from environment.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,              // STARTTLS on port 587
  auth: { user: smtpUser, pass: smtpPass },
});

// optional: quick health check for startup
export async function verifyEmailTransport(): Promise<void> {
  try {
    await transporter.verify();
    console.log("Email transport verified");
  } catch (err) {
    console.error("Email transport failed:", err);
  }
}

// POST /api/email
export async function sendEmailHandler(req: Request, res: Response) {
  try {
    const { to, subject, text, html, fromName } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        error: "Missing required fields: to, subject, and text or html",
      });
    }

    const fromAddress = smtpUser!;
    const fromHeader = fromName ? `"${fromName}" <${fromAddress}>` : fromAddress;

    const info = await transporter.sendMail({
      from: fromHeader,
      to,                 // string or array
      subject,
      text: text || undefined,
      html: html || undefined,
      // cc, bcc, replyTo, attachments, etc. can be added here
    });

    return res.json({ ok: true, messageId: info.messageId });
  } catch (err: any) {
    console.error("Email send error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Send failed" });
  }
}
