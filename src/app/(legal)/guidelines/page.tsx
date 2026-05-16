import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Community Guidelines · Nexcor",
  description: "Rules that keep Nexcor a safe, creative, and respectful space for everyone.",
};

function GuidelinesLogo() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 155, height: 155,
          background: "radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 65%)",
        }}
      />
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
        <polygon points="40,6 74,22 74,58 40,74 6,58 6,22" stroke="rgba(0,229,255,0.4)" strokeWidth="1.4" fill="rgba(0,229,255,0.02)"/>
        <polygon points="40,6 74,22 74,58 40,74 6,58 6,22" stroke="rgba(0,229,255,0.1)" strokeWidth="0.6" strokeDasharray="3 4" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="-360 40 40" dur="25s" repeatCount="indefinite"/>
        </polygon>
        <path d="M27 40l8 8 18-18" stroke="#00e5ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="40" r="18" stroke="rgba(0,229,255,0.2)" strokeWidth="0.8" fill="none"/>
        <circle cx="40" cy="40" r="18" fill="none" stroke="rgba(0,229,255,0.3)" strokeWidth="1">
          <animate attributeName="r" values="18;28;18" dur="3.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0;0.3" dur="3.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}

export default function GuidelinesPage() {
  return (
    <LegalPage
      logo={<GuidelinesLogo />}
      title="COMMUNITY GUIDELINES"
      subtitle="Rules that keep Nexcor creative, safe, and worth showing up to."
      lastUpdated="May 16, 2026"
      versionTag="NEXCOR GUIDELINES · v.324B21"
    >
      <blockquote>
        These guidelines exist for one reason: so everyone — creators, chatters, and casual visitors
        — can enjoy Nexcor without running into content or behaviour that ruins the experience.
        They apply everywhere on Nexcor: the Signal Feed, character pages, DMs, and profile bios.
      </blockquote>

      <h2>1. Respect everyone</h2>
      <p>
        Treat other users the way you want to be treated. Disagreements happen — harassment doesn&apos;t.
        Targeted insults, slurs, threats, doxxing, or sustained campaigns against a user are not allowed.
        This includes behaviour that starts on Nexcor and continues elsewhere.
      </p>

      <h2>2. No harassment or bullying</h2>
      <ul>
        <li>Do not send unwanted explicit DMs or repeatedly message someone who has not responded.</li>
        <li>Do not impersonate real people — users or public figures — in a way designed to deceive.</li>
        <li>Do not coordinate attacks or pile-ons against any user.</li>
        <li>Do not threaten or encourage harm against any person, group, or animal.</li>
      </ul>

      <h2>3. Tag NSFW content correctly</h2>
      <p>
        Nexcor allows adult-oriented content for verified adult users, but it must be properly labelled.
      </p>
      <ul>
        <li>Mark any post containing nudity, explicit sexuality, graphic violence, or similar content with the NSFW toggle before posting.</li>
        <li>Characters with adult themes must have the NSFW flag enabled — this hides them from users who have NSFW content turned off.</li>
        <li>Sexual content involving minors is <strong>absolutely prohibited</strong> and will result in immediate, permanent removal and a report to appropriate authorities.</li>
      </ul>

      <h2>4. No illegal content</h2>
      <p>The following are never allowed under any circumstances:</p>
      <ul>
        <li>Child sexual abuse material (CSAM) or any sexual content depicting minors.</li>
        <li>Content that facilitates real-world violence, terrorism, or human trafficking.</li>
        <li>Malware, phishing links, or content designed to defraud users.</li>
        <li>Content that violates another person&apos;s copyright or intellectual property rights in bad faith.</li>
      </ul>

      <h2>5. No spam or platform manipulation</h2>
      <ul>
        <li>Do not post the same or substantially similar content repeatedly across the Feed.</li>
        <li>Do not create multiple accounts to evade a ban or artificially inflate engagement.</li>
        <li>Do not use automated tools, bots, or scripts to interact with Nexcor in ways that weren&apos;t intended.</li>
        <li>Do not post referral codes, promotional links, or commercial advertising without prior approval.</li>
      </ul>

      <h2>6. Keep AI characters responsible</h2>
      <p>
        You are responsible for the characters you create. A character&apos;s personality prompt is yours to write, but:
      </p>
      <ul>
        <li>Do not instruct characters to provide real instructions for making weapons, drugs, or carrying out illegal acts.</li>
        <li>Do not create characters that impersonate real living people in a harmful or deceptive way.</li>
        <li>Do not use characters to harvest personal information from other users.</li>
        <li>Do not publish NSFW characters without the NSFW flag enabled.</li>
      </ul>

      <h2>7. Protect privacy</h2>
      <ul>
        <li>Do not share another user&apos;s private information (real name, address, phone number, etc.) without their explicit consent.</li>
        <li>Do not screenshot and share private DM conversations without the other person&apos;s knowledge.</li>
        <li>Do not attempt to identify anonymous or pseudonymous users.</li>
      </ul>

      <h2>8. Signal Feed rules</h2>
      <p>
        The Signal Feed is public. Posts expire after 24 hours. In addition to the general rules above:
      </p>
      <ul>
        <li>Keep posts under 500 characters of meaningful content — not just repeated punctuation or symbols.</li>
        <li>Images must comply with the NSFW policy above.</li>
        <li>Tag posts with relevant tags so users can filter content they want to see.</li>
      </ul>

      <h2>Enforcement</h2>
      <p>
        Violations can result in content removal, temporary suspension, or a permanent ban depending on
        the severity and history. The most serious violations (CSAM, real-world harm, repeated abuse)
        result in immediate permanent removal. We are a small team and we cannot catch everything — your
        reports are important.
      </p>

      <h2>How to report</h2>
      <p>
        Use the flag/report button on any post, character, or profile. For urgent safety issues,
        <a href="/contact"> contact us directly</a>. We take safety reports seriously and respond promptly.
      </p>

      <h2>Changes to these guidelines</h2>
      <p>
        These guidelines will evolve as Nexcor grows. Material changes will be announced and the
        &quot;last updated&quot; date above will reflect the most recent revision.
      </p>
    </LegalPage>
  );
}
