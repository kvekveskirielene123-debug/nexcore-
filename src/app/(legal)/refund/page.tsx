import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Refund Policy · Nexcor",
  description: "When we give money back, when we don't, and how to ask.",
};

function RefundLogo() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 148,
          height: 148,
          background: "radial-gradient(circle, rgba(0,229,255,0.13) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)",
          animation: "rfnd-breathe 3.5s ease-in-out infinite",
        }}
      />

      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>

        {/* Outer orbit ring */}
        <circle cx="44" cy="44" r="40" stroke="rgba(0,229,255,0.15)" strokeWidth="1" strokeDasharray="5 9">
          <animateTransform attributeName="transform" type="rotate"
            from="0 44 44" to="360 44 44" dur="28s" repeatCount="indefinite"/>
        </circle>

        {/* Orbit node — top */}
        <circle cx="44" cy="4" r="2.5" fill="#00e5ff">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate"
            from="0 44 44" to="360 44 44" dur="28s" repeatCount="indefinite"/>
        </circle>

        {/* Orbit node — right */}
        <circle cx="84" cy="44" r="2.5" fill="#a78bfa">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate"
            from="0 44 44" to="360 44 44" dur="28s" repeatCount="indefinite"/>
        </circle>

        {/* Mid ring */}
        <circle cx="44" cy="44" r="28" stroke="rgba(124,58,237,0.2)" strokeWidth="0.8"/>

        {/* Inner card body */}
        <rect x="16" y="26" width="56" height="36" rx="6"
          fill="rgba(5,2,13,0.9)" stroke="rgba(0,229,255,0.45)" strokeWidth="1.8"/>

        {/* Card stripe */}
        <rect x="16" y="34" width="56" height="8"
          fill="rgba(0,229,255,0.08)" stroke="none"/>
        <line x1="16" y1="34" x2="72" y2="34" stroke="rgba(0,229,255,0.22)" strokeWidth="0.8"/>
        <line x1="16" y1="42" x2="72" y2="42" stroke="rgba(0,229,255,0.22)" strokeWidth="0.8"/>

        {/* Card chip */}
        <rect x="22" y="29" width="10" height="7" rx="1.5"
          fill="rgba(251,191,36,0.25)" stroke="rgba(251,191,36,0.5)" strokeWidth="1"/>
        <line x1="27" y1="29" x2="27" y2="36" stroke="rgba(251,191,36,0.35)" strokeWidth="0.7"/>
        <line x1="22" y1="32.5" x2="32" y2="32.5" stroke="rgba(251,191,36,0.35)" strokeWidth="0.7"/>

        {/* Dots — card number placeholder */}
        {[46, 52, 58, 64].map((x, i) => (
          <circle key={i} cx={x} cy="37.5" r="1.3" fill="rgba(0,229,255,0.35)"/>
        ))}

        {/* ⟡ Mark diamond center */}
        <polygon points="44,48 50,54 44,60 38,54"
          fill="rgba(0,229,255,0.9)" stroke="white" strokeWidth="0.6"
          opacity="0.85"/>
        <circle cx="44" cy="54" r="1.6" fill="white" opacity="0.9">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/>
        </circle>

        {/* Return arrow — arcs back over the card */}
        <path d="M58 20 C70 14, 80 28, 72 38"
          stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round" fill="none"
          strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" values="0;-12" dur="1.5s" repeatCount="indefinite"/>
        </path>
        {/* Arrow head */}
        <polyline points="66,36 72,38 70,44"
          stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Scan ripple */}
        <circle cx="44" cy="44" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.2" r="4">
          <animate attributeName="r"       values="4;40"   dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".4;0"   dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="44" cy="44" fill="none" stroke="rgba(124,58,237,0.25)" strokeWidth="0.8" r="4">
          <animate attributeName="r"       values="4;40"   dur="3s" begin="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".25;0"  dur="3s" begin="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>

      <style>{`
        @keyframes rfnd-breathe { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
      `}</style>
    </div>
  );
}

export default function RefundPage() {
  return (
    <LegalPage
      logo={<RefundLogo />}
      title="REFUND POLICY"
      subtitle="When we give money back and how to ask. Plain and simple."
      lastUpdated="May 16, 2026"
      versionTag="NEXCOR REFUNDS · v.324B21"
    >
      <blockquote>
        We want you to be happy with every purchase. If something went wrong on
        our end, we&apos;ll make it right. Read on for the details.
      </blockquote>

      <h2>Mark Pack purchases</h2>
      <p>
        When you buy a Mark Pack, Marks are credited to your account immediately
        after payment completes. Because the digital goods are delivered
        instantly, <strong>Mark Pack purchases are generally non-refundable</strong> once
        the Marks appear in your balance.
      </p>
      <p>Exceptions we will always honour:</p>
      <ul>
        <li>
          <strong>Technical failure:</strong> Payment was charged but Marks were
          never credited to your account. Contact us with your transaction ID and
          we will either credit the Marks or issue a full refund within 3
          business days.
        </li>
        <li>
          <strong>Duplicate charge:</strong> You were billed twice for the same
          purchase. We will refund the duplicate charge in full.
        </li>
        <li>
          <strong>Unauthorised payment:</strong> You did not authorise the
          payment. Contact us immediately and we will investigate and refund if
          confirmed.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> issue refunds for Marks that have been spent on
        AI messages, even if you were unhappy with an AI response. The Marks are
        the access tokens — the AI conversation itself is the digital service
        delivered.
      </p>

      <h2>Nexcor Brilliant subscriptions</h2>
      <p>
        Subscription billing is recurring. Here is how refunds work for each
        situation:
      </p>
      <ul>
        <li>
          <strong>Cancellation mid-period:</strong> When you cancel a Nexcor
          Brilliant subscription, you keep access until the end of the current
          paid period. We do not issue pro-rata refunds for unused days unless
          the clause below applies.
        </li>
        <li>
          <strong>Significant benefit reduction:</strong> If we reduce a
          Brilliant benefit materially (e.g., remove a feature that was central
          to your reason for subscribing), you may cancel within 14 days of that
          change and receive a pro-rata refund for the remaining days in your
          billing period. Contact us to request this.
        </li>
        <li>
          <strong>Renewal you forgot about:</strong> If you contact us within 48
          hours of an automatic renewal charge and have not used any subscriber
          benefits in that new period, we will refund the renewal and cancel your
          subscription. This is a one-time goodwill gesture per account.
        </li>
        <li>
          <strong>Technical failure on activation:</strong> Payment was charged
          but Brilliant benefits did not activate. Contact us and we will fix it
          or refund in full.
        </li>
      </ul>

      <h2>EU &amp; UK consumer rights</h2>
      <p>
        If you are located in the European Union or United Kingdom, you have
        additional statutory rights:
      </p>
      <ul>
        <li>
          Under EU Directive 2011/83/EU and UK Consumer Contracts Regulations,
          you have a <strong>14-day right of withdrawal</strong> from digital
          purchases, unless you have consented to immediate delivery of digital
          content and acknowledged that you lose your right to withdraw. By
          completing a purchase on Nexcor you give this consent (a checkbox or
          equivalent confirmation is shown at checkout).
        </li>
        <li>
          If immediate delivery consent was not obtained correctly at your
          purchase, your 14-day withdrawal right applies in full. Contact us and
          we will honour it.
        </li>
        <li>
          These statutory rights apply in addition to everything else in this
          policy, not instead of them.
        </li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        To request a refund, contact us through our{" "}
        <a href="/contact">contact form</a>. Include:
      </p>
      <ol>
        <li>Your Nexcor username or account email.</li>
        <li>The date of the purchase.</li>
        <li>
          The transaction or order ID from your email receipt (starts with{" "}
          <code>txn_</code> or similar).
        </li>
        <li>A short description of what went wrong.</li>
      </ol>
      <p>
        We aim to respond within <strong>1 business day</strong> and resolve
        refund requests within <strong>3–5 business days</strong>. Approved
        refunds are returned to the original payment method. Processing time
        depends on your bank (typically 3–10 business days after we issue the
        refund).
      </p>

      <h2>Chargebacks</h2>
      <p>
        We take chargebacks seriously. If you believe a charge was unauthorised,
        please contact us <strong>before</strong> filing a chargeback with your
        bank — we can almost always resolve it faster directly. Accounts with
        fraudulent chargebacks may be suspended.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at
        the top reflects the most recent revision. Continued use of Nexcor after
        changes means you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about a purchase or refund?{" "}
        <a href="/contact">Contact us</a> — we read every message personally and
        we genuinely want to sort it out.
      </p>
    </LegalPage>
  );
}
