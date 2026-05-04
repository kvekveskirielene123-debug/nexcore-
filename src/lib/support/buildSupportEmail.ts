// Support topic list — used by SupportContactDialog.
// The actual support email address lives in CONTACT_EMAIL env var (server-side only).
// Never put the email address in client-side code.

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
