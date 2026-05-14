import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy Policy · Nexcor",
  description:
    "How Nexcor collects, uses, and protects your data. Clear and honest.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="PRIVACY POLICY"
      subtitle="Clear, honest, and written by humans who care."
      lastUpdated="May 15, 2026"
      versionTag="NEXCOR PRIVACY · v.324B21"
    >
      <blockquote>
        We wrote this ourselves in plain English. No buried clauses, no hidden
        trackers. If anything here is unclear, email us — there's a link at the
        bottom.
      </blockquote>

      <p>
        This Privacy Policy explains what Nexcor (&quot;we,&quot; &quot;us&quot;) collects from you, how we
        use it, who else sees it, and your rights over your own data.
      </p>

      <h2>Who we are</h2>
      <p>
        Nexcor is an AI character chat platform operated by <strong>Kurai
        Kvekveskirielene</strong>, an individual based in Georgia, for the purposes
        of this policy. We are a very small team (two people: Kurai and Big G).
        You can reach us via our <a href="/contact">contact form</a>.
      </p>
      <p>
        Because we offer services to people worldwide, this policy is written to
        respect your rights under the <strong>GDPR</strong> (European Union),
        <strong> CCPA</strong> (California), and similar privacy laws wherever
        you live.
      </p>

      <h2>Minimum age</h2>
      <p>
        Nexcor is <strong>for users 18 years of age or older</strong>. We do not
        knowingly collect data from people under 18. If we discover that a minor
        has created an account, we delete it and any associated data within a
        reasonable time. If you believe a minor is using Nexcor, please contact
        us.
      </p>

      <h2>What we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li><strong>Account info</strong> — email, username, password (hashed, we never see it in plain text), and optionally a display name and avatar.</li>
        <li><strong>Characters you create</strong> — name, description, greeting, long-term memory text, avatar image, gender/pronouns, visibility setting, NSFW flag.</li>
        <li><strong>Conversations</strong> — every message you send and every reply the AI generates, stored so characters can remember what you&apos;ve discussed.</li>
        <li><strong>Signal Feed content</strong> — text posts, images, NSFW flags, and tags you publish to the Feed. Feed posts and comments are <strong>publicly visible</strong> to all logged-in Nexcor users. Do not post anything in the Feed you wish to keep private.</li>
        <li><strong>Comments</strong> — text you write in response to Feed posts, including nested replies. Publicly visible.</li>
        <li><strong>Social interactions</strong> — likes (&ldquo;Resonates&rdquo;) on Feed posts, who you follow, and who follows you. Follow relationships are visible on your public profile. Like counts are visible on posts.</li>
        <li><strong>Uploaded images</strong> — photos you attach to Feed posts are uploaded to Supabase Storage and served via a public URL. If you delete a post, the image is removed from storage within 30 days.</li>
        <li><strong>Payment info</strong> — when you buy Marks or subscribe, Stripe handles your card details. We only receive your Stripe customer ID, purchase amount, and transaction timestamp. We never see your card number.</li>
        <li><strong>Support messages</strong> — when you contact us, we see your message plus some diagnostic info (username, page URL, browser) to help us help you.</li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li><strong>Session cookies</strong> — required for login. We don't use tracking cookies.</li>
        <li><strong>Server logs</strong> — basic information like IP address and timestamp, kept for 30 days for security and debugging.</li>
        <li><strong>Browser and OS</strong> — collected only when you contact support, to help diagnose bugs.</li>
      </ul>

      <h3>What we do NOT collect</h3>
      <ul>
        <li>We do not use third-party advertising trackers.</li>
        <li>We do not sell your data — to anyone, ever.</li>
        <li>We do not use analytics services that profile you across the web.</li>
      </ul>

      <h2>How the AI works (the honest version)</h2>
      <p>
        Nexcor is powered by <strong>Anthropic&apos;s Claude</strong> models. When you
        send a message, here is exactly what happens:
      </p>
      <ol className="list-decimal list-inside space-y-2 ml-2">
        <li>Your message is saved to our database (Supabase).</li>
        <li>We assemble a &quot;system prompt&quot; containing: the character&apos;s description, their long-term memory (written by whoever created the character), and some context about you (your username and any facts you&apos;ve told the character earlier in conversation).</li>
        <li>We send this prompt plus the last 20 messages in the conversation to Anthropic&apos;s API.</li>
        <li>Anthropic generates a reply and sends it back to us.</li>
        <li>We save the reply to our database and stream it to your screen.</li>
      </ol>
      <p>
        <strong>Anthropic does not use your API-sent data to train their models</strong>,
        per their standard API terms. They retain data temporarily for safety
        monitoring (typically 30 days) and then delete it. You can read their
        policy at <a href="https://www.anthropic.com/legal/commercial-terms">anthropic.com/legal</a>.
      </p>
      <p>
        <strong>Important:</strong> AI characters are not real people. They do
        not have feelings or consciousness, and their replies are generated by
        statistical models. Please do not use them for medical, legal,
        financial, or crisis-related advice.
      </p>

      <h2>How memory works</h2>
      <p>
        Each character has a <code>long_term_memory</code> text field written by
        its creator when the character is made. This memory is included in every
        AI request, so the character stays consistent.
      </p>
      <p>
        Separately, your <strong>conversation history</strong> (up to the last
        20 messages) is included in each request, so the character remembers
        what you just said. We do not train a model on your messages. We do not
        share your messages with other users or other characters. Your chat with
        Sistra stays private to you.
      </p>

      <h2>Third parties we use</h2>
      <p>
        We use a small number of service providers to run Nexcor. Each one is a
        &quot;data processor&quot; under GDPR terms, which means they handle data on our
        behalf under strict contracts.
      </p>
      <ul>
        <li><strong>Supabase</strong> — stores your account, characters, conversations, Feed posts, and comments in a PostgreSQL database hosted in the EU. Supabase Storage is also used to host images you attach to Feed posts (served via public URL). <a href="https://supabase.com/privacy">Privacy policy</a>.</li>
        <li><strong>Anthropic</strong> — provides the Claude AI models. Processes messages in real time, does not train on API data. <a href="https://www.anthropic.com/legal/privacy">Privacy policy</a>.</li>
        <li><strong>Stripe</strong> — handles payments. Receives your card details directly; we never see them. <a href="https://stripe.com/privacy">Privacy policy</a>.</li>
        <li><strong>Vercel</strong> — hosts the website. Receives basic request data (IP, user agent). <a href="https://vercel.com/legal/privacy-policy">Privacy policy</a>.</li>
      </ul>

      <h2>How long we keep your data</h2>
      <ul>
        <li><strong>Account &amp; profile:</strong> As long as your account exists.</li>
        <li><strong>Characters you create:</strong> As long as your account exists, unless you delete them.</li>
        <li><strong>Conversations:</strong> Stored indefinitely by default so characters can remember you. You can delete individual conversations anytime from the chat menu.</li>
        <li><strong>Signal Feed posts &amp; comments:</strong> Kept until you delete them or your account is deleted. When you delete a post, it is removed from active systems within 30 days.</li>
        <li><strong>Uploaded images:</strong> Stored in Supabase Storage. When you delete the associated Feed post, the image file is removed from storage within 30 days.</li>
        <li><strong>Payment records:</strong> Kept for 7 years for tax and accounting reasons.</li>
        <li><strong>Support messages:</strong> Kept for 2 years so we can reference past issues.</li>
        <li><strong>Server logs:</strong> 30 days.</li>
      </ul>
      <p>
        When you delete your account, we remove your profile, characters,
        conversations, Feed posts, comments, and messages from our active
        systems within 30 days. Associated image files in Supabase Storage are
        also deleted within this window. Backup copies may persist for up to
        90 days before being fully purged.
      </p>

      <h2>Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access</strong> your data — email us and we&apos;ll send you a copy.</li>
        <li><strong>Correct</strong> your data — most fields are editable in Settings.</li>
        <li><strong>Delete</strong> your data — delete individual conversations in the chat menu, or delete your entire account in Settings.</li>
        <li><strong>Export</strong> your data — email us and we&apos;ll provide a machine-readable export.</li>
        <li><strong>Object</strong> to our processing — email us.</li>
        <li><strong>Lodge a complaint</strong> with your local data protection authority if you feel we&apos;ve mishandled your data.</li>
      </ul>
      <p>
        For California residents: you have additional rights under the CCPA
        including the right to know, delete, and opt out of &quot;sales&quot; (we do not
        sell data). Exercise these rights by emailing us.
      </p>

      <h2>Security</h2>
      <p>
        We take reasonable steps to protect your data:
      </p>
      <ul>
        <li>All traffic is encrypted in transit (HTTPS/TLS).</li>
        <li>Passwords are hashed with industry-standard algorithms — we never see them.</li>
        <li>Database access is restricted by row-level security (RLS), meaning you can only read your own private data.</li>
        <li>Payment information never touches our servers.</li>
      </ul>
      <p>
        No system is perfectly secure. If we ever experience a data breach
        affecting you, we will notify you within 72 hours as required by GDPR.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        We use only <strong>essential cookies</strong> required for you to stay
        logged in. We do not use third-party advertising, analytics, or tracking
        cookies. If that ever changes, we will update this policy and notify
        you.
      </p>
      <p>
        We also store a small timestamp in your browser&apos;s <strong>localStorage</strong>
        to track when your Signal Feed was last refreshed (so the feed can
        automatically reload after 24 hours). This value is stored only on your
        device, is never sent to our servers, and contains no personal
        information.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as Nexcor evolves. When we make material
        changes, we&apos;ll notify you by email and update the &quot;Last updated&quot; date at
        the top. Continued use after changes means you accept the new terms.
      </p>

      <h2>Contact us</h2>
      <p>
        Privacy questions, data requests, or concerns?{" "}
        <a href="/contact">Use our contact form</a> — we read every message personally.
      </p>
    </LegalPage>
  );
}
