// PATCH for src/app/(app)/settings/SettingsClient.tsx
//
// Add this import at the top of your existing SettingsClient.tsx:
//
//   import Link from "next/link";   ← already imported, no change needed
//
// Then inside the ◈ ACCOUNT SettingsSection, add this row
// AFTER the MarksWidget block and BEFORE the closing </SettingsSection>:
//
// ─────────────────────────────────────────────────────────────
//
// <SettingsRow
//   iconSymbol="⟡"
//   iconColor="rgba(0,229,255,0.12)"
//   label="Billing & transactions"
//   description="Full history, invoices, payment methods."
//   href="/settings/billing"
//   showChevron
// />
//
// ─────────────────────────────────────────────────────────────
//
// That's the only change needed to SettingsClient.tsx.
// The full file is NOT shipped here to avoid overwriting your
// existing settings code — just apply the targeted edit above.
//
// Where exactly to put it in the JSX:
//
//   <SettingsSection title="ACCOUNT">
//     <Link href="/settings/profile" ...> ... </Link>   ← profile card
//
//     <MarksWidget initialBalance={props.marksBalance} />
//
//     {/* ADD THIS ↓ */}
//     <SettingsRow
//       iconSymbol="⟡"
//       iconColor="rgba(0,229,255,0.12)"
//       label="Billing & transactions"
//       description="Full history, invoices, payment methods."
//       href="/settings/billing"
//       showChevron
//     />
//     {/* END ADD */}
//
//   </SettingsSection>
//
// No other changes needed.

export {};
