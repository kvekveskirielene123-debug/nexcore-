import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Required env vars (set in Vercel dashboard — never in source):
//   CONTACT_EMAIL   — destination address (your real inbox)
//   SMTP_HOST       — e.g. smtp.gmail.com
//   SMTP_PORT       — e.g. 587
//   SMTP_USER       — SMTP login (your Gmail address)
//   SMTP_PASS       — Gmail App Password (not your account password)

const MAX_MESSAGE_LENGTH = 2000;

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: "Message too long." }, { status: 400 });
    }

    const destEmail = process.env.CONTACT_EMAIL;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT ?? "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!destEmail || !smtpHost || !smtpUser || !smtpPass) {
      // SMTP not yet configured — log on server, surface generic success to user
      console.error("Contact form: SMTP env vars not configured. Message dropped:", {
        from: email,
        subject,
      });
      return NextResponse.json({ ok: true });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Nexcor Contact" <${smtpUser}>`,
      to: destEmail,
      replyTo: `"${name}" <${email}>`,
      subject: `[Nexcor Contact] ${subject}`,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
      html: `
        <p><strong>From:</strong> ${escHtml(name)} &lt;${escHtml(email)}&gt;</p>
        <p><strong>Subject:</strong> ${escHtml(subject)}</p>
        <hr />
        <p style="white-space:pre-wrap">${escHtml(message)}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
