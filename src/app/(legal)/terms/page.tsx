import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms of Service · Nexcor",
  description:
    "The rules of using Nexcor. Plain English. Read them, they matter.",
};

function TermsScrollLogo() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      {/* Glow backdrop */}
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 140, height: 140,
          background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 65%)",
          animation: "trm-glow 3s ease-in-out infinite",
        }}
      />
      <svg width="88" height="88" viewBox="0 0 80 80" fill="none" aria-hidden>
        {/* Document shadow */}
        <rect x="18" y="11" width="46" height="60" rx="5"
              fill="rgba(124,58,237,0.05)" stroke="rgba(124,58,237,0.18)" strokeWidth="1"/>

        {/* Main document body */}
        <path d="M13 8 L53 8 L67 22 L67 70 C67 73 64.3 76 61 76 L13 76 C9.7 76 7 73 7 70 L7 14 C7 10.7 9.7 8 13 8 Z"
              fill="rgba(5,2,13,0.85)" stroke="#a78bfa" strokeWidth="2"/>

        {/* Folded corner */}
        <path d="M53 8 L53 22 L67 22" stroke="#a78bfa" strokeWidth="2" fill="rgba(124,58,237,0.12)"/>

        {/* Text lines — alternating purple/cyan */}
        <line x1="16" y1="32" x2="58" y2="32" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
        <line x1="16" y1="39" x2="50" y2="39" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" opacity="0.38"/>
        <line x1="16" y1="46" x2="55" y2="46" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
        <line x1="16" y1="53" x2="44" y2="53" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" opacity="0.38"/>

        {/* Seal ring (rotating dashes) */}
        <circle cx="51" cy="64" r="10"
                fill="rgba(0,229,255,0.05)" stroke="rgba(0,229,255,0.25)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="51" cy="64" r="10"
                fill="none" stroke="rgba(0,229,255,0.22)" strokeWidth="2.5" strokeDasharray="2.5 5">
          <animateTransform attributeName="transform" type="rotate"
                            from="0 51 64" to="360 51 64" dur="14s" repeatCount="indefinite"/>
        </circle>

        {/* ◈ diamond in seal */}
        <path d="M51 57 L58 64 L51 71 L44 64 Z"
              fill="none" stroke="#00e5ff" strokeWidth="1.5" opacity="0.7"/>
        <circle cx="51" cy="64" r="2" fill="#00e5ff" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>

        {/* DNA accent — top right corner area (3 mini base pairs) */}
        <line x1="57" y1="28" x2="57" y2="40" stroke="#a78bfa" strokeWidth="1" opacity="0.3"/>
        <line x1="62" y1="28" x2="62" y2="40" stroke="#00e5ff" strokeWidth="1" opacity="0.3"/>
        <line x1="57" y1="30" x2="62" y2="30" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <line x1="57" y1="35" x2="62" y2="35" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <line x1="57" y1="40" x2="62" y2="40" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    </div>
  );
}

export default function TermsPage() {
  return (
    <LegalPage
      logo={<TermsScrollLogo />}
      title="TERMS OF SERVICE"
      subtitle="Our rules. Short. Honest. Read them."
      lastUpdated="May 15, 2026"
      versionTag="NEXCOR TERMS · v.324B21"
    >
      <blockquote>
        These terms explain what you can do on Nexcor, what we promise, and what
        we don&apos;t. Skip the legalese &mdash; we wrote this so a real person can
        read it.
      </blockquote>

      <h2>Acceptance</h2>
      <p>
        By creating an account or using Nexcor, you agree to these Terms of
        Service and our Privacy Policy. If you don&apos;t agree with something, don&apos;t
        use Nexcor.
      </p>

      <h2>Eligibility</h2>
      <p>
        <strong>Nexcor is only for people 18 years of age or older.</strong> By
        creating an account, you confirm you are 18 or older. If we discover you
        are a minor, we will delete your account.
      </p>
      <p>
        You must also have the legal capacity to enter into contracts in your
        country.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You&apos;re responsible for keeping your password secure.</li>
        <li>You&apos;re responsible for everything that happens under your account.</li>
        <li>Don&apos;t share your account. Don&apos;t create an account on behalf of someone else.</li>
        <li>One real person per account. No bots, no mass automation, no scrapers.</li>
        <li>Usernames that impersonate others, mislead, or harass will be reclaimed.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>Using Nexcor, you agree NOT to:</p>
      <ul>
        <li>Create characters depicting <strong>minors in sexual contexts</strong> (this is a hard line with zero exceptions &mdash; doing so results in immediate account termination and may be reported to authorities).</li>
        <li>Create content designed to harass, threaten, or incite violence against real people.</li>
        <li>Impersonate real identifiable people (public figures included) in ways designed to deceive or harm.</li>
        <li>Generate or share content that is illegal in your jurisdiction.</li>
        <li>Attempt to jailbreak or exploit the AI to produce content that violates these terms.</li>
        <li>Extract, scrape, or re-publish other users&apos; private characters or conversations.</li>
        <li>Use Nexcor to generate spam, malware, phishing content, or misinformation.</li>
        <li>Reverse-engineer, decompile, or try to access our source code or infrastructure.</li>
        <li>Use automated tools to consume Marks or abuse the rate limits.</li>
        <li>Resell or commercialize Nexcor access without permission.</li>
      </ul>
      <p>
        Violations result in account termination. Severe violations (especially
        involving minors) may be reported to law enforcement.
      </p>

      <h2>Your content</h2>
      <p>
        When you create characters, post to the Signal Feed, leave comments,
        upload images, or contribute anything else to Nexcor, here&apos;s the deal:
      </p>
      <ul>
        <li><strong>You own what you create.</strong> The characters, Feed posts, comments, images, and writing &mdash; it&apos;s yours.</li>
        <li><strong>You grant us a license</strong> to host, store, display, and distribute your public content so Nexcor can function (for example: showing your public character in the Explore gallery, displaying your Feed posts to other logged-in users, serving your uploaded images). This license is non-exclusive and royalty-free and only exists for running the platform.</li>
        <li><strong>When you delete content, the license ends.</strong> We will stop displaying it and remove it from active systems within 30 days. Images stored in Supabase Storage are deleted within the same window.</li>
        <li><strong>You are responsible for your content.</strong> If you upload copyrighted material you don&apos;t own, harassing content, or anything that violates these terms, we&apos;ll remove it and may terminate your account.</li>
        <li><strong>Public content is public.</strong> Feed posts, comments, and your public profile are visible to all logged-in Nexcor users. Do not post anything you wouldn&apos;t want other users to see.</li>
      </ul>

      <h3>Copyright complaints (DMCA / takedown requests)</h3>
      <p>
        If you believe content on Nexcor infringes your copyright, please
        contact us at our <a href="/contact">contact form</a> with: (1) a
        description of the copyrighted work, (2) the URL of the allegedly
        infringing content, (3) your contact information, and (4) a statement
        that you have a good-faith belief the use is not authorised. We will
        investigate and remove infringing content promptly. Repeat infringers
        will have their accounts terminated.
      </p>

      <h2>AI-generated content disclaimer</h2>
      <p>
        AI characters on Nexcor are <strong>not real people</strong>. They
        cannot feel, love, or think, even if their responses sound like they do.
        Their replies are generated by statistical models and can be wrong,
        misleading, or offensive.
      </p>
      <p>
        <strong>Do not rely on AI characters for:</strong>
      </p>
      <ul>
        <li>Medical advice or mental health crisis support (please contact a qualified professional, or call an emergency number)</li>
        <li>Legal advice</li>
        <li>Financial or investment advice</li>
        <li>Relationship replacement or human connection in lieu of real support networks</li>
      </ul>
      <p>
        If you are struggling, please talk to someone real. We love that Nexcor
        brings you comfort, but it is not a substitute for human help.
      </p>

      <h2>Marks, payments, and refunds</h2>
      <h3>How Marks work</h3>
      <ul>
        <li>Marks are a virtual in-app currency required to send messages on Nexcor.</li>
        <li>All messages cost Marks. There are no free messages for non-subscribers. Current costs: Haiku 3 Marks, Sonnet 10 Marks, Opus 25 Marks per message.</li>
        <li>Active subscribers receive Haiku messages at no Mark cost and discounted rates on Sonnet and Opus as part of their subscription.</li>
        <li>Marks have <strong>no cash value</strong> and are not your property.</li>
        <li>Marks are not redeemable for money or transferable between accounts.</li>
        <li>We may adjust the Mark cost of messages in the future. If we make a significant negative change, we&apos;ll notify you in advance.</li>
        <li>Marks purchased via Mark Packs do not expire.</li>
        <li>Marks earned via daily login bonuses or (future) rewarded ads may expire if your account is inactive for 12+ months.</li>
      </ul>

      <h3>Payments</h3>
      <ul>
        <li>All payments are processed by <strong>Stripe</strong>. We do not see or store your card details.</li>
        <li>Prices shown are in USD unless stated otherwise. Local currency conversion and taxes may apply at checkout.</li>
        <li>For Mark Packs: purchase is final once payment completes and Marks are credited to your account.</li>
      </ul>

      <h3>Refunds</h3>
      <ul>
        <li>Mark Pack purchases are generally non-refundable once Marks are credited.</li>
        <li>If a payment succeeds but Marks are not credited due to a technical failure, contact us and we&apos;ll make it right.</li>
        <li>For EU consumers: you have a 14-day right of withdrawal under consumer protection law, subject to our obligation to deliver digital content immediately (which you waive by accepting these terms at purchase).</li>
      </ul>

      <h3>Subscriptions (Nexcor Brilliant)</h3>
      <p>
        A Nexcor Brilliant subscription currently includes the following
        benefits for as long as your subscription is active:
      </p>
      <ul>
        <li>Haiku AI messages at no Mark cost.</li>
        <li>Sonnet messages at 8 Marks (vs. 10 for free users).</li>
        <li>Opus messages at 19 Marks (vs. 25 for free users).</li>
        <li>Up to 25 Signal Feed transmissions per 24 hours (vs. 5 for free users).</li>
        <li>Up to 50 AI memory generates per week (vs. 15 for free users).</li>
        <li>Unlimited personas (vs. 5 for free users).</li>
        <li>Unlimited memory cards per character (vs. 30 for free users).</li>
        <li>Extended memory depth: 15,000 characters per character (vs. 10,000).</li>
        <li>100 daily bonus Marks on login (vs. 50 for free users).</li>
        <li>◈ Brilliant badge on your profile.</li>
        <li>Early access to new features.</li>
        <li>Priority support.</li>
      </ul>
      <p>
        We may add benefits over time. We may remove or reduce benefits with 30
        days&apos; advance notice to subscribers. If a benefit is significantly
        reduced, you may cancel for a pro-rata refund for remaining days in
        that billing period by contacting us.
      </p>
      <p>
        Subscriptions renew automatically at the end of each billing period. You
        can cancel anytime in Settings &rarr; Billing. Cancellation takes effect
        at the end of the current paid period &mdash; no partial refunds for
        unused time unless a benefit reduction triggers the above clause. If a
        payment fails, subscription benefits are paused until the payment is
        resolved.
      </p>

      <h2>Signal Feed</h2>
      <p>
        The Signal Feed is a public social space inside Nexcor where users can
        post text and images, comment on each other&apos;s posts, and interact
        through reactions. By using the Feed you agree to:
      </p>
      <ul>
        <li>Only post content you have the right to share.</li>
        <li>Not post content that is illegal, harassing, defamatory, or violates any section of the Acceptable Use policy above.</li>
        <li>Mark posts as <strong>NSFW</strong> if they contain adult themes or graphic imagery. Failure to correctly label NSFW content may result in content removal and account action.</li>
        <li>Not post real names, addresses, phone numbers, or other private identifying information about other people without their consent.</li>
      </ul>
      <p>
        The NSFW flag blurs a post&apos;s image for users who have not enabled
        NSFW content in their settings. This is a courtesy mechanism &mdash; NSFW
        content must still comply with all applicable laws and these terms.
        Content depicting minors sexually is absolutely prohibited regardless of
        any flag.
      </p>
      <p>
        We do not proactively moderate every post. We rely on community
        reporting and will act on reports promptly. We reserve the right to
        remove any Feed post, comment, or image at our discretion.
      </p>

      <h2>Rate limits &amp; fair use</h2>
      <p>
        To keep Nexcor sustainable and fair, the following daily transmission
        limits apply to the Signal Feed:
      </p>
      <ul>
        <li><strong>Free accounts:</strong> 5 posts per 24-hour rolling window.</li>
        <li><strong>Nexcor Brilliant subscribers:</strong> 25 posts per 24-hour rolling window.</li>
      </ul>
      <p>
        These limits reset on a rolling basis, not at a fixed midnight time. We
        may adjust these limits in the future; material changes will be
        communicated in advance. Other parts of Nexcor (AI messages, generates,
        etc.) have separate rate limits described elsewhere in these terms.
        Abusive patterns or automated posting may result in account action
        regardless of whether you have remaining quota.
      </p>

      <h2>Our intellectual property</h2>
      <p>
        The Nexcor name, DnaLogo, visual design, codebase, and all non-user
        content are our intellectual property. You may not copy, mirror, or
        rebrand Nexcor. You may link to us and write about us freely.
      </p>

      <h2>Suspension and termination</h2>
      <p>
        We may suspend or terminate your account if:
      </p>
      <ul>
        <li>You violate these terms.</li>
        <li>Your actions harm other users or the platform.</li>
        <li>We&apos;re legally required to.</li>
      </ul>
      <p>
        You may delete your account anytime in Settings. When you do, we remove
        your data per our Privacy Policy.
      </p>

      <h2>Service availability</h2>
      <p>
        We try hard to keep Nexcor online, but we can&apos;t promise it will always
        work. Outages happen. Features may change or be removed. When possible,
        we&apos;ll give you notice of major changes.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law:
      </p>
      <ul>
        <li>Nexcor is provided &quot;as is&quot; without warranties of any kind.</li>
        <li>We are not liable for any indirect, incidental, or consequential damages arising from your use of Nexcor.</li>
        <li>Our total liability to you for any claim is limited to the greater of: the amount you paid us in the past 12 months, or $50 USD.</li>
      </ul>
      <p>
        Some jurisdictions don&apos;t allow these limitations &mdash; in those places,
        our liability is limited to the maximum extent permitted by law.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to cover our costs (reasonable legal fees and damages) if we
        get sued because of content you created, posted, or shared on Nexcor,
        or because you violated these terms.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms over time. When we make material changes,
        we&apos;ll notify you by email and update the &quot;Last updated&quot; date. Continued
        use after changes means you accept the new terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of Georgia (country). Disputes
        will be resolved in courts located in Georgia, unless your local
        consumer protection law requires otherwise.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms?{" "}
        <a href="/contact">Contact us</a> — we read every message personally.
      </p>
    </LegalPage>
  );
}
