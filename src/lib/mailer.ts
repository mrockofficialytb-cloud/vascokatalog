import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const secure = String(process.env.SMTP_SECURE ?? "true") === "true";
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

const from = process.env.MAIL_FROM || "VASCO katalog <no-reply@vascokatalog>";

if (!host || !user || !pass) {
  console.warn("[mailer] Missing SMTP envs (SMTP_HOST/SMTP_USER/SMTP_PASS). Emails will fail.");
}

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}