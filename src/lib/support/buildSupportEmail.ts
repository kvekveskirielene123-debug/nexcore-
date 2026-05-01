// Builds the mailto link for contacting support.
// Runs in the browser.

export const SUPPORT_EMAIL = "kvekveskirielene123@mail.com";

export type SupportTopic =
  | "Bug"
  | "Payment"
  | "Feature Request"
  | "Character Issue"
  | "NSFW Report"
  | "Other";

export const TOPICS: SupportTopic[] = [
  "Bug",
  "Payment",
  "Feature Request",
  "Character Issue",
  "NSFW Report",
  "Other",
];

export interface SupportEmailArgs {
  topic: SupportTopic;
  subject: string;
  message: string;
  user: {
    username: string | null;
    id: string;
    email: string | null;
  };
  page: string;
  browser: string;
}

function formatTimestamp(): string {
  const d = new Date();
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function buildSupportEmail(args: SupportEmailArgs): {
  mailtoUrl: string;
  subjectLine: string;
  bodyText: string;
} {
  const { topic, subject, message, user, page, browser } = args;

  const username = user.username ?? "(no-username)";
  const subjectLine = `[Nexcor Support] ${topic} — ${username}`;

  const subjectLine2 = subject?.trim() ? subject.trim() : "(no subject)";

  const bodyText = [
    "USER INFO",
    "─────────",
    `Username: ${username}`,
    `User ID:  ${user.id}`,
    `Email:    ${user.email ?? "(none)"}`,
    `Page:     ${page}`,
    `Browser:  ${browser}`,
    `Time:     ${formatTimestamp()}`,
    "",
    `MESSAGE — Subject: ${subjectLine2}`,
    "─────────",
    message.trim(),
    "",
    "—",
    "Sent from Nexcor · 324B21",
  ].join("\n");

  const params = new URLSearchParams({
    subject: subjectLine,
    body: bodyText,
  });
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?${params.toString()}`;

  return { mailtoUrl, subjectLine, bodyText };
}
