import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const SUBJECTS = ["Bug report", "Billing issue", "Account issue", "Feature request", "Other"];

export async function POST(request: Request) {
  try {
    const { userId, username, email, subject, message } = await request.json();

    if (!userId || !subject || !message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (!SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }
    if (message.trim().length < 20) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Verify userId exists in profiles (auth guard — no unauthenticated submissions)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const safeUsername = username ?? "unknown";
    const safeEmail = email ?? "no email";

    // Log to support_tickets — best-effort, email is the primary delivery
    await supabaseAdmin.from("support_tickets").insert({
      user_id: userId,
      username: safeUsername,
      email: safeEmail,
      subject,
      message: message.trim(),
    }).then(() => {}).catch(() => {});

    // Send email to kuraigrey@gmail.com
    if (resend) {
      const { error: emailErr } = await resend.emails.send({
        from: "Nexcor Support <noreply@nexcor.app>",
        to: "kuraigrey@gmail.com",
        subject: `[Nexcor Support] ${subject} — @${safeUsername}`,
        text: [
          `From: @${safeUsername} (${safeEmail})`,
          `User ID: ${userId}`,
          `Subject: ${subject}`,
          "",
          message.trim(),
          "",
          "---",
          "Sent from Nexcor in-app support form",
        ].join("\n"),
      });
      if (emailErr) {
        console.error("[support/contact] resend error:", emailErr);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
      }
    } else {
      console.warn("[support/contact] RESEND_API_KEY not set — email not sent");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[support/contact]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
