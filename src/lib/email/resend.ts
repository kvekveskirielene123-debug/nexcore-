import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "Nexcor <noreply@nexcor.app>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexcor.app";

// Only send if Resend is configured — silently skip in dev without key
async function send(payload: Parameters<NonNullable<typeof resend>["emails"]["send"]>[0]) {
  if (!resend) return;
  try {
    await resend.emails.send(payload);
  } catch {
    // Never let email failures crash the API
  }
}

// ── Notification: someone liked your post ───────────────────────────────────
export async function sendLikeNotification({
  toEmail,
  toUsername,
  likerUsername,
  postId,
}: {
  toEmail: string;
  toUsername: string;
  likerUsername: string;
  postId: string;
}) {
  await send({
    from: FROM,
    to: toEmail,
    subject: `${likerUsername} resonated with your post`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#fff;">Someone resonated with your post ⟡</h2>
      <p style="margin:0 0 20px;color:rgba(226,217,243,0.7);font-size:14px;">
        <strong style="color:#00e5ff;">${likerUsername}</strong> liked your post on Nexcor.
      </p>
      <a href="${SITE}/feed" style="${btnStyle}">View Post →</a>
    `),
  });
}

// ── Notification: new follower ───────────────────────────────────────────────
export async function sendFollowNotification({
  toEmail,
  toUsername,
  followerUsername,
}: {
  toEmail: string;
  toUsername: string;
  followerUsername: string;
}) {
  await send({
    from: FROM,
    to: toEmail,
    subject: `${followerUsername} is now following you`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#fff;">New follower</h2>
      <p style="margin:0 0 20px;color:rgba(226,217,243,0.7);font-size:14px;">
        <strong style="color:#a78bfa;">${followerUsername}</strong> started following you on Nexcor.
      </p>
      <a href="${SITE}/profile/${followerUsername}" style="${btnStyle}">View Profile →</a>
    `),
  });
}

// ── Notification: comment on your post ──────────────────────────────────────
export async function sendCommentNotification({
  toEmail,
  toUsername,
  commenterUsername,
  commentPreview,
  postId,
}: {
  toEmail: string;
  toUsername: string;
  commenterUsername: string;
  commentPreview: string;
  postId: string;
}) {
  const preview = commentPreview.length > 120
    ? commentPreview.slice(0, 120) + "…"
    : commentPreview;

  await send({
    from: FROM,
    to: toEmail,
    subject: `${commenterUsername} commented on your post`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#fff;">New comment</h2>
      <p style="margin:0 0 12px;color:rgba(226,217,243,0.7);font-size:14px;">
        <strong style="color:#60c8ff;">${commenterUsername}</strong> commented on your post:
      </p>
      <blockquote style="margin:0 0 20px;padding:12px 16px;border-left:3px solid rgba(0,229,255,0.4);background:rgba(0,229,255,0.04);border-radius:4px;color:rgba(226,217,243,0.85);font-size:14px;font-style:italic;">
        ${preview}
      </blockquote>
      <a href="${SITE}/feed" style="${btnStyle}">View Thread →</a>
    `),
  });
}

// ── Notification: daily marks reminder (optional) ───────────────────────────
export async function sendDailyBonusReminder({
  toEmail,
  toUsername,
  marksAvailable,
}: {
  toEmail: string;
  toUsername: string;
  marksAvailable: number;
}) {
  await send({
    from: FROM,
    to: toEmail,
    subject: `Your daily ${marksAvailable} ⟡ Marks are ready`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#fff;">Daily Marks ready ⟡</h2>
      <p style="margin:0 0 20px;color:rgba(226,217,243,0.7);font-size:14px;">
        Hey ${toUsername}, your daily bonus of <strong style="color:#00e5ff;">${marksAvailable} Marks</strong> is waiting for you.
        Log in to claim them before they reset.
      </p>
      <a href="${SITE}/explore" style="${btnStyle}">Claim Marks →</a>
    `),
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const btnStyle = `display:inline-block;padding:11px 24px;border-radius:100px;background:linear-gradient(135deg,#00e5ff,#0077ff);color:#000;font-weight:800;font-size:13px;text-decoration:none;letter-spacing:1px;`;

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#05020d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#05020d;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#0c0520;border:1px solid rgba(124,58,237,0.2);border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,rgba(0,229,255,0.08),rgba(124,58,237,0.06));padding:28px 36px;border-bottom:1px solid rgba(124,58,237,0.15);">
          <span style="font-size:13px;font-weight:800;letter-spacing:3px;color:#00e5ff;text-transform:uppercase;">NEXCOR</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px 36px;">${content}</td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(124,58,237,0.1);text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(122,106,154,0.5);">
            You're receiving this because you have an account on <a href="${SITE}" style="color:rgba(0,229,255,0.5);text-decoration:none;">Nexcor</a>.
            <br>Manage notifications in <a href="${SITE}/settings" style="color:rgba(0,229,255,0.5);text-decoration:none;">Settings</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
